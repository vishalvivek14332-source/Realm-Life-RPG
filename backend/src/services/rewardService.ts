import prisma from '../prisma.js';

export interface RewardCalculation {
  baseXp: number;
  bonusXp: number;
  finalXp: number;
  baseGold: number;
  bonusGold: number;
  finalGold: number;
  droppedItem: {
    id: string;
    name: string;
    rarity: string;
    image?: string | null;
    bonus?: string | null;
  } | null;
}

export class RewardService {
  /**
   * Calculates authoritatively XP and Gold bonuses and possible item drops
   */
  static async calculateQuestRewards(
    quest: {
      xpReward: number;
      goldReward: number;
      attribute: string;
      category: string;
    },
    character: {
      intellect: number;
      wisdom: number;
    }
  ): Promise<RewardCalculation> {
    const baseXp = Math.max(10, quest.xpReward);
    const baseGold = Math.max(5, quest.goldReward);

    // Critical Insight: chance based on intellect (max 70% chance) for +25% XP
    const insightChance = Math.min(0.7, character.intellect / 35);
    const hasInsight = quest.attribute === 'intellect' && Math.random() < insightChance;
    const bonusXp = hasInsight ? Math.round(baseXp * 0.25) : 0;
    const finalXp = baseXp + bonusXp;

    // Bountiful Discovery: chance based on wisdom (max 70% chance) for +30% Gold
    const discoveryChance = Math.min(0.7, character.wisdom / 35);
    const hasDiscovery = quest.attribute === 'wisdom' && Math.random() < discoveryChance;
    const bonusGold = hasDiscovery ? Math.round(baseGold * 0.3) : 0;
    const finalGold = baseGold + bonusGold;

    // Loot Drop: 40% chance of an item drop corresponding to quest theme
    let droppedItem: RewardCalculation['droppedItem'] = null;
    const dropRoll = Math.random();

    if (dropRoll < 0.45) {
      let candidateIds: string[] = [];

      if (quest.attribute === 'strength' || quest.category === 'HEALTH') {
        candidateIds = ['health_potion', 'energy_bar', 'vitality_leaf'];
      } else if (quest.attribute === 'intellect' || quest.category === 'STUDY') {
        candidateIds = ['focus_potion', 'productivity_brew', 'knowledge_tome'];
      } else if (quest.attribute === 'wisdom' || quest.category === 'PERSONAL') {
        candidateIds = ['clarity_crystal', 'ancient_scroll', 'explorers_compass'];
      } else if (quest.attribute === 'discipline' || quest.category === 'DISCIPLINE') {
        candidateIds = ['productivity_brew', 'iron_token', 'time_shard'];
      } else {
        candidateIds = ['energy_bar', 'health_potion', 'focus_potion'];
      }

      const randomItemId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
      const item = await prisma.inventoryItem.findUnique({
        where: { id: randomItemId }
      });

      if (item) {
        droppedItem = {
          id: item.id,
          name: item.name,
          rarity: item.rarity,
          image: item.image,
          bonus: item.bonus
        };
      }
    }

    return {
      baseXp,
      bonusXp,
      finalXp,
      baseGold,
      bonusGold,
      finalGold,
      droppedItem
    };
  }
}
