import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';
import { RewardService } from '../services/rewardService.js';
import { AchievementService } from '../services/achievementService.js';

export class QuestController {
  /**
   * GET /api/quests - Retrieve user's quests
   */
  static async getQuests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const quests = await prisma.quest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: quests
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quests/:id - Retrieve specific quest
   */
  static async getQuestById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const quest = await prisma.quest.findUnique({
        where: { id }
      });

      if (!quest) {
        res.status(404).json({
          success: false,
          message: 'Quest not found.',
          errorCode: 'QUEST_NOT_FOUND'
        });
        return;
      }

      if (quest.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to view this quest.',
          errorCode: 'FORBIDDEN'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: quest
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/quests - Create new quest
   */
  static async createQuest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const {
        title,
        description,
        category,
        difficulty = 'Medium',
        attribute,
        xpReward,
        goldReward,
        energyCost = 15,
        estimatedMinutes = 30,
        frequency = 'Daily',
        quote,
        iconName
      } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Quest title is required.',
          errorCode: 'MISSING_TITLE'
        });
        return;
      }

      // Authoritative baseline calculations for rewards if not supplied or invalid
      const resolvedAttr = ProgressionService.resolveAttribute(category || 'DISCIPLINE', attribute);
      let calculatedXp = Number(xpReward) || 200;
      let calculatedGold = Number(goldReward) || 35;

      switch (difficulty) {
        case 'Easy':
          calculatedXp = Math.max(100, Math.min(250, calculatedXp));
          calculatedGold = Math.max(15, Math.min(40, calculatedGold));
          break;
        case 'Hard':
          calculatedXp = Math.max(300, Math.min(600, calculatedXp));
          calculatedGold = Math.max(50, Math.min(100, calculatedGold));
          break;
        case 'Epic':
          calculatedXp = Math.max(500, Math.min(1000, calculatedXp));
          calculatedGold = Math.max(80, Math.min(250, calculatedGold));
          break;
        case 'Medium':
        default:
          calculatedXp = Math.max(200, Math.min(400, calculatedXp));
          calculatedGold = Math.max(30, Math.min(60, calculatedGold));
          break;
      }

      const quest = await prisma.quest.create({
        data: {
          userId,
          title: title.trim(),
          description: description?.trim() || 'A purposeful endeavor to strengthen character.',
          category: (category || 'DISCIPLINE').toUpperCase(),
          difficulty,
          attribute: resolvedAttr,
          xpReward: calculatedXp,
          goldReward: calculatedGold,
          energyCost: Math.max(5, Number(energyCost) || 15),
          estimatedMinutes: Number(estimatedMinutes) || 30,
          currentMinutes: 0,
          frequency,
          quote: quote?.trim() || null,
          iconName: iconName || 'shield',
          status: 'ACTIVE',
          progress: 0
        }
      });

      res.status(201).json({
        success: true,
        message: `Quest "${quest.title}" inscribed in the Codex!`,
        data: quest
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/quests/:id - Update quest details
   */
  static async updateQuest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { title, description, category, difficulty, progress, estimatedMinutes } = req.body;

      const existingQuest = await prisma.quest.findUnique({ where: { id } });

      if (!existingQuest) {
        res.status(404).json({
          success: false,
          message: 'Quest not found.',
          errorCode: 'QUEST_NOT_FOUND'
        });
        return;
      }

      if (existingQuest.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized access to this quest.',
          errorCode: 'FORBIDDEN'
        });
        return;
      }

      if (existingQuest.status === 'COMPLETED') {
        res.status(409).json({
          success: false,
          message: 'Completed quests cannot be modified.',
          errorCode: 'QUEST_ALREADY_COMPLETED'
        });
        return;
      }

      const updated = await prisma.quest.update({
        where: { id },
        data: {
          ...(title ? { title: title.trim() } : {}),
          ...(description ? { description: description.trim() } : {}),
          ...(category ? { category: category.toUpperCase() } : {}),
          ...(difficulty ? { difficulty } : {}),
          ...(typeof progress === 'number' ? { progress: Math.min(100, Math.max(0, progress)) } : {}),
          ...(typeof estimatedMinutes === 'number' ? { estimatedMinutes } : {})
        }
      });

      res.status(200).json({
        success: true,
        message: 'Quest details updated.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/quests/:id - Delete quest
   */
  static async deleteQuest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const existingQuest = await prisma.quest.findUnique({ where: { id } });

      if (!existingQuest) {
        res.status(404).json({
          success: false,
          message: 'Quest not found.',
          errorCode: 'QUEST_NOT_FOUND'
        });
        return;
      }

      if (existingQuest.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized access.',
          errorCode: 'FORBIDDEN'
        });
        return;
      }

      await prisma.quest.delete({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'Quest deleted from active roster.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/quests/:id/complete
   * AUTHORITATIVE GAMEPLAY COMPLETION OPERATION
   */
  static async completeQuest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      // 1 & 2 & 3. Retrieve and verify quest ownership
      const quest = await prisma.quest.findUnique({
        where: { id },
        include: { completions: true }
      });

      if (!quest) {
        res.status(404).json({
          success: false,
          message: 'Quest not found.',
          errorCode: 'QUEST_NOT_FOUND'
        });
        return;
      }

      if (quest.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'You cannot complete another adventurer’s quest.',
          errorCode: 'UNAUTHORIZED_QUEST'
        });
        return;
      }

      // 4. Verify quest is not already completed
      if (quest.status === 'COMPLETED' || quest.completions.length > 0) {
        res.status(409).json({
          success: false,
          message: `Quest "${quest.title}" has already been claimed and completed!`,
          errorCode: 'QUEST_ALREADY_COMPLETED'
        });
        return;
      }

      // Fetch character
      const character = await prisma.character.findUnique({ where: { userId } });
      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found.',
          errorCode: 'CHARACTER_NOT_FOUND'
        });
        return;
      }

      // 5. Verify player has enough energy
      if (character.energy < quest.energyCost) {
        res.status(400).json({
          success: false,
          message: `Insufficient energy! Required: ${quest.energyCost} Energy, Available: ${character.energy} Energy. Rest at the campfire or consume an elixir to restore stamina.`,
          errorCode: 'INSUFFICIENT_ENERGY'
        });
        return;
      }

      // 7 & 8. Authoritatively calculate XP and Gold rewards with proc bonuses
      const rewards = await RewardService.calculateQuestRewards(
        {
          xpReward: quest.xpReward,
          goldReward: quest.goldReward,
          attribute: quest.attribute,
          category: quest.category
        },
        {
          intellect: character.intellect,
          wisdom: character.wisdom
        }
      );

      // 9. Increase appropriate attribute
      const attrKey = ProgressionService.resolveAttribute(quest.category, quest.attribute);
      const newAttrVal = character[attrKey] + 1;

      // 10 & 11 & 12. Non-linear level progression
      const progression = ProgressionService.calculateProgression(
        character.level,
        character.xp,
        rewards.finalXp
      );

      // Calculate new vitals
      const newVitality = attrKey === 'vitality' ? newAttrVal : character.vitality;
      const newDiscipline = attrKey === 'discipline' ? newAttrVal : character.discipline;
      const newMaxHp = ProgressionService.calculateMaxHealth(newVitality);
      const newMaxEnergy = ProgressionService.calculateMaxEnergy(newVitality, newDiscipline);

      // Deduct energy
      const nextEnergy = Math.max(0, character.energy - quest.energyCost);
      const nextGold = character.gold + rewards.finalGold;

      // 19. ATOMIC DATABASE TRANSACTION
      const transactionResult = await prisma.$transaction(async (tx) => {
        // Step 6, 9, 10, 11: Update character
        const updatedChar = await tx.character.update({
          where: { userId },
          data: {
            energy: nextEnergy,
            gold: nextGold,
            level: progression.newLevel,
            xp: progression.newXp,
            [attrKey]: newAttrVal
          }
        });

        // Step 16: Create QuestCompletion record
        const completion = await tx.questCompletion.create({
          data: {
            questId: quest.id,
            userId,
            xpEarned: rewards.finalXp,
            goldEarned: rewards.finalGold
          }
        });

        // Update quest status
        const updatedQuest = await tx.quest.update({
          where: { id: quest.id },
          data: {
            status: 'COMPLETED',
            progress: 100,
            currentMinutes: quest.estimatedMinutes
          }
        });

        // Step 15: If item dropped, add to user inventory
        if (rewards.droppedItem) {
          await tx.userInventory.upsert({
            where: {
              userId_itemId: {
                userId,
                itemId: rewards.droppedItem.id
              }
            },
            update: {
              quantity: { increment: 1 }
            },
            create: {
              userId,
              itemId: rewards.droppedItem.id,
              quantity: 1,
              equipped: false
            }
          });

          await tx.activityLog.create({
            data: {
              userId,
              type: 'item_acquired',
              title: `Acquired Loot: +1 ${rewards.droppedItem.name}!`,
              description: `Loot drop from quest "${quest.title}" (${rewards.droppedItem.rarity})`
            }
          });
        }

        // Step 17: Activity log for quest completion
        await tx.activityLog.create({
          data: {
            userId,
            type: 'completed_quest',
            title: `Completed: ${quest.title}`,
            description: `+${rewards.finalXp} XP, +${rewards.finalGold} Gold, +1 ${attrKey.toUpperCase()}`,
            xp: rewards.finalXp,
            gold: rewards.finalGold
          }
        });

        // Step 18: Transaction record for gold reward
        await tx.transaction.create({
          data: {
            userId,
            type: 'QUEST_REWARD',
            amount: rewards.finalGold,
            description: `Gold reward for completing "${quest.title}"`
          }
        });

        // Activity log for level-up if leveled up
        if (progression.didLevelUp) {
          await tx.activityLog.create({
            data: {
              userId,
              type: 'level_up',
              title: `Levelled up to Level ${progression.newLevel}!`,
              description: `Ascended to Level ${progression.newLevel} (+${progression.levelsGained} level(s))`
            }
          });
        }

        // Step 14: Evaluate achievements atomically
        const unlockedAchievements = await AchievementService.evaluateAchievements(userId, tx);

        // Fetch final character state to include any achievement reward increments
        const finalChar = await tx.character.findUnique({ where: { userId } });

        return {
          updatedChar: finalChar || updatedChar,
          updatedQuest,
          completion,
          unlockedAchievements
        };
      });

      // 20. Return complete updated character state and rewards
      res.status(200).json({
        success: true,
        message: `Quest "${quest.title}" victoriously completed!`,
        data: {
          character: {
            ...transactionResult.updatedChar,
            maxHealth: newMaxHp,
            maxEnergy: newMaxEnergy,
            requiredXp: progression.requiredXp
          },
          quest: transactionResult.updatedQuest,
          rewards: {
            xpEarned: rewards.finalXp,
            goldEarned: rewards.finalGold,
            bonusXp: rewards.bonusXp,
            bonusGold: rewards.bonusGold,
            attributeGained: attrKey,
            droppedItem: rewards.droppedItem
          },
          progression: {
            didLevelUp: progression.didLevelUp,
            levelsGained: progression.levelsGained,
            newLevel: progression.newLevel,
            currentXp: progression.newXp,
            requiredXp: progression.requiredXp
          },
          unlockedAchievements: transactionResult.unlockedAchievements
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
