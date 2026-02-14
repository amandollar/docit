import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { isValidObjectId } from '../utils/validators';
import logger from '../utils/logger';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit)) || 20));
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notificationService.listForUser(user._id.toString(), { limit, unreadOnly });
    res.json({ success: true, data: notifications });
  } catch (error) {
    logger.error('notification list error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to list notifications' } });
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const count = await notificationService.getUnreadCount(user._id.toString());
    res.json({ success: true, data: { count } });
  } catch (error) {
    logger.error('notification unread count error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get count' } });
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const id = req.params.id;
    if (!id || !isValidObjectId(id)) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid notification id required' } });
      return;
    }
    const ok = await notificationService.markAsRead(id, user._id.toString());
    if (!ok) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
      return;
    }
    res.json({ success: true, data: { ok: true } });
  } catch (error) {
    logger.error('notification markAsRead error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update' } });
  }
}

export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const count = await notificationService.markAllAsRead(user._id.toString());
    res.json({ success: true, data: { count } });
  } catch (error) {
    logger.error('notification markAllAsRead error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update' } });
  }
}
