import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { verifyAccessToken } from '../services/auth.service';

/**
 * Verify JWT and attach user to req.user.
 * Use on routes that require authentication.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query?.token as string);
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Access token required' },
      });
      return;
    }
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
}
