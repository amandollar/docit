import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import WorkspaceChatMessage from '../models/WorkspaceChatMessage';
import User from '../models/User';
import { verifyAccessToken } from '../services/auth.service';
import { getMemberRole } from '../services/workspace.service';
import { isValidObjectId } from '../utils/validators';
import logger from '../utils/logger';

const WORKSPACE_ROOMS = new Map<string, Set<WebSocket>>();
const SOCKET_META = new WeakMap<WebSocket, { workspaceId: string; userId: string; userName: string }>();

const HISTORY_LIMIT = 50;

function getWsRoom(workspaceId: string): Set<WebSocket> {
  let set = WORKSPACE_ROOMS.get(workspaceId);
  if (!set) {
    set = new Set();
    WORKSPACE_ROOMS.set(workspaceId, set);
  }
  return set;
}

function leaveRoom(socket: WebSocket): void {
  const meta = SOCKET_META.get(socket);
  if (!meta) return;
  const room = WORKSPACE_ROOMS.get(meta.workspaceId);
  if (room) {
    room.delete(socket);
    if (room.size === 0) WORKSPACE_ROOMS.delete(meta.workspaceId);
  }
  SOCKET_META.delete(socket);
}

function send(socket: WebSocket, payload: object): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function broadcastToWorkspace(workspaceId: string, payload: object, exclude?: WebSocket): void {
  const room = WORKSPACE_ROOMS.get(workspaceId);
  if (!room) return;
  room.forEach((s) => {
    if (s !== exclude) send(s, payload);
  });
}

export function handleWorkspaceChatUpgrade(
  request: IncomingMessage,
  socket: WebSocket,
  _head: Buffer
): void {
  const url = request.url || '';
  const path = parse(url, true);
  if (!path.pathname?.startsWith('/ws')) return;

  const token = (path.query?.token as string)?.trim();
  const workspaceId = (path.query?.workspaceId as string)?.trim();
  if (!token || !workspaceId || !isValidObjectId(workspaceId)) {
    socket.close(4000, 'Missing or invalid token or workspaceId');
    return;
  }

  let userId: string;
  try {
    const payload = verifyAccessToken(token);
    userId = payload.userId;
  } catch {
    socket.close(4001, 'Invalid token');
    return;
  }

  getMemberRole(workspaceId, userId)
    .then((role) => {
      if (!role) {
        socket.close(4003, 'Not a member of this workspace');
        return;
      }
      return User.findById(userId).select('name').lean();
    })
    .then((user) => {
      if (!user) {
        socket.close(4002, 'User not found');
        return;
      }
      const userName = (user as { name?: string }).name || 'Unknown';
      SOCKET_META.set(socket, { workspaceId, userId, userName });
      getWsRoom(workspaceId).add(socket);

      return WorkspaceChatMessage.find({ workspace: workspaceId })
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT)
        .populate('user', 'name')
        .lean();
    })
    .then((messages) => {
      const history = (messages || []).reverse().map((m: unknown) => {
        const msg = m as { _id: { toString(): string }; user: { _id: { toString(): string }; name?: string } | null; text: string; createdAt: Date };
        const user = msg.user;
        const userId = user && typeof user === 'object' && user._id ? user._id.toString() : '';
        return {
          type: 'message',
          id: msg._id.toString(),
          userId,
          userName: user?.name ?? 'Unknown',
          text: msg.text,
          createdAt: msg.createdAt,
        };
      });
      send(socket, { type: 'joined', history });
      logger.info(`Workspace chat: ${userId} joined workspace ${workspaceId}`);
    })
    .catch((err) => {
      logger.error('Workspace chat join error:', err);
      socket.close(4010, 'Server error');
    });

  socket.on('message', (data: Buffer) => {
    const meta = SOCKET_META.get(socket);
    if (!meta) return;
    let body: { type?: string; text?: string };
    try {
      body = JSON.parse(data.toString());
    } catch {
      return;
    }
    if (body.type !== 'message' || typeof body.text !== 'string') return;
    const text = body.text.trim().slice(0, 2000);
    if (!text) return;

    WorkspaceChatMessage.create({
      workspace: meta.workspaceId,
      user: meta.userId,
      text,
    })
      .then((doc) => doc.populate('user', 'name'))
      .then((doc) => {
        const user = doc.user as { _id: { toString(): string }; name?: string };
        const payload = {
          type: 'message',
          id: doc._id.toString(),
          userId: user._id.toString(),
          userName: user.name || meta.userName,
          text: doc.text,
          createdAt: doc.createdAt,
        };
        broadcastToWorkspace(meta.workspaceId, payload, socket);
        send(socket, payload);
      })
      .catch((err) => {
        logger.error('Workspace chat save message error:', err);
        send(socket, { type: 'error', message: 'Failed to send' });
      });
  });

  socket.on('close', () => {
    leaveRoom(socket);
  });

  socket.on('error', () => {
    leaveRoom(socket);
  });
}
