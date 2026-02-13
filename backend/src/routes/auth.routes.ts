import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { avatarUpload } from '../config/multer';

const router = Router();

// Google OAuth: get URL for frontend to redirect user
router.get('/google', authController.getGoogleAuthUrl);

// Google OAuth: exchange code for user + JWT (frontend sends code in body)
router.post('/google/callback', authController.googleCallback);

// Current user (protected)
router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, authController.updateProfile);

// Avatar upload: multipart "avatar" (image), max 2MB
router.post('/me/avatar', requireAuth, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err: unknown) => {
    if (err) return next(err);
    next();
  });
}, authController.uploadAvatar);

// Refresh access token
router.post('/refresh', authController.refresh);

export default router;
