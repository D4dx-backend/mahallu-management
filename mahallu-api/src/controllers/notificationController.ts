import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginationResponse } from '../utils/pagination';

export const getAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { recipientType, isRead, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    if (!req.isSuperAdmin && req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    // For individual notifications, filter by user
    if (recipientType === 'individual') {
      query.$or = [
        { recipientId: req.user?._id },
        { recipientType: 'all' },
      ];
    }

    if (isRead !== undefined) query.isRead = isRead === 'true';

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
    ]);

    res.json(createPaginationResponse(notifications, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const notificationData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!notificationData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    const notification = new Notification(notificationData);
    await notification.save();
    res.status(201).json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const query: any = {
      tenantId: req.tenantId || req.query.tenantId,
      isRead: false,
    };

    if (req.user?._id) {
      query.$or = [
        { recipientId: req.user._id },
        { recipientType: 'all' },
      ];
    }

    await Notification.updateMany(query, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

