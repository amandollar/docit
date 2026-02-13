import mongoose from 'mongoose';
import Workspace, { IWorkspace, IWorkspaceMember, WorkspaceMemberRole } from '../models/Workspace';
import User from '../models/User';
import Document from '../models/Document';
import { IUser } from '../models/User';
import { PaginatedResponse } from '../types';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function createWorkspace(
  name: string,
  description: string | undefined,
  owner: IUser
): Promise<IWorkspace> {
  let slug = slugify(name);
  let exists = await Workspace.findOne({ slug });
  let suffix = 0;
  while (exists) {
    suffix += 1;
    slug = `${slugify(name)}-${suffix}`;
    exists = await Workspace.findOne({ slug });
  }
  const workspace = await Workspace.create({
    name,
    description,
    slug,
    owner: owner._id,
    members: [{ user: owner._id, role: 'admin', addedAt: new Date() }],
  });
  await User.findByIdAndUpdate(owner._id, { $addToSet: { workspaces: workspace._id } });
  return workspace;
}

export async function getWorkspaceById(id: string, userId: string): Promise<IWorkspace | null> {
  const workspace = await Workspace.findOne({
    _id: id,
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .lean();
  return workspace as IWorkspace | null;
}

export async function listWorkspacesForUser(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<IWorkspace>> {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Workspace.countDocuments({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }),
  ]);
  return {
    data: items as IWorkspace[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  updates: { name?: string; description?: string }
): Promise<IWorkspace | null> {
  const role = await getMemberRole(workspaceId, userId);
  if (role !== 'admin' && role !== 'editor') return null;
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId },
    { $set: updates },
    { new: true }
  )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  return workspace ?? null;
}

export async function deleteWorkspace(workspaceId: string, userId: string): Promise<boolean> {
  const role = await getMemberRole(workspaceId, userId);
  if (role !== 'admin') return false;
  await Document.deleteMany({ workspace: workspaceId });
  await Workspace.findByIdAndDelete(workspaceId);
  await User.updateMany({}, { $pull: { workspaces: workspaceId } });
  return true;
}

export async function getMemberRole(workspaceId: string, userId: string): Promise<WorkspaceMemberRole | null> {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) return null;
  if (workspace.owner.toString() === userId) return 'admin';
  const member = workspace.members.find((m) => m.user.toString() === userId);
  return (member?.role as WorkspaceMemberRole) ?? null;
}

export async function addMember(
  workspaceId: string,
  inviterUserId: string,
  newUserId: string,
  role: WorkspaceMemberRole
): Promise<IWorkspace | null> {
  const inviterRole = await getMemberRole(workspaceId, inviterUserId);
  if (inviterRole !== 'admin') return null;
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, 'members.user': { $ne: newUserId } },
    { $push: { members: { user: newUserId, role, addedAt: new Date() } } },
    { new: true }
  )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  if (workspace) {
    await User.findByIdAndUpdate(newUserId, { $addToSet: { workspaces: workspaceId } });
  }
  return workspace ?? null;
}

export async function removeMember(
  workspaceId: string,
  removerUserId: string,
  memberUserId: string
): Promise<boolean> {
  const removerRole = await getMemberRole(workspaceId, removerUserId);
  if (removerRole !== 'admin') return false;
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace || workspace.owner.toString() === memberUserId) return false;
  await Workspace.findByIdAndUpdate(workspaceId, {
    $pull: { members: { user: memberUserId } },
  });
  await User.findByIdAndUpdate(memberUserId, { $pull: { workspaces: workspaceId } });
  return true;
}

export async function updateMemberRole(
  workspaceId: string,
  adminUserId: string,
  memberUserId: string,
  role: WorkspaceMemberRole
): Promise<IWorkspace | null> {
  const adminRole = await getMemberRole(workspaceId, adminUserId);
  if (adminRole !== 'admin') return null;
  if (memberUserId === (await Workspace.findById(workspaceId).select('owner').lean())?.owner?.toString()) {
    return null; // cannot change owner role
  }
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, 'members.user': memberUserId },
    { $set: { 'members.$.role': role } },
    { new: true }
  )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  return workspace ?? null;
}
