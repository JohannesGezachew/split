
import { Request } from 'express';
import { User } from '../generated/prisma';

export interface AuthRequest extends Request {
  user?: User;
}
