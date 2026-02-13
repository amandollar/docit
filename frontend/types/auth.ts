export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  workspaces?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
