import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Varisangya, Zakat, Wallet, Transaction } from '../models/Collectible';
import { AuthRequest } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginationResponse } from '../utils/pagination';

const getNextReceiptNo = async (Model: typeof Varisangya | typeof Zakat, tenantId: string) => {
  const normalizedTenantId = mongoose.Types.ObjectId.isValid(tenantId)
    ? new mongoose.Types.ObjectId(tenantId)
    : tenantId;
  const [latest] = await Model.aggregate([
    {
      $match: {
        tenantId: normalizedTenantId,
        receiptNo: { $regex: /^\d+$/ },
      },
    },
    {
      $addFields: {
        receiptNoNum: { $toInt: '$receiptNo' },
      },
    },
    { $sort: { receiptNoNum: -1 } },
    { $limit: 1 },
  ]);

  const lastNumber = latest?.receiptNoNum || 14000;
  return String(lastNumber + 1);
};

// Varisangya
export const getAllVarisangyas = async (req: AuthRequest, res: Response) => {
  try {
    const { familyId, memberId, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (familyId) query.familyId = familyId;
    if (memberId) query.memberId = memberId;

    const [varisangyas, total] = await Promise.all([
      Varisangya.find(query)
        .populate('familyId', 'houseName')
        .populate('memberId', 'name')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Varisangya.countDocuments(query),
    ]);

    res.json(createPaginationResponse(varisangyas, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNextReceiptNumber = async (req: AuthRequest, res: Response) => {
  try {
    const { type, tenantId } = req.query as { type?: string; tenantId?: string };
    const finalTenantId = req.tenantId || (tenantId && req.isSuperAdmin ? tenantId : undefined);

    if (!finalTenantId && !req.isSuperAdmin) {
      return res.status(400).json({ success: false, message: 'Tenant ID is required' });
    }

    if (type !== 'varisangya' && type !== 'zakat') {
      return res.status(400).json({ success: false, message: 'Invalid receipt type' });
    }

    const model = type === 'varisangya' ? Varisangya : Zakat;
    const receiptNo = await getNextReceiptNo(model, finalTenantId as string);

    res.json({ success: true, data: { receiptNo } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVarisangya = async (req: AuthRequest, res: Response) => {
  try {
    const varisangyaData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!varisangyaData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    if (!varisangyaData.receiptNo) {
      varisangyaData.receiptNo = await getNextReceiptNo(Varisangya, varisangyaData.tenantId);
    }

    const varisangya = new Varisangya(varisangyaData);
    await varisangya.save();

    // Update wallet if familyId or memberId exists
    if (varisangya.familyId || varisangya.memberId) {
      let wallet = await Wallet.findOne({
        tenantId: varisangya.tenantId,
        familyId: varisangya.familyId,
        memberId: varisangya.memberId,
      });

      if (!wallet) {
        wallet = new Wallet({
          tenantId: varisangya.tenantId,
          familyId: varisangya.familyId,
          memberId: varisangya.memberId,
          balance: 0,
        });
      }

      wallet.balance += varisangya.amount;
      wallet.lastTransactionDate = varisangya.paymentDate;
      await wallet.save();

      // Create transaction
      await Transaction.create({
        tenantId: varisangya.tenantId,
        walletId: wallet._id,
        type: 'credit',
        amount: varisangya.amount,
        description: `Varisangya payment - ${varisangya.receiptNo || 'N/A'}`,
        referenceId: varisangya._id,
        referenceType: 'varisangya',
      });
    }

    res.status(201).json({ success: true, data: varisangya });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Zakat
export const getAllZakats = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, search } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (search) {
      query.payerName = { $regex: search, $options: 'i' };
    }

    const [zakats, total] = await Promise.all([
      Zakat.find(query)
        .populate('payerId', 'name')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Zakat.countDocuments(query),
    ]);

    res.json(createPaginationResponse(zakats, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createZakat = async (req: AuthRequest, res: Response) => {
  try {
    const zakatData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!zakatData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    if (!zakatData.receiptNo) {
      zakatData.receiptNo = await getNextReceiptNo(Zakat, zakatData.tenantId);
    }

    const zakat = new Zakat(zakatData);
    await zakat.save();
    res.status(201).json({ success: true, data: zakat });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wallet
export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { familyId, memberId } = req.query;
    const query: any = {
      tenantId: req.tenantId || req.query.tenantId,
    };

    if (familyId) query.familyId = familyId;
    if (memberId) query.memberId = memberId;

    const wallet = await Wallet.findOne(query);
    if (!wallet) {
      return res.json({ success: true, data: { balance: 0 } });
    }
    res.json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWalletTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params;
    const transactions = await Transaction.find({ walletId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

