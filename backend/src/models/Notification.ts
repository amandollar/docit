import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'workspace_invite' | 'document_uploaded';

export interface INotificationPayload {
  workspaceId?: string;
  workspaceName?: string;
  documentId?: string;
  documentTitle?: string;
  actorUserId?: string;
  actorName?: string;
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  read: boolean;
  payload: INotificationPayload;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['workspace_invite', 'document_uploaded'],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    payload: {
      workspaceId: String,
      workspaceName: String,
      documentId: String,
      documentTitle: String,
      actorUserId: String,
      actorName: String,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
