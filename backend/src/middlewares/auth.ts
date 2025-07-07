import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '../generated/prisma';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const telegramId = req.header('x-telegram-id');
  if (!telegramId) return res.status(401).json({ error: 'Missing x-telegram-id header' });
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = user;
  next();
};

