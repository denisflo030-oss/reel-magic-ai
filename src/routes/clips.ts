import express, { Router } from 'express';
import {
  generateClips,
  getClipStatus,
  downloadClip,
  getClipThumbnail,
  listClips,
  getClipDetails,
  deleteClip,
} from '../controllers/clipController.js';

const router = Router();

// Routes
router.post('/generate', generateClips);
router.get('/status/:jobId', getClipStatus);
router.get('/download/:clipId', downloadClip);
router.get('/thumbnail/:clipId', getClipThumbnail);
router.get('/:clipId', getClipDetails);
router.get('/', listClips);
router.delete('/:clipId', deleteClip);

export default router;
