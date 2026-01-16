import { Request, Response } from 'express';
import { InstituteAccount, Category, MasterWallet, Ledger, LedgerItem } from '../models/MasterAccount';
import { AuthRequest } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginationResponse } from '../utils/pagination';

// Institute Accounts
export const getAllInstituteAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const { instituteId, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (instituteId) query.instituteId = instituteId;

    const [accounts, total] = await Promise.all([
      InstituteAccount.find(query)
        .populate('instituteId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InstituteAccount.countDocuments(query),
    ]);

    res.json(createPaginationResponse(accounts, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInstituteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const accountData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!accountData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    const account = new InstituteAccount(accountData);
    await account.save();
    const populated = await InstituteAccount.findById(account._id).populate('instituteId', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Categories
export const getAllCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { type, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (type) query.type = type;

    const [categories, total] = await Promise.all([
      Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Category.countDocuments(query),
    ]);

    res.json(createPaginationResponse(categories, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const categoryData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!categoryData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    const category = new Category(categoryData);
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Master Wallets
export const getAllWallets = async (req: AuthRequest, res: Response) => {
  try {
    const { type, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (type) query.type = type;

    const [wallets, total] = await Promise.all([
      MasterWallet.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MasterWallet.countDocuments(query),
    ]);

    res.json(createPaginationResponse(wallets, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWallet = async (req: AuthRequest, res: Response) => {
  try {
    const walletData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!walletData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    const wallet = new MasterWallet(walletData);
    await wallet.save();
    res.status(201).json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ledgers
export const getAllLedgers = async (req: AuthRequest, res: Response) => {
  try {
    const { type, tenantId } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (type) query.type = type;

    const [ledgers, total] = await Promise.all([
      Ledger.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Ledger.countDocuments(query),
    ]);

    res.json(createPaginationResponse(ledgers, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLedger = async (req: AuthRequest, res: Response) => {
  try {
    const ledgerData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!ledgerData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    const ledger = new Ledger(ledgerData);
    await ledger.save();
    res.status(201).json({ success: true, data: ledger });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ledger Items
export const getLedgerItems = async (req: AuthRequest, res: Response) => {
  try {
    const { ledgerId, tenantId, startDate, endDate } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const query: any = {};

    // Apply tenant filter - req.tenantId includes x-tenant-id header for super admin viewing as tenant
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    } else if (tenantId && req.isSuperAdmin) {
      query.tenantId = tenantId;
    }

    if (ledgerId) query.ledgerId = ledgerId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const [items, total] = await Promise.all([
      LedgerItem.find(query)
        .populate('ledgerId', 'name')
        .populate('categoryId', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      LedgerItem.countDocuments(query),
    ]);

    res.json(createPaginationResponse(items, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLedgerItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemData = {
      ...req.body,
      tenantId: req.tenantId || req.body.tenantId,
    };

    if (!itemData.tenantId && !req.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      });
    }

    const item = new LedgerItem(itemData);
    await item.save();
    const populated = await LedgerItem.findById(item._id)
      .populate('ledgerId', 'name')
      .populate('categoryId', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

