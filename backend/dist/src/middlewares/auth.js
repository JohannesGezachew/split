"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const db_1 = __importDefault(require("../db"));
const HttpError_1 = __importDefault(require("../HttpError"));
const authenticateUser = async (req, res, next) => {
    const telegramId = req.header('x-telegram-id');
    if (!telegramId)
        return next(new HttpError_1.default(401, 'Missing x-telegram-id header'));
    const user = await db_1.default.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user)
        return next(new HttpError_1.default(401, 'User not found'));
    req.user = user;
    next();
};
exports.authenticateUser = authenticateUser;
