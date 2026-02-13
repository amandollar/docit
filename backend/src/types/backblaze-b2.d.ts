declare module 'backblaze-b2' {
  interface B2Options {
    applicationKeyId: string;
    applicationKey: string;
  }

  export interface B2Instance {
    authorize(): Promise<{ data: { downloadUrl?: string } }>;
    listBuckets(): Promise<{ data: { buckets: Array<{ bucketId: string; bucketName: string }> } }>;
    getUploadUrl(params: { bucketId: string }): Promise<{ data: { uploadUrl: string; authorizationToken: string } }>;
    uploadFile(params: {
      uploadUrl: string;
      uploadAuthToken: string;
      fileName: string;
      data: Buffer;
      contentType?: string;
    }): Promise<{ data: { fileId: string } }>;
    downloadFileByName(params: { bucketName: string; fileName: string; responseType?: string }): Promise<{ data: Buffer | ArrayBuffer }>;
    deleteFileVersion(params: { fileId: string; fileName: string }): Promise<unknown>;
    getDownloadAuthorization?(params: { bucketId: string; fileNamePrefix: string; validDurationInSeconds: number }): Promise<{ data: { authorizationToken: string; downloadUrl: string } }>;
    listFileNames(params: { bucketId: string; startFileName?: string; maxFileCount?: number; prefix?: string }): Promise<{
      data: { files?: Array<{ fileId: string; fileName: string; contentType?: string; contentLength: number; uploadTimestamp: number }> };
    }>;
    downloadUrl?: string;
  }

  interface B2Constructor {
    new (options: B2Options): B2Instance;
  }

  const B2: B2Constructor;
  export = B2;
}
