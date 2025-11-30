import { Request, Response } from 'express';
import User from '../models/User';
import Member from '../models/Member';
import OTP from '../models/OTP';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required',
      });
    }

    // Try to find user by phone
    let user = await User.findOne({ phone }).select('+password');
    
    // If no user found, check if it's a member trying to login
    if (!user) {
      const member = await Member.findOne({ phone });
      if (member) {
        // Find member user account
        user = await User.findOne({ memberId: member._id, role: 'member' }).select('+password');
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Member account not found.',
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('tenantId', 'name code')
      .populate('memberId', 'name phone familyName');

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id)
      .select('-password')
      .populate('tenantId', 'name code')
      .populate('memberId', 'name phone familyName');
    
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate and send OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Check if user exists
    let user = await User.findOne({ phone });
    
    // If no user found, check if it's a member trying to login
    if (!user) {
      const member = await Member.findOne({ phone });
      if (member) {
        // Check if member user account exists
        user = await User.findOne({ memberId: member._id, role: 'member' });
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Member account not found. Please contact admin to create your account.',
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'User not found with this phone number',
        });
      }
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Check for recent OTP requests (rate limiting - max 1 per minute)
    const recentOTP = await OTP.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another OTP',
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous unused OTPs for this phone
    await OTP.updateMany(
      { phone, isUsed: false },
      { isUsed: true }
    );

    // Save new OTP
    const otp = new OTP({
      phone,
      code: otpCode,
      expiresAt,
    });
    await otp.save();

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll return the OTP in development
    // In production, remove this and send via SMS
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDevelopment) {
      console.log(`OTP for ${phone}: ${otpCode}`);
    }

    // Send SMS (implement your SMS service here)
    // await sendSMS(phone, `Your login OTP is ${otpCode}. Valid for 10 minutes.`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production
      ...(isDevelopment && { otp: otpCode }),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP and login
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required',
      });
    }

    // Find the OTP
    const otpRecord = await OTP.findOne({
      phone,
      code: otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      // Increment attempts for rate limiting
      await OTP.updateOne(
        { phone, code: otp },
        { $inc: { attempts: 1 } }
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Check if OTP has exceeded max attempts (5)
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP',
      });
    }

    // Find user
    let user = await User.findOne({ phone });
    
    // If no user found, check if it's a member trying to login
    if (!user) {
      const member = await Member.findOne({ phone });
      if (member) {
        // Find member user account
        user = await User.findOne({ memberId: member._id, role: 'member' });
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Member account not found. Please contact admin to create your account.',
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('tenantId', 'name code')
      .populate('memberId', 'name phone familyName');

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

