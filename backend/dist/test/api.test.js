"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const db_1 = __importDefault(require("../src/db"));
let testUserTelegramId;
beforeAll(async () => {
    const user = await db_1.default.user.upsert({
        where: { telegramId: BigInt(123456789) },
        update: {},
        create: {
            telegramId: BigInt(123456789),
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
        },
    });
    testUserTelegramId = user.telegramId.toString();
});
afterAll(async () => {
    await db_1.default.user.delete({
        where: { telegramId: BigInt(testUserTelegramId) },
    });
});
describe('GET /api/v1', () => {
    it('responds with a json message', (done) => {
        (0, supertest_1.default)(app_1.default)
            .get('/api/v1')
            .set('Accept', 'application/json')
            .set('x-telegram-id', testUserTelegramId)
            .expect('Content-Type', /json/)
            .expect(200, {
            message: 'API - 👋🌎🌍🌏',
        }, done);
    });
});
describe('GET /api/v1/emojis', () => {
    it('responds with a json message', (done) => {
        (0, supertest_1.default)(app_1.default)
            .get('/api/v1/emojis')
            .set('Accept', 'application/json')
            .set('x-telegram-id', testUserTelegramId)
            .expect('Content-Type', /json/)
            .expect(200, ['😀', '😳', '🙄'], done);
    });
});
