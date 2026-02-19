import express from 'express';
import {
  getAllPettyCash,
  getPettyCash,
  createPettyCash,
  updatePettyCash,
  getPettyCashTransactions,
  recordExpense,
  replenishPettyCash,
} from '../controllers/pettyCashController';
import { authMiddleware } from '../middleware/authMiddleware';
import { tenantMiddleware, tenantFilter, instituteFilter } from '../middleware/tenantMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(tenantFilter);
router.use(instituteFilter);

// Petty Cash Funds
router.get('/', getAllPettyCash);
router.get('/:id', getPettyCash);
router.post('/', createPettyCash);
router.put('/:id', updatePettyCash);

// Petty Cash Transactions
router.get('/:id/transactions', getPettyCashTransactions);
router.post('/:id/expense', recordExpense);
router.post('/:id/replenish', replenishPettyCash);

export default router;
