import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../generated/prisma';
import prisma from '../db';
import HttpError from '../HttpError';
import { validate } from '../middlewares/validation';
import { validateTelegramWebAppData } from '../utils/telegramAuth'; // Import the validation function

const router = express.Router();

const upsertUserSchema = z.object({
  body: z.object({
    telegramId: z.string(),
    username: z.string().optional(), // Make username optional as per Telegram user object
    firstName: z.string(),
    lastName: z.string().optional(), // Make lastName optional as per Telegram user object
    initData: z.string(), // Add initData to the schema
  }),
});

// POST /users/upsert - create or update user with Telegram WebApp data validation
router.post('/upsert', validate(upsertUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Received request to /users/upsert');
    console.log('Request body:', req.body);
    // console.log('Request headers:', req.headers); // Avoid logging sensitive headers in production

    const { telegramId, username, firstName, lastName, initData } = req.body;

    // Validate Telegram WebApp data
    const botToken = process.env.BOT_TOKEN; // Get bot token from environment
    if (!botToken) {
      console.error('BOT_TOKEN is not set in backend environment!');
      return next(new HttpError(500, 'Server configuration error.'));
    }

    if (!validateTelegramWebAppData(initData, botToken)) {
      console.error('Telegram WebApp data validation failed.');
      return next(new HttpError(403, 'Invalid Telegram WebApp data.'));
    }

    // Proceed with user upsert if validation passes
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: { username, firstName, lastName },
      create: { telegramId: BigInt(telegramId), username, firstName, lastName },
    });
    console.log('Successfully upserted user:', user);
    res.json({ user });
  } catch (error) {
    console.error('Error during user upsert:', error);
    next(new HttpError(500, 'An internal error occurred during user upsert.'));
  }
});

// GET /user/me - get current user info
router.get('/me', (req: Request, res: Response) => {
  res.json({ user: (req as Request & { user: User }).user });
});

const updateUserSchema = z.object({
  body: z.object({
    username: z.string().optional(),
    firstName: z.string(),
    lastName: z.string().optional(),
  }),
});

// PUT /user/me - update profile
router.put('/me', validate(updateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, firstName, lastName } = req.body;
    const user = (req as Request & { user: User }).user;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { username, firstName, lastName },
    });
    res.json({ user: updated });
  } catch (e) {
    next(e);
  }
});

const searchUserSchema = z.object({
  query: z.object({
    username: z.string(),
  }),
});

// GET /users/search?username=... - search users by username
router.get('/search', validate(searchUserSchema), async (req, res, next) => {
  try {
    const { username } = req.query;
    const users = await prisma.user.findMany({
      where: { username: { contains: username as string } },
      take: 10,
    });
    res.json({ users });
  } catch (e) {
    next(e);
  }
});

export default router;
