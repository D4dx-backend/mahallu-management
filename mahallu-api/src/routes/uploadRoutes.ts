import express from 'express';
import { uploadNotificationImage, uploadMiddleware } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/notification-image', uploadMiddleware, uploadNotificationImage);

export default router;
