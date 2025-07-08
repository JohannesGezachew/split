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
const emojis_1 = __importDefault(require("./emojis"));
const users_1 = __importDefault(require("./users"));
const friends_1 = __importDefault(require("./friends"));
const groups_1 = __importDefault(require("./groups"));
const expenses_1 = __importDefault(require("./expenses"));
const debts_1 = __importDefault(require("./debts"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.json({
        message: 'API - 👋🌎🌍🌏',
    });
});
const telegramAuthSchema = zod_1.z.object({
    body: zod_1.z.object({
        id: zod_1.z.string(),
        username: zod_1.z.string(),
        first_name: zod_1.z.string(),
        last_name: zod_1.z.string(),
    }),
});
router.post('/auth/telegram', (0, validation_1.validate)(telegramAuthSchema), async (req, res, next) => {
    try {
        const { id, username, first_name: firstName, last_name: lastName } = req.body;
        const user = await db_1.default.user.upsert({
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
        next(new HttpError_1.default(500, 'Failed to upsert user.'));
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
