export type AttributeType = 'strength' | 'intellect' | 'wisdom' | 'discipline' | 'vitality';

export interface AttributeStat {
  id: AttributeType;
  name: string;
  current: number;
  max: number;
  color: string;
  borderColor: string;
  glowColor: string;
  barColor: string;
  subSkills: string[];
}

export interface Quest {
  id: string;
  title: string;
  category: 'STUDY' | 'HEALTH' | 'PERSONAL' | 'WORK' | 'CAREER' | 'DISCIPLINE';
  categoryColor?: string;
  description: string;
  xpReward: number;
  goldReward: number;
  attribute: AttributeType;
  progress: number; // 0 to 100
  iconName?: 'book' | 'dumbbell' | 'scroll' | 'brain' | 'code' | 'shield';
  completed?: boolean;
  frequency?: 'Daily' | 'Weekly';
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Epic';
  quote?: string;
  estimatedMinutes?: number;
  currentMinutes?: number;
  image?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'completed_quest' | 'achievement' | 'level_up';
  title: string;
  xp?: number;
  gold?: number;
  timeAgo: string;
  timestamp: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  type: 'potion' | 'equipment' | 'relic';
  description: string;
  bonus: string;
  icon: string;
  quantity: number;
  equipped?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  category: string;
  unlocked: boolean;
  dateUnlocked?: string;
  progress: number;
  maxProgress: number;
}

export interface CharacterProfile {
  name: string;
  title: string;
  level: number;
  currentXP: number;
  maxXP: number;
  gold: number;
  totalXP: number;
  streakDays: number;
  class: string;
  avatarUrl?: string;
  equippedItems: string[];
}
