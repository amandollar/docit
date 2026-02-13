import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceChatMessage extends Document {
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const WorkspaceChatMessageSchema = new Schema<IWorkspaceChatMessage>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

WorkspaceChatMessageSchema.index({ workspace: 1, createdAt: -1 });

export default mongoose.model<IWorkspaceChatMessage>('WorkspaceChatMessage', WorkspaceChatMessageSchema);
