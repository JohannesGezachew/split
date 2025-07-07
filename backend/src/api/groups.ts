import express, { Request, Response } from 'express';
import { PrismaClient, User } from '../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();

interface CreateGroupRequest {
  name: string;
}

// Create group
router.post('/create', async (req: Request<object, object, CreateGroupRequest>, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing group name' });
  try {
    const group = await prisma.group.create({
      data: {
        name,
        members: { create: { userId: user.id } },
      },
      include: { members: true },
    });
    res.json({ group });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

interface JoinGroupRequest {
  groupId: number;
}

// Join group
router.post('/join', async (req: Request<object, object, JoinGroupRequest>, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { groupId } = req.body;
  if (!groupId) return res.status(400).json({ error: 'Missing groupId' });
  try {
    const member = await prisma.groupMember.create({
      data: { userId: user.id, groupId },
    });
    res.json({ member });
  } catch (e) {
    res.status(500).json({ error: 'Failed to join group' });
  }
});

interface LeaveGroupRequest {
  groupId: number;
}

// Leave group
router.post('/leave', async (req: Request<object, object, LeaveGroupRequest>, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { groupId } = req.body;
  if (!groupId) return res.status(400).json({ error: 'Missing groupId' });
  try {
    await prisma.groupMember.deleteMany({
      where: { userId: user.id, groupId },
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// List groups for user
router.get('/list', async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const groups = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: { group: true },
  });
  res.json({ groups });
});

interface GroupMembersParams {
  groupId: string;
}

// List group members
router.get('/:groupId/members', async (req: Request<GroupMembersParams>, res: Response) => {
  const { groupId } = req.params;
  const members = await prisma.groupMember.findMany({
    where: { groupId: Number(groupId) },
    include: { user: true },
  });
  res.json({ members });
});

export default router; 