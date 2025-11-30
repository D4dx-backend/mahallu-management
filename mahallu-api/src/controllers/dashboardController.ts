import { Request, Response } from 'express';
import User from '../models/User';
import Family from '../models/Family';
import Member from '../models/Member';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;
    const isSuperAdmin = req.isSuperAdmin;

    // Build query based on user role
    const userQuery: any = {};
    const familyQuery: any = {};
    const memberQuery: any = {};

    if (!isSuperAdmin && tenantId) {
      userQuery.tenantId = tenantId;
      familyQuery.tenantId = tenantId;
      memberQuery.tenantId = tenantId;
    }

    // Get counts
    const [totalUsers, totalFamilies, totalMembers, activeUsers, inactiveUsers] = await Promise.all([
      User.countDocuments(userQuery),
      Family.countDocuments(familyQuery),
      Member.countDocuments(memberQuery),
      User.countDocuments({ ...userQuery, status: 'active' }),
      User.countDocuments({ ...userQuery, status: 'inactive' }),
    ]);

    // Get gender distribution
    const [maleCount, femaleCount] = await Promise.all([
      Member.countDocuments({ ...memberQuery, gender: 'male' }),
      Member.countDocuments({ ...memberQuery, gender: 'female' }),
    ]);

    // Get status distribution for families
    const [approvedFamilies, pendingFamilies, unapprovedFamilies] = await Promise.all([
      Family.countDocuments({ ...familyQuery, status: 'approved' }),
      Family.countDocuments({ ...familyQuery, status: 'pending' }),
      Family.countDocuments({ ...familyQuery, status: 'unapproved' }),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        families: {
          total: totalFamilies,
          approved: approvedFamilies,
          pending: pendingFamilies,
          unapproved: unapprovedFamilies,
        },
        members: {
          total: totalMembers,
          male: maleCount,
          female: femaleCount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

