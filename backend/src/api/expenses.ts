import express, { Request, Response } from 'express';
import { PrismaClient, User } from '../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();

interface AddExpenseRequest {
  amount: number;
  groupId?: number;
  splits: { userId: number; amount: number }[];
  note?: string;
  date?: string;
}

// Add expense (group or individual)
router.post('/add', async (req: Request<object, object, AddExpenseRequest>, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { amount, groupId, splits, note, date } = req.body;
  if (!amount || !splits || !Array.isArray(splits)) return res.status(400).json({ error: 'Missing or invalid amount/splits' });
  try {
    const expense = await prisma.expense.create({
      data: {
        amount,
        paidById: user.id,
        groupId,
        note,
        date: date ? new Date(date) : undefined,
        splits: {
          create: splits.map((s: { userId: number; amount: number }) => ({ userId: s.userId, amount: s.amount })),
        },
      },
      include: { splits: true },
    });
    res.json({ expense });
  } catch (e) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

interface HistoryQuery {
  groupId?: string;
}

// Expense history (per user, per group)
router.get('/history', async (req: Request<object, object, object, HistoryQuery>, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { groupId } = req.query;
  const where: { OR: ({ paidById: number; } | { splits: { some: { userId: number; }; }; })[]; groupId?: number; } = { OR: [{ paidById: user.id }, { splits: { some: { userId: user.id } } }] };
  if (groupId) where.groupId = Number(groupId);
  const expenses = await prisma.expense.findMany({
    where,
    include: { splits: true },
    orderBy: { date: 'desc' },
    take: 50,
  });
  res.json({ expenses });
});

export default router; 