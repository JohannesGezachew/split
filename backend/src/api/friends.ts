

import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../generated/prisma';
import prisma from '../db';
import HttpError from '../HttpError';
import { validate } from '../middlewares/validation';

const router = express.Router();

const friendRequestSchema = z.object({
  body: z.object({
    toUserId: z.number(),
  }),
});

// Send friend request
router.post('/request', validate(friendRequestSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const { toUserId } = req.body;
    if (user.id === toUserId) throw new HttpError(400, 'Cannot friend yourself');
    const existing = await prisma.friendship.findFirst({
      where: {
        requesterId: user.id,
        addresseeId: toUserId,
      },
    });
    if (existing) throw new HttpError(400, 'Request already exists');
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        addresseeId: toUserId,
        status: 'PENDING',
      },
    });
    res.json({ friendship });
  } catch (e) {
    next(e);
  }
});

const respondRequestSchema = z.object({
  body: z.object({
    requestId: z.number(),
  }),
});

// Accept friend request
router.patch('/accept', validate(respondRequestSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const { requestId } = req.body;
    const friendship = await prisma.friendship.update({
      where: { id: requestId, addresseeId: user.id },
      data: { status: 'ACCEPTED' },
    });
    res.json({ friendship });
  } catch (e) {
    next(e);
  }
});

// Reject friend request
router.patch('/reject', validate(respondRequestSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const { requestId } = req.body;
    const friendship = await prisma.friendship.update({
      where: { id: requestId, addresseeId: user.id },
      data: { status: 'REJECTED' },
    });
    res.json({ friendship });
  } catch (e) {
    next(e);
  }
});

// List friends
router.get('/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: user.id, status: 'ACCEPTED' },
          { addresseeId: user.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: true,
        addressee: true,
      },
    });
    res.json({ friends });
  } catch (e) {
    next(e);
  }
});

// List pending requests
router.get('/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const pending = await prisma.friendship.findMany({
      where: {
        addresseeId: user.id,
        status: 'PENDING',
      },
      include: {
        requester: true,
      },
    });
    res.json({ pending });
  } catch (e) {
    next(e);
  }
});

export default router;

 