"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const authenticateUser = async (req, res, next) => {
    const telegramId = req.header('x-telegram-id');
    if (!telegramId)
        return res.status(401).json({ error: 'Missing x-telegram-id header' });
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user)
        return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
};
exports.authenticateUser = authenticateUser;
