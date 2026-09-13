import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';

export class InventoryController {
  /**
   * GET /api/inventory - Retrieve user's inventory and shop catalog
   */
  static async getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const [userInventory, catalogItems] = await Promise.all([
        prisma.userInventory.findMany({
          where: { userId },
          include: { item: true }
        }),
        prisma.inventoryItem.findMany()
      ]);

      // Format user items
      const formattedItems = userInventory.map((ui) => ({
        id: ui.itemId,
        name: ui.item.name,
        description: ui.item.description,
        type: ui.item.type,
        category: ui.item.category || 'consumables',
        rarity: ui.item.rarity,
        bonus: ui.item.bonus,
        sellPrice: Math.round(ui.item.value * 0.6),
        value: ui.item.value,
        icon: ui.item.icon,
        image: ui.item.image,
        quote: ui.item.quote,
        quantity: ui.quantity,
        equipped: ui.equipped,
        healthRestore: ui.item.healthRestore,
        energyRestore: ui.item.energyRestore
      }));

      res.status(200).json({
        success: true,
        data: {
          items: formattedItems,
          catalog: catalogItems
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/inventory/buy - Purchase item with Gold
   */
  static async buyItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { itemId } = req.body;

      if (!itemId) {
        res.status(400).json({
          success: false,
          message: 'Item ID is required.',
          errorCode: 'MISSING_ITEM_ID'
        });
        return;
      }

      const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Item not found in shop catalog.',
          errorCode: 'ITEM_NOT_FOUND'
        });
        return;
      }

      const character = await prisma.character.findUnique({ where: { userId } });
      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found.',
          errorCode: 'CHARACTER_NOT_FOUND'
        });
        return;
      }

      if (character.gold < item.value) {
        res.status(400).json({
          success: false,
          message: `Insufficient gold! You need ${item.value - character.gold} more gold to purchase "${item.name}".`,
          errorCode: 'INSUFFICIENT_GOLD'
        });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        // Deduct gold
        const updatedChar = await tx.character.update({
          where: { userId },
          data: {
            gold: character.gold - item.value
          }
        });

        // Add or increment inventory
        const userInv = await tx.userInventory.upsert({
          where: {
            userId_itemId: {
              userId,
              itemId: item.id
            }
          },
          update: {
            quantity: { increment: 1 }
          },
          create: {
            userId,
            itemId: item.id,
            quantity: 1,
            equipped: false
          },
          include: { item: true }
        });

        // Transaction log
        await tx.transaction.create({
          data: {
            userId,
            type: 'ITEM_PURCHASE',
            amount: -item.value,
            description: `Purchased "${item.name}" for ${item.value} Gold`
          }
        });

        // Activity log
        await tx.activityLog.create({
          data: {
            userId,
            type: 'item_acquired',
            title: `Purchased ${item.name} (-${item.value} Gold)`,
            description: `Acquired from the Merchant Vault.`
          }
        });

        return { updatedChar, userInv };
      });

      res.status(200).json({
        success: true,
        message: `Purchased "${item.name}" for ${item.value} Gold! Added to vault.`,
        data: {
          remainingGold: result.updatedChar.gold,
          inventoryItem: result.userInv
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/inventory/use - Consume potion or booster item
   */
  static async useItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { itemId } = req.body;

      const userInv = await prisma.userInventory.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        },
        include: { item: true }
      });

      if (!userInv || userInv.quantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'You do not have any charges of this item in your vault.',
          errorCode: 'NO_ITEM_AVAILABLE'
        });
        return;
      }

      // Safeguard: equipment must never be consumed!
      if (userInv.item.type === 'equipment') {
        res.status(400).json({
          success: false,
          message: `"${userInv.item.name}" is equipment and cannot be consumed. Equip or unequip it instead.`,
          errorCode: 'CANNOT_CONSUME_EQUIPMENT'
        });
        return;
      }

      const character = await prisma.character.findUnique({ where: { userId } });
      if (!character) {
        res.status(404).json({
          success: false,
          message: 'Character not found.',
          errorCode: 'CHARACTER_NOT_FOUND'
        });
        return;
      }

      const maxHp = ProgressionService.calculateMaxHealth(character.vitality);
      const maxEnergy = ProgressionService.calculateMaxEnergy(character.vitality, character.discipline);

      // Determine effect based on item
      let hpRestore = userInv.item.healthRestore || 0;
      let energyRestore = userInv.item.energyRestore || 0;
      let xpBonus = 250;
      let goldBonus = 0;
      let attrToBoost: string | null = null;

      const idLow = itemId.toLowerCase();
      if (idLow.includes('health') || idLow.includes('vitality') || idLow.includes('leaf')) {
        hpRestore = Math.max(hpRestore, 50);
        attrToBoost = 'vitality';
      } else if (idLow.includes('energy') || idLow.includes('bar')) {
        energyRestore = Math.max(energyRestore, 40);
        attrToBoost = 'strength';
      } else if (idLow.includes('focus')) {
        energyRestore = Math.max(energyRestore, 30);
        xpBonus = 350;
        attrToBoost = 'intellect';
      } else if (idLow.includes('productivity') || idLow.includes('brew') || idLow.includes('coffee')) {
        energyRestore = Math.max(energyRestore, 50);
        hpRestore = Math.max(hpRestore, 20);
        goldBonus = 50;
        attrToBoost = 'discipline';
      } else if (idLow.includes('knowledge') || idLow.includes('scroll') || idLow.includes('tome')) {
        xpBonus = 500;
        attrToBoost = 'wisdom';
      }

      const nextHp = Math.min(maxHp, character.health + hpRestore);
      const nextEnergy = Math.min(maxEnergy, character.energy + energyRestore);

      // Progression calculation
      const progression = ProgressionService.calculateProgression(
        character.level,
        character.xp,
        xpBonus
      );

      const updateData: any = {
        health: nextHp,
        energy: nextEnergy,
        level: progression.newLevel,
        xp: progression.newXp,
        gold: character.gold + goldBonus
      };

      if (attrToBoost && ['strength', 'intellect', 'wisdom', 'discipline', 'vitality'].includes(attrToBoost)) {
        updateData[attrToBoost] = (character as any)[attrToBoost] + 1;
      }

      const result = await prisma.$transaction(async (tx) => {
        // Decrement quantity
        const updatedInv = await tx.userInventory.update({
          where: {
            userId_itemId: {
              userId,
              itemId
            }
          },
          data: {
            quantity: { decrement: 1 }
          }
        });

        // Update character
        const updatedChar = await tx.character.update({
          where: { userId },
          data: updateData
        });

        // Activity log
        await tx.activityLog.create({
          data: {
            userId,
            type: 'item_acquired',
            title: `Consumed: ${userInv.item.name}`,
            description: `Restored +${hpRestore} HP, +${energyRestore} Energy, +${xpBonus} XP.`,
            xp: xpBonus,
            gold: goldBonus
          }
        });

        return { updatedChar, updatedInv };
      });

      res.status(200).json({
        success: true,
        message: `Consumed "${userInv.item.name}"! +${hpRestore} HP, +${energyRestore} Energy, +${xpBonus} XP!`,
        data: {
          character: {
            ...result.updatedChar,
            maxHealth: maxHp,
            maxEnergy,
            requiredXp: progression.requiredXp
          },
          remainingQuantity: result.updatedInv.quantity,
          itemId: userInv.itemId
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/inventory/equip - Equip or unequip item
   */
  static async equipItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { itemId } = req.body;

      const userInv = await prisma.userInventory.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        },
        include: { item: true }
      });

      if (!userInv) {
        res.status(404).json({
          success: false,
          message: 'Item not found in your inventory.',
          errorCode: 'ITEM_NOT_FOUND'
        });
        return;
      }

      const nextEquipped = !userInv.equipped;

      // If equipping (not unequipped), ensure user owns at least 1 copy
      if (nextEquipped && userInv.quantity <= 0) {
        res.status(400).json({
          success: false,
          message: `You do not have any copies of "${userInv.item.name}" in your vault to equip.`,
          errorCode: 'ITEM_NOT_AVAILABLE'
        });
        return;
      }

      // If unequipped, ensure quantity is preserved as at least 1
      const safeQuantity = Math.max(1, userInv.quantity);

      const updated = await prisma.userInventory.update({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        },
        data: {
          equipped: nextEquipped,
          quantity: safeQuantity
        }
      });

      // Activity log
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'item_acquired',
          title: nextEquipped ? `Equipped: ${userInv.item.name}` : `Unequipped: ${userInv.item.name}`,
          description: nextEquipped 
            ? `Armed ${userInv.item.name}. Active perk: ${userInv.item.bonus}` 
            : `Stored ${userInv.item.name} back in vault.`,
          xp: 0,
          gold: 0
        }
      });

      res.status(200).json({
        success: true,
        message: nextEquipped ? `Equipped "${userInv.item.name}"!` : `Unequipped "${userInv.item.name}".`,
        data: {
          ...updated,
          itemId: userInv.itemId,
          equipped: nextEquipped,
          quantity: safeQuantity
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/inventory/sell - Sell item back to merchant for Gold
   */
  static async sellItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { itemId } = req.body;

      const userInv = await prisma.userInventory.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        },
        include: { item: true }
      });

      if (!userInv || userInv.quantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'You do not have any units of this item to sell.',
          errorCode: 'NO_ITEM_AVAILABLE'
        });
        return;
      }

      const sellPrice = Math.round(userInv.item.value * 0.6);

      const result = await prisma.$transaction(async (tx) => {
        // Decrement quantity
        const updatedInv = await tx.userInventory.update({
          where: {
            userId_itemId: {
              userId,
              itemId
            }
          },
          data: {
            quantity: { decrement: 1 }
          }
        });

        // Credit gold
        const updatedChar = await tx.character.update({
          where: { userId },
          data: {
            gold: { increment: sellPrice }
          }
        });

        // Transaction
        await tx.transaction.create({
          data: {
            userId,
            type: 'ITEM_SALE',
            amount: sellPrice,
            description: `Sold 1x "${userInv.item.name}" to Merchant Vault for +${sellPrice} Gold`
          }
        });

        // Activity log
        await tx.activityLog.create({
          data: {
            userId,
            type: 'item_acquired',
            title: `Sold 1x ${userInv.item.name} (+${sellPrice} Gold)`,
            gold: sellPrice
          }
        });

        return { updatedChar, updatedInv };
      });

      res.status(200).json({
        success: true,
        message: `Sold "${userInv.item.name}" for +${sellPrice} Gold!`,
        data: {
          currentGold: result.updatedChar.gold,
          remainingQuantity: result.updatedInv.quantity
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
