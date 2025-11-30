import { Request, Response } from 'express';
import { Varisangya, Zakat, Wallet, Transaction } from '../models/Collectible';
import { AuthRequest } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginationResponse } from '../utils/pagination';

// Varisangya
export const getAllVarisangyas = async (req: AuthRequest, res: Response) => {
  try {
    const { familyId, memberId, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    if (!req.isSuperAdmin && req.tenantId) {
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

    if (!req.isSuperAdmin && req.tenantId) {
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

