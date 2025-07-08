import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db';

let testUserTelegramId: string;

beforeAll(async () => {
  const user = await prisma.user.upsert({
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
  await prisma.user.delete({
    where: { telegramId: BigInt(testUserTelegramId) },
  });
});

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
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
    request(app)
      .get('/api/v1/emojis')
      .set('Accept', 'application/json')
      .set('x-telegram-id', testUserTelegramId)
      .expect('Content-Type', /json/)
      .expect(200, ['😀', '😳', '🙄'], done);
  });
});
