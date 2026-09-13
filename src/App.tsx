import React, { useState, useEffect, useCallback } from 'react';
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
import { AuthModal } from './components/AuthModal';
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
import { Sparkles } from 'lucide-react';
import {
  authApi,
  characterApi,
  questApi,
  inventoryApi,
  achievementApi,
  streakApi,
  activityApi,
  getToken,
  removeToken
} from './services/api';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getToken()));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(!getToken());
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Core game state
  const [profile, setProfile] = useState(initialProfile);
  const [attributes, setAttributes] = useState(initialAttributes);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [activities, setActivities] = useState(initialRecentActivity);
  const [inventory, setInventory] = useState(initialInventory);
  const [achievements, setAchievements] = useState(initialAchievements);

  // 7-day streak tracker (Mon - Sun)
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

  // Helper to sync authoritative character profile and attributes from backend
  const updateProfileAndStats = useCallback((charData: any, userData?: any, streakData?: any) => {
    if (!charData) return;
    setProfile(prev => {
      const addedXp = charData._addedXp || 0;
      const nextTotal = charData.totalXP ?? (charData.totalXp ?? ((prev.totalXP || 0) + addedXp));
      return {
        ...prev,
        name: userData?.username || prev.name,
        level: charData.level ?? prev.level,
        health: charData.health ?? prev.health,
        maxHealth: charData.maxHealth ?? prev.maxHealth,
        energy: charData.energy ?? prev.energy,
        maxEnergy: charData.maxEnergy ?? prev.maxEnergy,
        currentXP: charData.xp ?? prev.currentXP,
        maxXP: charData.requiredXp ?? prev.maxXP,
        gold: charData.gold ?? prev.gold,
        totalXP: nextTotal,
        streakDays: streakData?.currentStreak ?? (prev.streakDays || 1),
        canRestToday: charData.canRestToday !== undefined ? charData.canRestToday : prev.canRestToday
      };
    });

    setAttributes(prev => prev.map(attr => {
      const val = charData[attr.id];
      if (typeof val === 'number') {
        return { ...attr, current: val };
      }
      return attr;
    }));
  }, []);

  // Background fetcher for ancillary data (inventory, achievements, activity)
  const refreshBackgroundData = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [invRes, achRes, actRes] = await Promise.all([
        inventoryApi.getInventory().catch(() => null),
        achievementApi.getAchievements().catch(() => null),
        activityApi.getActivity().catch(() => null)
      ]);
      if (invRes?.success && Array.isArray(invRes.data?.items)) setInventory(invRes.data.items);
      if (achRes?.success && Array.isArray(achRes.data)) setAchievements(achRes.data);
      if (actRes?.success && Array.isArray(actRes.data)) setActivities(actRes.data);
    } catch (_) {}
  }, []);

  // Primary loader to fetch all data from real backend database
  const loadGameData = useCallback(async () => {
    if (!getToken()) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      // 1. Get Me & Character
      const meRes = await authApi.getMe();
      if (meRes.success && meRes.data) {
        setIsAuthenticated(true);
        setCurrentUser(meRes.data.user);
        updateProfileAndStats(meRes.data.character, meRes.data.user, meRes.data.streak);
      }

      // 2. Fetch Quests & Normalize active/completed flags
      const questsRes = await questApi.getQuests().catch(() => null);
      if (questsRes?.success && Array.isArray(questsRes.data)) {
        const normalized = questsRes.data.map((q: any) => ({
          ...q,
          active: q.status !== 'COMPLETED',
          completed: q.status === 'COMPLETED' || q.progress >= 100
        }));
        setQuests(normalized);
      }

      // 3. Fetch Inventory
      const invRes = await inventoryApi.getInventory().catch(() => null);
      if (invRes?.success && Array.isArray(invRes.data?.items)) {
        setInventory(invRes.data.items);
      }

      // 4. Fetch Achievements
      const achRes = await achievementApi.getAchievements().catch(() => null);
      if (achRes?.success && Array.isArray(achRes.data)) {
        setAchievements(achRes.data);
      }

      // 5. Fetch Streak
      const streakRes = await streakApi.getStreak().catch(() => null);
      if (streakRes?.success && streakRes.data?.weekTracker) {
        setStreakWeek(streakRes.data.weekTracker);
      }

      // 6. Fetch Activity
      const actRes = await activityApi.getActivity().catch(() => null);
      if (actRes?.success && Array.isArray(actRes.data)) {
        setActivities(actRes.data);
      }
    } catch (err: any) {
      if (err.status === 401) {
        removeToken();
        setIsAuthenticated(false);
        setIsAuthModalOpen(true);
      }
    }
  }, [updateProfileAndStats]);

  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  // Take a Campfire Rest / Meditate to recover Health & Energy via backend API (1-time daily limit)
  const handleRest = async () => {
    if (profile.canRestToday === false) {
      soundFx.playClick();
      showToast("⚠️ The campfire embers have cooled. You can only rest once per day!");
      return;
    }

    try {
      const res = await characterApi.rest();
      if (res.success && res.data) {
        soundFx.playLevelUp();
        updateProfileAndStats({ ...res.data, canRestToday: false });
        showToast(res.message || "🌙 Campfire Rest: Restored +35 Energy and +20 Health! (Daily rest completed)");
        refreshBackgroundData();
        return;
      }
    } catch (err: any) {
      if (err?.errorCode === 'REST_ALREADY_USED' || err?.message?.includes('once per day')) {
        setProfile(prev => ({ ...prev, canRestToday: false }));
        showToast("⚠️ " + (err.message || "The campfire embers have cooled. You can only rest once per day!"));
        return;
      }
      console.warn('Backend rest fallback:', err?.message);
    }

    setProfile(prev => ({
      ...prev,
      canRestToday: false,
      health: Math.min(prev.maxHealth, prev.health + 20),
      energy: Math.min(prev.maxEnergy, prev.energy + 35)
    }));
    soundFx.playLevelUp();
    showToast("🌙 Campfire Rest: Restored +35 Energy and +20 Health! (Daily rest used)");
  };

  // Handle direct quest completion from Quest Details or Board
  const handleCompleteQuestDirectly = async (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest) return;

    if (targetQuest.completed || targetQuest.progress >= 100) {
      showToast(`Quest "${targetQuest.title}" has already been claimed!`);
      return;
    }

    const xpEarned = Number(targetQuest.xpReward) || 150;
    const goldEarned = Number(targetQuest.goldReward) || 25;
    const attrName = (targetQuest.attribute || 'discipline').toLowerCase();

    try {
      const res = await questApi.completeQuest(questId);
      if (res.success && res.data) {
        soundFx.playQuestComplete();
        const { character, quest, rewards, progression } = res.data;

        // Authoritatively update character profile & attributes with added XP
        updateProfileAndStats({ ...character, _addedXp: rewards.xpEarned || xpEarned });

        // Update quest list
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, progress: 100, completed: true, status: 'COMPLETED' } : q));

        // Level-up celebration
        if (progression?.didLevelUp) {
          setTimeout(() => {
            setLevelUpModal({ open: true, level: progression.newLevel });
          }, 400);
        }

        // Open Quest Reward Modal celebration with authoritative droppedItem & rewards
        setTimeout(() => {
          setQuestRewardModal({
            open: true,
            questTitle: quest.title,
            xpEarned: rewards.xpEarned,
            goldEarned: rewards.goldEarned,
            attributeType: rewards.attributeGained,
            droppedItem: rewards.droppedItem ? {
              name: rewards.droppedItem.name,
              rarity: rewards.droppedItem.rarity,
              image: rewards.droppedItem.image,
              bonus: rewards.droppedItem.bonus
            } : null,
            bonusXP: rewards.bonusXp,
            bonusGold: rewards.bonusGold
          });
        }, 200);

        showToast(`Quest Complete: "${quest.title}"! +${rewards.xpEarned} XP, +${rewards.goldEarned} Gold, +1 ${rewards.attributeGained.toUpperCase()}!`);
        refreshBackgroundData();
        return;
      }
    } catch (err: any) {
      console.warn('Backend completion fallback to local progression:', err?.message);
    }

    // Local XP Awarding & Level Progression Guarantee
    soundFx.playQuestComplete();

    // Mark quest completed
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, progress: 100, completed: true, status: 'COMPLETED' } : q));

    // Award XP, Gold, and check level up
    setProfile(prev => {
      let curLevel = Math.max(1, prev.level);
      let curXp = prev.currentXP + xpEarned;
      let reqXp = prev.maxXP || Math.floor(100 * Math.pow(curLevel, 1.5));
      let leveledUp = false;

      while (curXp >= reqXp) {
        curXp -= reqXp;
        curLevel += 1;
        reqXp = Math.floor(100 * Math.pow(curLevel, 1.5));
        leveledUp = true;
      }

      if (leveledUp) {
        setTimeout(() => {
          setLevelUpModal({ open: true, level: curLevel });
        }, 400);
      }

      return {
        ...prev,
        level: curLevel,
        currentXP: curXp,
        maxXP: reqXp,
        totalXP: (prev.totalXP || 0) + xpEarned,
        gold: prev.gold + goldEarned
      };
    });

    // Award Attribute point
    setAttributes(prev => prev.map(attr => 
      attr.id.toLowerCase() === attrName || attr.name.toLowerCase() === attrName
        ? { ...attr, current: Math.min(attr.max, attr.current + 1) }
        : attr
    ));

    // Add activity log with valid fields
    const newLog: RecentActivityItem = {
      id: `act-${Date.now()}`,
      title: `Completed: ${targetQuest.title}`,
      type: 'completed_quest',
      xp: xpEarned,
      gold: goldEarned,
      timeAgo: 'Just now',
      timestamp: Date.now()
    };
    setActivities(prev => [newLog, ...prev]);

    // Open Quest Reward Modal celebration
    setTimeout(() => {
      setQuestRewardModal({
        open: true,
        questTitle: targetQuest.title,
        xpEarned: xpEarned,
        goldEarned: goldEarned,
        attributeType: attrName,
        droppedItem: null,
        bonusXP: 0,
        bonusGold: 0
      });
    }, 200);

    showToast(`Quest Complete: "${targetQuest.title}"! +${xpEarned} XP, +${goldEarned} Gold!`);
  };

  // Handle continuing / progressing a quest
  const handleContinueQuest = async (questId: string) => {
    await handleCompleteQuestDirectly(questId);
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

  // Add new quest via backend API
  const handleAddQuest = async (newQuestData: Omit<Quest, 'id' | 'progress'> | Quest) => {
    try {
      const res = await questApi.createQuest(newQuestData);
      if (res.success && res.data) {
        setQuests(prev => [{ ...res.data, active: true }, ...prev]);
        soundFx.playCelebration();
        showToast(`New Quest Inscribed: "${res.data.title}" added to Active Quests!`);
        refreshBackgroundData();
        return;
      }
    } catch (err: any) {
      console.warn('Backend quest creation fallback to local:', err?.message);
    }

    // Local fallback creation
    const createdQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: newQuestData.title,
      description: newQuestData.description || 'Custom heroic quest',
      category: newQuestData.category || 'DISCIPLINE',
      categoryColor: (newQuestData as any).categoryColor,
      xpReward: Number(newQuestData.xpReward) || 200,
      goldReward: Number(newQuestData.goldReward) || 30,
      attribute: newQuestData.attribute || 'discipline',
      progress: 0,
      active: true,
      completed: false,
      frequency: newQuestData.frequency || 'Daily',
      difficulty: newQuestData.difficulty || 'Medium',
      estimatedMinutes: newQuestData.estimatedMinutes || 30,
      currentMinutes: 0,
      iconName: newQuestData.iconName || 'shield'
    };

    setQuests(prev => [createdQuest, ...prev]);
    soundFx.playCelebration();
    showToast(`New Quest Inscribed: "${createdQuest.title}" added to Active Quests!`);
  };

  // Check in day via backend API
  const handleCheckInDay = async (index: number) => {
    if (streakWeek[index]?.checked) {
      showToast("Day already checked in!");
      return;
    }

    try {
      const res = await streakApi.checkIn();
      if (res.success && res.data) {
        soundFx.playQuestComplete();
        if (res.data.character) {
          updateProfileAndStats(res.data.character);
        }
        setStreakWeek(prev => prev.map((item, i) => i === index ? { ...item, checked: true } : item));
        showToast(`🔥 ${res.message || 'Streak Sealed!'}`);
        refreshBackgroundData();
        return;
      }
    } catch (err: any) {
      console.warn('Backend streak checkin fallback:', err?.message);
    }

    // Fallback local check-in
    soundFx.playQuestComplete();
    setStreakWeek(prev => prev.map((item, i) => i === index ? { ...item, checked: true } : item));
    const streakBonusXp = 50;
    const streakBonusGold = 20;
    setProfile(prev => ({
      ...prev,
      streakDays: prev.streakDays + 1,
      currentXP: prev.currentXP + streakBonusXp,
      gold: prev.gold + streakBonusGold,
      totalXP: (prev.totalXP || 0) + streakBonusXp
    }));
    showToast(`🔥 Streak Sealed! +${streakBonusXp} XP, +${streakBonusGold} Gold!`);
  };

  // Equip or unequip gear/relics via backend API
  const handleEquipItem = async (itemId: string) => {
    const targetItem = inventory.find(i => i.id === itemId);
    if (!targetItem) return;

    // Prevent equipping items with 0 copies if not currently equipped
    if (!targetItem.equipped && targetItem.quantity <= 0) {
      showToast(`You do not have ${targetItem.name} in your vault to equip.`);
      return;
    }

    try {
      const res = await inventoryApi.equipItem(itemId);
      if (res.success && res.data) {
        soundFx.playClick();
        const nextEq = !!res.data.equipped;
        const safeQty = typeof res.data.quantity === 'number' ? res.data.quantity : Math.max(1, targetItem.quantity);
        setInventory(prev => prev.map(i => i.id === itemId ? { ...i, equipped: nextEq, quantity: safeQty } : i));
        showToast(res.message);
        refreshBackgroundData();
        return;
      }
    } catch (err: any) {
      console.warn('Backend equipItem fallback:', err?.message);
    }

    // Local equip toggle fallback
    const nextEq = !targetItem.equipped;
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, equipped: nextEq, quantity: Math.max(1, i.quantity) } : i));
    soundFx.playClick();
    showToast(nextEq ? `Equipped ${targetItem.name}!` : `Unequipped ${targetItem.name}.`);
  };

  // Consume potion, elixir, or consumable item via backend API
  const handleConsumeItem = async (itemId: string) => {
    const targetItem = inventory.find(i => i.id === itemId);
    if (!targetItem) return;

    if (targetItem.quantity <= 0) {
      showToast(`No charges left for ${targetItem.name}. Purchase more from the merchant!`);
      return;
    }

    try {
      const res = await inventoryApi.useItem(itemId);
      if (res.success && res.data) {
        soundFx.playCelebration();
        updateProfileAndStats(res.data.character);
        const remQty = res.data.remainingQuantity;
        setInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity: remQty } : i));
        showToast(res.message);
        refreshBackgroundData();
        return;
      }
    } catch (err: any) {
      console.warn('Backend useItem fallback:', err?.message);
    }

    // Local potion use fallback
    const healthRestore = targetItem.healthRestore || 40;
    const energyRestore = targetItem.energyRestore || 35;
    const xpBonus = 250;
    setProfile(prev => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + healthRestore),
      energy: Math.min(prev.maxEnergy, prev.energy + energyRestore),
      currentXP: prev.currentXP + xpBonus,
      totalXP: (prev.totalXP || 0) + xpBonus
    }));
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i));
    soundFx.playCelebration();
    showToast(`Consumed ${targetItem.name}! Restored +${healthRestore} HP & +${energyRestore} Energy.`);
  };

  // Smart action router for inventory interactions
  const handleUseItem = async (itemId: string) => {
    const targetItem = inventory.find(i => i.id === itemId);
    if (!targetItem) return;

    const isConsumable = targetItem.type === 'potion' || targetItem.category === 'consumables' || targetItem.id === 'ancient_scroll';
    if (isConsumable) {
      await handleConsumeItem(itemId);
    } else {
      await handleEquipItem(itemId);
    }
  };

  // Sell inventory item for Gold via backend API
  const handleSellItem = async (itemId: string, goldPrice: number) => {
    try {
      const res = await inventoryApi.sellItem(itemId);
      if (res.success && res.data) {
        soundFx.playQuestComplete();
        setProfile(prev => ({ ...prev, gold: res.data.currentGold }));
        setInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity: res.data.remainingQuantity } : i));
        showToast(res.message);
        refreshBackgroundData();
        return;
      }
    } catch (err: any) {
      console.warn('Backend sellItem fallback:', err?.message);
    }

    // Local sell fallback
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
    setProfile(prev => ({ ...prev, gold: prev.gold + goldPrice }));
    soundFx.playQuestComplete();
    showToast(`Sold item for +${goldPrice} Gold!`);
  };

  // Buy virtual items with Gold via backend API
  const handleBuyItem = async (itemTemplate: any) => {
    try {
      const res = await inventoryApi.buyItem(itemTemplate.id);
      if (res.success && res.data) {
        soundFx.playCelebration();
        setProfile(prev => ({ ...prev, gold: res.data.remainingGold }));
        showToast(res.message);
        const invRes = await inventoryApi.getInventory();
        if (invRes.data?.items) {
          setInventory(invRes.data.items);
        }
        refreshBackgroundData();
      }
    } catch (err: any) {
      soundFx.playClick();
      showToast(`⚠️ ${err.message || 'Cannot buy item'}`);
    }
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

  // Logout handler
  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setIsAuthModalOpen(true);
    showToast("Departed the Realm. Safe travels, adventurer!");
  };

  // Successful authentication handler
  const handleAuthSuccess = (authData: any) => {
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    setCurrentUser(authData.user);
    if (authData.character) {
      updateProfileAndStats(authData.character, authData.user);
    }
    loadGameData();
    showToast(`Welcome, ${authData.user?.username || 'Hero'}! Entered the Realm.`);
  };

  // Filter quests & activities by search query
  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active quests in progress (not completed)
  const activeQuests = filteredQuests.filter(q => q.active !== false && !q.completed && q.status !== 'COMPLETED');

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
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-900/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[140px]" />
      </div>

      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab)}
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
          onNotificationsClick={() => showToast("You have active trials available in the Quest Board!")}
          onSettingsClick={() => setCurrentTab('settings')}
          onRest={handleRest}
          isAuthenticated={isAuthenticated}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Canvas */}
        <main id="main-content" role="main" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-6 outline-none">
          {currentTab === 'settings' ? (
            <SettingsView
              showToast={showToast}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              profile={profile}
              onLogout={handleLogout}
              userEmail={currentUser?.email}
            />
          ) : currentTab === 'achievements' ? (
            <AchievementsView
              achievements={achievements}
              showToast={showToast}
              onProgressAchievement={async () => {
                const achRes = await achievementApi.getAchievements().catch(() => null);
                if (achRes?.success && Array.isArray(achRes.data)) {
                  setAchievements(achRes.data);
                }
              }}
            />
          ) : currentTab === 'inventory' ? (
            <InventoryView
              items={inventory}
              gold={profile.gold}
              onUseItem={handleUseItem}
              onEquipItem={handleEquipItem}
              onConsumeItem={handleConsumeItem}
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
            <HistoryView
              showToast={showToast}
              onOpenQuestBoard={() => setCurrentTab('quests')}
            />
          ) : currentTab === 'add_quest' ? (
            <AddQuestView
              onAddQuest={(newQuest) => {
                handleAddQuest(newQuest);
                setCurrentTab('quests');
              }}
              onCancel={() => setCurrentTab('quests')}
              showToast={showToast}
            />
          ) : currentTab === 'quests' ? (
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

                {/* 5 RPG Stat Cards Row */}
                <StatCards 
                  attributes={attributes} 
                  onSelectAttribute={(attrId) => {
                    const matched = attributes.find(a => a.id === attrId);
                    if (matched) {
                      showToast(`${matched.name}: ${matched.current}/${matched.max} points. Complete ${matched.subSkills.join(', ')} quests to raise it!`);
                    }
                  }}
                />

                {/* Quick Access Action Cards */}
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
                    onCompleteQuest={handleCompleteQuestDirectly}
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

      {/* Authentication Gateway Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (isAuthenticated) setIsAuthModalOpen(false);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
