"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const validation_1 = require("../middlewares/validation");
const router = express_1.default.Router();
const addExpenseSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number(),
        groupId: zod_1.z.number().optional(),
        splits: zod_1.z.array(zod_1.z.object({
            userId: zod_1.z.number(),
            amount: zod_1.z.number(),
        })),
        note: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
    }),
});
// Add expense (group or individual)
router.post('/add', (0, validation_1.validate)(addExpenseSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { amount, groupId, splits, note, date } = req.body;
        const expense = await db_1.default.expense.create({
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
        next(e);
    }
});
const historySchema = zod_1.z.object({
    query: zod_1.z.object({
        groupId: zod_1.z.string().optional(),
    }),
});
// Expense history (per user, per group)
router.get('/history', (0, validation_1.validate)(historySchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { groupId } = req.query;
        const where = { OR: [{ paidById: user.id }, { splits: { some: { userId: user.id } } }] };
        if (groupId)
            where.groupId = Number(groupId);
        const expenses = await db_1.default.expense.findMany({
            where,
            include: { splits: true },
            orderBy: { date: 'desc' },
            take: 50,
        });
        res.json({ expenses });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
