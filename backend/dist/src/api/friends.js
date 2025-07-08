"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const HttpError_1 = __importDefault(require("../HttpError"));
const validation_1 = require("../middlewares/validation");
const router = express_1.default.Router();
const friendRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        toUserId: zod_1.z.number(),
    }),
});
// Send friend request
router.post('/request', (0, validation_1.validate)(friendRequestSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { toUserId } = req.body;
        if (user.id === toUserId)
            throw new HttpError_1.default(400, 'Cannot friend yourself');
        const existing = await db_1.default.friendship.findFirst({
            where: {
                requesterId: user.id,
                addresseeId: toUserId,
            },
        });
        if (existing)
            throw new HttpError_1.default(400, 'Request already exists');
        const friendship = await db_1.default.friendship.create({
            data: {
                requesterId: user.id,
                addresseeId: toUserId,
                status: 'PENDING',
            },
        });
        res.json({ friendship });
    }
    catch (e) {
        next(e);
    }
});
const respondRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        requestId: zod_1.z.number(),
    }),
});
// Accept friend request
router.patch('/accept', (0, validation_1.validate)(respondRequestSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { requestId } = req.body;
        const friendship = await db_1.default.friendship.update({
            where: { id: requestId, addresseeId: user.id },
            data: { status: 'ACCEPTED' },
        });
        res.json({ friendship });
    }
    catch (e) {
        next(e);
    }
});
// Reject friend request
router.patch('/reject', (0, validation_1.validate)(respondRequestSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { requestId } = req.body;
        const friendship = await db_1.default.friendship.update({
            where: { id: requestId, addresseeId: user.id },
            data: { status: 'REJECTED' },
        });
        res.json({ friendship });
    }
    catch (e) {
        next(e);
    }
});
// List friends
router.get('/list', async (req, res, next) => {
    try {
        const user = req.user;
        const friends = await db_1.default.friendship.findMany({
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
    }
    catch (e) {
        next(e);
    }
});
// List pending requests
router.get('/pending', async (req, res, next) => {
    try {
        const user = req.user;
        const pending = await db_1.default.friendship.findMany({
            where: {
                addresseeId: user.id,
                status: 'PENDING',
            },
            include: {
                requester: true,
            },
        });
        res.json({ pending });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
