import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from '../models/User';
import env from '../config/env';
import logger from '../utils/logger';

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Build Google OAuth2 consent URL for redirect
 */
export function getGoogleAuthUrl(): string {
  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile', 'openid'],
    prompt: 'consent',
    redirect_uri: env.GOOGLE_REDIRECT_URI,
  });
}

/**
 * Exchange authorization code for tokens and fetch user profile
 */
export async function getGoogleUserFromCode(code: string): Promise<GoogleProfile> {
  const { tokens } = await googleClient.getToken({ code, redirect_uri: env.GOOGLE_REDIRECT_URI });
  googleClient.setCredentials(tokens);
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token!,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error('Google profile missing email');
  }
  return {
    id: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? payload.email,
    picture: payload.picture,
  };
}

/**
 * Find or create user from Google profile
 */
export async function createOrGetUser(profile: GoogleProfile): Promise<IUser> {
  let user = await User.findOne({ googleId: profile.id });
  if (user) {
    user.name = profile.name;
    user.avatar = profile.picture;
    await user.save();
    return user;
  }
  user = await User.findOne({ email: profile.email });
  if (user) {
    user.googleId = profile.id;
    user.name = profile.name;
    user.avatar = profile.picture;
    await user.save();
    return user;
  }
  user = await User.create({
    email: profile.email,
    name: profile.name,
    googleId: profile.id,
    avatar: profile.picture,
    role: 'viewer',
  });
  logger.info(`New user created via Google: ${user.email}`);
  return user;
}

/**
 * Generate JWT access and refresh tokens
 */
export function generateTokens(user: IUser): { accessToken: string; refreshToken: string; expiresIn: string } {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessOpts = { expiresIn: env.JWT_EXPIRES_IN } as unknown as jwt.SignOptions;
  const refreshOpts = { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as unknown as jwt.SignOptions;
  const accessToken = jwt.sign(payload, env.JWT_SECRET, accessOpts);
  const refreshToken = jwt.sign(
    { userId: user._id.toString(), type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    refreshOpts
  );
  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_EXPIRES_IN,
  };
}

/**
 * Verify access token and return payload
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

/**
 * Verify refresh token and return userId
 */
export async function verifyRefreshToken(token: string): Promise<string> {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; type: string };
  if (decoded.type !== 'refresh') throw new Error('Invalid refresh token');
  return decoded.userId;
}

/**
 * Update current user profile (name, avatar). Email is read-only for Google users.
 */
export async function updateProfile(userId: string, data: { name?: string; avatar?: string }): Promise<IUser | null> {
  const user = await User.findById(userId);
  if (!user) return null;
  if (data.name !== undefined) {
    const trimmed = (data.name as string).trim();
    if (trimmed.length > 0) user.name = trimmed;
  }
  if (data.avatar !== undefined) user.avatar = (data.avatar as string).trim() || undefined;
  await user.save();
  return user;
}
