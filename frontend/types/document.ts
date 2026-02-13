export interface DocumentUploadedBy {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Document {
  _id: string;
  title: string;
  filename: string;
  filePath: string;
  fileId: string;
  fileSize: number;
  mimeType: string;
  /** AI-generated summary (Vercel AI SDK + Gemini) */
  summary?: string;
  workspace: string;
  uploadedBy: DocumentUploadedBy | string;
  createdAt: string;
  updatedAt: string;
}
