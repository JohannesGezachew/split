

import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import HttpError from '../HttpError';
import { validate } from '../middlewares/validation';

import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import users from './users';
import friends from './friends';
import groups from './groups';
import expenses from './expenses';
import debts from './debts';
import { authenticateUser } from '../middlewares/auth';

const router = express.Router();

router.get<Record<string, never>, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

const telegramAuthSchema = z.object({
  body: z.object({
    id: z.string(),
    username: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }),
});

router.post('/auth/telegram', validate(telegramAuthSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, username, first_name: firstName, last_name: lastName } = req.body;
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(id) },
      update: {
        username,
        firstName,
        lastName,
      },
      create: {
        telegramId: BigInt(id),
        username,
        firstName,
        lastName,
      },
    });
    res.json({ user });
  } catch (error) {
    next(new HttpError(500, 'Failed to upsert user.'));
  }
});

router.use('/emojis', emojis);
router.use('/users', users);

router.use(authenticateUser);

router.use('/friends', friends);
router.use('/groups', groups);
router.use('/expenses', expenses);
router.use('/debts', debts);

export default router;


