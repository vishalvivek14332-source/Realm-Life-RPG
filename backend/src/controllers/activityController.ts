import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ActivityController {
  /**
   * GET /api/activity - Retrieve chronological player activity history
   */
  static async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const logs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      const now = Date.now();
      const formatted = logs.map(log => {
        const diffMs = now - new Date(log.createdAt).getTime();
        const diffMins = Math.round(diffMs / 60000);
        let timeAgo = 'Just now';
        if (diffMins >= 1440) {
          timeAgo = `${Math.floor(diffMins / 1440)}d ago`;
        } else if (diffMins >= 60) {
          timeAgo = `${Math.floor(diffMins / 60)}h ago`;
        } else if (diffMins > 0) {
          timeAgo = `${diffMins}m ago`;
        }

        return {
          id: log.id,
          type: log.type,
          title: log.title,
          description: log.description,
          xp: log.xp > 0 ? log.xp : undefined,
          gold: log.gold > 0 ? log.gold : undefined,
          timeAgo,
          timestamp: new Date(log.createdAt).getTime()
        };
      });

      res.status(200).json({
        success: true,
        data: formatted
      });
    } catch (err) {
      next(err);
    }
  }
}
