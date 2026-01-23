import { Request, Response } from 'express';
import Family from '../models/Family';
import Member from '../models/Member';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAreaReport = async (req: AuthRequest, res: Response) => {
  try {
    const { area, tenantId } = req.query;
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (area) query.area = area;

    const families = await Family.find(query);
    const familyIds = families.map((f) => f._id);
    const members = await Member.find({ familyId: { $in: familyIds } });

    const report = {
      totalFamilies: families.length,
      totalMembers: members.length,
      maleCount: members.filter((m) => m.gender === 'male').length,
      femaleCount: members.filter((m) => m.gender === 'female').length,
      families: families.map((f) => ({
        id: f._id,
        houseName: f.houseName,
        area: f.area,
        memberCount: members.filter((m) => m.familyId.toString() === f._id.toString()).length,
      })),
    };

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBloodBankReport = async (req: AuthRequest, res: Response) => {
  try {
    const { bloodGroup, tenantId } = req.query;
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (bloodGroup) query.bloodGroup = bloodGroup;

    const members = await Member.find(query).select('name bloodGroup phone age gender');

    const bloodGroupStats: Record<string, number> = {};
    members.forEach((member) => {
      if (member.bloodGroup) {
        bloodGroupStats[member.bloodGroup] = (bloodGroupStats[member.bloodGroup] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        total: members.length,
        bloodGroupStats,
        members: members.filter((m) => m.bloodGroup),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrphansReport = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.query;
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    // This is a simplified version - in reality, you'd need to identify orphans based on family structure
    const members = await Member.find(query)
      .populate('familyId', 'houseName')
      .select('name age gender familyId');

    // Filter members who might be orphans (age < 18, or based on other criteria)
    const orphans = members.filter((m) => (m.age || 0) < 18);

    res.json({
      success: true,
      data: {
        total: orphans.length,
        orphans: orphans.map((o) => ({
          id: o._id,
          name: o.name,
          age: o.age,
          gender: o.gender,
          family: (o.familyId as any)?.houseName,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

