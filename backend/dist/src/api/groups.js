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
const createGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
    }),
});
// Create group
router.post('/create', (0, validation_1.validate)(createGroupSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { name } = req.body;
        const group = await db_1.default.group.create({
            data: {
                name,
                members: { create: { userId: user.id } },
            },
            include: { members: true },
        });
        res.json({ group });
    }
    catch (e) {
        next(e);
    }
});
const joinGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        groupId: zod_1.z.number(),
    }),
});
// Join group
router.post('/join', (0, validation_1.validate)(joinGroupSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { groupId } = req.body;
        const member = await db_1.default.groupMember.create({
            data: { userId: user.id, groupId },
        });
        res.json({ member });
    }
    catch (e) {
        next(e);
    }
});
const leaveGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        groupId: zod_1.z.number(),
    }),
});
// Leave group
router.delete('/leave', (0, validation_1.validate)(leaveGroupSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { groupId } = req.body;
        await db_1.default.groupMember.deleteMany({
            where: { userId: user.id, groupId },
        });
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
// List groups for user
router.get('/list', async (req, res, next) => {
    try {
        const user = req.user;
        const groups = await db_1.default.groupMember.findMany({
            where: { userId: user.id },
            include: { group: true },
        });
        res.json({ groups });
    }
    catch (e) {
        next(e);
    }
});
const groupMembersSchema = zod_1.z.object({
    params: zod_1.z.object({
        groupId: zod_1.z.string(),
    }),
});
// List group members
router.get('/:groupId/members', (0, validation_1.validate)(groupMembersSchema), async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const members = await db_1.default.groupMember.findMany({
            where: { groupId: Number(groupId) },
            include: { user: true },
        });
        res.json({ members });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
