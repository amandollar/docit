import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  filename: string;
  filePath: string;
  fileId: string; // Backblaze B2 fileId for delete
  fileSize: number;
  mimeType: string;
  workspace: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

DocumentSchema.index({ workspace: 1 });
DocumentSchema.index({ uploadedBy: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);
