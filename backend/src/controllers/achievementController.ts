import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AchievementService } from '../services/achievementService.js';

export class AchievementController {
  /**
   * GET /api/achievements - List achievements with player's progress and unlock state
   */
  static async getAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      // Automatically evaluate any newly unlocked achievements first
      await AchievementService.evaluateAchievements(userId);

      const [allAchievements, userAchievements] = await Promise.all([
        prisma.achievement.findMany(),
        prisma.userAchievement.findMany({ where: { userId } })
      ]);

      const userMap = new Map<string, any>();
      userAchievements.forEach(ua => userMap.set(ua.achievementId, ua));

      const formatted = allAchievements.map(ach => {
        const ua = userMap.get(ach.id);
        const unlocked = Boolean(ua && ua.unlockedAt);
        const progress = ua ? ua.progress : 0;
        const maxProgress = ach.maxProgress || 1;

        let status: 'completed' | 'in_progress' | 'locked' = 'locked';
        if (unlocked || progress >= maxProgress) {
          status = 'completed';
        } else if (progress > 0) {
          status = 'in_progress';
        }

        return {
          id: ach.id,
          title: ach.name,
          description: ach.description,
          xpReward: ach.xpReward,
          goldReward: ach.goldReward,
          status,
          icon: ach.icon || 'trophy',
          category: ach.category || 'General',
          rarity: ach.rarity,
          unlocked,
          dateUnlocked: ua?.unlockedAt ? new Date(ua.unlockedAt).toLocaleDateString() : undefined,
          progress,
          maxProgress
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
