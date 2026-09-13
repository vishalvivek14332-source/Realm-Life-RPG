export interface ProgressionResult {
  newLevel: number;
  newXp: number;
  requiredXp: number;
  didLevelUp: boolean;
  levelsGained: number;
}

export class ProgressionService {
  /**
   * Authoritative non-linear formula: requiredXP = floor(100 * level^1.5)
   */
  static getRequiredXpForLevel(level: number): number {
    const lvl = Math.max(1, level);
    return Math.floor(100 * Math.pow(lvl, 1.5));
  }

  /**
   * Recalculates level and carries forward excess XP, allowing multiple level-ups
   */
  static calculateProgression(currentLevel: number, currentXp: number, addedXp: number): ProgressionResult {
    let level = Math.max(1, currentLevel);
    let xp = currentXp + addedXp;
    let didLevelUp = false;
    let levelsGained = 0;

    let requiredXp = this.getRequiredXpForLevel(level);

    while (xp >= requiredXp) {
      xp -= requiredXp;
      level += 1;
      levelsGained += 1;
      didLevelUp = true;
      requiredXp = this.getRequiredXpForLevel(level);
    }

    return {
      newLevel: level,
      newXp: xp,
      requiredXp,
      didLevelUp,
      levelsGained
    };
  }

  /**
   * Recalculates maximum health based on Vitality stat
   */
  static calculateMaxHealth(vitality: number): number {
    return 100 + Math.max(0, vitality) * 2;
  }

  /**
   * Recalculates maximum energy based on Vitality & Discipline stats
   */
  static calculateMaxEnergy(vitality: number, discipline: number): number {
    const vit = Math.max(0, vitality);
    const dis = Math.max(0, discipline);
    return 100 + Math.round(vit * 1.5 + dis * 0.5);
  }

  /**
   * Maps category and attribute to authoritative character stat
   */
  static resolveAttribute(category: string, attribute?: string): 'strength' | 'intellect' | 'wisdom' | 'discipline' | 'vitality' {
    const attrLower = attribute?.toLowerCase();
    if (attrLower && ['strength', 'intellect', 'wisdom', 'discipline', 'vitality'].includes(attrLower)) {
      return attrLower as any;
    }

    const catUpper = category.toUpperCase();
    switch (catUpper) {
      case 'HEALTH':
      case 'FITNESS':
        return 'strength';
      case 'STUDY':
      case 'WORK':
        return 'intellect';
      case 'PERSONAL':
      case 'MEDITATION':
        return 'wisdom';
      case 'DISCIPLINE':
      case 'CAREER':
      case 'PRODUCTIVITY':
        return 'discipline';
      default:
        return 'discipline';
    }
  }
}
