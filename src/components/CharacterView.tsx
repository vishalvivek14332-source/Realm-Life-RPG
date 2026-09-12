import React, { useState } from 'react';
import { 
  Shield, 
  Star, 
  Award, 
  Zap, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Coins, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  Heart, 
  Dumbbell, 
  Brain, 
  Eye, 
  Leaf, 
  Footprints, 
  Lock, 
  X, 
  Edit3, 
  User, 
  Trophy, 
  SunMedium,
  Check
} from 'lucide-react';
import { soundFx } from '../sound';
import heroShadowBanner from '../assets/images/hero_shadow_banner_1789201471184.jpg';
import promoCliffImg from '../assets/images/promo_cliff_1789201593655.jpg';
import itemCloakImg from '../assets/images/item_mindful_cloak_1789202806025.jpg';
import itemBladeImg from '../assets/images/item_trackers_blade_1789202830581.jpg';
import itemJournalImg from '../assets/images/item_explorers_journal_1789202848219.jpg';
import avatarImg from '../assets/images/shadow_avatar_1789200543671.jpg';

interface CharacterViewProps {
  showToast: (message: string) => void;
  onOpenInventory: () => void;
  onOpenAchievements: () => void;
}

export const CharacterView: React.FC<CharacterViewProps> = ({
  showToast,
  onOpenInventory,
  onOpenAchievements
}) => {
  // Character states
  const [characterName, setCharacterName] = useState('SHADOW');
  const [currentTitle, setCurrentTitle] = useState('Pathfinder');
  const [currentQuote, setCurrentQuote] = useState('“Discipline today, results tomorrow.”');
  
  // Modals
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [isChangeTitleOpen, setIsChangeTitleOpen] = useState(false);
  const [isAttributeDetailOpen, setIsAttributeDetailOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<{
    name: string;
    rarity: string;
    bonus: string;
    img?: string;
    desc: string;
  } | null>(null);

  // Available titles to unlock/equip
  const availableTitles = [
    { id: 'pathfinder', name: 'Pathfinder', desc: 'Exploring a better version of yourself.', unlocked: true, rarity: 'Epic' },
    { id: 'wanderer', name: 'Novice Wanderer', desc: 'Every grand expedition begins with a single step.', unlocked: true, rarity: 'Common' },
    { id: 'disciplined', name: 'Disciplined Hunter', desc: 'Forged in the fires of unbroken consistency.', unlocked: true, rarity: 'Rare' },
    { id: 'trailblazer', name: 'Trailblazer', desc: 'Unlocks at Level 20. Forge unexplored paths.', unlocked: false, rarity: 'Epic' },
    { id: 'shadow_master', name: 'Grandmaster of Wills', desc: 'Unlocks at Level 50. Master of mind and spirit.', unlocked: false, rarity: 'Legendary' },
  ];

  return (
    <div className="w-full space-y-6">

      {/* 1. Main 2-Column Split: Character Canvas (col-span-8) & Right Overview Column (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Hero Card + Attributes + Equipped Items + Stats) */}
        <div className="lg:col-span-8 space-y-6">

          {/* A. Hero Banner Card */}
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/50 bg-[#0b061c] shadow-[0_4px_30px_rgba(0,0,0,0.8)] min-h-[290px] sm:min-h-[320px] flex flex-col justify-between p-5 sm:p-7">
            {/* Background Artwork: Twilight floating spires with Shadow Hunter overlooking realm */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={heroShadowBanner}
                alt="Shadow Character"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_35%] filter saturate-125 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080415] via-[#080415]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080415] via-transparent to-[#080415]/40" />
            </div>

            {/* Top Identity Block: Name + Badges + Quote */}
            <div className="relative z-10 max-w-xl space-y-2">
              <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wider drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                {characterName}
              </h1>

              {/* Badges: Lv. 12 & Pathfinder */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Level Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/70 text-amber-300 font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <span className="text-amber-400">✦</span>
                  <span>Lv. 12</span>
                </div>

                {/* Title Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500/70 text-purple-200 font-bold text-xs shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>{currentTitle}</span>
                </div>
              </div>

              {/* Quote */}
              <p className="font-serif italic text-xs sm:text-sm text-slate-200 tracking-wide pt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {currentQuote}
              </p>
            </div>

            {/* Bottom Progress Bar & Action Buttons */}
            <div className="relative z-10 pt-6 space-y-4">
              {/* Level Progress Bar */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-cyan-300 tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                    2,450 / 3,000 XP
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-600/60 text-purple-200 text-[11px]">
                    Lv. 13
                  </span>
                </div>

                {/* Custom Progress Bar with Glowing Cyan Head */}
                <div className="relative h-3 rounded-full bg-slate-950/80 border border-purple-900/60 overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.8)] relative"
                    style={{ width: `${(2450 / 3000) * 100}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(255,255,255,1)]" />
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-medium tracking-wide">
                  550 XP to next level
                </p>
              </div>

              {/* Action Buttons: Edit Avatar & Change Title */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsEditAvatarOpen(true);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#140b2a]/90 hover:bg-purple-900/80 border border-purple-500/50 hover:border-purple-400 text-xs font-bold text-slate-100 hover:text-white transition-all duration-200 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-300" />
                  <span>Edit Avatar</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsChangeTitleOpen(true);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#140b2a]/90 hover:bg-purple-900/80 border border-purple-500/50 hover:border-purple-400 text-xs font-bold text-slate-100 hover:text-white transition-all duration-200 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-purple-300" />
                  <span>Change Title</span>
                </button>
              </div>
            </div>
          </div>

          {/* B. ATTRIBUTES Section */}
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <h2 className="font-cinzel text-sm sm:text-base font-black text-white tracking-widest uppercase">
                  ATTRIBUTES
                </h2>
                <span className="text-xs text-slate-400 font-normal">
                  Real actions. Real growth.
                </span>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsAttributeDetailOpen(true);
                }}
                className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5 Attribute Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. STRENGTH */}
              <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#180a14]/90 to-[#0c0409]/95 border border-rose-600/40 shadow-[0_0_15px_rgba(244,63,94,0.15)] flex flex-col justify-between hover:border-rose-500 transition-all group">
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-2 shadow-[0_0_10px_rgba(244,63,94,0.4)] group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <span className="font-cinzel text-xs font-black text-rose-400 tracking-wider">
                    STRENGTH
                  </span>
                  <div className="text-sm font-black text-white font-sans mt-0.5">
                    18 <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-rose-900/40 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: '18%' }} />
                  </div>
                </div>

                {/* Sub-skills */}
                <div className="mt-3 pt-2.5 border-t border-rose-950/60 space-y-1 text-[11px] text-slate-300">
                  <p className="hover:text-white transition-colors">+ Gym</p>
                  <p className="hover:text-white transition-colors">+ Calisthenics</p>
                  <p className="hover:text-white transition-colors">+ Heavy Training</p>
                </div>
              </div>

              {/* 2. INTELLECT */}
              <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#091524]/90 to-[#040a12]/95 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col justify-between hover:border-cyan-400 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-2 shadow-[0_0_10px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="font-cinzel text-xs font-black text-cyan-400 tracking-wider">
                    INTELLECT
                  </span>
                  <div className="text-sm font-black text-white font-sans mt-0.5">
                    16 <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-cyan-900/40 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: '16%' }} />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-cyan-950/60 space-y-1 text-[11px] text-slate-300">
                  <p className="hover:text-white transition-colors">+ Reading</p>
                  <p className="hover:text-white transition-colors">+ Coding</p>
                  <p className="hover:text-white transition-colors">+ Problem Solving</p>
                </div>
              </div>

              {/* 3. WISDOM */}
              <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#150a28]/90 to-[#0b0416]/95 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex flex-col justify-between hover:border-purple-400 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/50 flex items-center justify-center text-purple-300 mb-2 shadow-[0_0_10px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="font-cinzel text-xs font-black text-purple-300 tracking-wider">
                    WISDOM
                  </span>
                  <div className="text-sm font-black text-white font-sans mt-0.5">
                    14 <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-purple-900/40 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '14%' }} />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-purple-950/60 space-y-1 text-[11px] text-slate-300">
                  <p className="hover:text-white transition-colors">+ Mindfulness</p>
                  <p className="hover:text-white transition-colors">+ Journaling</p>
                  <p className="hover:text-white transition-colors">+ Better Decisions</p>
                </div>
              </div>

              {/* 4. DISCIPLINE */}
              <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#1c1308]/90 to-[#0f0a04]/95 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex flex-col justify-between hover:border-amber-400 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/50 flex items-center justify-center text-amber-300 mb-2 shadow-[0_0_10px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <span className="font-cinzel text-xs font-black text-amber-300 tracking-wider">
                    DISCIPLINE
                  </span>
                  <div className="text-sm font-black text-white font-sans mt-0.5">
                    20 <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-amber-900/40 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: '20%' }} />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-950/60 space-y-1 text-[11px] text-slate-300">
                  <p className="hover:text-white transition-colors">+ Routine</p>
                  <p className="hover:text-white transition-colors">+ Consistency</p>
                  <p className="hover:text-white transition-colors">+ Self Control</p>
                </div>
              </div>

              {/* 5. VITALITY */}
              <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#081816]/90 to-[#030d0b]/95 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex flex-col justify-between hover:border-emerald-400 transition-all group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_0_10px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="font-cinzel text-xs font-black text-emerald-400 tracking-wider">
                    VITALITY
                  </span>
                  <div className="text-sm font-black text-white font-sans mt-0.5">
                    17 <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-emerald-900/40 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: '17%' }} />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-emerald-950/60 space-y-1 text-[11px] text-slate-300">
                  <p className="hover:text-white transition-colors">+ Sleep</p>
                  <p className="hover:text-white transition-colors">+ Nutrition</p>
                  <p className="hover:text-white transition-colors">+ Overall Health</p>
                </div>
              </div>
            </div>
          </div>

          {/* C. EQUIPPED ITEMS Section */}
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <h2 className="font-cinzel text-sm sm:text-base font-black text-white tracking-widest uppercase">
                  EQUIPPED ITEMS
                </h2>
                <span className="text-xs text-slate-400 font-normal">
                  Gear for a greater you.
                </span>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenInventory();
                }}
                className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Manage Inventory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Item Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Item 1: Mindful Cloak (Epic) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setSelectedItemDetail({
                    name: 'Mindful Cloak',
                    rarity: 'Epic',
                    bonus: '+5 Focus',
                    img: itemCloakImg,
                    desc: 'A tailored cloak woven with obsidian silk and runic filaments that deflect mental wanderings.'
                  });
                }}
                className="rounded-2xl p-3 bg-gradient-to-b from-[#140a28]/90 to-[#090414]/95 border border-purple-500/60 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#0d061c] border border-purple-400/60 overflow-hidden shrink-0 flex items-center justify-center relative shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <img src={itemCloakImg} alt="Mindful Cloak" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-purple-200">
                    Mindful Cloak
                  </h4>
                  <span className="inline-block text-[10px] font-bold text-purple-300 tracking-wider">
                    Epic
                  </span>
                  <p className="text-[11px] font-semibold text-purple-200 mt-0.5">
                    +5 Focus
                  </p>
                </div>
              </div>

              {/* Item 2: Tracker's Blade (Rare) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setSelectedItemDetail({
                    name: "Tracker's Blade",
                    rarity: 'Rare',
                    bonus: '+10 Discipline',
                    img: itemBladeImg,
                    desc: 'A tempered edge forged to slice away hesitation and strike directly at procrastination.'
                  });
                }}
                className="rounded-2xl p-3 bg-gradient-to-b from-[#091626]/90 to-[#040c16]/95 border border-cyan-500/60 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#040e1a] border border-cyan-400/60 overflow-hidden shrink-0 flex items-center justify-center relative shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <img src={itemBladeImg} alt="Tracker's Blade" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-cyan-200">
                    Tracker's Blade
                  </h4>
                  <span className="inline-block text-[10px] font-bold text-cyan-300 tracking-wider">
                    Rare
                  </span>
                  <p className="text-[11px] font-semibold text-cyan-200 mt-0.5">
                    +10 Discipline
                  </p>
                </div>
              </div>

              {/* Item 3: Explorer's Journal (Rare) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setSelectedItemDetail({
                    name: "Explorer's Journal",
                    rarity: 'Rare',
                    bonus: '+5 Wisdom',
                    img: itemJournalImg,
                    desc: 'Weathered parchment bounded in leather, preserving profound lessons extracted from trial and error.'
                  });
                }}
                className="rounded-2xl p-3 bg-gradient-to-b from-[#091626]/90 to-[#040c16]/95 border border-cyan-500/60 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#040e1a] border border-cyan-400/60 overflow-hidden shrink-0 flex items-center justify-center relative shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <img src={itemJournalImg} alt="Explorer's Journal" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-cyan-200">
                    Explorer's Journal
                  </h4>
                  <span className="inline-block text-[10px] font-bold text-cyan-300 tracking-wider">
                    Rare
                  </span>
                  <p className="text-[11px] font-semibold text-cyan-200 mt-0.5">
                    +5 Wisdom
                  </p>
                </div>
              </div>

              {/* Item 4: Pathfinder's Ring (Epic) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setSelectedItemDetail({
                    name: "Pathfinder's Ring",
                    rarity: 'Epic',
                    bonus: '+5 XP Gain',
                    desc: 'An antique signet carrying a glowing amethyst that magnifies knowledge acquired from daily routines.'
                  });
                }}
                className="rounded-2xl p-3 bg-gradient-to-b from-[#140a28]/90 to-[#090414]/95 border border-purple-500/60 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#0d061c] border border-purple-400/60 overflow-hidden shrink-0 flex items-center justify-center relative shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  {/* Glowing Signet Ring Emblem */}
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400/80 bg-gradient-to-b from-purple-900 to-indigo-950 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.8)]">
                    <div className="w-4 h-4 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(216,180,254,1)]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-purple-200">
                    Pathfinder's Ring
                  </h4>
                  <span className="inline-block text-[10px] font-bold text-purple-300 tracking-wider">
                    Epic
                  </span>
                  <p className="text-[11px] font-semibold text-purple-200 mt-0.5">
                    +5 XP Gain
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* D. CHARACTER STATS Section */}
          <div className="space-y-3">
            <h2 className="font-cinzel text-sm sm:text-base font-black text-white tracking-widest uppercase px-1">
              CHARACTER STATS
            </h2>

            {/* 5 Horizontal Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Health */}
              <div className="rounded-xl px-4 py-3 bg-[#0c061d]/90 border border-purple-900/40 flex items-center gap-3 shadow-md hover:border-rose-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Health</span>
                  <span className="text-xs font-black text-white font-sans">100 / 100</span>
                </div>
              </div>

              {/* Energy */}
              <div className="rounded-xl px-4 py-3 bg-[#0c061d]/90 border border-purple-900/40 flex items-center gap-3 shadow-md hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Energy</span>
                  <span className="text-xs font-black text-white font-sans">85 / 100</span>
                </div>
              </div>

              {/* Focus */}
              <div className="rounded-xl px-4 py-3 bg-[#0c061d]/90 border border-purple-900/40 flex items-center gap-3 shadow-md hover:border-purple-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Focus</span>
                  <span className="text-xs font-black text-white font-sans">78 / 100</span>
                </div>
              </div>

              {/* Resilience */}
              <div className="rounded-xl px-4 py-3 bg-[#0c061d]/90 border border-purple-900/40 flex items-center gap-3 shadow-md hover:border-sky-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                  <Shield className="w-4 h-4 fill-sky-500/20" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resilience</span>
                  <span className="text-xs font-black text-white font-sans">72 / 100</span>
                </div>
              </div>

              {/* Luck */}
              <div className="rounded-xl px-4 py-3 bg-[#0c061d]/90 border border-purple-900/40 flex items-center gap-3 shadow-md hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Star className="w-4 h-4 fill-amber-300/40" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Luck</span>
                  <span className="text-xs font-black text-white font-sans">64 / 100</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Overview + Title + Achievements + Motivational Card) */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. CHARACTER OVERVIEW */}
          <div className="relative rounded-2xl p-5 border border-purple-900/40 bg-gradient-to-b from-[#110927]/95 via-[#0c061d]/98 to-[#070312] shadow-xl">
            <h3 className="font-cinzel text-xs font-black tracking-widest text-slate-200 uppercase mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.9)]" />
              CHARACTER OVERVIEW
            </h3>

            {/* 3x2 Metric Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Total Quests */}
              <div className="rounded-xl p-3 bg-purple-950/40 border border-purple-700/40 flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(168,85,247,0.15)] group hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-amber-400 mb-1.5" />
                <span className="text-lg sm:text-xl font-black text-white font-sans">24</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Total Quests
                </span>
              </div>

              {/* Completed */}
              <div className="rounded-xl p-3 bg-emerald-950/40 border border-emerald-700/40 flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(16,185,129,0.15)] group hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1.5" />
                <span className="text-lg sm:text-xl font-black text-white font-sans">18</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Completed
                </span>
              </div>

              {/* Total XP */}
              <div className="rounded-xl p-3 bg-purple-950/40 border border-purple-700/40 flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(168,85,247,0.15)] group hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-purple-400 mb-1.5" />
                <span className="text-lg sm:text-xl font-black text-white font-sans">12,450</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Total XP
                </span>
              </div>

              {/* Gold */}
              <div className="rounded-xl p-3 bg-amber-950/40 border border-amber-700/40 flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(245,158,11,0.15)] group hover:scale-105 transition-transform">
                <Coins className="w-5 h-5 text-amber-400 mb-1.5" />
                <span className="text-lg sm:text-xl font-black text-white font-sans">720</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Gold
                </span>
              </div>

              {/* Current Streak */}
              <div className="rounded-xl p-3 bg-orange-950/40 border border-orange-700/40 flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(249,115,22,0.15)] group hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-orange-400 mb-1.5" />
                <span className="text-lg sm:text-xl font-black text-white font-sans">12 Days</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Current Streak
                </span>
              </div>

              {/* Achievements */}
              <div className="rounded-xl p-3 bg-amber-950/40 border border-amber-700/40 flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(245,158,11,0.15)] group hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5 text-amber-400 mb-1.5" />
                <span className="text-lg sm:text-xl font-black text-white font-sans">8 / 25</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Achievements
                </span>
              </div>
            </div>
          </div>

          {/* 2. CURRENT TITLE */}
          <div className="relative rounded-2xl p-5 border border-purple-900/40 bg-gradient-to-b from-[#110927]/95 via-[#0c061d]/98 to-[#070312] shadow-xl space-y-4">
            <h3 className="font-cinzel text-xs font-black tracking-widest text-slate-200 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
              CURRENT TITLE
            </h3>

            {/* Active Title Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border-2 border-amber-400/80 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Compass className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="font-cinzel text-base font-black text-purple-300 tracking-wider">
                  {currentTitle}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Exploring a better version of yourself.
                </p>
              </div>
            </div>

            {/* Next Title Progress */}
            <div className="pt-2 border-t border-purple-950/60 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Next Title
              </span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-950/60 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">Trailblazer</span>
                    <span className="text-slate-400 font-normal">12 / 20</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Reach Level 20</p>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-900 border border-sky-900/40 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ACHIEVEMENT HIGHLIGHTS */}
          <div className="relative rounded-2xl p-5 border border-purple-900/40 bg-gradient-to-b from-[#110927]/95 via-[#0c061d]/98 to-[#070312] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel text-xs font-black tracking-widest text-slate-200 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
                ACHIEVEMENT HIGHLIGHTS
              </h3>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenAchievements();
                }}
                className="text-[11px] font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* 3 Highlight Items */}
            <div className="space-y-2.5">
              {/* Consistent Mind */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/25 border border-purple-900/30 hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white tracking-wide">Consistent Mind</h5>
                  <p className="text-[10px] text-slate-400">Complete 7 days in a row</p>
                </div>
              </div>

              {/* Bookworm */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/25 border border-purple-900/30 hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white tracking-wide">Bookworm</h5>
                  <p className="text-[10px] text-slate-400">Read 10 books</p>
                </div>
              </div>

              {/* Early Riser */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/25 border border-purple-900/30 hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0">
                  <SunMedium className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white tracking-wide">Early Riser</h5>
                  <p className="text-[10px] text-slate-400">Complete 20 morning quests</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. MOTIVATIONAL CARD: “A STRONGER YOU LIVES WITHIN.” */}
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 bg-gradient-to-b from-[#13092b]/95 to-[#070313]/98 shadow-xl min-h-[160px] flex flex-col justify-between p-5 group">
            {/* Artwork background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={promoCliffImg}
                alt="Stronger You"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter saturate-125 opacity-70 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080416] via-[#080416]/50 to-transparent" />
            </div>

            <div className="relative z-10 flex justify-end">
              <p className="font-cinzel text-xs sm:text-sm font-black text-slate-100 text-right tracking-widest uppercase leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-[200px]">
                “A STRONGER YOU<br />
                <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">LIVES WITHIN.”</span>
              </p>
            </div>

            <div className="relative z-10 flex justify-end pt-3">
              <div className="w-8 h-8 rounded-full border border-amber-400/70 bg-[#120803]/80 flex items-center justify-center text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                <Compass className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Avatar Modal */}
      {isEditAvatarOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsEditAvatarOpen(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-2xl p-6 bg-[#0f0824] border border-purple-500/60 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-300" />
                Customize Avatar & Name
              </h3>
              <button 
                onClick={() => setIsEditAvatarOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Personal Motto / Quote
                </label>
                <input
                  type="text"
                  value={currentQuote}
                  onChange={(e) => setCurrentQuote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-800 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playCelebration();
                setIsEditAvatarOpen(false);
                showToast(`Hero profile updated to ${characterName}!`);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Change Title Modal */}
      {isChangeTitleOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsChangeTitleOpen(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-2xl p-6 bg-[#0f0824] border border-purple-500/60 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-300" />
                Select Character Title
              </h3>
              <button 
                onClick={() => setIsChangeTitleOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {availableTitles.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    if (t.unlocked) {
                      soundFx.playLevelUp();
                      setCurrentTitle(t.name);
                      setIsChangeTitleOpen(false);
                      showToast(`Equipped title: ${t.name}!`);
                    } else {
                      soundFx.playClick();
                      showToast(t.desc);
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    t.name === currentTitle
                      ? 'bg-purple-950/80 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : t.unlocked
                      ? 'bg-[#140b28]/60 border-purple-900/40 text-slate-300 hover:bg-purple-950/40 hover:text-white cursor-pointer'
                      : 'bg-black/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-xs font-bold">{t.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full border border-purple-500/30">{t.rarity}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{t.desc}</p>
                  </div>
                  {t.name === currentTitle ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : !t.unlocked ? (
                    <Lock className="w-4 h-4 text-slate-600" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedItemDetail(null)}
        >
          <div 
            className="relative w-full max-w-sm rounded-2xl p-6 bg-[#0f0824] border border-purple-500/60 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
              <h3 className="font-cinzel text-base font-bold text-white">
                {selectedItemDetail.name}
              </h3>
              <button 
                onClick={() => setSelectedItemDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {selectedItemDetail.img ? (
                <img 
                  src={selectedItemDetail.img} 
                  alt={selectedItemDetail.name} 
                  referrerPolicy="no-referrer" 
                  className="w-16 h-16 rounded-xl object-cover border border-purple-400/60 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl border border-purple-400/60 bg-purple-950 flex items-center justify-center">
                  <Star className="w-8 h-8 text-amber-300" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-purple-300 px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700">
                  {selectedItemDetail.rarity}
                </span>
                <p className="text-sm font-bold text-emerald-300 mt-1">
                  {selectedItemDetail.bonus}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedItemDetail.desc}
            </p>

            <button
              onClick={() => setSelectedItemDetail(null)}
              className="w-full py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Attribute Detail Modal */}
      {isAttributeDetailOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsAttributeDetailOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl p-6 bg-[#0e0722] border border-purple-500/60 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-300" />
                Attribute Scaling & Real-Life Growth
              </h3>
              <button 
                onClick={() => setIsAttributeDetailOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                In <strong>REALM</strong>, every single physical and mental action translates directly into statistical character attributes:
              </p>
              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40">
                  <span className="font-bold text-rose-300">STRENGTH:</span> Boosted by gym sessions, calisthenics, stamina drills, and heavy physical training.
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40">
                  <span className="font-bold text-cyan-300">INTELLECT:</span> Boosted by focused reading, coding, algorithmic logic, and technical mastery.
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <span className="font-bold text-purple-300">WISDOM:</span> Boosted by mindfulness meditation, self-reflection, journaling, and prudent decisions.
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40">
                  <span className="font-bold text-amber-300">DISCIPLINE:</span> Boosted by waking routines, unbroken daily streaks, and resistance to distraction.
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                  <span className="font-bold text-emerald-300">VITALITY:</span> Boosted by 8 hours of sleep, clean whole nutrition, hydration, and recovery.
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAttributeDetailOpen(false)}
              className="w-full py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Close Codex
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
