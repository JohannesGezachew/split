import express from 'express';
import { PrismaClient } from '../generated/prisma';

import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import users from './users';
import friends from './friends';
import groups from './groups';
import expenses from './expenses';
import debts from './debts';

const router = express.Router();

const prisma = new PrismaClient();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);
router.use('/users', users);
router.use('/friends', friends);
router.use('/groups', groups);
router.use('/expenses', expenses);
router.use('/debts', debts);

router.post('/auth/telegram', async (req, res) => {
  const { id, username, first_name, last_name } = req.body;
  if (!id || !first_name) {
    return res.status(400).json({ error: 'Missing required Telegram user info.' });
  }
  try {
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(id) },
      update: {
        username,
        firstName: first_name,
        lastName: last_name,
      },
      create: {
        telegramId: BigInt(id),
        username,
        firstName: first_name,
        lastName: last_name,
      },
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upsert user.' });
  }
});

export default router;
