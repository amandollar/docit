import fs from 'fs/promises';
import path from 'path';
import B2 from 'backblaze-b2';
import { getB2Instance, getB2BucketId, getB2BucketName, getB2Endpoint } from '../config/backblaze-b2';
import env from '../config/env';
import logger from '../utils/logger';

export interface UploadResult {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  downloadUrl: string;
  uploadTimestamp: Date;
}

export interface FileMetadata {
  fileId: string;
  fileName: string;
  contentType: string;
  contentLength: number;
  uploadTimestamp: Date;
}

class FileStorageService {
  private bucketId: string;
  private bucketName: string;
  private endpoint: string;

  constructor() {
    this.bucketId = getB2BucketId();
    this.bucketName = getB2BucketName();
    this.endpoint = getB2Endpoint();
  }

  /**
   * Upload file to Backblaze B2
   */
  async uploadFile(
    filePath: string,
    fileName: string,
    contentType: string = 'application/pdf',
    folderPath?: string
  ): Promise<UploadResult> {
    try {
      const b2 = await getB2Instance();
      
      // Read file buffer
      const fileBuffer = await fs.readFile(filePath);
      const fileSize = fileBuffer.length;

      // Generate B2 file path
      const b2FileName = folderPath 
        ? `${folderPath}/${fileName}` 
        : fileName;

      // Get upload URL
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

      // Upload file to B2
      const uploadResponse = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName: b2FileName,
        data: fileBuffer,
        contentType,
      });

      const fileId = uploadResponse.data.fileId;
      const downloadUrl = this.generateDownloadUrl(b2FileName);

      logger.info(`File uploaded to B2: ${b2FileName} (${fileId})`);

      return {
        fileId,
        fileName: b2FileName,
        filePath: b2FileName,
        fileSize,
        downloadUrl,
        uploadTimestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error uploading file to B2:', error);
      throw new Error(`Failed to upload file to B2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload file buffer directly (without saving to disk first)
   */
  async uploadFileBuffer(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = 'application/pdf',
    folderPath?: string
  ): Promise<UploadResult> {
    try {
      const b2 = await getB2Instance();
      
      const fileSize = fileBuffer.length;
      const b2FileName = folderPath 
        ? `${folderPath}/${fileName}` 
        : fileName;

      // Get upload URL
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

      // Upload file to B2
      const uploadResponse = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName: b2FileName,
        data: fileBuffer,
        contentType,
      });

      const fileId = uploadResponse.data.fileId;
      const downloadUrl = this.generateDownloadUrl(b2FileName);

      logger.info(`File buffer uploaded to B2: ${b2FileName} (${fileId})`);

      return {
        fileId,
        fileName: b2FileName,
        filePath: b2FileName,
        fileSize,
        downloadUrl,
        uploadTimestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error uploading file buffer to B2:', error);
      throw new Error(`Failed to upload file buffer to B2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from Backblaze B2
   */
  async downloadFile(fileName: string): Promise<Buffer> {
    try {
      const b2 = await getB2Instance();
      
      const downloadResponse = await b2.downloadFileByName({
        bucketName: this.bucketName,
        fileName,
      });

      return Buffer.from(downloadResponse.data);
    } catch (error) {
      logger.error(`Error downloading file from B2: ${fileName}`, error);
      throw new Error(`Failed to download file from B2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from Backblaze B2
   */
  async deleteFile(fileName: string, fileId: string): Promise<void> {
    try {
      const b2 = await getB2Instance();
      
      await b2.deleteFileVersion({
        fileId,
        fileName,
      });

      logger.info(`File deleted from B2: ${fileName} (${fileId})`);
    } catch (error) {
      logger.error(`Error deleting file from B2: ${fileName}`, error);
      throw new Error(`Failed to delete file from B2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileName: string): Promise<FileMetadata | null> {
    try {
      const b2 = await getB2Instance();
      
      const listResponse = await b2.listFileNames({
        bucketId: this.bucketId,
        startFileName: fileName,
        maxFileCount: 1,
      });

      const file = listResponse.data.files?.find(f => f.fileName === fileName);
      
      if (!file) {
        return null;
      }

      return {
        fileId: file.fileId,
        fileName: file.fileName,
        contentType: file.contentType || 'application/octet-stream',
        contentLength: file.contentLength,
        uploadTimestamp: new Date(file.uploadTimestamp),
      };
    } catch (error) {
      logger.error(`Error getting file metadata from B2: ${fileName}`, error);
      return null;
    }
  }

  /**
   * Generate download URL (public or signed)
   */
  generateDownloadUrl(fileName: string, expiresInSeconds?: number): string {
    if (expiresInSeconds) {
      // For signed URLs, you would need to implement URL signing
      // This is a simplified version - you may need to use B2's authorizeDownloadUrl
      return `${this.endpoint}/${this.bucketName}/${fileName}`;
    }
    
    // Public URL
    return `${this.endpoint}/${this.bucketName}/${fileName}`;
  }

  /**
   * Generate signed download URL with expiration
   */
  async generateSignedDownloadUrl(
    fileName: string,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    try {
      const b2 = await getB2Instance();
      
      const downloadAuthResponse = await b2.getDownloadAuthorization({
        bucketId: this.bucketId,
        fileNamePrefix: fileName,
        validDurationInSeconds: expiresInSeconds,
      });

      const { authorizationToken, downloadUrl } = downloadAuthResponse.data;
      
      return `${downloadUrl}/file/${this.bucketName}/${fileName}?Authorization=${authorizationToken}`;
    } catch (error) {
      logger.error(`Error generating signed URL for: ${fileName}`, error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List files in a folder/prefix
   */
  async listFiles(folderPath?: string, maxCount: number = 100): Promise<FileMetadata[]> {
    try {
      const b2 = await getB2Instance();
      
      const listResponse = await b2.listFileNames({
        bucketId: this.bucketId,
        startFileName: folderPath || '',
        maxFileCount: maxCount,
        prefix: folderPath,
      });

      const files = listResponse.data.files || [];
      
      return files.map(file => ({
        fileId: file.fileId,
        fileName: file.fileName,
        contentType: file.contentType || 'application/octet-stream',
        contentLength: file.contentLength,
        uploadTimestamp: new Date(file.uploadTimestamp),
      }));
    } catch (error) {
      logger.error(`Error listing files from B2: ${folderPath}`, error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(fileName: string): Promise<boolean> {
    const metadata = await this.getFileMetadata(fileName);
    return metadata !== null;
  }
}

export default new FileStorageService();
