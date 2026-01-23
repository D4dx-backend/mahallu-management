import { Request, Response } from 'express';
import Institute from '../models/Institute';
import { AuthRequest } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginationResponse } from '../utils/pagination';

export const getAllMadrasas = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = { type: 'madrasa' };

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { place: { $regex: search, $options: 'i' } },
      ];
    }

    const [madrasas, total] = await Promise.all([
      Institute.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Institute.countDocuments(query),
    ]);

    res.json(createPaginationResponse(madrasas, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMadrasaById = async (req: Request, res: Response) => {
  try {
    const madrasa = await Institute.findOne({ _id: req.params.id, type: 'madrasa' });
    if (!madrasa) {
      return res.status(404).json({ success: false, message: 'Madrasa not found' });
    }
    res.json({ success: true, data: madrasa });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMadrasa = async (req: AuthRequest, res: Response) => {
  try {
    const madrasaData = {
      ...req.body,
      type: 'madrasa',
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!madrasaData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    const madrasa = new Institute(madrasaData);
    await madrasa.save();
    res.status(201).json({ success: true, data: madrasa });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMadrasa = async (req: Request, res: Response) => {
  try {
    const madrasa = await Institute.findOneAndUpdate(
      { _id: req.params.id, type: 'madrasa' },
      { ...req.body, type: 'madrasa' },
      { new: true, runValidators: true }
    );
    if (!madrasa) {
      return res.status(404).json({ success: false, message: 'Madrasa not found' });
    }
    res.json({ success: true, data: madrasa });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMadrasa = async (req: Request, res: Response) => {
  try {
    const madrasa = await Institute.findOneAndDelete({ _id: req.params.id, type: 'madrasa' });
    if (!madrasa) {
      return res.status(404).json({ success: false, message: 'Madrasa not found' });
    }
    res.json({ success: true, message: 'Madrasa deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

