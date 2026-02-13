import fs from 'fs/promises';
import Document, { IDocument } from '../models/Document';
import Workspace from '../models/Workspace';
import fileStorageService from './file-storage.service';
import { getMemberRole } from './workspace.service';
import { IUser } from '../models/User';
import { PaginatedResponse } from '../types';

export async function uploadDocument(
  workspaceId: string,
  uploadedBy: IUser,
  localFilePath: string,
  originalFilename: string
): Promise<IDocument | null> {
  const role = await getMemberRole(workspaceId, uploadedBy._id.toString());
  if (!role || (role !== 'admin' && role !== 'editor')) return null;
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return null;

  const safeName = `${Date.now()}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const folderPath = `workspaces/${workspaceId}`;
  const fileBuffer = await fs.readFile(localFilePath);
  const result = await fileStorageService.uploadFileBuffer(
    fileBuffer,
    safeName,
    'application/pdf',
    folderPath
  );
  await fs.unlink(localFilePath).catch(() => {});

  const title = originalFilename.replace(/\.pdf$/i, '') || originalFilename;
  const doc = await Document.create({
    title,
    filename: originalFilename,
    filePath: result.filePath,
    fileId: result.fileId,
    fileSize: result.fileSize,
    mimeType: 'application/pdf',
    workspace: workspaceId,
    uploadedBy: uploadedBy._id,
  });
  return doc;
}

export async function listByWorkspace(
  workspaceId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResponse<IDocument> | null> {
  const role = await getMemberRole(workspaceId, userId);
  if (!role) return null;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Document.find({ workspace: workspaceId })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Document.countDocuments({ workspace: workspaceId }),
  ]);
  return {
    data: items as IDocument[],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(documentId: string, userId: string): Promise<IDocument | null> {
  const doc = await Document.findById(documentId).populate('uploadedBy', 'name email avatar').lean();
  if (!doc) return null;
  const role = await getMemberRole(doc.workspace.toString(), userId);
  if (!role) return null;
  return doc as IDocument;
}

export async function getDownloadStream(documentId: string, userId: string): Promise<{ buffer: Buffer; filename: string; mimeType: string } | null> {
  const doc = await Document.findById(documentId);
  if (!doc) return null;
  const role = await getMemberRole(doc.workspace.toString(), userId);
  if (!role) return null;
  const buffer = await fileStorageService.downloadFile(doc.filePath);
  return {
    buffer,
    filename: doc.filename,
    mimeType: doc.mimeType,
  };
}

export async function removeDocument(documentId: string, userId: string): Promise<boolean> {
  const doc = await Document.findById(documentId);
  if (!doc) return false;
  const role = await getMemberRole(doc.workspace.toString(), userId);
  if (role !== 'admin' && role !== 'editor') return false;
  await fileStorageService.deleteFile(doc.filePath, doc.fileId);
  await Document.findByIdAndDelete(documentId);
  return true;
}
