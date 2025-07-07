import express, { Request, Response } from 'express';
import { PrismaClient, User } from '../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();

interface UpsertUserRequest {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
}

// POST /users/upsert - create or update user
router.post('/upsert', async (req: Request<object, object, UpsertUserRequest>, res: Response) => {
  const { telegramId, username, firstName, lastName } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(telegramId) },
    update: { username, firstName, lastName },
    create: { telegramId: BigInt(telegramId), username, firstName, lastName },
  });

  res.json({ user });
});

// GET /user/me - get current user info
router.get('/me', (req: Request, res: Response) => {
  res.json({ user: (req as Request & { user: User }).user });
});

interface UpdateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
}

// PUT /user/me - update profile
router.put('/me', async (req: Request<object, object, UpdateUserRequest>, res: Response) => {
  const { username, firstName, lastName } = req.body;
  const user = (req as Request & { user: User }).user;
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