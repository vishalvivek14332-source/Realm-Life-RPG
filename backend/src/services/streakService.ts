import prisma from '../prisma.js';
import { ProgressionService } from './progressionService.js';

export interface StreakCheckInResult {
  currentStreak: number;
  longestStreak: number;
  xpAwarded: number;
  goldAwarded: number;
  restoredVitals: boolean;
}

export class StreakService {
  /**
   * Helper to normalize date to calendar day string (YYYY-MM-DD in UTC)
   */
  static getDayString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate the difference in calendar days between two dates
   */
  static getDayDifference(current: Date, previous: Date): number {
    const d1 = new Date(this.getDayString(current));
    const d2 = new Date(this.getDayString(previous));
    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Retrieve or create streak record for user
   */
  static async getOrCreateStreak(userId: string) {
    let streak = await prisma.streak.findUnique({
      where: { userId }
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastCheckIn: new Date()
        }
      });
    }

    return streak;
  }

  /**
   * Process daily check-in
   */
  static async checkIn(userId: string): Promise<StreakCheckInResult> {
    const now = new Date();
    const streak = await this.getOrCreateStreak(userId);

    if (streak.lastCheckIn) {
      const dayDiff = this.getDayDifference(now, streak.lastCheckIn);

      if (dayDiff === 0) {
        const error: any = new Error('You have already sealed your streak for today. Rest and return tomorrow!');
        error.statusCode = 400;
        error.errorCode = 'STREAK_ALREADY_CLAIMED';
        throw error;
      }
    }

    // Determine new streak count
    let newStreak = 1;
    if (streak.lastCheckIn) {
      const dayDiff = this.getDayDifference(now, streak.lastCheckIn);
      if (dayDiff === 1) {
        newStreak = streak.currentStreak + 1;
      } else {
        // Missed one or more days, resets to 1
        newStreak = 1;
      }
    }

    const newLongest = Math.max(streak.longestStreak, newStreak);
    const xpReward = 150;
    const goldReward = 25;

    // Execute check-in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update streak
      await tx.streak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastCheckIn: now
        }
      });

      // 2. Fetch and restore character vitals, add XP & Gold
      const character = await tx.character.findUnique({ where: { userId } });
      if (character) {
        const maxHp = ProgressionService.calculateMaxHealth(character.vitality);
        const maxEnergy = ProgressionService.calculateMaxEnergy(character.vitality, character.discipline);

        const progression = ProgressionService.calculateProgression(
          character.level,
          character.xp,
          xpReward
        );

        await tx.character.update({
          where: { userId },
          data: {
            level: progression.newLevel,
            xp: progression.newXp,
            gold: character.gold + goldReward,
            health: maxHp,
            energy: maxEnergy
          }
        });

        // 3. Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'STREAK_REWARD',
            amount: goldReward,
            description: `Daily Streak Day ${newStreak} Reward (+${xpReward} XP, +${goldReward} Gold)`
          }
        });

        // 4. Create activity log
        await tx.activityLog.create({
          data: {
            userId,
            type: 'streak_milestone',
            title: `Sealed Day ${newStreak} Streak! (+${xpReward} XP, +${goldReward} Gold)`,
            description: `Restored 100% Health & Energy. Current Streak: ${newStreak} days.`,
            xp: xpReward,
            gold: goldReward
          }
        });
      }
    });

    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      xpAwarded: xpReward,
      goldAwarded: goldReward,
      restoredVitals: true
    };
  }
}
