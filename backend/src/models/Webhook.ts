import mongoose, { Schema, Document } from 'mongoose';

export type WebhookEvent =
  | 'document_uploaded'
  | 'document_summarized'
  | 'workspace_created'
  | 'member_invited';

export interface IWebhook extends Document {
  workspace: mongoose.Types.ObjectId;
  url: string;
  description?: string;
  events: WebhookEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema = new Schema<IWebhook>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    events: {
      type: [String],
      enum: ['document_uploaded', 'document_summarized', 'workspace_created', 'member_invited'],
      default: ['document_uploaded', 'document_summarized', 'workspace_created', 'member_invited'],
    },
  },
  { timestamps: true }
);

WebhookSchema.index({ workspace: 1 });

export default mongoose.model<IWebhook>('Webhook', WebhookSchema);
