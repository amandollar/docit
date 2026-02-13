import type { User } from "@/types/auth";
import type { Workspace, Pagination } from "@/types/workspace";
import type { Document } from "@/types/document";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ success: true; data: T } | { success: false; error: { code: string; message: string } }> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server. Make sure the backend is running."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return json as { success: true; data: T };
}

/** GET /api/auth/google → { url } */
export async function getGoogleAuthUrl(): Promise<
  { success: true; data: { url: string } } | { success: false; error: { code: string; message: string } }
> {
  return request<{ url: string }>("/api/auth/google");
}

/** POST /api/auth/google/callback with { code } */
export async function exchangeCodeForTokens(code: string): Promise<
  | { success: true; data: { user: User; accessToken: string; refreshToken: string; expiresIn: number } }
  | { success: false; error: { code: string; message: string } }
> {
  return request<{ user: User; accessToken: string; refreshToken: string; expiresIn: number }>(
    "/api/auth/google/callback",
    { method: "POST", body: JSON.stringify({ code }) }
  );
}

/** GET /api/auth/me with Bearer token */
export async function getMe(token: string): Promise<
  | { success: true; data: User & { workspaces?: string[] } }
  | { success: false; error: { code: string; message: string } }
> {
  return request<User & { workspaces?: string[] }>("/api/auth/me", { token });
}

/** PATCH /api/auth/me with Bearer token. Body: { name?: string, avatar?: string } */
export async function patchMe(
  token: string,
  data: { name?: string; avatar?: string }
): Promise<
  | { success: true; data: User & { workspaces?: string[] } }
  | { success: false; error: { code: string; message: string } }
> {
  return request<User & { workspaces?: string[] }>("/api/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

/** POST /api/auth/me/avatar with Bearer token. FormData with field "avatar" (file). Returns updated user. */
export async function uploadAvatarPhoto(
  token: string,
  file: File
): Promise<
  | { success: true; data: User & { workspaces?: string[] } }
  | { success: false; error: { code: string; message: string } }
> {
  const formData = new FormData();
  formData.append("avatar", file);
  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server. Make sure the backend is running."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return json as { success: true; data: User & { workspaces?: string[] } };
}

/** POST /api/auth/refresh with { refreshToken } */
export async function refreshAccessToken(refreshToken: string): Promise<
  | { success: true; data: { accessToken: string; expiresIn: number } }
  | { success: false; error: { code: string; message: string } }
> {
  return request<{ accessToken: string; expiresIn: number }>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

// --- Workspaces ---

/** GET /api/workspaces */
export async function listWorkspaces(
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<
  | { success: true; data: Workspace[]; pagination: Pagination }
  | { success: false; error: { code: string; message: string } }
> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/workspaces?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return {
    success: true,
    data: json.data ?? [],
    pagination: json.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

/** POST /api/workspaces body: { name, description? } */
export async function createWorkspace(
  token: string,
  name: string,
  description?: string
): Promise<
  | { success: true; data: Workspace }
  | { success: false; error: { code: string; message: string } }
> {
  return request<Workspace>("/api/workspaces", {
    method: "POST",
    token,
    body: JSON.stringify({ name: name.trim(), description: description?.trim() || undefined }),
  });
}

/** GET /api/workspaces/:id */
export async function getWorkspace(
  token: string,
  id: string
): Promise<
  | { success: true; data: Workspace }
  | { success: false; error: { code: string; message: string } }
> {
  return request<Workspace>(`/api/workspaces/${id}`, { token });
}

/** PATCH /api/workspaces/:id body: { name?, description? } */
export async function updateWorkspace(
  token: string,
  id: string,
  updates: { name?: string; description?: string }
): Promise<
  | { success: true; data: Workspace }
  | { success: false; error: { code: string; message: string } }
> {
  return request<Workspace>(`/api/workspaces/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(updates),
  });
}

/** DELETE /api/workspaces/:id */
export async function deleteWorkspace(
  token: string,
  id: string
): Promise<
  | { success: true }
  | { success: false; error: { code: string; message: string } }
> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/workspaces/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  if (res.status === 204) return { success: true };
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return { success: true };
}

// --- Workspace members (collaboration) ---

/** POST /api/workspaces/:id/invite body: { email, role? } — invite by email (user must have DOCIT account) */
export async function inviteWorkspaceByEmail(
  token: string,
  workspaceId: string,
  email: string,
  role: "admin" | "editor" | "viewer" = "viewer"
): Promise<
  | { success: true; data: Workspace }
  | { success: false; error: { code: string; message: string } }
> {
  return request<Workspace>(`/api/workspaces/${workspaceId}/invite`, {
    method: "POST",
    token,
    body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
  });
}

/** DELETE /api/workspaces/:id/members/:userId */
export async function removeWorkspaceMember(
  token: string,
  workspaceId: string,
  userId: string
): Promise<
  | { success: true }
  | { success: false; error: { code: string; message: string } }
> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/workspaces/${workspaceId}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return { success: true };
}

/** PATCH /api/workspaces/:id/members/:userId/role body: { role } */
export async function updateWorkspaceMemberRole(
  token: string,
  workspaceId: string,
  userId: string,
  role: "admin" | "editor" | "viewer"
): Promise<
  | { success: true; data: Workspace }
  | { success: false; error: { code: string; message: string } }
> {
  return request<Workspace>(`/api/workspaces/${workspaceId}/members/${userId}/role`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ role }),
  });
}

// --- Documents ---

/** GET /api/documents/workspace/:workspaceId */
export async function listDocumentsByWorkspace(
  token: string,
  workspaceId: string,
  page: number = 1,
  limit: number = 50
): Promise<
  | { success: true; data: Document[]; pagination: Pagination }
  | { success: false; error: { code: string; message: string } }
> {
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE}/api/documents/workspace/${workspaceId}?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return {
    success: true,
    data: json.data ?? [],
    pagination: json.pagination ?? { page: 1, limit: 50, total: 0, totalPages: 0 },
  };
}

/** POST /api/documents/upload — FormData: file (PDF), workspaceId */
export async function uploadDocument(
  token: string,
  workspaceId: string,
  file: File
): Promise<
  | { success: true; data: Document }
  | { success: false; error: { code: string; message: string } }
> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workspaceId", workspaceId);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return json as { success: true; data: Document };
}

/** GET /api/documents/:id */
export async function getDocument(
  token: string,
  id: string
): Promise<
  | { success: true; data: Document }
  | { success: false; error: { code: string; message: string } }
> {
  return request<Document>(`/api/documents/${id}`, { token });
}

/** GET /api/documents/:id/download — returns blob; call openDocumentDownload to trigger save */
export async function downloadDocument(
  token: string,
  id: string
): Promise<
  | { success: true; blob: Blob; filename: string }
  | { success: false; error: { code: string; message: string } }
> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/documents/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="?([^";\n]+)"?/);
  const filename = filenameMatch?.[1]?.trim() ?? "document.pdf";
  return { success: true, blob, filename };
}

/** DELETE /api/documents/:id */
export async function deleteDocument(
  token: string,
  id: string
): Promise<
  | { success: true }
  | { success: false; error: { code: string; message: string } }
> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the server."
        : err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
  if (res.status === 204) return { success: true };
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? { code: "REQUEST_FAILED", message: res.statusText },
    };
  }
  return { success: true };
}
