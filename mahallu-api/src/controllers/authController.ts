import { Request, Response } from 'express';
import User from '../models/User';
import Member from '../models/Member';
import OTP from '../models/OTP';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { normalizeIndianPhone, sendWhatsAppMessage } from '../services/dxingService';

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

    // Fetch user without populating to keep tenantId as string
    const userResponse = await User.findById(user._id).select('-password');

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
    // Fetch user without populating to keep tenantId/memberId as strings
    const user = await User.findById(req.user?._id).select('-password');
    
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

    let normalizedPhone: string;
    let localPhone: string;
    try {
      const normalized = normalizeIndianPhone(phone);
      normalizedPhone = normalized.normalized;
      localPhone = normalized.local;
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Invalid phone number' });
    }

    console.info(`[OTP] send-otp requested for phone=${phone} normalized=${normalizedPhone} env=${process.env.NODE_ENV}`);

    // Check if user exists
    let user = await User.findOne({ phone: localPhone });
    
    // If no user found, check if it's a member trying to login
    if (!user) {
      const member = await Member.findOne({ phone: localPhone });
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
      phone: normalizedPhone,
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another OTP',
      });
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Invalidate previous unused OTPs for this phone
    await OTP.updateMany(
      { phone: normalizedPhone, isUsed: false },
      { isUsed: true }
    );

    let otpCode: string;
    let otp: any;

    if (!isDevelopment) {
      console.info(`[OTP] Production mode: Sending via DXING to ${normalizedPhone}`);
      
      // Use DXING's OTP template - DXING will generate and send the OTP
      const message = `🔐 Mahallu Login OTP\n\nYour OTP is {{otp}}. It will expire in 5 minutes.\n\nIf you did not request this OTP, please ignore this message.`;
      
      try {
        const deliveryResult = await sendWhatsAppMessage(normalizedPhone, message);
        
        // Strict validation of DXING response
        if (!deliveryResult) {
          throw new Error('DXING returned empty response');
        }

        if (typeof deliveryResult !== 'object') {
          throw new Error('DXING returned non-object response: ' + typeof deliveryResult);
        }

        // Check for explicit delivery confirmation
        const confirmed = 
          deliveryResult.status === 200 || 
          deliveryResult.status === true ||
          deliveryResult.success === true;

        if (!confirmed) {
          console.error('[OTP] DXING did not confirm delivery:', {
            response: deliveryResult,
            phone: normalizedPhone,
          });
          throw new Error(`DXING delivery not confirmed: ${JSON.stringify(deliveryResult)}`);
        }

        // Extract OTP from DXING response
        // Response format: { status: 200, message: "...", data: { otp: 123456, messageId: "..." } }
        if (!deliveryResult.data || !deliveryResult.data.otp) {
          throw new Error('DXING response missing OTP code');
        }

        otpCode = String(deliveryResult.data.otp);

        console.info(`[OTP] ✅ DXING confirmed delivery to ${normalizedPhone}`, {
          messageId: deliveryResult.data.messageId,
          status: deliveryResult.status,
          otpLength: otpCode.length,
          timestamp: new Date().toISOString(),
        });

        // Save the DXING-generated OTP to database for verification
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes (matching DXING)
        otp = new OTP({
          phone: normalizedPhone,
          code: otpCode,
          expiresAt,
        });
        await otp.save();

      } catch (err: any) {
        console.error(`[OTP] ❌ DXING delivery failed for ${normalizedPhone}:`, {
          error: err?.message,
          code: err?.code,
          httpStatus: err?.response?.status,
          dxingResponse: err?.response?.data,
          timestamp: new Date().toISOString(),
        });

        // Return user-friendly error
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP via WhatsApp. Please try again or contact support if the problem persists.',
        });
      }
    } else {
      // Development mode: Generate OTP locally
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      otp = new OTP({
        phone: normalizedPhone,
        code: otpCode,
        expiresAt,
      });
      await otp.save();
      
      console.info(`[OTP] Dev mode: Generated OTP for ${normalizedPhone}, OTP=${otpCode}`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
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

    let normalizedPhone: string;
    let localPhone: string;
    try {
      const normalized = normalizeIndianPhone(phone);
      normalizedPhone = normalized.normalized;
      localPhone = normalized.local;
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Invalid phone number' });
    }

    // Find the latest valid OTP for this phone
    const otpRecord = await OTP.findOne({
      phone: normalizedPhone,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP',
      });
    }

    if (otpRecord.code !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Find user
    let user = await User.findOne({ phone: localPhone });
    
    // If no user found, check if it's a member trying to login
    if (!user) {
      const member = await Member.findOne({ phone: localPhone });
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
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Missing JWT secret' });
    }

    const token = jwt.sign(
      { userId: user._id, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Fetch user without populating to keep tenantId as string
    const userResponse = await User.findById(user._id).select('-password');

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

