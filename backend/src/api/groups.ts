
import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../generated/prisma';
import prisma from '../db';

import { validate } from '../middlewares/validation';

const router = express.Router();

const createGroupSchema = z.object({
  body: z.object({
    name: z.string(),
  }),
});

// Create group
router.post('/create', validate(createGroupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const { name } = req.body;
    const group = await prisma.group.create({
      data: {
        name,
        members: { create: { userId: user.id } },
      },
      include: { members: true },
    });
    res.json({ group });
  } catch (e) {
    next(e);
  }
});

const joinGroupSchema = z.object({
  body: z.object({
    groupId: z.number(),
  }),
});

// Join group
router.post('/join', validate(joinGroupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const { groupId } = req.body;
    const member = await prisma.groupMember.create({
      data: { userId: user.id, groupId },
    });
    res.json({ member });
  } catch (e) {
    next(e);
  }
});

const leaveGroupSchema = z.object({
  body: z.object({
    groupId: z.number(),
  }),
});

// Leave group
router.delete('/leave', validate(leaveGroupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const { groupId } = req.body;
    await prisma.groupMember.deleteMany({
      where: { userId: user.id, groupId },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// List groups for user
router.get('/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user: User }).user;
    const groups = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: { group: true },
    });
    res.json({ groups });
  } catch (e) {
    next(e);
  }
});

const groupMembersSchema = z.object({
  params: z.object({
    groupId: z.string(),
  }),
});

// List group members
router.get('/:groupId/members', validate(groupMembersSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const members = await prisma.groupMember.findMany({
      where: { groupId: Number(groupId) },
      include: { user: true },
    });
    res.json({ members });
  } catch (e) {
    next(e);
  }
});

export default router;
 