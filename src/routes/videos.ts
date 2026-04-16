import express, { Router } from 'express';
import multer from 'multer';
import { uploadVideo, getVideoInfo, deleteVideo, analyzeVideoUrl } from '../controllers/videoController.js';

const router = Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  },
});

// Routes
router.post('/upload', upload.single('video'), uploadVideo);
router.post('/analyze', analyzeVideoUrl);
router.get('/:videoId', getVideoInfo);
router.delete('/:videoId', deleteVideo);

export default router;
