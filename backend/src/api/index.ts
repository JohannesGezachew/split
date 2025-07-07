import express from 'express';
import { PrismaClient } from '../generated/prisma';

import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import users from './users';
import friends from './friends';
import groups from './groups';
import expenses from './expenses';
import debts from './debts';
import { authenticateUser } from '../middlewares/auth';

const router = express.Router();

const prisma = new PrismaClient();

router.get<Record<string, never>, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

interface TelegramAuthRequest {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

router.post('/auth/telegram', async (req, res) => {
  const { id, username, first_name: firstName, last_name: lastName } = req.body as TelegramAuthRequest;
  if (!id || !firstName) {
    return res.status(400).json({ error: 'Missing required Telegram user info.' });
  }
  try {
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
    res.status(500).json({ error: 'Failed to upsert user.' });
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
