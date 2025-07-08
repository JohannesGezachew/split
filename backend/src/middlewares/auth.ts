import { Response, NextFunction } from 'express';
import prisma from '../db';
import HttpError from '../HttpError';
import { AuthRequest } from '../interfaces/AuthRequest';

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const telegramId = req.header('x-telegram-id');
  if (!telegramId) return next(new HttpError(401, 'Missing x-telegram-id header'));
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
  if (!user) return next(new HttpError(401, 'User not found'));
  req.user = user;
  next();
};

