import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../prisma.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Token missing or invalid.',
        errorCode: 'UNAUTHORIZED'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
        errorCode: 'USER_NOT_FOUND'
      });
      return;
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
      errorCode: 'INVALID_TOKEN'
    });
  }
};
