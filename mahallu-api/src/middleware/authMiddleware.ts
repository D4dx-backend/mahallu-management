import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
  tenantId?: string;
  isSuperAdmin?: boolean;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }

    req.user = user;
    req.isSuperAdmin = user.isSuperAdmin;
    req.tenantId = user.tenantId?.toString();

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const superAdminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required',
    });
  }
  next();
};

export const memberUserOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'member') {
    return res.status(403).json({
      success: false,
      message: 'Member user access required',
    });
  }
  next();
};

