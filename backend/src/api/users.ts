import express from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();

// GET /user/me - get current user info
router.get('/me', (req, res) => {
  res.json({ user: (req as any).user });
});

// PUT /user/me - update profile
router.put('/me', async (req, res) => {
  const { username, firstName, lastName } = req.body;
  const user = (req as any).user;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { username, firstName, lastName },
  });
  res.json({ user: updated });
});

// GET /users/search?username=... - search users by username
router.get('/search', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username query param' });
  const users = await prisma.user.findMany({
    where: { username: { contains: username as string } },
    take: 10,
  });
  res.json({ users });
});

export default router; 