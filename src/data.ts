import { AttributeStat, Quest, RecentActivityItem, CharacterProfile, InventoryItem, Achievement } from './types';
import questDeepWork from './assets/images/quest_deepwork_1789200577920.jpg';
import questMorningExercise from './assets/images/quest_gym_weights_1789201011033.jpg';
import questReadBook from './assets/images/quest_reading_1789200614011.jpg';
import questPlanDay from './assets/images/quest_plan_day_1789200935829.jpg';
import questMeditation from './assets/images/quest_meditation_1789200950636.jpg';
import questDrinkWater from './assets/images/quest_water_bottle_1789200964839.jpg';
import questCompleteAssignment from './assets/images/quest_assignment_1789200979976.jpg';
import questCleanSpace from './assets/images/quest_clean_space_1789200996914.jpg';

export const initialProfile: CharacterProfile = {
  name: 'SHADOW',
  title: 'Pathfinder',
  level: 12,
  currentXP: 2450,
  maxXP: 3000,
  gold: 100,
  totalXP: 1250,
  streakDays: 12,
  class: 'Night Stalker / Pathfinder',
  equippedItems: ['cloak_shadows', 'ring_willpower']
};

export const initialAttributes: AttributeStat[] = [
  {
    id: 'strength',
    name: 'STRENGTH',
    current: 18,
    max: 100,
    color: '#ef4444',
    borderColor: 'border-rose-500/60',
    glowColor: 'rpg-border-glow-rose',
    barColor: 'from-rose-600 to-red-500',
    subSkills: ['Gym', 'Calisthenics', 'Heavy Training']
  },
  {
    id: 'intellect',
    name: 'INTELLECT',
    current: 16,
    max: 100,
    color: '#06b6d4',
    borderColor: 'border-cyan-500/60',
    glowColor: 'rpg-border-glow-cyan',
    barColor: 'from-cyan-600 to-sky-400',
    subSkills: ['Reading', 'Coding', 'Problem Solving']
  },
  {
    id: 'wisdom',
    name: 'WISDOM',
    current: 14,
    max: 100,
    color: '#a855f7',
    borderColor: 'border-purple-500/60',
    glowColor: 'rpg-border-glow-purple',
    barColor: 'from-purple-600 to-violet-400',
    subSkills: ['Mindfulness', 'Journaling', 'Better Decisions']
  },
  {
    id: 'discipline',
    name: 'DISCIPLINE',
    current: 20,
    max: 100,
    color: '#eab308',
    borderColor: 'border-amber-500/60',
    glowColor: 'rpg-border-glow-amber',
    barColor: 'from-amber-600 to-yellow-400',
    subSkills: ['Routine', 'Consistency', 'Self Control']
  },
  {
    id: 'vitality',
    name: 'VITALITY',
    current: 17,
    max: 100,
    color: '#10b981',
    borderColor: 'border-emerald-500/60',
    glowColor: 'rpg-border-glow-emerald',
    barColor: 'from-emerald-600 to-teal-400',
    subSkills: ['Sleep', 'Nutrition', 'Overall Health']
  }
];

export const initialQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Deep Work Session',
    category: 'STUDY',
    categoryColor: 'bg-indigo-900/80 border-purple-400/50 text-purple-200',
    description: 'Focus for 30 minutes on a meaningful task.',
    xpReward: 250,
    goldReward: 40,
    attribute: 'intellect',
    progress: 80,
    difficulty: 'Medium',
    estimatedMinutes: 30,
    currentMinutes: 24,
    frequency: 'Daily',
    quote: '“Focus is the key to extraordinary results.”',
    image: questDeepWork,
    iconName: 'book'
  },
  {
    id: 'quest-2',
    title: 'Morning Exercise',
    category: 'HEALTH',
    categoryColor: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200',
    description: 'Complete 20 min workout.',
    xpReward: 300,
    goldReward: 50,
    attribute: 'strength',
    progress: 50,
    difficulty: 'Medium',
    estimatedMinutes: 20,
    currentMinutes: 10,
    frequency: 'Daily',
    quote: '“Strength doesn’t come from what you can do, but overcoming what you once thought you couldn’t.”',
    image: questMorningExercise,
    iconName: 'dumbbell'
  },
  {
    id: 'quest-3',
    title: 'Read a Book',
    category: 'PERSONAL',
    categoryColor: 'bg-amber-950/80 border-amber-400/50 text-amber-200',
    description: 'Read 20 pages.',
    xpReward: 200,
    goldReward: 30,
    attribute: 'wisdom',
    progress: 30,
    difficulty: 'Easy',
    estimatedMinutes: 25,
    currentMinutes: 8,
    frequency: 'Daily',
    quote: '“A reader lives a thousand lives before he dies. The man who never reads lives only one.”',
    image: questReadBook,
    iconName: 'scroll'
  },
  {
    id: 'quest-4',
    title: 'Plan Your Day',
    category: 'WORK',
    categoryColor: 'bg-sky-950/80 border-sky-400/50 text-sky-200',
    description: 'Organize and prioritize your tasks.',
    xpReward: 150,
    goldReward: 20,
    attribute: 'discipline',
    progress: 60,
    difficulty: 'Easy',
    estimatedMinutes: 15,
    currentMinutes: 9,
    frequency: 'Daily',
    quote: '“By failing to prepare, you are preparing to fail.”',
    image: questPlanDay,
    iconName: 'scroll'
  },
  {
    id: 'quest-5',
    title: 'Meditation',
    category: 'PERSONAL',
    categoryColor: 'bg-amber-950/80 border-amber-400/50 text-amber-200',
    description: 'Meditate for 10 minutes.',
    xpReward: 100,
    goldReward: 20,
    attribute: 'wisdom',
    progress: 0,
    difficulty: 'Easy',
    estimatedMinutes: 10,
    currentMinutes: 0,
    frequency: 'Daily',
    quote: '“Quiet the mind, and the soul will speak.”',
    image: questMeditation,
    iconName: 'brain'
  },
  {
    id: 'quest-6',
    title: 'Drink Water',
    category: 'HEALTH',
    categoryColor: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200',
    description: 'Drink 8 glasses of water.',
    xpReward: 100,
    goldReward: 20,
    attribute: 'vitality',
    progress: 25,
    difficulty: 'Easy',
    estimatedMinutes: 12,
    currentMinutes: 3,
    frequency: 'Daily',
    quote: '“Water is the driving force of all nature and energy.”',
    image: questDrinkWater,
    iconName: 'shield'
  },
  {
    id: 'quest-7',
    title: 'Complete Assignment',
    category: 'STUDY',
    categoryColor: 'bg-indigo-900/80 border-purple-400/50 text-purple-200',
    description: 'Finish your pending assignment.',
    xpReward: 200,
    goldReward: 30,
    attribute: 'intellect',
    progress: 40,
    difficulty: 'Medium',
    estimatedMinutes: 45,
    currentMinutes: 18,
    frequency: 'Weekly',
    quote: '“Small disciplines repeated with consistency lead to great achievements.”',
    image: questCompleteAssignment,
    iconName: 'book'
  },
  {
    id: 'quest-8',
    title: 'Clean Your Space',
    category: 'PERSONAL',
    categoryColor: 'bg-amber-950/80 border-amber-400/50 text-amber-200',
    description: 'Spend 15 minutes cleaning.',
    xpReward: 100,
    goldReward: 20,
    attribute: 'discipline',
    progress: 0,
    difficulty: 'Easy',
    estimatedMinutes: 15,
    currentMinutes: 0,
    frequency: 'Daily',
    quote: '“Clear your space to clear your mind.”',
    image: questCleanSpace,
    iconName: 'shield'
  }
];

export const initialRecentActivity: RecentActivityItem[] = [
  {
    id: 'act-1',
    type: 'completed_quest',
    title: 'Completed: Deep Work Session',
    xp: 250,
    gold: 40,
    timeAgo: '2h ago',
    timestamp: Date.now() - 2 * 3600 * 1000
  },
  {
    id: 'act-2',
    type: 'achievement',
    title: 'Achievement Unlocked: Consistent Mind',
    xp: 500,
    timeAgo: '1d ago',
    timestamp: Date.now() - 24 * 3600 * 1000
  },
  {
    id: 'act-3',
    type: 'completed_quest',
    title: 'Completed: Morning Exercise',
    xp: 300,
    gold: 50,
    timeAgo: '5h ago',
    timestamp: Date.now() - 5 * 3600 * 1000
  },
  {
    id: 'act-4',
    type: 'completed_quest',
    title: 'Completed: Read a Book',
    xp: 200,
    gold: 30,
    timeAgo: '1d ago',
    timestamp: Date.now() - 26 * 3600 * 1000
  },
  {
    id: 'act-5',
    type: 'level_up',
    title: 'Levelled up to Level 12',
    timeAgo: '10h ago',
    timestamp: Date.now() - 10 * 3600 * 1000
  },
  {
    id: 'act-6',
    type: 'completed_quest',
    title: 'Completed: Plan Your Day',
    xp: 150,
    gold: 20,
    timeAgo: '2d ago',
    timestamp: Date.now() - 48 * 3600 * 1000
  }
];

export const initialInventory: InventoryItem[] = [
  {
    id: 'cloak_shadows',
    name: 'Cloak of the Shadow Stalker',
    rarity: 'Epic',
    type: 'equipment',
    description: 'Enchanted weave that shields the wearer from procrastination.',
    bonus: '+15% XP from Study Quests',
    icon: 'shield',
    quantity: 1,
    equipped: true
  },
  {
    id: 'ring_willpower',
    name: 'Band of Iron Discipline',
    rarity: 'Rare',
    type: 'equipment',
    description: 'Forged in cold mountain forge. Keeps your resolve unwavering.',
    bonus: '+5% Gold on 7+ Day Streak',
    icon: 'sparkles',
    quantity: 1,
    equipped: true
  },
  {
    id: 'elixir_focus',
    name: 'Elixir of Deep Focus',
    rarity: 'Rare',
    type: 'potion',
    description: 'Instantly grants 30 minutes of uninterrupted mental flow.',
    bonus: '+100 XP upon next completed study quest',
    icon: 'flask',
    quantity: 3,
    equipped: false
  },
  {
    id: 'draught_vitality',
    name: 'Tears of the Phoenix',
    rarity: 'Legendary',
    type: 'potion',
    description: 'Restores broken streak protector or prevents streak loss for 24h.',
    bonus: 'Streak Freeze Shield (1 Use)',
    icon: 'flame',
    quantity: 1,
    equipped: false
  },
  {
    id: 'tome_mastery',
    name: 'Grimoire of Habit Synthesis',
    rarity: 'Epic',
    type: 'relic',
    description: 'Ancient blueprint describing how minute habits compound into destiny.',
    bonus: '+2 Discipline permanently when studied',
    icon: 'book',
    quantity: 1,
    equipped: false
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Consistent Mind',
    description: 'Maintain a study streak for 7 consecutive days',
    xpReward: 500,
    icon: 'trophy',
    category: 'Intellect',
    unlocked: true,
    dateUnlocked: '1 day ago',
    progress: 7,
    maxProgress: 7
  },
  {
    id: 'ach-2',
    title: 'Dawn Breaker',
    description: 'Complete morning workouts before 8 AM for 5 days',
    xpReward: 350,
    icon: 'sun',
    category: 'Vitality',
    unlocked: true,
    dateUnlocked: '3 days ago',
    progress: 5,
    maxProgress: 5
  },
  {
    id: 'ach-3',
    title: 'Fortress of Discipline',
    description: 'Reach Level 15 in Discipline attribute',
    xpReward: 600,
    icon: 'shield',
    category: 'Discipline',
    unlocked: true,
    dateUnlocked: '10 hours ago',
    progress: 20,
    maxProgress: 15
  },
  {
    id: 'ach-4',
    title: 'Titan Lifter',
    description: 'Log 50 heavy physical workout sessions',
    xpReward: 1000,
    icon: 'sword',
    category: 'Strength',
    unlocked: false,
    progress: 38,
    maxProgress: 50
  },
  {
    id: 'ach-5',
    title: 'Grand Pathfinder',
    description: 'Reach Level 15 Character Rank',
    xpReward: 1500,
    icon: 'crown',
    category: 'General',
    unlocked: false,
    progress: 12,
    maxProgress: 15
  }
];
