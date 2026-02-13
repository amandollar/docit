import { Router } from 'express';
import * as workspaceController from '../controllers/workspace.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', workspaceController.create);
router.get('/', workspaceController.list);
router.get('/:id', workspaceController.getById);
router.patch('/:id', workspaceController.update);
router.delete('/:id', workspaceController.remove);

// Collaboration
router.post('/:id/members', workspaceController.addMember);
router.delete('/:id/members/:userId', workspaceController.removeMember);
router.patch('/:id/members/:userId/role', workspaceController.updateMemberRole);

export default router;
