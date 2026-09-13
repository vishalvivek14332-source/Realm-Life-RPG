import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚔️  Seeding REALM Codex: Inventory Items and Achievements...');

  // 1. Inventory Items Catalog
  const inventoryItems = [
    {
      id: 'mindful_cloak',
      name: 'Mindful Cloak',
      rarity: 'Epic',
      type: 'equipment',
      category: 'boosts',
      description: 'A cloak woven from the threads of focus. Helps you stay in the zone.',
      bonus: '+5 Focus while working',
      value: 120,
      quote: '“Discipline wears many forms.”',
      icon: 'cloak'
    },
    {
      id: 'trackers_blade_item',
      name: "Tracker's Blade",
      rarity: 'Rare',
      type: 'equipment',
      category: 'boosts',
      description: 'A tempered edge forged to slice away hesitation and strike directly at procrastination.',
      bonus: '+10 Discipline',
      value: 140,
      quote: '“Strike while the iron is hot.”',
      icon: 'sword'
    },
    {
      id: 'time_shard',
      name: 'Time Shard',
      rarity: 'Legendary',
      type: 'relic',
      category: 'special',
      description: 'Crystallized temporal energy mined from deep focused states.',
      bonus: 'Reduces quest time by 25%',
      value: 250,
      quote: '“Master time, or be mastered by it.”',
      icon: 'hourglass'
    },
    {
      id: 'focus_potion',
      name: 'Focus Potion',
      rarity: 'Rare',
      type: 'potion',
      category: 'consumables',
      description: 'A distillation of hyper-concentration herbs that clears away brain fog.',
      bonus: '+50 Focus (1 hour)',
      value: 50,
      energyRestore: 30,
      quote: '“Clarity in a bottle.”',
      icon: 'flask'
    },
    {
      id: 'health_potion',
      name: 'Health Potion',
      rarity: 'Common',
      type: 'potion',
      category: 'consumables',
      description: 'Enchanted tonic brewed from crimson berries and clean spring water.',
      bonus: 'Restores 50 Health',
      value: 25,
      healthRestore: 50,
      quote: '“Vitality renewed.”',
      icon: 'apple'
    },
    {
      id: 'energy_bar',
      name: 'Energy Bar',
      rarity: 'Common',
      type: 'potion',
      category: 'consumables',
      description: 'Nutrient-dense ration that fuels prolonged physical and mental sessions.',
      bonus: 'Restores 40 Energy',
      value: 20,
      energyRestore: 40,
      quote: '“Fuel for the relentless.”',
      icon: 'sneaker'
    },
    {
      id: 'knowledge_tome',
      name: 'Knowledge Tome',
      rarity: 'Epic',
      type: 'relic',
      category: 'boosts',
      description: 'Illuminated codex holding synthesis techniques for complex disciplines.',
      bonus: '+5 Intellect (permanent)',
      value: 180,
      quote: '“Knowledge compounds without limit.”',
      icon: 'book'
    },
    {
      id: 'phoenix_feather',
      name: 'Phoenix Feather',
      rarity: 'Rare',
      type: 'relic',
      category: 'special',
      description: 'A radiant feather imbued with perpetual flame that saves a lapsed day.',
      bonus: 'Revive streak (once)',
      value: 200,
      quote: '“From the ashes, we rise.”',
      icon: 'feather'
    },
    {
      id: 'productivity_brew',
      name: 'Productivity Brew',
      rarity: 'Common',
      type: 'potion',
      category: 'consumables',
      description: 'Dark roast coffee infused with ancient roasted beans from the highlands.',
      bonus: '+50 Focus (30 minutes)',
      value: 30,
      energyRestore: 50,
      healthRestore: 20,
      quote: '“The ritual of morning execution.”',
      icon: 'coffee'
    },
    {
      id: 'pathfinders_ring',
      name: "Pathfinder's Ring",
      rarity: 'Epic',
      type: 'equipment',
      category: 'boosts',
      description: 'An antique signet carrying a glowing amethyst that magnifies knowledge.',
      bonus: '+5 XP Gain (all quests)',
      value: 160,
      quote: '“Forge uncharted ground.”',
      icon: 'ring'
    },
    {
      id: 'explorers_compass',
      name: "Explorer's Compass",
      rarity: 'Rare',
      type: 'relic',
      category: 'special',
      description: 'A brass compass needle aligned with elusive milestones and rare codex pages.',
      bonus: 'Reveal hidden achievements',
      value: 120,
      quote: '“Guidance through the fog.”',
      icon: 'compass'
    },
    {
      id: 'iron_token',
      name: 'Iron Token',
      rarity: 'Common',
      type: 'relic',
      category: 'boosts',
      description: 'Heavy minted medallion symbolizing resistance drills and iron discipline.',
      bonus: '+5 Strength (permanent)',
      value: 80,
      quote: '“The weight does not get lighter, you get stronger.”',
      icon: 'dumbbell'
    },
    {
      id: 'clarity_crystal',
      name: 'Clarity Crystal',
      rarity: 'Rare',
      type: 'relic',
      category: 'boosts',
      description: 'Prismatic geode that attunes the mind to calm introspection and deep decisions.',
      bonus: '+5 Wisdom (permanent)',
      value: 110,
      quote: '“See through the turbulence of impulse.”',
      icon: 'brain'
    },
    {
      id: 'vitality_leaf',
      name: 'Vitality Leaf',
      rarity: 'Uncommon',
      type: 'potion',
      category: 'consumables',
      description: 'Dew-kissed herb harvested at dawn, rich with rejuvenating natural properties.',
      bonus: '+40 Health',
      value: 35,
      healthRestore: 40,
      quote: '“Nourish the biological vessel.”',
      icon: 'leaf'
    },
    {
      id: 'champions_trophy',
      name: "Champion's Trophy",
      rarity: 'Epic',
      type: 'relic',
      category: 'trophies',
      description: 'Gilded cup engraved with the names of warriors who conquered their excuses.',
      bonus: 'A symbol of consistency',
      value: 300,
      quote: '“Honor earned through the quiet days.”',
      icon: 'trophy'
    },
    {
      id: 'ancient_scroll',
      name: 'Ancient Scroll',
      rarity: 'Common',
      type: 'relic',
      category: 'special',
      description: 'A mysterious scroll inscribed with ancient mantras of mastery.',
      bonus: 'A mysterious scroll...',
      value: 60,
      quote: '“The past whispers to those who listen.”',
      icon: 'scroll'
    },
    {
      id: 'streak_guardian',
      name: 'Streak Guardian',
      rarity: 'Epic',
      type: 'relic',
      category: 'trophies',
      description: 'Golden insignia commemorating two unbroken weeks of disciplined execution.',
      bonus: '+10% Streak Multiplier',
      value: 250,
      quote: '“Unbroken cadence builds dynasties.”',
      icon: 'trophy'
    },
    {
      id: 'grandmaster_badge',
      name: "Grandmaster's Seal",
      rarity: 'Legendary',
      type: 'relic',
      category: 'trophies',
      description: 'Royal crest given to champions who mastered all 5 core life attributes.',
      bonus: '+100 Max Energy Capacity',
      value: 600,
      quote: '“The pinnacle of self mastery.”',
      icon: 'trophy'
    }
  ];

  for (const itm of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { id: itm.id },
      update: itm,
      create: itm
    });
  }
  console.log(`✅ Seeded ${inventoryItems.length} inventory items.`);

  // 2. Achievements Catalog
  const achievements = [
    {
      id: 'first_quest',
      name: 'First Blood',
      description: 'Complete your first quest in the Realm',
      requirement: 'Complete 1 quest',
      reward: '+200 XP, +50 Gold',
      xpReward: 200,
      goldReward: 50,
      icon: 'shield',
      category: 'General',
      rarity: 'Common',
      maxProgress: 1
    },
    {
      id: 'consistent_mind',
      name: 'Consistent Mind',
      description: 'Complete 7 days in a row',
      requirement: 'Maintain 7-day streak',
      reward: '+500 XP, +100 Gold',
      xpReward: 500,
      goldReward: 100,
      icon: 'brain',
      category: 'Intellect',
      rarity: 'Epic',
      maxProgress: 7
    },
    {
      id: 'bookworm',
      name: 'Bookworm',
      description: 'Read 10 books',
      requirement: 'Complete 10 reading quests',
      reward: '+300 XP, +50 Gold',
      xpReward: 300,
      goldReward: 50,
      icon: 'book',
      category: 'Intellect',
      rarity: 'Rare',
      maxProgress: 10
    },
    {
      id: 'fitness_fighter',
      name: 'Fitness Fighter',
      description: 'Complete 30 workout quests',
      requirement: '30 strength quests',
      reward: '+400 XP, +75 Gold',
      xpReward: 400,
      goldReward: 75,
      icon: 'dumbbell',
      category: 'Strength',
      rarity: 'Rare',
      maxProgress: 30
    },
    {
      id: 'early_riser',
      name: 'Early Riser',
      description: 'Complete 20 morning quests',
      requirement: '20 morning quests',
      reward: '+300 XP, +50 Gold',
      xpReward: 300,
      goldReward: 50,
      icon: 'sun',
      category: 'Vitality',
      rarity: 'Rare',
      maxProgress: 20
    },
    {
      id: 'quest_master',
      name: 'Quest Master',
      description: 'Complete 100 total quests',
      requirement: 'Complete 100 quests',
      reward: '+1000 XP, +200 Gold',
      xpReward: 1000,
      goldReward: 200,
      icon: 'scroll',
      category: 'General',
      rarity: 'Legendary',
      maxProgress: 100
    },
    {
      id: 'productivity_pro',
      name: 'Productivity Pro',
      description: 'Complete 50 study quests',
      requirement: 'Complete 50 study quests',
      reward: '+300 XP, +100 Gold',
      xpReward: 300,
      goldReward: 100,
      icon: 'hourglass',
      category: 'Discipline',
      rarity: 'Epic',
      maxProgress: 50
    },
    {
      id: 'health_hero',
      name: 'Health Hero',
      description: 'Complete 50 health quests',
      requirement: 'Complete 50 health quests',
      reward: '+500 XP, +100 Gold',
      xpReward: 500,
      goldReward: 100,
      icon: 'leaf',
      category: 'Vitality',
      rarity: 'Rare',
      maxProgress: 50
    },
    {
      id: 'wealth_builder',
      name: 'Wealth Builder',
      description: 'Earn 5,000 gold',
      requirement: 'Accumulate 5000 gold',
      reward: '+750 XP',
      xpReward: 750,
      goldReward: 0,
      icon: 'coins',
      category: 'General',
      rarity: 'Epic',
      maxProgress: 5000
    },
    {
      id: 'legendary_discipline',
      name: 'Legendary Discipline',
      description: 'Complete 100 day streak',
      requirement: 'Maintain 100-day streak',
      reward: '+2000 XP, +300 Gold',
      xpReward: 2000,
      goldReward: 300,
      icon: 'flame',
      category: 'Discipline',
      rarity: 'Legendary',
      maxProgress: 100
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Complete 25 personal quests',
      requirement: 'Complete 25 personal quests',
      reward: '+300 XP, +50 Gold',
      xpReward: 300,
      goldReward: 50,
      icon: 'users',
      category: 'Personal',
      rarity: 'Common',
      maxProgress: 25
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Try all quest categories',
      requirement: 'Try 6 quest categories',
      reward: '+500 XP, +100 Gold',
      xpReward: 500,
      goldReward: 100,
      icon: 'compass',
      category: 'General',
      rarity: 'Rare',
      maxProgress: 6
    },
    {
      id: 'realm_champion',
      name: 'Realm Champion',
      description: 'Complete 250 total quests',
      requirement: 'Complete 250 total quests',
      reward: '+2500 XP, +500 Gold',
      xpReward: 2500,
      goldReward: 500,
      icon: 'crown',
      category: 'General',
      rarity: 'Legendary',
      maxProgress: 250
    }
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: ach,
      create: ach
    });
  }
  console.log(`✅ Seeded ${achievements.length} achievements.`);
  console.log('🏰 REALM Codex seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding REALM database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
