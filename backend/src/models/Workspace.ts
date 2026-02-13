import mongoose, { Schema, Document } from 'mongoose';

export type WorkspaceMemberRole = 'admin' | 'editor' | 'viewer';

export interface IWorkspaceMember {
  user: mongoose.Types.ObjectId;
  role: WorkspaceMemberRole;
  addedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['admin', 'editor', 'viewer'],
          default: 'viewer',
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

WorkspaceSchema.index({ owner: 1 });
WorkspaceSchema.index({ 'members.user': 1 });
WorkspaceSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
