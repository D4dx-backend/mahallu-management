import { Response } from 'express';
import Member from '../models/Member';
import Family from '../models/Family';
import { Varisangya, Zakat, Wallet, Transaction } from '../models/Collectible';
import { NikahRegistration, DeathRegistration, NOC } from '../models/Registration';
import Notification from '../models/Notification';
import Institute from '../models/Institute';
import { Feed } from '../models/Social';
import { AuthRequest } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginationResponse } from '../utils/pagination';

// Get own profile
export const getOwnProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId)
      .populate('familyId', 'houseName mahallId contactNo address');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update own profile (limited fields)
export const updateOwnProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    // Only allow updating specific fields
    const allowedFields = ['phone', 'email'];
    const updateData: any = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const member = await Member.findByIdAndUpdate(
      req.user.memberId,
      updateData,
      { new: true, runValidators: true }
    ).populate('familyId', 'houseName mahallId');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get own payment history
export const getOwnPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const { type, page, limit } = req.query;
    const { skip } = getPaginationParams(req);

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const query: any = {
      tenantId: member.tenantId,
      $or: [
        { memberId: member._id },
        { familyId: member.familyId },
      ],
    };

    let payments: any[] = [];
    let total = 0;

    if (!type || type === 'varisangya') {
      const varisangyas = await Varisangya.find({
        ...query,
        memberId: member._id,
      })
        .populate('familyId', 'houseName')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(Number(limit) || 10);

      const varisangyaTotal = await Varisangya.countDocuments({
        ...query,
        memberId: member._id,
      });

      payments = varisangyas.map((v) => ({
        ...v.toObject(),
        type: 'varisangya',
      }));
      total = varisangyaTotal;
    }

    if (!type || type === 'zakat') {
      const zakats = await Zakat.find({
        tenantId: member.tenantId,
        payerId: member._id,
      })
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(Number(limit) || 10);

      const zakatTotal = await Zakat.countDocuments({
        tenantId: member.tenantId,
        payerId: member._id,
      });

      if (type === 'zakat') {
        payments = zakats.map((z) => ({
          ...z.toObject(),
          type: 'zakat',
        }));
        total = zakatTotal;
      } else {
        payments = [
          ...payments,
          ...zakats.map((z) => ({
            ...z.toObject(),
            type: 'zakat',
          })),
        ];
        total += zakatTotal;
      }
    }

    payments.sort((a, b) => {
      const dateA = a.paymentDate || a.createdAt;
      const dateB = b.paymentDate || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    res.json(createPaginationResponse(payments, total, Number(page) || 1, Number(limit) || 10));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get own wallet balance
export const getOwnWallet = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    let wallet = await Wallet.findOne({
      tenantId: member.tenantId,
      memberId: member._id,
    });

    if (!wallet) {
      wallet = new Wallet({
        tenantId: member.tenantId,
        memberId: member._id,
        balance: 0,
      });
      await wallet.save();
    }

    res.json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get own wallet transactions
export const getOwnWalletTransactions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    let wallet = await Wallet.findOne({
      tenantId: member.tenantId,
      memberId: member._id,
    });

    if (!wallet) {
      wallet = new Wallet({
        tenantId: member.tenantId,
        memberId: member._id,
        balance: 0,
      });
      await wallet.save();
    }

    const { page, limit } = req.query;
    const { skip } = getPaginationParams(req);

    const [transactions, total] = await Promise.all([
      Transaction.find({ walletId: wallet._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit) || 10),
      Transaction.countDocuments({ walletId: wallet._id }),
    ]);

    res.json(createPaginationResponse(transactions, total, Number(page) || 1, Number(limit) || 10));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request Varisangya payment (creates pending payment request)
export const requestVarisangyaPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const varisangyaData = {
      ...req.body,
      tenantId: member.tenantId,
      memberId: member._id,
      familyId: member.familyId,
    };

    const varisangya = new Varisangya(varisangyaData);
    await varisangya.save();

    res.status(201).json({
      success: true,
      data: varisangya,
      message: 'Varisangya payment request submitted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request Zakat payment
export const requestZakatPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const zakatData = {
      ...req.body,
      tenantId: member.tenantId,
      payerId: member._id,
      payerName: member.name,
    };

    const zakat = new Zakat(zakatData);
    await zakat.save();

    res.status(201).json({
      success: true,
      data: zakat,
      message: 'Zakat payment request submitted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get own registrations
export const getOwnRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const { type } = req.query;
    const { page, limit, skip } = getPaginationParams(req);

    const registrations: any = {};

    if (!type || type === 'nikah') {
      const nikahRegs = await NikahRegistration.find({
        tenantId: member.tenantId,
        $or: [
          { groomId: member._id },
          { brideId: member._id },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit) || 10);

      registrations.nikah = nikahRegs;
    }

    if (!type || type === 'death') {
      const deathRegs = await DeathRegistration.find({
        tenantId: member.tenantId,
        deceasedId: member._id,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit) || 10);

      registrations.death = deathRegs;
    }

    if (!type || type === 'noc') {
      const nocs = await NOC.find({
        tenantId: member.tenantId,
        applicantId: member._id,
      })
        .populate('nikahRegistrationId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit) || 10);

      registrations.noc = nocs;
    }

    res.json({ success: true, data: registrations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request Nikah registration
export const requestNikahRegistration = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const nikahData = {
      ...req.body,
      tenantId: member.tenantId,
      groomId: member._id,
      groomName: member.name,
      status: 'pending',
    };

    const nikah = new NikahRegistration(nikahData);
    await nikah.save();

    res.status(201).json({
      success: true,
      data: nikah,
      message: 'Nikah registration request submitted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request Death registration
export const requestDeathRegistration = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const deathData = {
      ...req.body,
      tenantId: member.tenantId,
      deceasedId: member._id,
      deceasedName: member.name,
      familyId: member.familyId,
      status: 'pending',
    };

    const death = new DeathRegistration(deathData);
    await death.save();

    res.status(201).json({
      success: true,
      data: death,
      message: 'Death registration request submitted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request NOC
export const requestNOC = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const nocData = {
      ...req.body,
      tenantId: member.tenantId,
      applicantId: member._id,
      applicantName: member.name,
      applicantPhone: member.phone || req.user.phone,
      status: 'pending',
    };

    const noc = new NOC(nocData);
    await noc.save();

    res.status(201).json({
      success: true,
      data: noc,
      message: 'NOC request submitted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get own notifications
export const getOwnNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const { page, limit, skip } = getPaginationParams(req);

    const query: any = {
      tenantId: member.tenantId,
      $or: [
        { recipientType: 'member', recipientId: member._id },
        { recipientType: 'all' },
      ],
    };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    res.json(createPaginationResponse(notifications, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get community programs (view only)
export const getCommunityPrograms = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const { page, limit, skip } = getPaginationParams(req);

    const query: any = {
      tenantId: member.tenantId,
      type: 'program',
      status: 'active',
    };

    const [programs, total] = await Promise.all([
      Institute.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Institute.countDocuments(query),
    ]);

    res.json(createPaginationResponse(programs, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get public feeds
export const getPublicFeeds = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const { page, limit, skip } = getPaginationParams(req);

    const query: any = {
      tenantId: member.tenantId,
      status: 'published',
    };

    const [feeds, total] = await Promise.all([
      Feed.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feed.countDocuments(query),
    ]);

    res.json(createPaginationResponse(feeds, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get own family members
export const getOwnFamilyMembers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.memberId) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not linked to user account',
      });
    }

    const member = await Member.findById(req.user.memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    if (!member.familyId) {
      return res.status(404).json({
        success: false,
        message: 'Member is not linked to a family',
      });
    }

    const { page, limit, skip } = getPaginationParams(req);

    // Get all active members from the same family
    const [familyMembers, total] = await Promise.all([
      Member.find({ 
        familyId: member.familyId,
        tenantId: member.tenantId,
        status: 'active', // Only show active members
      })
        .populate('familyId', 'houseName mahallId contactNo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Member.countDocuments({ 
        familyId: member.familyId,
        tenantId: member.tenantId,
        status: 'active', // Only count active members
      }),
    ]);

    res.json(createPaginationResponse(familyMembers, total, page, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

