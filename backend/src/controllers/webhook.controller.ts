import { Request, Response } from 'express';
import * as webhookService from '../services/webhook.service';
import * as workspaceService from '../services/workspace.service';
import { isValidObjectId } from '../utils/validators';
import logger from '../utils/logger';
import type { WebhookEvent } from '../models/Webhook';

const VALID_EVENTS: WebhookEvent[] = [
  'document_uploaded',
  'document_summarized',
  'workspace_created',
  'member_invited',
];

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const workspaceId = req.params.id;
    if (!workspaceId || !isValidObjectId(workspaceId)) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid workspace ID required' } });
      return;
    }
    const role = await workspaceService.getMemberRole(workspaceId, user._id.toString());
    if (!role || (role !== 'admin' && role !== 'editor')) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No access to workspace' } });
      return;
    }
    const webhooks = await webhookService.listWebhooksByWorkspace(workspaceId);
    res.json({ success: true, data: webhooks });
  } catch (error) {
    logger.error('webhook list error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to list webhooks' } });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const workspaceId = req.params.id;
    if (!workspaceId || !isValidObjectId(workspaceId)) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid workspace ID required' } });
      return;
    }
    const role = await workspaceService.getMemberRole(workspaceId, user._id.toString());
    if (!role || (role !== 'admin' && role !== 'editor')) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No access to workspace' } });
      return;
    }
    const { url, description, events } = req.body;
    const urlStr = typeof url === 'string' ? url.trim() : '';
    if (!urlStr) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Webhook URL is required' } });
      return;
    }
    const eventsFiltered = Array.isArray(events)
      ? (events as string[]).filter((e) => VALID_EVENTS.includes(e as WebhookEvent))
      : undefined;
    const webhook = await webhookService.createWebhook(workspaceId, urlStr, {
      description: typeof description === 'string' ? description.trim() : undefined,
      events: eventsFiltered?.length ? (eventsFiltered as WebhookEvent[]) : undefined,
    });
    if (!webhook) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'URL must start with http:// or https://' } });
      return;
    }
    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    logger.error('webhook create error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create webhook' } });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const workspaceId = req.params.id;
    const webhookId = req.params.webhookId;
    if (!workspaceId || !webhookId || !isValidObjectId(workspaceId) || !isValidObjectId(webhookId)) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid IDs required' } });
      return;
    }
    const role = await workspaceService.getMemberRole(workspaceId, user._id.toString());
    if (!role || (role !== 'admin' && role !== 'editor')) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No access to workspace' } });
      return;
    }
    const ok = await webhookService.deleteWebhook(webhookId, workspaceId);
    if (!ok) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
      return;
    }
    res.status(204).send();
  } catch (error) {
    logger.error('webhook remove error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete webhook' } });
  }
}
