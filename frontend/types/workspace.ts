export type WorkspaceMemberRole = "admin" | "editor" | "viewer";

export interface WorkspaceMemberUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface WorkspaceMember {
  user: WorkspaceMemberUser | string;
  role: WorkspaceMemberRole;
  addedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  owner: WorkspaceMemberUser | string;
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
