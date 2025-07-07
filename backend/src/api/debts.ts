import express, { Request, Response } from 'express';
import { PrismaClient, User, Debt } from '../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();

// Calculate debts for user
router.get('/summary', async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  // Get all debts where user is involved
  const debts = await prisma.debt.findMany({
    where: {
      OR: [
        { fromUserId: user.id },
        { toUserId: user.id },
      ],
      settled: false,
    },
    include: { expense: true, toUser: true, fromUser: true },
  });

  // Smart debt reduction
  const netDebts: { [key: number]: number } = {};
  debts.forEach(debt => {
    const otherUserId = debt.fromUserId === user.id ? debt.toUserId : debt.fromUserId;
    const amount = debt.fromUserId === user.id ? debt.amount : -debt.amount;
    netDebts[otherUserId] = (netDebts[otherUserId] || 0) + amount;
  });

  res.json({ debts, netDebts });
});

interface SettleDebtRequest {
  debtId: number;
}

// Settle up (mark debts as paid)
router.post('/settle', async (req: Request<object, object, SettleDebtRequest>, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { debtId } = req.body;
  if (!debtId) return res.status(400).json({ error: 'Missing debtId' });
  try {
    const debt = await prisma.debt.update({
      where: { id: debtId, fromUserId: user.id },
      data: { settled: true },
    });
    res.json({ debt });
  } catch (e) {
    res.status(500).json({ error: 'Failed to settle debt' });
  }
});

// Ledger breakdown (all debts, grouped)
router.get('/ledger', async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const debts = await prisma.debt.findMany({
    where: {
      OR: [
        { fromUserId: user.id },
        { toUserId: user.id },
      ],
    },
    include: { expense: true, toUser: true, fromUser: true },
  });
  // Group by user
  const ledger: { [key: number]: { total: number, details: Debt[] } } = {};
  debts.forEach((d) => {
    const key = d.fromUserId === user.id ? d.toUserId : d.fromUserId;
    if (!ledger[key]) ledger[key] = { total: 0, details: [] };
    ledger[key].total += d.fromUserId === user.id ? d.amount : -d.amount;
    ledger[key].details.push(d);
  });
  res.json({ ledger });
});

export default router; 