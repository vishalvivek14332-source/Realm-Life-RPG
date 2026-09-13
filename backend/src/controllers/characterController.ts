import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';

export class CharacterController {
  static async getCharacter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const character = await prisma.character.findUnique({
        where: { userId },
        include: {
          user: {
            select: { username: true, email: true, createdAt: true }
          }
        }
      });

      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found for this user.',
          errorCode: 'CHARACTER_NOT_FOUND'
        });
        return;
      }

      const maxHealth = ProgressionService.calculateMaxHealth(character.vitality);
      const maxEnergy = ProgressionService.calculateMaxEnergy(character.vitality, character.discipline);
      const requiredXp = ProgressionService.getRequiredXpForLevel(character.level);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const existingRestToday = await prisma.activityLog.findFirst({
        where: {
          userId,
          title: 'Campfire Rest & Meditation',
          createdAt: { gte: todayStart }
        }
      });
      const canRestToday = !existingRestToday;

      res.status(200).json({
        success: true,
        data: {
          ...character,
          maxHealth,
          maxEnergy,
          requiredXp,
          canRestToday
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async rest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const character = await prisma.character.findUnique({ where: { userId } });
      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found.',
          errorCode: 'CHARACTER_NOT_FOUND'
        });
        return;
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingRestToday = await prisma.activityLog.findFirst({
        where: {
          userId,
          title: 'Campfire Rest & Meditation',
          createdAt: { gte: todayStart }
        }
      });

      if (existingRestToday) {
        res.status(400).json({
          success: false,
          message: 'The campfire embers have cooled. You can only rest once per day! Consume potions or return tomorrow.',
          errorCode: 'REST_ALREADY_USED',
          data: {
            canRestToday: false
          }
        });
        return;
      }

      const maxHealth = ProgressionService.calculateMaxHealth(character.vitality);
      const maxEnergy = ProgressionService.calculateMaxEnergy(character.vitality, character.discipline);

      const nextEnergy = Math.min(maxEnergy, character.energy + 35);
      const nextHealth = Math.min(maxHealth, character.health + 20);

      const updated = await prisma.character.update({
        where: { userId },
        data: {
          energy: nextEnergy,
          health: nextHealth
        }
      });

      await prisma.activityLog.create({
        data: {
          userId,
          type: 'rest',
          title: 'Campfire Rest & Meditation',
          description: 'Restored +35 Energy and +20 Health by the warm hearth.'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Campfire Rest: Restored +35 Energy and +20 Health! (Daily rest completed)',
        data: {
          ...updated,
          maxHealth,
          maxEnergy,
          requiredXp: ProgressionService.getRequiredXpForLevel(updated.level),
          canRestToday: false
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
