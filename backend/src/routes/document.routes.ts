import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import { requireAuth } from '../middleware/auth.middleware';
import upload from '../config/multer';

const router = Router();

router.use(requireAuth);

// Upload: multipart form with field "file" (PDF) and "workspaceId"
router.post('/upload', upload.single('file'), documentController.upload);

// List documents in a workspace: GET /documents/workspace/:workspaceId
router.get('/workspace/:workspaceId', documentController.list);

// Get one document metadata
router.get('/:id', documentController.getById);

// Download file
router.get('/:id/download', documentController.download);

// Delete document
router.delete('/:id', documentController.remove);

export default router;
