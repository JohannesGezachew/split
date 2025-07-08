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
const upsertUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        telegramId: zod_1.z.string(),
        username: zod_1.z.string(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
    }),
});
// POST /users/upsert - create or update user
router.post('/upsert', (0, validation_1.validate)(upsertUserSchema), async (req, res, next) => {
    try {
        console.log('Received request to /users/upsert');
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);
        const { telegramId, username, firstName, lastName } = req.body;
        const user = await db_1.default.user.upsert({
            where: { telegramId: BigInt(telegramId) },
            update: { username, firstName, lastName },
            create: { telegramId: BigInt(telegramId), username, firstName, lastName },
        });
        console.log('Successfully upserted user:', user);
        res.json({ user });
    }
    catch (error) {
        console.error('Error during user upsert:', error);
        next(new HttpError_1.default(500, 'An internal error occurred during user upsert.'));
    }
});
// GET /user/me - get current user info
router.get('/me', (req, res) => {
    res.json({ user: req.user });
});
const updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
    }),
});
// PUT /user/me - update profile
router.put('/me', (0, validation_1.validate)(updateUserSchema), async (req, res, next) => {
    try {
        const { username, firstName, lastName } = req.body;
        const user = req.user;
        const updated = await db_1.default.user.update({
            where: { id: user.id },
            data: { username, firstName, lastName },
        });
        res.json({ user: updated });
    }
    catch (e) {
        next(e);
    }
});
const searchUserSchema = zod_1.z.object({
    query: zod_1.z.object({
        username: zod_1.z.string(),
    }),
});
// GET /users/search?username=... - search users by username
router.get('/search', (0, validation_1.validate)(searchUserSchema), async (req, res, next) => {
    try {
        const { username } = req.query;
        const users = await db_1.default.user.findMany({
            where: { username: { contains: username } },
            take: 10,
        });
        res.json({ users });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
