import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateParamId } from '../middleware/validateId.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', notificationController.list);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validateParamId('id'), notificationController.markAsRead);

export default router;
