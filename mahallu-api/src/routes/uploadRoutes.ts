import express from 'express';
import { uploadBannerImage, uploadNotificationImage, uploadMiddleware } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/notification-image', uploadMiddleware, uploadNotificationImage);
router.post('/banner-image', uploadMiddleware, uploadBannerImage);

export default router;
