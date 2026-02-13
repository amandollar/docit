import { Request, Response } from 'express';
import * as workspaceService from '../services/workspace.service';
import logger from '../utils/logger';

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
      return;
    }
    const workspace = await workspaceService.createWorkspace(
      name.trim(),
      typeof description === 'string' ? description.trim() : undefined,
      user
    );
    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    logger.error('workspace create error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create workspace' } });
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit)) || 20));
    const result = await workspaceService.listWorkspacesForUser(user._id.toString(), page, limit);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    logger.error('workspace list error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to list workspaces' } });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const workspace = await workspaceService.getWorkspaceById(req.params.id, user._id.toString());
    if (!workspace) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workspace not found' } });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    logger.error('workspace getById error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get workspace' } });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const workspace = await workspaceService.updateWorkspace(
      req.params.id,
      user._id.toString(),
      req.body
    );
    if (!workspace) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workspace not found or no permission' } });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    logger.error('workspace update error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update workspace' } });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const ok = await workspaceService.deleteWorkspace(req.params.id, user._id.toString());
    if (!ok) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workspace not found or not admin' } });
      return;
    }
    res.status(204).send();
  } catch (error) {
    logger.error('workspace remove error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete workspace' } });
  }
}

export async function addMember(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const { userId, role } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'userId is required' } });
      return;
    }
    const validRole = ['admin', 'editor', 'viewer'].includes(role) ? role : 'viewer';
    const workspace = await workspaceService.addMember(
      req.params.id,
      user._id.toString(),
      userId,
      validRole
    );
    if (!workspace) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workspace not found or no permission' } });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    logger.error('workspace addMember error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to add member' } });
  }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const memberUserId = req.params.userId;
    const ok = await workspaceService.removeMember(req.params.id, user._id.toString(), memberUserId);
    if (!ok) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workspace not found or cannot remove' } });
      return;
    }
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    logger.error('workspace removeMember error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to remove member' } });
  }
}

export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const { role } = req.body;
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid role' } });
      return;
    }
    const workspace = await workspaceService.updateMemberRole(
      req.params.id,
      user._id.toString(),
      req.params.userId,
      role
    );
    if (!workspace) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workspace not found or no permission' } });
      return;
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    logger.error('workspace updateMemberRole error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update role' } });
  }
}
