import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import { authenticateUser } from './middlewares/auth';

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<Record<string, never>, MessageResponse>('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', (req, res, next) => {
  if (req.path === '/users/upsert') {
    return next();
  }
  authenticateUser(req, res, next);
}, api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
