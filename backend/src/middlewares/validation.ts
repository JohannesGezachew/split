
import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

export function validate(schema: z.AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: `${issue.path.join('.')} is ${issue.message.toLowerCase()}`,
        }));
        res.status(400).json({ error: 'Invalid input', details: errorMessages });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
}
