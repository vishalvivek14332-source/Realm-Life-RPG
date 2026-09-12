import React from 'react';
import { 
  Search, 
  Flame, 
  Bell, 
  Volume2, 
  VolumeX, 
  Menu,
  Settings
} from 'lucide-react';
import { CharacterProfile } from '../types';
import { soundFx } from '../sound';
import shadowAvatar from '../assets/images/shadow_avatar_1789200543671.jpg';

interface TopHeaderProps {
  profile: CharacterProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  onProfileClick: () => void;
  onNotificationsClick: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  searchQuery,
  setSearchQuery,
  soundEnabled,
  setSoundEnabled,
  setMobileOpen,
  onProfileClick,
  onNotificationsClick
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    soundFx.soundEnabled = next;
    setSoundEnabled(next);
    if (next) soundFx.playClick();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080916]/85 backdrop-blur-xl border-b border-purple-950/40 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu button & Left Motto */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setMobileOpen(true);
            }}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-purple-950/40 rounded-xl border border-purple-800/30"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Left Quotation: “SAME PERSON. HIGHER STANDARDS.” */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-serif tracking-wider">
            <span className="text-purple-400 font-mono text-sm">→</span>
            <span className="font-semibold text-slate-200 uppercase tracking-widest text-[11px]">“SAME PERSON. HIGHER STANDARDS.”</span>
          </div>
        </div>

        {/* Center Search Bar or Motto */}
        <div className="relative flex-1 max-w-xs xl:max-w-sm hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quests, codex, items..."
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-[#101226]/80 text-slate-200 placeholder-slate-500 rounded-full border border-purple-900/40 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Right Badges & Controls */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gold Coin Badge */}
          <div 
            id="header-gold-badge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-950/60 to-[#221706]/80 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-default transition-transform hover:scale-105"
            title="Your Current Gold"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center shadow-[0_0_6px_rgba(251,191,36,0.8)] border border-amber-300/60">
              <span className="text-[11px] font-black text-amber-950">★</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-sans tracking-tight">
                {profile.gold.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/80 font-medium hidden sm:inline">Gold</span>
            </div>
          </div>

          {/* XP Gem Badge */}
          <div 
            id="header-xp-badge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-950/60 to-[#1f0a2e]/80 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-default transition-transform hover:scale-105"
            title="Total Experience"
          >
            <div className="w-5 h-5 flex items-center justify-center text-purple-300">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-purple-400 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]">
                <polygon points="12,2 22,8.5 12,22 2,8.5" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-extrabold text-purple-200 font-sans tracking-tight">
                {profile.totalXP.toLocaleString()}
              </span>
              <span className="text-[10px] text-purple-300/80 font-medium hidden sm:inline">XP</span>
            </div>
          </div>

          {/* Streak Flame Badge */}
          <div 
            id="header-streak-badge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-950/60 to-[#270e06]/80 border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-default transition-transform hover:scale-105"
            title="Consecutive Day Streak"
          >
            <Flame className="w-4 h-4 text-orange-400 fill-orange-500 drop-shadow-[0_0_8px_rgba(251,146,60,0.9)] animate-pulse" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-black text-orange-300 tracking-tight">
                {profile.streakDays}
              </span>
              <span className="text-[10px] text-orange-300/80 font-medium hidden md:inline">Day Streak</span>
            </div>
          </div>

          {/* User Profile Pill */}
          <button 
            id="header-profile-button"
            onClick={() => {
              soundFx.playClick();
              onProfileClick();
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-[#111329]/90 border border-purple-800/50 hover:border-purple-400/80 transition-all group"
          >
            {/* Avatar with online pip */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-400/60 bg-gradient-to-tr from-purple-950 to-indigo-900 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                <img
                  src={shadowAvatar}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080916] shadow-[0_0_6px_#34d399]" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-slate-100 font-cinzel tracking-wider group-hover:text-purple-300 transition-colors">
                {profile.name}
              </div>
              <div className="text-[10px] font-semibold text-purple-400">
                Lv. {profile.level}
              </div>
            </div>
          </button>

          {/* Notifications Bell */}
          <button 
            id="header-notifications-button"
            onClick={() => {
              soundFx.playClick();
              onNotificationsClick();
            }}
            className="relative p-2 text-slate-400 hover:text-purple-300 bg-[#12142d]/80 hover:bg-purple-950/50 rounded-full border border-purple-900/30 transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          </button>

          {/* Settings Gear */}
          <button 
            id="header-settings-button"
            onClick={() => {
              soundFx.playClick();
              onNotificationsClick();
            }}
            className="p-2 text-slate-400 hover:text-purple-300 bg-[#12142d]/80 hover:bg-purple-950/50 rounded-full border border-purple-900/30 transition-all"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button 
            id="header-sound-toggle"
            onClick={toggleSound}
            className={`p-2 rounded-full border transition-all ${
              soundEnabled 
                ? 'text-purple-300 bg-[#12142d]/80 border-purple-800/40 hover:border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.2)]' 
                : 'text-slate-500 bg-[#0d0e1f]/60 border-slate-800 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            aria-label="Toggle sound effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Sub-quote on right under badges: “A BETTER YOU A BRIGHTER TOMORROW.” */}
        <div className="hidden xl:block text-[10px] font-serif italic text-cyan-300/80 tracking-widest uppercase mt-1 mr-1 text-right">
          “A BETTER YOU • A BRIGHTER TOMORROW.”
        </div>
      </div>
    </div>
  </header>
  );
};
