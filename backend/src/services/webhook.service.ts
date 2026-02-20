import Webhook, { IWebhook, WebhookEvent } from '../models/Webhook';
import logger from '../utils/logger';

export interface WebhookPayload {
  event: WebhookEvent;
  workspaceId: string;
  workspaceName?: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Fire webhooks for a workspace event. Sends POST requests to all configured webhook URLs.
 * Failures are logged but do not block the main flow.
 */
export async function fireWebhooks(
  workspaceId: string,
  event: WebhookEvent,
  payload: Omit<WebhookPayload, 'event' | 'workspaceId' | 'timestamp'>
): Promise<void> {
  const webhooks = await Webhook.find({
    workspace: workspaceId,
    events: event,
  })
    .lean()
    .exec();

  if (webhooks.length === 0) return;

  const body: WebhookPayload = {
    event,
    workspaceId,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  await Promise.all(
    webhooks.map(async (wh: { url: string }) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(wh.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) {
          logger.warn(`Webhook ${wh.url} returned ${res.status} for event ${event}`);
        }
      } catch (err) {
        logger.error(`Webhook ${wh.url} failed for event ${event}:`, err);
      }
    })
  );
}

export async function createWebhook(
  workspaceId: string,
  url: string,
  options?: { description?: string; events?: WebhookEvent[] }
): Promise<IWebhook | null> {
  const validUrl = url.trim();
  if (!validUrl.startsWith('https://') && !validUrl.startsWith('http://')) {
    return null;
  }
  const doc = await Webhook.create({
    workspace: workspaceId,
    url: validUrl,
    description: options?.description?.trim(),
    events: options?.events?.length ? options.events : undefined,
  });
  return doc;
}

export async function listWebhooksByWorkspace(workspaceId: string): Promise<IWebhook[]> {
  return Webhook.find({ workspace: workspaceId })
    .select('-__v')
    .lean()
    .exec() as Promise<IWebhook[]>;
}

export async function deleteWebhook(
  webhookId: string,
  workspaceId: string
): Promise<boolean> {
  const result = await Webhook.findOneAndDelete({
    _id: webhookId,
    workspace: workspaceId,
  });
  return result != null;
}
