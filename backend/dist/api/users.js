"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const router = express_1.default.Router();
// POST /users/upsert - create or update user
router.post('/upsert', async (req, res) => {
    const { telegramId, username, firstName, lastName } = req.body;
    if (!telegramId)
        return res.status(400).json({ error: 'Missing telegramId' });
    const user = await prisma.user.upsert({
        where: { telegramId: BigInt(telegramId) },
        update: { username, firstName, lastName },
        create: { telegramId: BigInt(telegramId), username, firstName, lastName },
    });
    res.json({ user });
});
// GET /user/me - get current user info
router.get('/me', (req, res) => {
    res.json({ user: req.user });
});
// PUT /user/me - update profile
router.put('/me', async (req, res) => {
    const { username, firstName, lastName } = req.body;
    const user = req.user;
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { username, firstName, lastName },
    });
    res.json({ user: updated });
});
// GET /users/search?username=... - search users by username
router.get('/search', async (req, res) => {
    const { username } = req.query;
    if (!username)
        return res.status(400).json({ error: 'Missing username query param' });
    const users = await prisma.user.findMany({
        where: { username: { contains: username } },
        take: 10,
    });
    res.json({ users });
});
exports.default = router;
