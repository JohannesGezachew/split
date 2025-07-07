"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const router = express_1.default.Router();
// Add expense (group or individual)
router.post('/add', async (req, res) => {
    const user = req.user;
    const { amount, groupId, splits, note, date } = req.body;
    if (!amount || !splits || !Array.isArray(splits))
        return res.status(400).json({ error: 'Missing or invalid amount/splits' });
    try {
        const expense = await prisma.expense.create({
            data: {
                amount,
                paidById: user.id,
                groupId,
                note,
                date: date ? new Date(date) : undefined,
                splits: {
                    create: splits.map((s) => ({ userId: s.userId, amount: s.amount })),
                },
            },
            include: { splits: true },
        });
        res.json({ expense });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to add expense' });
    }
});
// Expense history (per user, per group)
router.get('/history', async (req, res) => {
    const user = req.user;
    const { groupId } = req.query;
    const where = { OR: [{ paidById: user.id }, { splits: { some: { userId: user.id } } }] };
    if (groupId)
        where.groupId = Number(groupId);
    const expenses = await prisma.expense.findMany({
        where,
        include: { splits: true },
        orderBy: { date: 'desc' },
        take: 50,
    });
    res.json({ expenses });
});
exports.default = router;
