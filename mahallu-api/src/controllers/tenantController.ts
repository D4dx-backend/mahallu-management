import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginationResponse } from '../utils/pagination';

export const getAllTenants = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, type } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      Tenant.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Tenant.countDocuments(query),
    ]);

    res.json(createPaginationResponse(tenants, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTenantById = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    res.json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenantData = req.body;
    
    // Check if code already exists
    const existingTenant = await Tenant.findOne({ code: tenantData.code.toUpperCase() });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: 'Tenant with this code already exists',
      });
    }

    const tenant = new Tenant({
      ...tenantData,
      code: tenantData.code.toUpperCase(),
    });
    await tenant.save();

    res.status(201).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Optionally: Delete all related data or mark as deleted
    res.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTenantStats = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.params.id;
    
    // Get statistics for the tenant
    const [users, families, members] = await Promise.all([
      User.countDocuments({ tenantId }),
      require('../models/Family').default.countDocuments({ tenantId }),
      require('../models/Member').default.countDocuments({ tenantId }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        families,
        members,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const activateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

