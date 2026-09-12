import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { HeroBanner } from './components/HeroBanner';
import { StatCards } from './components/StatCards';
import { QuickAccess } from './components/QuickAccess';
import { RecentActivity } from './components/RecentActivity';
import { ActiveQuests } from './components/ActiveQuests';
import { StreakCard } from './components/StreakCard';
import { PromoCard } from './components/PromoCard';
import { QuestBoard } from './components/QuestBoard';
import { AddQuestView } from './components/AddQuestView';
import { HistoryView } from './components/HistoryView';
import { CharacterView } from './components/CharacterView';
import { InventoryView } from './components/InventoryView';
import { AddQuestModal } from './components/AddQuestModal';
import { CharacterModal } from './components/CharacterModal';
import { InventoryModal } from './components/InventoryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementsView } from './components/AchievementsView';
import { SettingsView } from './components/SettingsView';
import { LevelUpCelebration } from './components/LevelUpCelebration';
import { QuestRewardModal } from './components/QuestRewardModal';
import { 
  initialProfile, 
  initialAttributes, 
  initialQuests, 
  initialRecentActivity,
  initialInventory,
  initialAchievements
} from './data';
import { Quest, AttributeType } from './types';
import { soundFx } from './sound';
import { Sparkles, CheckCircle, Bell } from 'lucide-react';

export default function App() {
  // Core game state
  const [profile, setProfile] = useState(initialProfile);
  const [attributes, setAttributes] = useState(initialAttributes);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [activities, setActivities] = useState(initialRecentActivity);
  const [inventory, setInventory] = useState(initialInventory);
  const [achievements, setAchievements] = useState(initialAchievements);

  // 7-day streak tracker (Mon - Sun, matches reference image where Sun is open today)
  const [streakWeek, setStreakWeek] = useState([
    { day: 'Mon', checked: true },
    { day: 'Tue', checked: false },
    { day: 'Wed', checked: false },
    { day: 'Thu', checked: false },
    { day: 'Fri', checked: false },
    { day: 'Sat', checked: false },
    { day: 'Sun', checked: false }
  ]);

  // UI state - default to 'dashboard'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddQuestOpen, setIsAddQuestOpen] = useState(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{ open: boolean; level: number }>({
    open: false,
    level: 1
  });

  // Dedicated Quest Victory & Reward Modal
  const [questRewardModal, setQuestRewardModal] = useState<{
    open: boolean;
    questTitle: string;
    xpEarned: number;
    goldEarned: number;
    attributeType: string;
    droppedItem?: {
      name: string;
      rarity: string;
      image?: string;
      bonus: string;
    } | null;
    bonusXP?: number;
    bonusGold?: number;
  }>({
    open: false,
    questTitle: '',
    xpEarned: 0,
    goldEarned: 0,
    attributeType: 'strength',
    droppedItem: null,
    bonusXP: 0,
    bonusGold: 0
  });

  // Floating feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Take a Campfire Rest / Meditate to recover Health & Energy
  const handleRest = () => {
    soundFx.playLevelUp();
    setProfile(prev => {
      const nextEnergy = Math.min(prev.maxEnergy, prev.energy + 35);
      const nextHealth = Math.min(prev.maxHealth, prev.health + 20);
      return {
        ...prev,
        energy: nextEnergy,
        health: nextHealth
      };
    });
    showToast("🌙 Campfire Rest: Restored +35 Energy and +20 Health!");
  };

  // Award quest loot drop
  const awardQuestLoot = (quest: Quest) => {
    let candidateIds: string[] = [];

    if (quest.attribute === 'strength' || quest.category === 'HEALTH') {
      candidateIds = ['health_potion', 'energy_bar', 'vitality_leaf'];
    } else if (quest.attribute === 'intellect' || quest.category === 'STUDY' || quest.category === 'WORK') {
      candidateIds = ['focus_potion', 'productivity_brew', 'knowledge_tome'];
    } else if (quest.attribute === 'wisdom' || quest.category === 'PERSONAL') {
      candidateIds = ['clarity_crystal', 'ancient_scroll', 'explorers_compass'];
    } else if (quest.attribute === 'discipline' || quest.category === 'DISCIPLINE') {
      candidateIds = ['productivity_brew', 'iron_token', 'time_shard'];
    } else {
      candidateIds = ['energy_bar', 'health_potion', 'focus_potion'];
    }

    const lootId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
    const targetItem = inventory.find(i => i.id === lootId);

    if (targetItem) {
      setInventory(prev => prev.map(item => {
        if (item.id === lootId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }));

      setActivities(acts => [
        {
          id: `act-${Date.now()}-loot`,
          type: 'item_acquired',
          title: `Acquired: +1 ${targetItem.name}`,
          timeAgo: 'Just now',
          timestamp: Date.now()
        },
        ...acts
      ]);

      return targetItem;
    }
    return null;
  };

  // Handle continuing / progressing a quest with stamina & health exhaustion mechanics
  const handleContinueQuest = (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest) return;

    // Strict guard: quest already completed or claimed
    if (targetQuest.completed || targetQuest.progress >= 100) {
      showToast(`Quest "${targetQuest.title}" has already been claimed!`);
      return;
    }

    // Check if player has collapsed from exhaustion
    if (profile.health <= 0) {
      soundFx.playClick();
      showToast("💀 Collapse! You have 0 HP and cannot quest. Rest or drink an elixir to recover!");
      return;
    }

    // 1. Calculate step stamina energy cost (mitigated by Strength & Discipline attributes)
    const rawCost = targetQuest.energyCost || 15;
    let stepCost = Math.max(3, Math.round(rawCost * 0.4));
    const strStat = attributes.find(a => a.id === 'strength')?.current || 10;
    const disStat = attributes.find(a => a.id === 'discipline')?.current || 10;

    if (targetQuest.attribute === 'strength') {
      stepCost = Math.max(2, Math.round(stepCost * (1 - Math.min(0.45, strStat / 150))));
    }
    stepCost = Math.max(2, Math.round(stepCost * (1 - Math.min(0.35, disStat / 200))));

    // Deduct stamina or apply exhaustion health damage
    let healthLoss = 0;
    let staminaUsed = 0;

    setProfile(prev => {
      let nextEnergy = prev.energy;
      let nextHealth = prev.health;

      if (nextEnergy >= stepCost) {
        nextEnergy -= stepCost;
        staminaUsed = stepCost;
      } else {
        const deficit = stepCost - nextEnergy;
        staminaUsed = nextEnergy;
        nextEnergy = 0;
        healthLoss = Math.max(4, Math.round(deficit * 1.5));
        nextHealth = Math.max(0, nextHealth - healthLoss);
      }

      return {
        ...prev,
        energy: nextEnergy,
        health: nextHealth
      };
    });

    soundFx.playQuestProgress();

    // Increment progress by 20%
    const newProgress = Math.min(100, targetQuest.progress + 20);
    const est = targetQuest.estimatedMinutes || 30;
    const newMins = Math.round((est * newProgress) / 100);
    const isNowCompleted = newProgress >= 100;

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { 
          ...q, 
          progress: newProgress,
          currentMinutes: newMins,
          completed: isNowCompleted
        };
      }
      return q;
    }));

    if (isNowCompleted) {
      soundFx.playQuestComplete();

      // Calculate Intellect Critical Insight bonus (+25% XP chance)
      const intStat = attributes.find(a => a.id === 'intellect')?.current || 10;
      const insightProc = targetQuest.attribute === 'intellect' && (Math.random() < Math.min(0.7, intStat / 35));
      const bonusXP = insightProc ? Math.round(targetQuest.xpReward * 0.25) : 0;
      const finalXP = targetQuest.xpReward + bonusXP;

      // Calculate Wisdom Bountiful Discovery bonus (+30% Gold chance)
      const wisStat = attributes.find(a => a.id === 'wisdom')?.current || 10;
      const discoveryProc = targetQuest.attribute === 'wisdom' && (Math.random() < Math.min(0.7, wisStat / 35));
      const bonusGold = discoveryProc ? Math.round(targetQuest.goldReward * 0.3) : 0;
      const finalGold = targetQuest.goldReward + bonusGold;

      const bonusNote = (insightProc ? ' 🧠 Critical Insight (+25% XP)!' : '') + (discoveryProc ? ' 👁️ Bountiful Discovery (+30% Gold)!' : '');

      const droppedItem = awardQuestLoot(targetQuest);
      const lootNote = droppedItem ? ` 🎁 Loot: +1 ${droppedItem.name}!` : '';

      if (healthLoss > 0) {
        showToast(`⚠️ Exhaustion Strain (-${healthLoss} HP)! Quest Complete: ${targetQuest.title}! +${finalXP} XP, +${finalGold} Gold, +1 ${targetQuest.attribute.toUpperCase()}!${bonusNote}${lootNote}`);
      } else {
        showToast(`⚡ -${stepCost} Energy! Quest Complete: ${targetQuest.title}! +${finalXP} XP, +${finalGold} Gold, +1 ${targetQuest.attribute.toUpperCase()}!${bonusNote}${lootNote}`);
      }

      awardXPAndGold(finalXP, finalGold, targetQuest.attribute, targetQuest.title);

      // Open Quest Reward Modal celebration
      setTimeout(() => {
        setQuestRewardModal({
          open: true,
          questTitle: targetQuest.title,
          xpEarned: finalXP,
          goldEarned: finalGold,
          attributeType: targetQuest.attribute,
          droppedItem: droppedItem ? {
            name: droppedItem.name,
            rarity: droppedItem.rarity,
            image: droppedItem.image,
            bonus: droppedItem.bonus
          } : null,
          bonusXP,
          bonusGold
        });
      }, 200);
    } else {
      if (healthLoss > 0) {
        showToast(`⚠️ Exhaustion! -${healthLoss} HP lost (0 Energy)! ${targetQuest.title} at ${newProgress}%! (${newMins}/${est} mins)`);
      } else {
        showToast(`⚡ -${stepCost} Energy | ${targetQuest.title} is now at ${newProgress}%! (${newMins}/${est} mins)`);
      }
    }
  };

  // Handle direct quest completion from Quest Details
  const handleCompleteQuestDirectly = (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest) return;

    if (targetQuest.completed || targetQuest.progress >= 100) {
      showToast(`Quest "${targetQuest.title}" has already been claimed!`);
      return;
    }

    if (profile.health <= 0) {
      soundFx.playClick();
      showToast("💀 Collapse! You have 0 HP and cannot quest. Rest or drink an elixir to recover!");
      return;
    }

    // Direct completion energy cost
    const fullCost = targetQuest.energyCost || 15;
    let healthLoss = 0;

    setProfile(prev => {
      let nextEnergy = prev.energy;
      let nextHealth = prev.health;

      if (nextEnergy >= fullCost) {
        nextEnergy -= fullCost;
      } else {
        const deficit = fullCost - nextEnergy;
        nextEnergy = 0;
        healthLoss = Math.max(6, Math.round(deficit * 1.5));
        nextHealth = Math.max(0, nextHealth - healthLoss);
      }

      return { ...prev, energy: nextEnergy, health: nextHealth };
    });

    soundFx.playQuestComplete();
    const est = targetQuest.estimatedMinutes || 30;

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { 
          ...q, 
          progress: 100,
          currentMinutes: est,
          completed: true 
        };
      }
      return q;
    }));

    // Calculate bonuses
    const intStat = attributes.find(a => a.id === 'intellect')?.current || 10;
    const insightProc = targetQuest.attribute === 'intellect' && (Math.random() < Math.min(0.7, intStat / 35));
    const bonusXP = insightProc ? Math.round(targetQuest.xpReward * 0.25) : 0;
    const finalXP = targetQuest.xpReward + bonusXP;

    const wisStat = attributes.find(a => a.id === 'wisdom')?.current || 10;
    const discoveryProc = targetQuest.attribute === 'wisdom' && (Math.random() < Math.min(0.7, wisStat / 35));
    const bonusGold = discoveryProc ? Math.round(targetQuest.goldReward * 0.3) : 0;
    const finalGold = targetQuest.goldReward + bonusGold;

    const bonusNote = (insightProc ? ' 🧠 Critical Insight (+25% XP)!' : '') + (discoveryProc ? ' 👁️ Bountiful Discovery (+30% Gold)!' : '');

    const droppedItem = awardQuestLoot(targetQuest);
    const lootNote = droppedItem ? ` 🎁 Loot: +1 ${droppedItem.name}!` : '';

    if (healthLoss > 0) {
      showToast(`⚠️ Exhaustion Strain (-${healthLoss} HP)! "${targetQuest.title}" completed! +${finalXP} XP, +${finalGold} Gold, +1 ${targetQuest.attribute.toUpperCase()}!${bonusNote}${lootNote}`);
    } else {
      showToast(`⚡ -${fullCost} Energy! "${targetQuest.title}" completed! +${finalXP} XP, +${finalGold} Gold, +1 ${targetQuest.attribute.toUpperCase()}!${bonusNote}${lootNote}`);
    }

    awardXPAndGold(finalXP, finalGold, targetQuest.attribute, targetQuest.title);

    // Open Quest Reward Modal celebration
    setTimeout(() => {
      setQuestRewardModal({
        open: true,
        questTitle: targetQuest.title,
        xpEarned: finalXP,
        goldEarned: finalGold,
        attributeType: targetQuest.attribute,
        droppedItem: droppedItem ? {
          name: droppedItem.name,
          rarity: droppedItem.rarity,
          image: droppedItem.image,
          bonus: droppedItem.bonus
        } : null,
        bonusXP,
        bonusGold
      });
    }, 200);
  };

  // Award XP and Gold logic + leveling
  const awardXPAndGold = (xp: number, gold: number, attrType?: AttributeType, questTitle?: string) => {
    setProfile(prev => {
      const nextXP = prev.currentXP + xp;
      const nextTotalXP = prev.totalXP + xp;
      const nextGold = prev.gold + gold;

      // Check level up
      if (nextXP >= prev.maxXP) {
        const newLevel = prev.level + 1;
        const remainingXP = nextXP - prev.maxXP;
        const newMaxXP = Math.round(prev.maxXP * 1.25);

        // Trigger level up modal celebration
        setTimeout(() => {
          setLevelUpModal({ open: true, level: newLevel });
        }, 400);

        // Add level up to activity log
        setActivities(acts => [
          {
            id: `act-${Date.now()}-lvl`,
            type: 'level_up',
            title: `Levelled up to Level ${newLevel}`,
            timeAgo: 'Just now',
            timestamp: Date.now()
          },
          ...acts
        ]);

        return {
          ...prev,
          level: newLevel,
          currentXP: remainingXP,
          maxXP: newMaxXP,
          gold: nextGold,
          totalXP: nextTotalXP
        };
      }

      return {
        ...prev,
        currentXP: nextXP,
        totalXP: nextTotalXP,
        gold: nextGold
      };
    });

    // Boost attribute if provided and dynamically recalculate max vitals
    if (attrType) {
      setAttributes(prev => {
        const nextAttrs = prev.map(a => {
          if (a.id === attrType) {
            return { ...a, current: Math.min(a.max, a.current + 1) };
          }
          return a;
        });

        // Recalculate dynamic maxHealth & maxEnergy based on new Vitality & Discipline
        const vit = nextAttrs.find(a => a.id === 'vitality')?.current || 10;
        const dis = nextAttrs.find(a => a.id === 'discipline')?.current || 10;
        const newMaxHP = 100 + vit * 2;
        const newMaxEnergy = 100 + Math.round(vit * 1.5 + dis * 0.5);

        setProfile(p => ({
          ...p,
          maxHealth: newMaxHP,
          maxEnergy: newMaxEnergy
        }));

        return nextAttrs;
      });
    }

    // Add activity log
    if (questTitle) {
      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          type: 'completed_quest',
          title: `Completed: ${questTitle}`,
          xp,
          gold,
          timeAgo: 'Just now',
          timestamp: Date.now()
        },
        ...prev
      ]);
    }
  };

  // Accept quest from board into active list
  const handleAcceptQuest = (questId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { ...q, active: true };
      }
      return q;
    }));
    soundFx.playClick();
    const target = quests.find(q => q.id === questId);
    if (target) {
      showToast(`Quest Accepted! "${target.title}" is now active on your dashboard.`);
    }
  };

  // Add new quest
  const handleAddQuest = (newQuestData: Omit<Quest, 'id' | 'progress'> | Quest) => {
    const newQuest: Quest = {
      ...newQuestData,
      id: 'id' in newQuestData && newQuestData.id ? newQuestData.id : `quest-${Date.now()}`,
      progress: 'progress' in newQuestData && typeof newQuestData.progress === 'number' ? newQuestData.progress : 0,
      active: true,
      completed: false
    };

    setQuests(prev => [newQuest, ...prev]);
    showToast(`New Quest Inscribed: "${newQuest.title}" added to Active Quests!`);
  };

  // Check in day
  const handleCheckInDay = (index: number) => {
    if (streakWeek[index].checked) return;

    setStreakWeek(prev => prev.map((item, i) => {
      if (i === index) return { ...item, checked: true };
      return item;
    }));

    setProfile(prev => ({
      ...prev,
      streakDays: prev.streakDays + 1,
      health: prev.maxHealth,
      energy: prev.maxEnergy
    }));

    awardXPAndGold(150, 25);
    soundFx.playQuestComplete();
    showToast(`🔥 Streak Sealed! Day ${profile.streakDays + 1} logged. 100% Health & Energy restored, +150 XP & +25 Gold!`);
  };

  // Use / Equip inventory item
  const handleUseItem = (itemId: string) => {
    const targetItem = inventory.find(i => i.id === itemId);
    if (!targetItem) return;

    if (targetItem.type === 'potion' || targetItem.category === 'consumables' || targetItem.category === 'boosts') {
      if (targetItem.quantity <= 0) {
        showToast(`No charges left for "${targetItem.name}"!`);
        return;
      }

      // Determine XP, Gold and Attribute rewards based on item
      let xpAward = 250;
      let goldAward = 0;
      let attrBoost: AttributeType | undefined = undefined;

      const idLow = itemId.toLowerCase();
      if (idLow.includes('focus')) {
        xpAward = 350;
        attrBoost = 'intellect';
      } else if (idLow.includes('health') || idLow.includes('vitality')) {
        xpAward = 250;
        attrBoost = 'vitality';
      } else if (idLow.includes('productivity') || idLow.includes('brew')) {
        xpAward = 400;
        goldAward = 75;
        attrBoost = 'discipline';
      } else if (idLow.includes('time_shard') || idLow.includes('shard')) {
        xpAward = 600;
        goldAward = 150;
      } else if (idLow.includes('knowledge') || idLow.includes('scroll') || idLow.includes('tome')) {
        xpAward = 500;
        attrBoost = 'wisdom';
      } else if (idLow.includes('phoenix')) {
        xpAward = 1000;
        goldAward = 250;
        attrBoost = 'vitality';
      } else if (idLow.includes('energy')) {
        xpAward = 200;
        goldAward = 35;
        attrBoost = 'strength';
      } else if (idLow.includes('token') || idLow.includes('badge') || idLow.includes('trophy')) {
        xpAward = 750;
        goldAward = 300;
      }

      // Health and Energy restorations
      let hpRest = targetItem.healthRestore || 0;
      let epRest = targetItem.energyRestore || 0;

      if (idLow.includes('health')) {
        hpRest = Math.max(hpRest, 50);
      } else if (idLow.includes('vitality')) {
        hpRest = Math.max(hpRest, 40);
        epRest = Math.max(epRest, 25);
      } else if (idLow.includes('energy')) {
        epRest = Math.max(epRest, 40);
      } else if (idLow.includes('productivity') || idLow.includes('brew')) {
        epRest = Math.max(epRest, 50);
        hpRest = Math.max(hpRest, 20);
      } else if (idLow.includes('focus')) {
        epRest = Math.max(epRest, 40);
      }

      if (hpRest > 0 || epRest > 0) {
        setProfile(prev => ({
          ...prev,
          health: Math.min(prev.maxHealth, prev.health + hpRest),
          energy: Math.min(prev.maxEnergy, prev.energy + epRest)
        }));
      }

      setInventory(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(0, item.quantity - 1) };
        }
        return item;
      }));

      soundFx.playCelebration();
      const vitalsText = (hpRest > 0 ? ` +${hpRest} HP` : '') + (epRest > 0 ? ` +${epRest} Energy` : '');
      showToast(`Consumed ${targetItem.name}!${vitalsText} +${xpAward} XP${goldAward > 0 ? `, +${goldAward} Gold` : ''}! (${targetItem.bonus})`);
      awardXPAndGold(xpAward, goldAward, attrBoost, `Consumed ${targetItem.name}`);
    } else {
      // Equipment
      if (!targetItem.equipped && targetItem.quantity <= 0) {
        soundFx.playClick();
        showToast(`Cannot equip "${targetItem.name}": 0 in vault! Complete quests to loot it.`);
        return;
      }

      const nextEquipped = !targetItem.equipped;
      setInventory(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, equipped: nextEquipped };
        }
        return item;
      }));
      showToast(nextEquipped ? `Equipped ${targetItem.name}! (${targetItem.bonus})` : `Unequipped ${targetItem.name}.`);
      soundFx.playClick();
    }
  };

  // Sell inventory item for Gold
  const handleSellItem = (itemId: string, goldPrice: number) => {
    const target = inventory.find(i => i.id === itemId);
    if (!target || target.quantity <= 0) {
      showToast("Cannot sell: none left in inventory!");
      return;
    }

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, item.quantity - 1) };
      }
      return item;
    }));

    setProfile(prev => ({
      ...prev,
      gold: prev.gold + goldPrice
    }));

    setActivities(acts => [
      {
        id: `act-${Date.now()}-sell`,
        type: 'item_acquired',
        title: `Sold ${target.name} for +${goldPrice} Gold`,
        gold: goldPrice,
        timeAgo: 'Just now',
        timestamp: Date.now()
      },
      ...acts
    ]);

    soundFx.playQuestComplete();
    showToast(`Merchant Vault: Sold 1x "${target.name}" for +${goldPrice} Gold!`);
  };

  // Buy virtual items with Gold
  const handleBuyItem = (itemTemplate: any) => {
    if (profile.gold < itemTemplate.price) {
      soundFx.playClick();
      showToast(`⚠️ Insufficient Gold! You need ${itemTemplate.price - profile.gold} more Gold to buy "${itemTemplate.name}".`);
      return;
    }

    setProfile(prev => ({
      ...prev,
      gold: prev.gold - itemTemplate.price
    }));

    setInventory(prev => {
      const existing = prev.find(i => i.id === itemTemplate.id);
      if (existing) {
        return prev.map(i => i.id === itemTemplate.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          id: itemTemplate.id,
          name: itemTemplate.name,
          rarity: itemTemplate.rarity,
          type: itemTemplate.type,
          category: itemTemplate.category,
          description: itemTemplate.description,
          bonus: itemTemplate.bonus,
          sellPrice: Math.round(itemTemplate.price * 0.6),
          icon: itemTemplate.icon,
          quantity: 1,
          equipped: false,
          healthRestore: itemTemplate.healthRestore,
          energyRestore: itemTemplate.energyRestore
        }
      ];
    });

    soundFx.playCelebration();
    showToast(`🛒 Purchased "${itemTemplate.name}" for ${itemTemplate.price} Gold! Added to your Vault.`);

    setActivities(acts => [
      {
        id: `act-${Date.now()}-buy`,
        type: 'item_acquired',
        title: `Purchased ${itemTemplate.name} for ${itemTemplate.price} Gold`,
        timeAgo: 'Just now',
        timestamp: Date.now()
      },
      ...acts
    ]);
  };

  // Buy & Equip Realm Theme with Gold
  const handleBuyTheme = (themeId: string, themeName: string, price: number) => {
    if (profile.unlockedThemes?.includes(themeId)) {
      setProfile(prev => ({ ...prev, currentTheme: themeId }));
      soundFx.playClick();
      showToast(`🎨 Realm Theme switched to "${themeName}"!`);
      return;
    }

    if (profile.gold < price) {
      soundFx.playClick();
      showToast(`⚠️ Insufficient Gold! You need ${price - profile.gold} more Gold to unlock theme "${themeName}".`);
      return;
    }

    setProfile(prev => ({
      ...prev,
      gold: prev.gold - price,
      currentTheme: themeId,
      unlockedThemes: [...(prev.unlockedThemes || ['theme-default']), themeId]
    }));

    soundFx.playCelebration();
    showToast(`✨ Unlocked & Activated Realm Theme: "${themeName}" for ${price} Gold!`);

    setActivities(acts => [
      {
        id: `act-${Date.now()}-theme`,
        type: 'item_acquired',
        title: `Unlocked Realm Theme: ${themeName}`,
        timeAgo: 'Just now',
        timestamp: Date.now()
      },
      ...acts
    ]);
  };

  // Buy & Equip Profile Badge / Title with Gold
  const handleBuyBadge = (badgeTitle: string, price: number) => {
    if (profile.unlockedTitles?.includes(badgeTitle)) {
      setProfile(prev => ({ ...prev, title: badgeTitle }));
      soundFx.playClick();
      showToast(`🛡️ Equipped Title: "${badgeTitle}"!`);
      return;
    }

    if (profile.gold < price) {
      soundFx.playClick();
      showToast(`⚠️ Insufficient Gold! You need ${price - profile.gold} more Gold to unlock title "${badgeTitle}".`);
      return;
    }

    setProfile(prev => ({
      ...prev,
      gold: prev.gold - price,
      title: badgeTitle,
      unlockedTitles: [...(prev.unlockedTitles || [prev.title || 'Novice Wanderer']), badgeTitle]
    }));

    soundFx.playCelebration();
    showToast(`🏆 Prestige Title Unlocked: "${badgeTitle}" for ${price} Gold! Equipped to profile.`);

    setActivities(acts => [
      {
        id: `act-${Date.now()}-badge`,
        type: 'achievement',
        title: `Unlocked Prestige Title: ${badgeTitle}`,
        timeAgo: 'Just now',
        timestamp: Date.now()
      },
      ...acts
    ]);
  };

  // Filter quests & activities by search query
  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active quests in progress (not completed)
  const activeQuests = filteredQuests.filter(q => q.active && !q.completed);

  // Dynamic theme wrapper class
  const getThemeWrapperClass = () => {
    switch (profile.currentTheme) {
      case 'theme-solar':
        return 'bg-[#120803] text-amber-50';
      case 'theme-emerald':
        return 'bg-[#03140c] text-emerald-50';
      case 'theme-crimson':
        return 'bg-[#140407] text-rose-50';
      case 'theme-default':
      default:
        return 'bg-[#070814] text-slate-100';
    }
  };

  const filteredActivities = activities.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${getThemeWrapperClass()} flex relative overflow-x-hidden transition-colors duration-500`}>
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Purple top glow */}
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-[120px]" />
        {/* Cyan center-right glow */}
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-900/10 rounded-full blur-[130px]" />
        {/* Amber bottom glow */}
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[140px]" />
      </div>

      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
        }}
        openAddQuest={() => setCurrentTab('add_quest')}
        questCount={activeQuests.length}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col relative z-10">
        {/* Top Header */}
        <TopHeader
          profile={profile}
          currentTab={currentTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          setMobileOpen={setMobileNavOpen}
          onProfileClick={() => setCurrentTab('character')}
          onNotificationsClick={() => showToast("You have 1 pending daily trial available in Active Quests!")}
          onSettingsClick={() => setCurrentTab('settings')}
          onRest={handleRest}
        />

        {/* Main Canvas: Settings View OR Achievements View OR Inventory View OR Character View OR History View OR Add Quest View OR Quest Board OR Overview Dashboard */}
        <main id="main-content" role="main" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-6 outline-none">
          {currentTab === 'settings' ? (
            /* Dedicated Settings View matching the reference screenshot */
            <SettingsView
              showToast={showToast}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              profile={profile}
            />
          ) : currentTab === 'achievements' ? (
            /* Dedicated Achievements View matching the reference screenshot */
            <AchievementsView
              achievements={achievements}
              showToast={showToast}
              onProgressAchievement={(id) => {
                setAchievements(prev => prev.map(a => {
                  if (a.id === id) {
                    if (a.status === 'completed' || a.unlocked || a.progress >= a.maxProgress) {
                      return a;
                    }
                    const newProg = Math.min(a.maxProgress, a.progress + 1);
                    const completed = newProg >= a.maxProgress;
                    if (completed) {
                      soundFx.playAchievementUnlock();
                      showToast(`Achievement Unlocked: "${a.title}"! +${a.xpReward} XP, +${a.goldReward} Gold!`);
                      awardXPAndGold(a.xpReward, a.goldReward);
                    }
                    return {
                      ...a,
                      progress: newProg,
                      unlocked: completed,
                      status: completed ? 'completed' : 'in_progress'
                    };
                  }
                  return a;
                }));
              }}
            />
          ) : currentTab === 'inventory' ? (
            /* Dedicated Inventory View matching the reference screenshot */
            <InventoryView
              items={inventory}
              gold={profile.gold}
              onUseItem={handleUseItem}
              onSellItem={handleSellItem}
              onBuyItem={handleBuyItem}
              onBuyTheme={handleBuyTheme}
              onBuyBadge={handleBuyBadge}
              unlockedThemes={profile.unlockedThemes}
              currentTheme={profile.currentTheme}
              unlockedTitles={profile.unlockedTitles}
              currentTitle={profile.title}
              showToast={showToast}
            />
          ) : currentTab === 'character' ? (
            /* Dedicated Character View matching the reference screenshot */
            <CharacterView
              profile={profile}
              setProfile={setProfile}
              attributes={attributes}
              setAttributes={setAttributes}
              inventory={inventory}
              setInventory={setInventory}
              quests={quests}
              achievements={achievements}
              showToast={showToast}
              onOpenInventory={() => setCurrentTab('inventory')}
              onOpenAchievements={() => setCurrentTab('achievements')}
              onRest={handleRest}
            />
          ) : currentTab === 'history' ? (
            /* Dedicated Adventure Log / History View matching the uploaded History.png reference image */
            <HistoryView
              showToast={showToast}
              onOpenQuestBoard={() => setCurrentTab('quests')}
            />
          ) : currentTab === 'add_quest' ? (
            /* Dedicated Inscribe Quest View matching the uploaded Add Quests.png reference image */
            <AddQuestView
              onAddQuest={(newQuest) => {
                handleAddQuest(newQuest);
                setCurrentTab('quests');
              }}
              onCancel={() => setCurrentTab('quests')}
              showToast={showToast}
            />
          ) : currentTab === 'quests' ? (
            /* Dedicated Quest Board View matching the uploaded reference image */
            <QuestBoard
              quests={filteredQuests}
              onContinueQuest={handleContinueQuest}
              onCompleteQuest={handleCompleteQuestDirectly}
              onOpenAddQuest={() => setCurrentTab('add_quest')}
              onAcceptQuest={handleAcceptQuest}
            />
          ) : (
            /* Main Dashboard Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Primary Column (col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Hero Banner with Character Showcase & Glowing XP Bar */}
                <HeroBanner profile={profile} />

                {/* 5 RPG Stat Cards Row (STRENGTH, INTELLECT, WISDOM, DISCIPLINE, VITALITY) */}
                <StatCards 
                  attributes={attributes} 
                  onSelectAttribute={(attrId) => {
                    const matched = attributes.find(a => a.id === attrId);
                    if (matched) {
                      showToast(`${matched.name}: ${matched.current}/${matched.max} points. Focus on ${matched.subSkills.join(', ')} to raise it!`);
                    }
                  }}
                />

                {/* Quick Access Action Cards (Add Quest, Character, Inventory, Achievements) */}
                <QuickAccess
                  onAddQuest={() => setCurrentTab('add_quest')}
                  onOpenCharacter={() => setCurrentTab('character')}
                  onOpenInventory={() => setCurrentTab('inventory')}
                  onOpenAchievements={() => setCurrentTab('achievements')}
                />

                {/* Recent Activity Log */}
                <div id="recent-activity-section">
                  <RecentActivity 
                    activities={filteredActivities}
                    onViewAll={() => {
                      soundFx.playClick();
                      setCurrentTab('history');
                    }}
                  />
                </div>

              </div>

              {/* Right RPG HUD Column (col-span-4) */}
              <div className="lg:col-span-4 space-y-5">
                
                {/* Active Quests Panel */}
                <div id="active-quests-section">
                  <ActiveQuests
                    quests={activeQuests}
                    onContinueQuest={handleContinueQuest}
                    onViewAll={() => setCurrentTab('quests')}
                    onOpenAddQuest={() => setIsAddQuestOpen(true)}
                  />
                </div>

                {/* Streak Card with 7-Day Tracker */}
                <StreakCard
                  streakDays={profile.streakDays}
                  streakWeek={streakWeek}
                  onCheckInDay={handleCheckInDay}
                />

                {/* Promo Card: "SMALL STEPS. BIGGER YOU." */}
                <PromoCard
                  onKeepGoing={() => {
                    setCurrentTab('quests');
                  }}
                />

              </div>

            </div>
          )}
        </main>
      </div>

      {/* Floating Interactive Toast Feedback */}
      {toastMessage && (
        <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-xl bg-[#170e2b] border border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.4)] text-xs font-bold text-white flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-7 h-7 rounded-lg bg-purple-900/80 flex items-center justify-center shrink-0 text-purple-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals */}
      <AddQuestModal
        isOpen={isAddQuestOpen}
        onClose={() => setIsAddQuestOpen(false)}
        onAddQuest={handleAddQuest}
      />

      <CharacterModal
        isOpen={isCharacterOpen}
        onClose={() => setIsCharacterOpen(false)}
        profile={profile}
        attributes={attributes}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        items={inventory}
        onUseItem={handleUseItem}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      <LevelUpCelebration
        isOpen={levelUpModal.open}
        onClose={() => setLevelUpModal({ open: false, level: levelUpModal.level })}
        newLevel={levelUpModal.level}
      />

      {/* Quest Completion Victory & Reward Modal */}
      <QuestRewardModal
        isOpen={questRewardModal.open}
        onClose={() => setQuestRewardModal(prev => ({ ...prev, open: false }))}
        questTitle={questRewardModal.questTitle}
        xpEarned={questRewardModal.xpEarned}
        goldEarned={questRewardModal.goldEarned}
        attributeType={questRewardModal.attributeType}
        droppedItem={questRewardModal.droppedItem}
        bonusXP={questRewardModal.bonusXP}
        bonusGold={questRewardModal.bonusGold}
      />
    </div>
  );
}
