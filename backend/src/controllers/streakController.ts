import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { StreakService } from '../services/streakService.js';
import { ProgressionService } from '../services/progressionService.js';

export class StreakController {
  /**
   * GET /api/streak - Get player streak and 7-day tracker
   */
  static async getStreak(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const streak = await StreakService.getOrCreateStreak(userId);

      // Determine 7-day tracker status
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const now = new Date();
      const currentDayIdx = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6

      // Format weekly check-in indicators
      const hasCheckedToday = streak.lastCheckIn
        ? StreakService.getDayDifference(now, streak.lastCheckIn) === 0
        : false;

      const weekTracker = days.map((day, idx) => {
        let checked = false;
        if (idx < currentDayIdx) {
          // Previous days marked based on streak length
          checked = streak.currentStreak > (currentDayIdx - idx);
        } else if (idx === currentDayIdx) {
          checked = hasCheckedToday;
        }
        return { day, checked };
      });

      res.status(200).json({
        success: true,
        data: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastCheckIn: streak.lastCheckIn,
          hasCheckedToday,
          weekTracker
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/streak/check-in - Claim daily streak check-in
   */
  static async checkIn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const result = await StreakService.checkIn(userId);

      const character = await prisma.character.findUnique({ where: { userId } });
      const maxHp = character ? ProgressionService.calculateMaxHealth(character.vitality) : 100;
      const maxEnergy = character ? ProgressionService.calculateMaxEnergy(character.vitality, character.discipline) : 100;
      const requiredXp = character ? ProgressionService.getRequiredXpForLevel(character.level) : 100;

      res.status(200).json({
        success: true,
        message: `Streak Sealed! Day ${result.currentStreak} logged. Restored 100% Health & Energy, +${result.xpAwarded} XP & +${result.goldAwarded} Gold!`,
        data: {
          ...result,
          character: character ? {
            ...character,
            maxHealth: maxHp,
            maxEnergy,
            requiredXp
          } : null
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
