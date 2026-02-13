import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Google OAuth: get URL for frontend to redirect user
router.get('/google', authController.getGoogleAuthUrl);

// Google OAuth: exchange code for user + JWT (frontend sends code in body)
router.post('/google/callback', authController.googleCallback);

// Current user (protected)
router.get('/me', requireAuth, authController.me);

// Refresh access token
router.post('/refresh', authController.refresh);

export default router;
