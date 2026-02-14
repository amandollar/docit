export type NotificationType = "workspace_invite" | "document_uploaded";

export interface NotificationPayload {
  workspaceId?: string;
  workspaceName?: string;
  documentId?: string;
  documentTitle?: string;
  actorUserId?: string;
  actorName?: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  read: boolean;
  payload: NotificationPayload;
  createdAt: string;
  updatedAt: string;
}
