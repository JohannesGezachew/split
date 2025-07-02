import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const telegramId = req.header('x-telegram-id');
  if (!telegramId) return res.status(401).json({ error: 'Missing x-telegram-id header' });
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
  if (!user) return res.status(401).json({ error: 'User not found' });
  (req as any).user = user;
  next();
};

