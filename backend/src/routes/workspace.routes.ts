import { Router } from 'express';
import * as workspaceController from '../controllers/workspace.controller';
import * as webhookController from '../controllers/webhook.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateParamId } from '../middleware/validateId.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', workspaceController.create);
router.get('/', workspaceController.list);
router.get('/:id', validateParamId('id'), workspaceController.getById);
router.patch('/:id', validateParamId('id'), workspaceController.update);
router.delete('/:id', validateParamId('id'), workspaceController.remove);

// Webhooks (Zapier support)
router.get('/:id/webhooks', validateParamId('id'), webhookController.list);
router.post('/:id/webhooks', validateParamId('id'), webhookController.create);
router.delete('/:id/webhooks/:webhookId', validateParamId('id'), validateParamId('webhookId'), webhookController.remove);

// Collaboration
router.post('/:id/invite', validateParamId('id'), workspaceController.inviteByEmail);
router.post('/:id/members', validateParamId('id'), workspaceController.addMember);
router.delete('/:id/members/:userId', validateParamId('id'), validateParamId('userId'), workspaceController.removeMember);
router.patch('/:id/members/:userId/role', validateParamId('id'), validateParamId('userId'), workspaceController.updateMemberRole);

export default router;
