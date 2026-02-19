import { Response } from 'express';
import { LedgerItem, Ledger, Category, InstituteAccount } from '../models/MasterAccount';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

/**
 * Day Book: Chronological list of all transactions for an institute within a date range
 */
export const getDayBook = async (req: AuthRequest, res: Response) => {
  try {
    const { instituteId, startDate, endDate } = req.query;
    const query: any = {};

    if (req.tenantId) {
      query.tenantId = new mongoose.Types.ObjectId(req.tenantId);
    }

    if (instituteId) {
      query.instituteId = new mongoose.Types.ObjectId(instituteId as string);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const items = await LedgerItem.find(query)
      .populate('ledgerId', 'name type')
      .populate('categoryId', 'name type')
      .populate('instituteId', 'name type')
      .sort({ date: 1, createdAt: 1 });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    const entries = items.map((item: any) => {
      const ledgerType = item.ledgerId?.type;
      if (ledgerType === 'income') {
        totalIncome += item.amount;
      } else if (ledgerType === 'expense') {
        totalExpense += item.amount;
      }
      return {
        _id: item._id,
        date: item.date,
        description: item.description,
        ledger: item.ledgerId?.name,
        ledgerType: item.ledgerId?.type,
        category: item.categoryId?.name,
        institute: item.instituteId?.name,
        amount: item.amount,
        paymentMethod: item.paymentMethod,
        referenceNo: item.referenceNo,
        type: ledgerType,
      };
    });

    res.json({
      success: true,
      data: {
        entries,
        summary: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          totalEntries: entries.length,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Trial Balance: Aggregate income vs expense totals by ledger
 */
export const getTrialBalance = async (req: AuthRequest, res: Response) => {
  try {
    const { instituteId, startDate, endDate } = req.query;
    const matchQuery: any = {};

    if (req.tenantId) {
      matchQuery.tenantId = new mongoose.Types.ObjectId(req.tenantId);
    }

    if (instituteId) {
      matchQuery.instituteId = new mongoose.Types.ObjectId(instituteId as string);
    }

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate as string);
      if (endDate) matchQuery.date.$lte = new Date(endDate as string);
    }

    const result = await LedgerItem.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'ledgers',
          localField: 'ledgerId',
          foreignField: '_id',
          as: 'ledger',
        },
      },
      { $unwind: '$ledger' },
      {
        $group: {
          _id: {
            ledgerId: '$ledgerId',
            ledgerName: '$ledger.name',
            ledgerType: '$ledger.type',
          },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          ledgerId: '$_id.ledgerId',
          ledgerName: '$_id.ledgerName',
          ledgerType: '$_id.ledgerType',
          debit: {
            $cond: [{ $eq: ['$_id.ledgerType', 'expense'] }, '$totalAmount', 0],
          },
          credit: {
            $cond: [{ $eq: ['$_id.ledgerType', 'income'] }, '$totalAmount', 0],
          },
          totalAmount: 1,
          transactionCount: 1,
        },
      },
      { $sort: { ledgerType: 1, ledgerName: 1 } },
    ]);

    const totalDebit = result.reduce((sum: number, r: any) => sum + r.debit, 0);
    const totalCredit = result.reduce((sum: number, r: any) => sum + r.credit, 0);

    res.json({
      success: true,
      data: {
        ledgers: result,
        totals: {
          totalDebit,
          totalCredit,
          difference: totalCredit - totalDebit,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Balance Sheet: Assets (bank balances) vs Liabilities, Income summary vs Expense summary
 */
export const getBalanceSheet = async (req: AuthRequest, res: Response) => {
  try {
    const { instituteId, startDate, endDate } = req.query;
    const tenantFilter: any = {};

    if (req.tenantId) {
      tenantFilter.tenantId = new mongoose.Types.ObjectId(req.tenantId);
    }

    const instituteFilter: any = { ...tenantFilter };
    if (instituteId) {
      instituteFilter.instituteId = new mongoose.Types.ObjectId(instituteId as string);
    }

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate as string);
      if (endDate) dateFilter.date.$lte = new Date(endDate as string);
    }

    // 1. Get bank account balances (assets)
    const accountQuery: any = { ...tenantFilter };
    if (instituteId) accountQuery.instituteId = new mongoose.Types.ObjectId(instituteId as string);
    accountQuery.status = 'active';

    const bankAccounts = await InstituteAccount.find(accountQuery)
      .populate('instituteId', 'name')
      .select('accountName bankName balance instituteId');

    const totalBankBalance = bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);

    // 2. Get income summary
    const incomeResult = await LedgerItem.aggregate([
      {
        $match: { ...instituteFilter, ...dateFilter },
      },
      {
        $lookup: {
          from: 'ledgers',
          localField: 'ledgerId',
          foreignField: '_id',
          as: 'ledger',
        },
      },
      { $unwind: '$ledger' },
      { $match: { 'ledger.type': 'income' } },
      {
        $group: {
          _id: { ledgerId: '$ledgerId', ledgerName: '$ledger.name' },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          ledgerName: '$_id.ledgerName',
          total: 1,
        },
      },
      { $sort: { ledgerName: 1 } },
    ]);

    // 3. Get expense summary
    const expenseResult = await LedgerItem.aggregate([
      {
        $match: { ...instituteFilter, ...dateFilter },
      },
      {
        $lookup: {
          from: 'ledgers',
          localField: 'ledgerId',
          foreignField: '_id',
          as: 'ledger',
        },
      },
      { $unwind: '$ledger' },
      { $match: { 'ledger.type': 'expense' } },
      {
        $group: {
          _id: { ledgerId: '$ledgerId', ledgerName: '$ledger.name' },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          ledgerName: '$_id.ledgerName',
          total: 1,
        },
      },
      { $sort: { ledgerName: 1 } },
    ]);

    // Salary is already included in expenseResult via auto-posted LedgerItems (source='salary')
    // No separate SalaryPayment query needed — avoids double-counting

    const totalIncome = incomeResult.reduce((sum: number, r: any) => sum + r.total, 0);
    const totalExpense = expenseResult.reduce((sum: number, r: any) => sum + r.total, 0);

    res.json({
      success: true,
      data: {
        assets: {
          bankAccounts: bankAccounts.map((acc: any) => ({
            accountName: acc.accountName,
            bankName: acc.bankName,
            balance: acc.balance,
            institute: acc.instituteId?.name,
          })),
          totalBankBalance,
        },
        income: {
          items: incomeResult,
          total: totalIncome,
        },
        expenses: {
          items: expenseResult,
          salaryExpense: 0,
          total: totalExpense,
        },
        summary: {
          totalAssets: totalBankBalance,
          totalIncome,
          totalExpenses: totalExpense,
          netBalance: totalIncome - totalExpense,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Ledger Report: Detailed transactions for a specific ledger with opening/closing balance
 */
export const getLedgerReport = async (req: AuthRequest, res: Response) => {
  try {
    const { ledgerId, instituteId, startDate, endDate } = req.query;

    if (!ledgerId) {
      return res.status(400).json({ success: false, message: 'ledgerId is required' });
    }

    const tenantMatch: any = {};
    if (req.tenantId) {
      tenantMatch.tenantId = new mongoose.Types.ObjectId(req.tenantId);
    }

    const baseMatch: any = {
      ...tenantMatch,
      ledgerId: new mongoose.Types.ObjectId(ledgerId as string),
    };

    if (instituteId) {
      baseMatch.instituteId = new mongoose.Types.ObjectId(instituteId as string);
    }

    // Opening balance: sum of all entries before startDate
    let openingBalance = 0;
    if (startDate) {
      const openingResult = await LedgerItem.aggregate([
        { $match: { ...baseMatch, date: { $lt: new Date(startDate as string) } } },
        {
          $lookup: { from: 'ledgers', localField: 'ledgerId', foreignField: '_id', as: 'ledger' },
        },
        { $unwind: '$ledger' },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $cond: [{ $eq: ['$ledger.type', 'income'] }, '$amount', { $multiply: ['$amount', -1] }],
              },
            },
          },
        },
      ]);
      openingBalance = openingResult[0]?.total || 0;
    }

    // Transactions in date range
    const dateMatch: any = { ...baseMatch };
    if (startDate || endDate) {
      dateMatch.date = {};
      if (startDate) dateMatch.date.$gte = new Date(startDate as string);
      if (endDate) dateMatch.date.$lte = new Date(endDate as string);
    }

    const items = await LedgerItem.find(dateMatch)
      .populate('ledgerId', 'name type')
      .populate('categoryId', 'name')
      .populate('instituteId', 'name')
      .sort({ date: 1, createdAt: 1 });

    // Build entries with running balance
    let runningBalance = openingBalance;
    const entries = items.map((item: any) => {
      const isIncome = item.ledgerId?.type === 'income';
      const signedAmount = isIncome ? item.amount : -item.amount;
      runningBalance += signedAmount;
      return {
        _id: item._id,
        date: item.date,
        description: item.description,
        category: item.categoryId?.name,
        institute: item.instituteId?.name,
        debit: isIncome ? 0 : item.amount,
        credit: isIncome ? item.amount : 0,
        amount: item.amount,
        balance: runningBalance,
        paymentMethod: item.paymentMethod,
        referenceNo: item.referenceNo,
        source: item.source,
      };
    });

    const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
    const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

    const ledger = await Ledger.findById(ledgerId);

    res.json({
      success: true,
      data: {
        ledger: ledger ? { _id: ledger._id, name: ledger.name, type: ledger.type } : null,
        openingBalance,
        closingBalance: runningBalance,
        totalDebit,
        totalCredit,
        entries,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Income & Expenditure Statement: Groups income and expenses by category with surplus/deficit
 */
export const getIncomeExpenditure = async (req: AuthRequest, res: Response) => {
  try {
    const { instituteId, startDate, endDate } = req.query;
    const matchQuery: any = {};

    if (req.tenantId) {
      matchQuery.tenantId = new mongoose.Types.ObjectId(req.tenantId);
    }
    if (instituteId) {
      matchQuery.instituteId = new mongoose.Types.ObjectId(instituteId as string);
    }
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate as string);
      if (endDate) matchQuery.date.$lte = new Date(endDate as string);
    }

    // Income grouped by ledger then category
    const incomeItems = await LedgerItem.aggregate([
      { $match: matchQuery },
      { $lookup: { from: 'ledgers', localField: 'ledgerId', foreignField: '_id', as: 'ledger' } },
      { $unwind: '$ledger' },
      { $match: { 'ledger.type': 'income' } },
      { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            ledgerId: '$ledgerId',
            ledgerName: '$ledger.name',
            categoryId: '$categoryId',
            categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { ledgerId: '$_id.ledgerId', ledgerName: '$_id.ledgerName' },
          categories: {
            $push: {
              categoryId: '$_id.categoryId',
              categoryName: '$_id.categoryName',
              total: '$total',
              count: '$count',
            },
          },
          ledgerTotal: { $sum: '$total' },
        },
      },
      { $sort: { '_id.ledgerName': 1 } },
    ]);

    // Expense grouped similarly
    const expenseItems = await LedgerItem.aggregate([
      { $match: matchQuery },
      { $lookup: { from: 'ledgers', localField: 'ledgerId', foreignField: '_id', as: 'ledger' } },
      { $unwind: '$ledger' },
      { $match: { 'ledger.type': 'expense' } },
      { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            ledgerId: '$ledgerId',
            ledgerName: '$ledger.name',
            categoryId: '$categoryId',
            categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { ledgerId: '$_id.ledgerId', ledgerName: '$_id.ledgerName' },
          categories: {
            $push: {
              categoryId: '$_id.categoryId',
              categoryName: '$_id.categoryName',
              total: '$total',
              count: '$count',
            },
          },
          ledgerTotal: { $sum: '$total' },
        },
      },
      { $sort: { '_id.ledgerName': 1 } },
    ]);

    const totalIncome = incomeItems.reduce((s: number, i: any) => s + i.ledgerTotal, 0);
    const totalExpense = expenseItems.reduce((s: number, i: any) => s + i.ledgerTotal, 0);

    res.json({
      success: true,
      data: {
        income: incomeItems.map((i: any) => ({
          ledgerId: i._id.ledgerId,
          ledgerName: i._id.ledgerName,
          categories: i.categories,
          total: i.ledgerTotal,
        })),
        expenses: expenseItems.map((e: any) => ({
          ledgerId: e._id.ledgerId,
          ledgerName: e._id.ledgerName,
          categories: e.categories,
          total: e.ledgerTotal,
        })),
        totalIncome,
        totalExpense,
        surplus: totalIncome - totalExpense,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Consolidated Report: Aggregates income / expense by institute for franchise-level view
 */
export const getConsolidatedReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery: any = {};

    if (req.tenantId) {
      matchQuery.tenantId = new mongoose.Types.ObjectId(req.tenantId);
    }
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate as string);
      if (endDate) matchQuery.date.$lte = new Date(endDate as string);
    }

    const result = await LedgerItem.aggregate([
      { $match: matchQuery },
      { $lookup: { from: 'ledgers', localField: 'ledgerId', foreignField: '_id', as: 'ledger' } },
      { $unwind: '$ledger' },
      { $lookup: { from: 'institutes', localField: 'instituteId', foreignField: '_id', as: 'institute' } },
      { $unwind: { path: '$institute', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            instituteId: '$instituteId',
            instituteName: { $ifNull: ['$institute.name', 'Unassigned'] },
          },
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$ledger.type', 'income'] }, '$amount', 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$ledger.type', 'expense'] }, '$amount', 0] },
          },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          instituteId: '$_id.instituteId',
          instituteName: '$_id.instituteName',
          totalIncome: 1,
          totalExpense: 1,
          netBalance: { $subtract: ['$totalIncome', '$totalExpense'] },
          transactionCount: 1,
        },
      },
      { $sort: { instituteName: 1 } },
    ]);

    // Bank accounts per institute
    const accountQuery: any = { status: 'active' };
    if (req.tenantId) accountQuery.tenantId = new mongoose.Types.ObjectId(req.tenantId);

    const bankAccounts = await InstituteAccount.aggregate([
      { $match: accountQuery },
      { $lookup: { from: 'institutes', localField: 'instituteId', foreignField: '_id', as: 'institute' } },
      { $unwind: { path: '$institute', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { instituteId: '$instituteId', instituteName: { $ifNull: ['$institute.name', 'Unassigned'] } },
          totalBankBalance: { $sum: '$balance' },
          accountCount: { $sum: 1 },
        },
      },
    ]);

    const bankMap: Record<string, number> = {};
    bankAccounts.forEach((b: any) => {
      bankMap[String(b._id.instituteId)] = b.totalBankBalance;
    });

    const institutes = result.map((r: any) => ({
      ...r,
      bankBalance: bankMap[String(r.instituteId)] || 0,
    }));

    const grandTotalIncome = institutes.reduce((s: number, i: any) => s + i.totalIncome, 0);
    const grandTotalExpense = institutes.reduce((s: number, i: any) => s + i.totalExpense, 0);
    const grandBankBalance = institutes.reduce((s: number, i: any) => s + i.bankBalance, 0);

    res.json({
      success: true,
      data: {
        institutes,
        grandTotals: {
          totalIncome: grandTotalIncome,
          totalExpense: grandTotalExpense,
          netBalance: grandTotalIncome - grandTotalExpense,
          bankBalance: grandBankBalance,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};