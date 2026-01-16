import { Request, Response } from 'express';
import User from '../models/User';
import Family from '../models/Family';
import Member from '../models/Member';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId; // Now includes x-tenant-id header for super admin viewing as tenant
    const isSuperAdmin = req.isSuperAdmin;

    // Build query based on user role
    const userQuery: any = {};
    const familyQuery: any = {};
    const memberQuery: any = {};

    // Apply tenant filter
    if (tenantId) {
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

export const getRecentFamilies = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId; // Now includes x-tenant-id header for super admin viewing as tenant
    const limit = parseInt(req.query.limit as string) || 5;

    const query: any = {};
    // Apply tenant filter
    if (tenantId) {
      query.tenantId = tenantId;
    }

    const families = await Family.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('familyName mahallId createdAt status')
      .lean();

    res.json({
      success: true,
      data: families,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId; // Now includes x-tenant-id header for super admin viewing as tenant
    const days = parseInt(req.query.days as string) || 7;

    const query: any = {};
    // Apply tenant filter
    if (tenantId) {
      query.tenantId = tenantId;
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily family registration counts
    const familyActivity = await Family.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Create timeline data for all days
    const timeline = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      const activity = familyActivity.find((a) => a._id === dateStr);
      
      timeline.push({
        name: dayName,
        date: dateStr,
        value: activity ? activity.count : 0,
      });
    }

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

