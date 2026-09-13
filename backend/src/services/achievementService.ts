import prisma from '../prisma.js';

export interface UnlockedAchievementInfo {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  goldReward: number;
}

export class AchievementService {
  /**
   * Evaluate all achievements for a user based on current character and quest stats
   */
  static async evaluateAchievements(
    userId: string,
    txContext?: any
  ): Promise<UnlockedAchievementInfo[]> {
    const db = txContext || prisma;

    // Fetch character, completed quest count, streak
    const [character, completedQuestsCount, streak, allAchievements, userAchievements] = await Promise.all([
      db.character.findUnique({ where: { userId } }),
      db.questCompletion.count({ where: { userId } }),
      db.streak.findUnique({ where: { userId } }),
      db.achievement.findMany(),
      db.userAchievement.findMany({ where: { userId } })
    ]);

    if (!character) return [];

    const userAchMap = new Map<string, any>();
    userAchievements.forEach((ua: any) => {
      userAchMap.set(ua.achievementId, ua);
    });

    const newlyUnlocked: UnlockedAchievementInfo[] = [];

    for (const ach of allAchievements) {
      const existing = userAchMap.get(ach.id);
      if (existing && existing.unlockedAt) {
        continue; // already completed & unlocked
      }

      let currentProgress = 0;
      let targetProgress = ach.maxProgress || 1;

      // Evaluate according to achievement ID
      switch (ach.id) {
        case 'first_quest':
          currentProgress = completedQuestsCount >= 1 ? 1 : 0;
          break;
        case 'quest_master':
          currentProgress = Math.min(targetProgress, completedQuestsCount);
          break;
        case 'consistent_mind':
          currentProgress = Math.min(targetProgress, streak ? streak.currentStreak : 0);
          break;
        case 'wealth_builder':
          currentProgress = Math.min(targetProgress, character.gold);
          break;
        case 'fitness_fighter':
          // Quests completed with attribute strength
          const strQuests = await db.quest.count({
            where: {
              userId,
              attribute: 'strength',
              status: 'COMPLETED'
            }
          });
          currentProgress = Math.min(targetProgress, strQuests);
          break;
        case 'productivity_pro':
          const studyQuests = await db.quest.count({
            where: {
              userId,
              category: 'STUDY',
              status: 'COMPLETED'
            }
          });
          currentProgress = Math.min(targetProgress, studyQuests);
          break;
        case 'health_hero':
          const healthQuests = await db.quest.count({
            where: {
              userId,
              category: 'HEALTH',
              status: 'COMPLETED'
            }
          });
          currentProgress = Math.min(targetProgress, healthQuests);
          break;
        case 'early_riser':
          currentProgress = Math.min(targetProgress, completedQuestsCount);
          break;
        default:
          if (ach.id.includes('level')) {
            currentProgress = Math.min(targetProgress, character.level);
          } else {
            currentProgress = existing ? existing.progress : 0;
          }
      }

      const isCompleted = currentProgress >= targetProgress;

      if (isCompleted) {
        // Unlock achievement!
        await db.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: ach.id
            }
          },
          update: {
            progress: targetProgress,
            unlockedAt: new Date()
          },
          create: {
            userId,
            achievementId: ach.id,
            progress: targetProgress,
            unlockedAt: new Date()
          }
        });

        // Award achievement rewards if any using atomic increments
        if (ach.xpReward > 0 || ach.goldReward > 0) {
          await db.character.update({
            where: { userId },
            data: {
              ...(ach.xpReward > 0 ? { xp: { increment: ach.xpReward } } : {}),
              ...(ach.goldReward > 0 ? { gold: { increment: ach.goldReward } } : {})
            }
          });
        }

        // Create activity log
        await db.activityLog.create({
          data: {
            userId,
            type: 'achievement',
            title: `Achievement Unlocked: "${ach.name}"!`,
            description: `${ach.description} (+${ach.xpReward} XP, +${ach.goldReward} Gold)`,
            xp: ach.xpReward,
            gold: ach.goldReward
          }
        });

        newlyUnlocked.push({
          id: ach.id,
          name: ach.name,
          description: ach.description,
          xpReward: ach.xpReward,
          goldReward: ach.goldReward
        });
      } else {
        // Update progress if changed
        if (!existing || existing.progress !== currentProgress) {
          await db.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: ach.id
              }
            },
            update: { progress: currentProgress },
            create: {
              userId,
              achievementId: ach.id,
              progress: currentProgress
            }
          });
        }
      }
    }

    return newlyUnlocked;
  }
}
