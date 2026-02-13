import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import User from '../models/User';
import logger from '../utils/logger';

/**
 * GET /api/auth/google
 * Returns the Google OAuth2 URL for the frontend to redirect the user.
 */
export async function getGoogleAuthUrl(_req: Request, res: Response): Promise<void> {
  try {
    const url = authService.getGoogleAuthUrl();
    res.json({ success: true, data: { url } });
  } catch (error) {
    logger.error('getGoogleAuthUrl error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Failed to generate Google auth URL' },
    });
  }
}

/**
 * POST /api/auth/google/callback
 * Body: { code: string }
 * Exchanges code for user, creates/updates user, returns JWT.
 */
export async function googleCallback(req: Request, res: Response): Promise<void> {
  try {
    const code = req.body?.code as string;
    if (!code) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_CODE', message: 'Authorization code is required' },
      });
      return;
    }
    const profile = await authService.getGoogleUserFromCode(code);
    const user = await authService.createOrGetUser(profile);
    const tokens = authService.generateTokens(user);
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('googleCallback error:', error);
    res.status(401).json({
      success: false,
      error: { code: 'AUTH_FAILED', message: 'Google sign-in failed' },
    });
  }
}

/**
 * GET /api/auth/me
 * Requires JWT. Returns current user.
 */
export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        workspaces: user.workspaces,
      },
    });
  } catch (error) {
    logger.error('me error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get user' },
    });
  }
}

/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * Returns new access token.
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.body?.refreshToken as string;
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' },
      });
      return;
    }
    const userId = await authService.verifyRefreshToken(refreshToken);
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'User not found' },
      });
      return;
    }
    const tokens = authService.generateTokens(user);
    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    logger.error('refresh error:', error);
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' },
    });
  }
}
