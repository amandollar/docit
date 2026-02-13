import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateParamId } from '../middleware/validateId.middleware';
import upload from '../config/multer';

const router = Router();

router.use(requireAuth);

// Upload: multipart form with field "file" (PDF) and "workspaceId" – multer errors passed to error handler
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) return next(err);
    next();
  });
}, documentController.upload);

// List documents in a workspace: GET /documents/workspace/:workspaceId
router.get('/workspace/:workspaceId', validateParamId('workspaceId'), documentController.list);

// Get one document metadata
router.get('/:id', validateParamId('id'), documentController.getById);

// Download file
router.get('/:id/download', validateParamId('id'), documentController.download);

// Delete document
router.delete('/:id', validateParamId('id'), documentController.remove);

export default router;
