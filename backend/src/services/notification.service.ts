import Notification, { INotification, NotificationType, INotificationPayload } from '../models/Notification';
import Workspace from '../models/Workspace';

export async function createNotification(
  userId: string,
  type: NotificationType,
  payload: INotificationPayload
): Promise<INotification> {
  const notification = await Notification.create({
    user: userId,
    type,
    read: false,
    payload,
  });
  return notification;
}

/** Notify all workspace members except one (e.g. the uploader). */
export async function notifyWorkspaceMembersExcept(
  workspaceId: string,
  exceptUserId: string,
  type: NotificationType,
  payload: INotificationPayload
): Promise<void> {
  const workspace = await Workspace.findById(workspaceId).select('owner members').lean();
  if (!workspace) return;
  const recipientIds = new Set<string>();
  if (workspace.owner.toString() !== exceptUserId) {
    recipientIds.add(workspace.owner.toString());
  }
  workspace.members.forEach((m: { user: { toString: () => string } }) => {
    const id = m.user.toString();
    if (id !== exceptUserId) recipientIds.add(id);
  });
  await Promise.all(
    Array.from(recipientIds).map((uid) => createNotification(uid, type, payload))
  );
}

export interface ListNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
}

export async function listForUser(
  userId: string,
  options: ListNotificationsOptions = {}
): Promise<INotification[]> {
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const query = Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
  if (options.unreadOnly) {
    query.where('read').equals(false);
  }
  return query.exec() as Promise<INotification[]>;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ user: userId, read: false });
}

export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } }
  );
  return result != null;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );
  return result.modifiedCount;
}
