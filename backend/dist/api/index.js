"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../generated/prisma");
const emojis_1 = __importDefault(require("./emojis"));
const users_1 = __importDefault(require("./users"));
const friends_1 = __importDefault(require("./friends"));
const groups_1 = __importDefault(require("./groups"));
const expenses_1 = __importDefault(require("./expenses"));
const debts_1 = __importDefault(require("./debts"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const prisma = new prisma_1.PrismaClient();
router.get('/', (req, res) => {
    res.json({
        message: 'API - 👋🌎🌍🌏',
    });
});
router.post('/auth/telegram', async (req, res) => {
    const { id, username, first_name: firstName, last_name: lastName } = req.body;
    if (!id || !firstName) {
        return res.status(400).json({ error: 'Missing required Telegram user info.' });
    }
    try {
        const user = await prisma.user.upsert({
            where: { telegramId: BigInt(id) },
            update: {
                username,
                firstName,
                lastName,
            },
            create: {
                telegramId: BigInt(id),
                username,
                firstName,
                lastName,
            },
        });
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upsert user.' });
    }
});
router.use('/emojis', emojis_1.default);
router.use('/users', users_1.default);
router.use(auth_1.authenticateUser);
router.use('/friends', friends_1.default);
router.use('/groups', groups_1.default);
router.use('/expenses', expenses_1.default);
router.use('/debts', debts_1.default);
exports.default = router;
