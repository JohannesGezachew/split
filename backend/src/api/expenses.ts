import express from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();

// Add expense (group or individual)
router.post('/add', async (req, res) => {
  const user = (req as any).user;
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
          create: splits.map((s: any) => ({ userId: s.userId, amount: s.amount })),
        },
      },
      include: { splits: true },
    });
    res.json({ expense });
  } catch (e) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Expense history (per user, per group)
router.get('/history', async (req, res) => {
  const user = (req as any).user;
  const { groupId } = req.query;
  let where: any = { OR: [{ paidById: user.id }, { splits: { some: { userId: user.id } } }] };
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