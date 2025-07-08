
import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../generated/prisma';
import prisma from '../db';

import { validate } from '../middlewares/validation';

const router = express.Router();

const addExpenseSchema = z.object({
  body: z.object({
    amount: z.number(),
    groupId: z.number().optional(),
    splits: z.array(z.object({
      userId: z.number(),
      amount: z.number(),
    })),
    note: z.string().optional(),
    date: z.string().optional(),
  }),
});

// Add expense (group or individual)
router.post('/add', validate(addExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const { amount, groupId, splits, note, date } = req.body;
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
    next(e);
  }
});

const historySchema = z.object({
  query: z.object({
    groupId: z.string().optional(),
  }),
});

// Expense history (per user, per group)
router.get('/history', validate(historySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (e) {
    next(e);
  }
});

export default router;
 