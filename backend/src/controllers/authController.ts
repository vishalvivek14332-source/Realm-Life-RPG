import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || typeof username !== 'string' || username.trim().length < 3) {
        res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long.',
          errorCode: 'INVALID_USERNAME'
        });
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({
          success: false,
          message: 'A valid email address is required.',
          errorCode: 'INVALID_EMAIL'
        });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
          errorCode: 'WEAK_PASSWORD'
        });
        return;
      }

      // Check duplicates
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase().trim() },
            { username: username.trim() }
          ]
        }
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: existing.email.toLowerCase() === email.toLowerCase().trim()
            ? 'An account with this email already exists.'
            : 'This username is already claimed in the Realm.',
          errorCode: 'USER_ALREADY_EXISTS'
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create user, character, streak, starter items, starter quests atomically
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: username.trim(),
            email: email.toLowerCase().trim(),
            passwordHash
          }
        });

        const character = await tx.character.create({
          data: {
            userId: user.id,
            level: 1,
            xp: 0,
            gold: 50,
            health: 100,
            energy: 100,
            strength: 18,
            intellect: 16,
            wisdom: 14,
            discipline: 20,
            vitality: 17
          }
        });

        await tx.streak.create({
          data: {
            userId: user.id,
            currentStreak: 1,
            longestStreak: 1,
            lastCheckIn: new Date()
          }
        });

        // Seed starter starter quests for the player
        const starterQuests = [
          {
            userId: user.id,
            title: 'Deep Work Session',
            category: 'STUDY',
            difficulty: 'Medium',
            attribute: 'intellect',
            description: 'Focus for 30 minutes on a meaningful task without distractions.',
            xpReward: 250,
            goldReward: 40,
            energyCost: 15,
            progress: 0,
            estimatedMinutes: 30,
            currentMinutes: 0,
            frequency: 'Daily',
            quote: '“Focus is the key to extraordinary results.”',
            iconName: 'book',
            status: 'ACTIVE'
          },
          {
            userId: user.id,
            title: 'Morning Exercise',
            category: 'HEALTH',
            difficulty: 'Medium',
            attribute: 'strength',
            description: 'Complete 20 min workout routine.',
            xpReward: 300,
            goldReward: 50,
            energyCost: 20,
            progress: 0,
            estimatedMinutes: 20,
            currentMinutes: 0,
            frequency: 'Daily',
            quote: '“Strength doesn’t come from what you can do, but overcoming what you once thought you couldn’t.”',
            iconName: 'dumbbell',
            status: 'ACTIVE'
          },
          {
            userId: user.id,
            title: 'Read a Book',
            category: 'PERSONAL',
            difficulty: 'Easy',
            attribute: 'wisdom',
            description: 'Read 20 pages of non-fiction or philosophy.',
            xpReward: 200,
            goldReward: 30,
            energyCost: 10,
            progress: 0,
            estimatedMinutes: 25,
            currentMinutes: 0,
            frequency: 'Daily',
            quote: '“A reader lives a thousand lives before he dies.”',
            iconName: 'scroll',
            status: 'ACTIVE'
          },
          {
            userId: user.id,
            title: 'Plan Your Day',
            category: 'DISCIPLINE',
            difficulty: 'Easy',
            attribute: 'discipline',
            description: 'Define top 3 priorities before opening social media.',
            xpReward: 150,
            goldReward: 25,
            energyCost: 10,
            progress: 0,
            estimatedMinutes: 10,
            currentMinutes: 0,
            frequency: 'Daily',
            quote: '“Failing to plan is planning to fail.”',
            iconName: 'shield',
            status: 'ACTIVE'
          }
        ];

        for (const q of starterQuests) {
          await tx.quest.create({ data: q });
        }

        // Give starter inventory items
        const starterItemIds = [
          { id: 'trackers_blade_item', qty: 1, eq: true },
          { id: 'mindful_cloak', qty: 1, eq: true },
          { id: 'health_potion', qty: 2, eq: false },
          { id: 'energy_bar', qty: 2, eq: false },
          { id: 'focus_potion', qty: 1, eq: false }
        ];

        for (const itm of starterItemIds) {
          const itemExists = await tx.inventoryItem.findUnique({ where: { id: itm.id } });
          if (itemExists) {
            await tx.userInventory.create({
              data: {
                userId: user.id,
                itemId: itm.id,
                quantity: itm.qty,
                equipped: itm.eq
              }
            });
          }
        }

        // Starter activity log
        await tx.activityLog.create({
          data: {
            userId: user.id,
            type: 'level_up',
            title: 'Inscribed in the Realm',
            description: 'Initiate registered with Novice Wanderer title.',
            xp: 0,
            gold: 50
          }
        });

        return { user, character };
      });

      const token = generateToken(result.user.id);

      const maxHp = ProgressionService.calculateMaxHealth(result.character.vitality);
      const maxEnergy = ProgressionService.calculateMaxEnergy(result.character.vitality, result.character.discipline);
      const requiredXp = ProgressionService.getRequiredXpForLevel(result.character.level);

      res.status(201).json({
        success: true,
        message: 'Welcome to REALM! Your adventurer profile has been inscribed.',
        data: {
          token,
          user: {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email
          },
          character: {
            ...result.character,
            maxHealth: maxHp,
            maxEnergy,
            requiredXp
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required.',
          errorCode: 'CREDENTIALS_MISSING'
        });
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase().trim() },
            { username: email.trim() }
          ]
        },
        include: {
          character: true,
          streak: true
        }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. No adventurer found matching these details.',
          errorCode: 'INVALID_CREDENTIALS'
        });
        return;
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. Incorrect password.',
          errorCode: 'INVALID_CREDENTIALS'
        });
        return;
      }

      const token = generateToken(user.id);
      const character = user.character || await prisma.character.create({
        data: {
          userId: user.id,
          level: 1,
          xp: 0,
          gold: 50
        }
      });

      const maxHp = ProgressionService.calculateMaxHealth(character.vitality);
      const maxEnergy = ProgressionService.calculateMaxEnergy(character.vitality, character.discipline);
      const requiredXp = ProgressionService.getRequiredXpForLevel(character.level);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const existingRestToday = await prisma.activityLog.findFirst({
        where: {
          userId: user.id,
          title: 'Campfire Rest & Meditation',
          createdAt: { gte: todayStart }
        }
      });
      const canRestToday = !existingRestToday;

      res.status(200).json({
        success: true,
        message: `Welcome back, ${user.username}!`,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          character: {
            ...character,
            maxHealth: maxHp,
            maxEnergy,
            requiredXp,
            canRestToday
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          character: true,
          streak: true
        }
      });

      if (!user || !user.character) {
        res.status(404).json({
          success: false,
          message: 'Character not found.',
          errorCode: 'CHARACTER_NOT_FOUND'
        });
        return;
      }

      const maxHp = ProgressionService.calculateMaxHealth(user.character.vitality);
      const maxEnergy = ProgressionService.calculateMaxEnergy(user.character.vitality, user.character.discipline);
      const requiredXp = ProgressionService.getRequiredXpForLevel(user.character.level);

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
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
          },
          character: {
            ...user.character,
            maxHealth: maxHp,
            maxEnergy,
            requiredXp,
            canRestToday
          },
          streak: user.streak
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.id) {
        // Optional departure activity log
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            type: 'quest_complete',
            title: 'Departed the Realm',
            description: `${req.user.username} saved their journey and rested outside the gates.`,
            xp: 0,
            gold: 0
          }
        }).catch(() => null);
      }

      res.status(200).json({
        success: true,
        message: 'Departed the Realm. Safe travels until your return, adventurer!'
      });
    } catch (err) {
      next(err);
    }
  }
}
