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
import { AddQuestModal } from './components/AddQuestModal';
import { CharacterModal } from './components/CharacterModal';
import { InventoryModal } from './components/InventoryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LevelUpCelebration } from './components/LevelUpCelebration';
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
    { day: 'Tue', checked: true },
    { day: 'Wed', checked: true },
    { day: 'Thu', checked: true },
    { day: 'Fri', checked: true },
    { day: 'Sat', checked: true },
    { day: 'Sun', checked: false }
  ]);

  // UI state - default to 'history' to match user's uploaded History.png view directly!
  const [currentTab, setCurrentTab] = useState('history');
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
    level: 13
  });

  // Floating feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handle continuing / progressing a quest
  const handleContinueQuest = (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest) return;

    soundFx.playQuestProgress();

    // Increment progress by 20%
    const newProgress = Math.min(100, targetQuest.progress + 20);
    const est = targetQuest.estimatedMinutes || 30;
    const newMins = Math.round((est * newProgress) / 100);

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { 
          ...q, 
          progress: newProgress,
          currentMinutes: newMins,
          completed: newProgress === 100
        };
      }
      return q;
    }));

    if (newProgress === 100) {
      // Completed quest!
      soundFx.playQuestComplete();
      showToast(`Quest Complete: ${targetQuest.title}! +${targetQuest.xpReward} XP, +${targetQuest.goldReward} Gold!`);

      // Award XP and Gold
      awardXPAndGold(targetQuest.xpReward, targetQuest.goldReward, targetQuest.attribute, targetQuest.title);
    } else {
      showToast(`Quest Progress: ${targetQuest.title} is now at ${newProgress}%! (${newMins}/${est} mins)`);
    }
  };

  // Handle direct quest completion from Quest Details
  const handleCompleteQuestDirectly = (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest) return;

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

    showToast(`Mastery Achieved: "${targetQuest.title}" completed! +${targetQuest.xpReward} XP, +${targetQuest.goldReward} Gold!`);
    awardXPAndGold(targetQuest.xpReward, targetQuest.goldReward, targetQuest.attribute, targetQuest.title);
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

    // Boost attribute if provided
    if (attrType) {
      setAttributes(prev => prev.map(a => {
        if (a.id === attrType) {
          return { ...a, current: Math.min(a.max, a.current + 1) };
        }
        return a;
      }));
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

  // Add new quest
  const handleAddQuest = (newQuestData: Omit<Quest, 'id' | 'progress'> | Quest) => {
    const newQuest: Quest = {
      ...newQuestData,
      id: 'id' in newQuestData && newQuestData.id ? newQuestData.id : `quest-${Date.now()}`,
      progress: 'progress' in newQuestData && typeof newQuestData.progress === 'number' ? newQuestData.progress : 0
    };

    setQuests(prev => [newQuest, ...prev]);
    showToast(`New Quest Inscribed: "${newQuest.title}" added to your codex!`);
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
      streakDays: prev.streakDays + 1
    }));

    awardXPAndGold(150, 25);
    soundFx.playQuestComplete();
    showToast(`Streak Sealed! Day ${profile.streakDays + 1} logged. +150 XP & +25 Gold!`);
  };

  // Use / Equip inventory item
  const handleUseItem = (itemId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        if (item.type === 'potion') {
          showToast(`Drank ${item.name}! Effect active: ${item.bonus}`);
          soundFx.playQuestComplete();
          return { ...item, quantity: Math.max(0, item.quantity - 1) };
        } else {
          const nextEquipped = !item.equipped;
          showToast(nextEquipped ? `Equipped ${item.name}!` : `Unequipped ${item.name}.`);
          soundFx.playClick();
          return { ...item, equipped: nextEquipped };
        }
      }
      return item;
    }));
  };

  // Filter quests & activities by search query
  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070814] text-slate-100 flex relative overflow-x-hidden">
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
          if (tab === 'dashboard' || tab === 'quests' || tab === 'add_quest' || tab === 'history') {
            setCurrentTab(tab);
          } else if (tab === 'character') {
            setIsCharacterOpen(true);
          } else if (tab === 'inventory') {
            setIsInventoryOpen(true);
          } else if (tab === 'achievements') {
            setIsAchievementsOpen(true);
          } else if (tab === 'settings') {
            showToast("Realm Settings initialized: High-fidelity audio, dark mode, and cloud syncing are active.");
          }
        }}
        openAddQuest={() => setCurrentTab('add_quest')}
        questCount={quests.length}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col relative z-10">
        {/* Top Header */}
        <TopHeader
          profile={profile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          setMobileOpen={setMobileNavOpen}
          onProfileClick={() => setIsCharacterOpen(true)}
          onNotificationsClick={() => showToast("You have 1 pending daily trial available in Active Quests!")}
        />

        {/* Main Canvas: History View OR Add Quest View OR Quest Board OR Overview Dashboard */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-6">
          {currentTab === 'history' ? (
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
                  onOpenCharacter={() => setIsCharacterOpen(true)}
                  onOpenInventory={() => setIsInventoryOpen(true)}
                  onOpenAchievements={() => setIsAchievementsOpen(true)}
                />

                {/* Recent Activity Log */}
                <div id="recent-activity-section">
                  <RecentActivity 
                    activities={filteredActivities}
                    onViewAll={() => showToast("All past quest milestones and accomplishments are synchronized.")}
                  />
                </div>

              </div>

              {/* Right RPG HUD Column (col-span-4) */}
              <div className="lg:col-span-4 space-y-5">
                
                {/* Active Quests Panel */}
                <div id="active-quests-section">
                  <ActiveQuests
                    quests={filteredQuests}
                    onContinueQuest={handleContinueQuest}
                    onViewAll={() => setCurrentTab('quests')}
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
        <div className="fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-xl bg-[#170e2b] border border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.4)] text-xs font-bold text-white flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
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
    </div>
  );
}
