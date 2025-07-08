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
// Calculate debts for user
router.get('/summary', async (req, res, next) => {
    try {
        const user = req.user;
        // Get all debts where user is involved
        const debts = await db_1.default.debt.findMany({
            where: {
                OR: [
                    { fromUserId: user.id },
                    { toUserId: user.id },
                ],
                settled: false,
            },
            include: { expense: true, toUser: true, fromUser: true },
        });
        // Smart debt reduction
        const netDebts = {};
        debts.forEach(debt => {
            const otherUserId = debt.fromUserId === user.id ? debt.toUserId : debt.fromUserId;
            const amount = debt.fromUserId === user.id ? debt.amount : -debt.amount;
            netDebts[otherUserId] = (netDebts[otherUserId] || 0) + amount;
        });
        res.json({ debts, netDebts });
    }
    catch (e) {
        next(e);
    }
});
const settleDebtSchema = zod_1.z.object({
    body: zod_1.z.object({
        debtId: zod_1.z.number(),
    }),
});
// Settle up (mark debts as paid)
router.post('/settle', (0, validation_1.validate)(settleDebtSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { debtId } = req.body;
        const debt = await db_1.default.debt.update({
            where: { id: debtId, fromUserId: user.id },
            data: { settled: true },
        });
        res.json({ debt });
    }
    catch (e) {
        next(e);
    }
});
// Ledger breakdown (all debts, grouped)
router.get('/ledger', async (req, res, next) => {
    try {
        const user = req.user;
        const debts = await db_1.default.debt.findMany({
            where: {
                OR: [
                    { fromUserId: user.id },
                    { toUserId: user.id },
                ],
            },
            include: { expense: true, toUser: true, fromUser: true },
        });
        // Group by user
        const ledger = {};
        debts.forEach((d) => {
            const key = d.fromUserId === user.id ? d.toUserId : d.fromUserId;
            if (!ledger[key])
                ledger[key] = { total: 0, details: [] };
            ledger[key].total += d.fromUserId === user.id ? d.amount : -d.amount;
            ledger[key].details.push(d);
        });
        res.json({ ledger });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
