import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred in the Realm server.';

  if (ENV.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('SERVER ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode
  });
};
