import express from 'express';
import { PrismaClient, FriendshipStatus } from '../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();

// Send friend request
router.post('/request', async (req, res) => {
  const user = (req as any).user;
  const { toUserId } = req.body;
  if (!toUserId) return res.status(400).json({ error: 'Missing toUserId' });
  if (user.id === toUserId) return res.status(400).json({ error: 'Cannot friend yourself' });
  try {
    const existing = await prisma.friendship.findFirst({
      where: {
        requesterId: user.id,
        addresseeId: toUserId,
      },
    });
    if (existing) return res.status(400).json({ error: 'Request already exists' });
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        addresseeId: toUserId,
        status: 'PENDING',
      },
    });
    res.json({ friendship });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Accept friend request
router.post('/accept', async (req, res) => {
  const user = (req as any).user;
  const { requestId } = req.body;
  if (!requestId) return res.status(400).json({ error: 'Missing requestId' });
  try {
    const friendship = await prisma.friendship.update({
      where: { id: requestId, addresseeId: user.id },
      data: { status: 'ACCEPTED' },
    });
    res.json({ friendship });
  } catch (e) {
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// Reject friend request
router.post('/reject', async (req, res) => {
  const user = (req as any).user;
  const { requestId } = req.body;
  if (!requestId) return res.status(400).json({ error: 'Missing requestId' });
  try {
    const friendship = await prisma.friendship.update({
      where: { id: requestId, addresseeId: user.id },
      data: { status: 'REJECTED' },
    });
    res.json({ friendship });
  } catch (e) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// List friends
router.get('/list', async (req, res) => {
  const user = (req as any).user;
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
});

// List pending requests
router.get('/pending', async (req, res) => {
  const user = (req as any).user;
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
});

export default router; 