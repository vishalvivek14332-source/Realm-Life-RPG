import React, { useState } from 'react';
import { 
  Gamepad2, 
  Music, 
  Palette, 
  Bell, 
  SlidersHorizontal, 
  Accessibility, 
  User, 
  ShieldCheck, 
  Info, 
  Volume2, 
  VolumeX, 
  Lock, 
  Download, 
  Trash2, 
  RefreshCw, 
  Check, 
  Sparkles,
  Settings as SettingsIcon,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { soundFx } from '../sound';

import settingsStudyBanner from '../assets/images/settings_study_banner.jpg';
import settingsCastleWidget from '../assets/images/settings_castle_widget.jpg';
import settingsParchmentBanner from '../assets/images/settings_parchment_banner.jpg';
import settingsDeskVignette from '../assets/images/settings_desk_vignette.jpg';
import { CharacterProfile } from '../types';

interface SettingsViewProps {
  showToast: (msg: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  profile?: CharacterProfile;
  onLogout?: () => void;
  userEmail?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  showToast,
  soundEnabled,
  setSoundEnabled,
  profile,
  onLogout,
  userEmail
}) => {
  // Game Settings State
  const [levelUpAnimations, setLevelUpAnimations] = useState(true);
  const [questCompletionEffects, setQuestCompletionEffects] = useState(true);
  const [backgroundParticles, setBackgroundParticles] = useState(true);
  const [showMotivationalQuotes, setShowMotivationalQuotes] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Audio State
  const [masterVolume, setMasterVolume] = useState(70);
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [uiSoundEffects, setUiSoundEffects] = useState(true);
  const [questCompletionSound, setQuestCompletionSound] = useState(true);
  const [levelUpSound, setLevelUpSound] = useState(true);

  // Appearance State
  const [theme, setTheme] = useState('Realm (Default)');
  const [accentColor, setAccentColor] = useState('purple');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Notifications State
  const [questReminders, setQuestReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [weeklyProgressReport, setWeeklyProgressReport] = useState(false);

  // Preferences State
  const [defaultQuestCategory, setDefaultQuestCategory] = useState('Study');
  const [defaultDifficulty, setDefaultDifficulty] = useState('Medium');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12 Hour (AM/PM)');
  const [startWeekOn, setStartWeekOn] = useState('Monday');

  // Accessibility State
  const [largerText, setLargerText] = useState(false);
  const [dyslexiaFriendlyFont, setDyslexiaFriendlyFont] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(true);
  const [screenReaderSupport, setScreenReaderSupport] = useState(true);
  const [colorBlindFriendly, setColorBlindFriendly] = useState(false);

  // UI Interactive modals / states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // Toggle helper
  const handleToggle = (
    value: boolean, 
    setter: React.Dispatch<React.SetStateAction<boolean>>, 
    name: string
  ) => {
    soundFx.playClick();
    const next = !value;
    setter(next);
    showToast(`${name} turned ${next ? 'ON' : 'OFF'}.`);
  };

  // Export JSON backup data
  const handleExportData = () => {
    soundFx.playQuestComplete();
    const exportData = {
      user: profile?.name || 'SHADOW',
      level: profile?.level || 12,
      gold: profile?.gold || 0,
      xp: profile?.currentXP || 0,
      streak: profile?.streakDays || 12,
      exportDate: new Date().toISOString(),
      settings: {
        theme,
        accentColor,
        masterVolume,
        defaultCategory: defaultQuestCategory,
        notifications: { questReminders, dailySummary, streakAlerts }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `realm-data-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Realm Codex exported successfully to JSON!");
  };

  const handleCheckUpdates = () => {
    soundFx.playClick();
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      soundFx.playQuestComplete();
      showToast("REALM is currently up to date (Build 2025.09.12).");
    }, 1200);
  };

  // Reusable Toggle Switch Component matching reference aesthetic
  const ToggleSwitch = ({ 
    active, 
    onToggle, 
    id 
  }: { 
    active: boolean; 
    onToggle: () => void; 
    id?: string;
  }) => (
    <button
      id={id}
      type="button"
      onClick={onToggle}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none shadow-sm
        ${active 
          ? 'bg-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.7)]' 
          : 'bg-[#181c33] border-slate-700/80'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md 
          ring-0 transition duration-200 ease-in-out
          ${active ? 'translate-x-5' : 'translate-x-0 bg-slate-300'}
        `}
      />
    </button>
  );

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Header Banner: Wizard Study with Sleeping Cat, Candlesticks & Arched Citadel Window */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-900/50 bg-[#0c081e] shadow-[0_4px_30px_rgba(0,0,0,0.85)] min-h-[140px] sm:min-h-[160px] flex items-center p-6 sm:p-8">
        {/* Background Study Banner Artwork */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={settingsStudyBanner}
            alt="Wizard Alchemist Library & Arched Window"
            className="w-full h-full object-cover object-center filter saturate-125 brightness-95 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070414]/90 via-[#070414]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070414] via-transparent to-[#070414]/30" />
        </div>

        {/* Banner Content: Golden Gear Icon + SETTINGS + Subtitle */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Golden Gear Icon Badge */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-600/30 via-[#191024] to-[#120822] p-0.5 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-2xl bg-[#110820]/90 flex items-center justify-center text-amber-300">
                <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-spin-slow" />
              </div>
            </div>

            <div>
              <h1 className="font-cinzel text-2xl sm:text-4xl font-black tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                SETTINGS
              </h1>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-purple-200/80 mt-1">
                Customize your journey. Make it yours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Layout: 9 Settings Cards (3x3) + Right-Side Showcase Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 9-Card Settings Grid (col-span-12 lg:col-span-8 xl:col-span-9) */}
        <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* CARD 1: GAME SETTINGS (Purple Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-purple-600/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col justify-between space-y-4 hover:border-purple-500/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Gamepad2 className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  GAME SETTINGS
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Control your experience.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Level Up Animations</span>
                <ToggleSwitch 
                  id="toggle-level-up-animations"
                  active={levelUpAnimations} 
                  onToggle={() => handleToggle(levelUpAnimations, setLevelUpAnimations, 'Level Up Animations')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Quest Completion Effects</span>
                <ToggleSwitch 
                  id="toggle-quest-completion-effects"
                  active={questCompletionEffects} 
                  onToggle={() => handleToggle(questCompletionEffects, setQuestCompletionEffects, 'Quest Completion Effects')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Background Particles</span>
                <ToggleSwitch 
                  id="toggle-background-particles"
                  active={backgroundParticles} 
                  onToggle={() => handleToggle(backgroundParticles, setBackgroundParticles, 'Background Particles')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Show Motivational Quotes</span>
                <ToggleSwitch 
                  id="toggle-show-motivational-quotes"
                  active={showMotivationalQuotes} 
                  onToggle={() => handleToggle(showMotivationalQuotes, setShowMotivationalQuotes, 'Motivational Quotes')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Compact Mode</span>
                <ToggleSwitch 
                  id="toggle-compact-mode"
                  active={compactMode} 
                  onToggle={() => handleToggle(compactMode, setCompactMode, 'Compact Mode')} 
                />
              </div>
            </div>
          </div>

          {/* CARD 2: AUDIO (Blue Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col justify-between space-y-4 hover:border-blue-400/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Music className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  AUDIO
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Sound fuels the journey.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Master Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-200">
                  <span className="font-medium text-[11px] text-slate-300">Master Volume</span>
                  <span className="text-[11px] font-mono text-blue-300 font-bold">{masterVolume} %</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <input
                    id="slider-master-volume"
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMasterVolume(val);
                      if (val === 0 && soundEnabled) setSoundEnabled(false);
                      if (val > 0 && !soundEnabled) setSoundEnabled(true);
                    }}
                    className="w-full h-1.5 bg-[#141a33] rounded-lg appearance-none cursor-pointer accent-blue-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200 pt-1">
                <span>Background Music</span>
                <ToggleSwitch 
                  id="toggle-background-music"
                  active={backgroundMusic} 
                  onToggle={() => handleToggle(backgroundMusic, setBackgroundMusic, 'Background Music')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>UI Sound Effects</span>
                <ToggleSwitch 
                  id="toggle-ui-sound-effects"
                  active={uiSoundEffects} 
                  onToggle={() => handleToggle(uiSoundEffects, setUiSoundEffects, 'UI Sound Effects')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Quest Completion Sound</span>
                <ToggleSwitch 
                  id="toggle-quest-completion-sound"
                  active={questCompletionSound} 
                  onToggle={() => handleToggle(questCompletionSound, setQuestCompletionSound, 'Quest Completion Sound')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Level Up Sound</span>
                <ToggleSwitch 
                  id="toggle-level-up-sound"
                  active={levelUpSound} 
                  onToggle={() => handleToggle(levelUpSound, setLevelUpSound, 'Level Up Sound')} 
                />
              </div>
            </div>
          </div>

          {/* CARD 3: APPEARANCE (Amber Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between space-y-4 hover:border-amber-400/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Palette className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  APPEARANCE
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Change how your realm looks.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Theme Selector */}
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">Theme</label>
                <div className="relative">
                  <select
                    id="select-theme"
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value);
                      soundFx.playClick();
                      showToast(`Realm Theme set to ${e.target.value}`);
                    }}
                    className="w-full bg-[#13162b] border border-amber-500/40 text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Realm (Default)">Realm (Default)</option>
                    <option value="Dark Twilight">Dark Twilight</option>
                    <option value="Ethereal Dawn">Ethereal Dawn</option>
                    <option value="Cyber Obsidian">Cyber Obsidian</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-400/80 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Accent Color Swatches */}
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1.5">Accent Color</label>
                <div className="flex items-center gap-2.5">
                  {[
                    { id: 'purple', bg: 'bg-[#a855f7]', ring: 'ring-[#a855f7]' },
                    { id: 'blue', bg: 'bg-[#3b82f6]', ring: 'ring-[#3b82f6]' },
                    { id: 'emerald', bg: 'bg-[#10b981]', ring: 'ring-[#10b981]' },
                    { id: 'amber', bg: 'bg-[#f59e0b]', ring: 'ring-[#f59e0b]' },
                    { id: 'red', bg: 'bg-[#ef4444]', ring: 'ring-[#ef4444]' },
                    { id: 'pink', bg: 'bg-[#ec4899]', ring: 'ring-[#ec4899]' },
                  ].map(c => (
                    <button
                      key={c.id}
                      id={`accent-${c.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        setAccentColor(c.id);
                        showToast(`Accent color shifted to ${c.id.toUpperCase()}`);
                      }}
                      className={`
                        w-6 h-6 rounded-full ${c.bg} transition-transform
                        ${accentColor === c.id 
                          ? `ring-2 ${c.ring} ring-offset-2 ring-offset-[#0b0c1e] scale-110 shadow-lg` 
                          : 'opacity-80 hover:opacity-100 hover:scale-105'}
                      `}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200 pt-1">
                <span>Reduced Motion</span>
                <ToggleSwitch 
                  id="toggle-reduced-motion"
                  active={reducedMotion} 
                  onToggle={() => handleToggle(reducedMotion, setReducedMotion, 'Reduced Motion')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>High Contrast</span>
                <ToggleSwitch 
                  id="toggle-high-contrast"
                  active={highContrast} 
                  onToggle={() => handleToggle(highContrast, setHighContrast, 'High Contrast')} 
                />
              </div>
            </div>
          </div>

          {/* CARD 4: NOTIFICATIONS (Emerald Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between space-y-4 hover:border-emerald-400/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Bell className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  NOTIFICATIONS
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Stay informed, stay consistent.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Quest Reminders</span>
                <ToggleSwitch 
                  id="toggle-quest-reminders"
                  active={questReminders} 
                  onToggle={() => handleToggle(questReminders, setQuestReminders, 'Quest Reminders')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Daily Summary</span>
                <ToggleSwitch 
                  id="toggle-daily-summary"
                  active={dailySummary} 
                  onToggle={() => handleToggle(dailySummary, setDailySummary, 'Daily Summary')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Streak Alerts</span>
                <ToggleSwitch 
                  id="toggle-streak-alerts"
                  active={streakAlerts} 
                  onToggle={() => handleToggle(streakAlerts, setStreakAlerts, 'Streak Alerts')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Achievement Notifications</span>
                <ToggleSwitch 
                  id="toggle-achievement-notifications"
                  active={achievementNotifications} 
                  onToggle={() => handleToggle(achievementNotifications, setAchievementNotifications, 'Achievement Notifications')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Weekly Progress Report</span>
                <ToggleSwitch 
                  id="toggle-weekly-progress-report"
                  active={weeklyProgressReport} 
                  onToggle={() => handleToggle(weeklyProgressReport, setWeeklyProgressReport, 'Weekly Progress Report')} 
                />
              </div>
            </div>
          </div>

          {/* CARD 5: PREFERENCES (Indigo Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] flex flex-col justify-between space-y-4 hover:border-indigo-400/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  PREFERENCES
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Tailor your experience.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Default Quest Category */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-200">Default Quest Category</span>
                <select
                  id="select-default-category"
                  value={defaultQuestCategory}
                  onChange={(e) => {
                    setDefaultQuestCategory(e.target.value);
                    soundFx.playClick();
                  }}
                  className="bg-[#13162b] border border-indigo-500/40 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="Study">Study</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Health">Health</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Mindfulness">Mindfulness</option>
                </select>
              </div>

              {/* Default Difficulty */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-200">Default Difficulty</span>
                <select
                  id="select-default-difficulty"
                  value={defaultDifficulty}
                  onChange={(e) => {
                    setDefaultDifficulty(e.target.value);
                    soundFx.playClick();
                  }}
                  className="bg-[#13162b] border border-indigo-500/40 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>

              {/* Date Format */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-200">Date Format</span>
                <select
                  id="select-date-format"
                  value={dateFormat}
                  onChange={(e) => {
                    setDateFormat(e.target.value);
                    soundFx.playClick();
                  }}
                  className="bg-[#13162b] border border-indigo-500/40 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              {/* Time Format */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-200">Time Format</span>
                <select
                  id="select-time-format"
                  value={timeFormat}
                  onChange={(e) => {
                    setTimeFormat(e.target.value);
                    soundFx.playClick();
                  }}
                  className="bg-[#13162b] border border-indigo-500/40 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="12 Hour (AM/PM)">12 Hour (AM/PM)</option>
                  <option value="24 Hour">24 Hour</option>
                </select>
              </div>

              {/* Start Week On */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-200">Start Week On</span>
                <select
                  id="select-start-week-on"
                  value={startWeekOn}
                  onChange={(e) => {
                    setStartWeekOn(e.target.value);
                    soundFx.playClick();
                  }}
                  className="bg-[#13162b] border border-indigo-500/40 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="Monday">Monday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARD 6: ACCESSIBILITY (Sky Blue Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.15)] flex flex-col justify-between space-y-4 hover:border-sky-400/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Accessibility className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  ACCESSIBILITY
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Make REALM work for you.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Larger Text</span>
                <ToggleSwitch 
                  id="toggle-larger-text"
                  active={largerText} 
                  onToggle={() => handleToggle(largerText, setLargerText, 'Larger Text')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Dyslexia Friendly Font</span>
                <ToggleSwitch 
                  id="toggle-dyslexia-font"
                  active={dyslexiaFriendlyFont} 
                  onToggle={() => handleToggle(dyslexiaFriendlyFont, setDyslexiaFriendlyFont, 'Dyslexia Font')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Keyboard Navigation</span>
                <ToggleSwitch 
                  id="toggle-keyboard-navigation"
                  active={keyboardNavigation} 
                  onToggle={() => handleToggle(keyboardNavigation, setKeyboardNavigation, 'Keyboard Navigation')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Screen Reader Support</span>
                <ToggleSwitch 
                  id="toggle-screen-reader"
                  active={screenReaderSupport} 
                  onToggle={() => handleToggle(screenReaderSupport, setScreenReaderSupport, 'Screen Reader')} 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Color Blind Friendly</span>
                <ToggleSwitch 
                  id="toggle-color-blind"
                  active={colorBlindFriendly} 
                  onToggle={() => handleToggle(colorBlindFriendly, setColorBlindFriendly, 'Color Blind Mode')} 
                />
              </div>
            </div>
          </div>

          {/* CARD 7: ACCOUNT (Warm Amber/Bronze Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-amber-600/40 shadow-[0_0_20px_rgba(217,119,6,0.15)] flex flex-col justify-between space-y-4 hover:border-amber-500/60 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <User className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  ACCOUNT
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Manage your account.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-purple-950/40">
                <span className="text-slate-400 font-medium">Username</span>
                <span className="font-bold text-white font-cinzel tracking-wider">{profile?.name || 'SHADOW'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-purple-950/40">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="text-purple-200 font-mono text-[11px]">shadow@realm.app</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-medium">Member Since</span>
                <span className="text-slate-300 font-medium">Sep 1, 2025</span>
              </div>

              <button
                id="btn-change-password"
                onClick={() => {
                  soundFx.playClick();
                  setIsPasswordModalOpen(true);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl border border-amber-600/50 bg-[#161226] hover:bg-amber-950/30 text-slate-200 hover:text-amber-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Change Password</span>
              </button>

              {onLogout && (
                <button
                  id="btn-sign-out"
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-600/50 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Depart Realm (Sign Out)</span>
                </button>
              )}
            </div>
          </div>

          {/* CARD 8: DATA & PRIVACY (Crimson/Ruby Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] flex flex-col justify-between space-y-4 hover:border-rose-400/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <ShieldCheck className="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  DATA & PRIVACY
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Your data, your control.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2.5">
                <button
                  id="btn-export-data"
                  onClick={handleExportData}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-700/80 bg-[#14162e] hover:bg-[#1e2348] text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export My Data</span>
                </button>

                <button
                  id="btn-delete-account"
                  onClick={() => {
                    soundFx.playClick();
                    showToast("Account deletion requires primary authentication. Your realm remains guarded.");
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Account</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400/90 leading-relaxed pt-1">
                Your data is secure and never shared with third parties.
              </p>
            </div>
          </div>

          {/* CARD 9: ABOUT (Steel Blue Theme) */}
          <div className="rounded-2xl p-5 bg-[#0b0c1e]/90 border border-blue-600/45 shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col justify-between space-y-4 hover:border-blue-500/70 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <Info className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                <h3 className="font-cinzel text-sm font-black tracking-wider text-white">
                  ABOUT
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Version and information.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-purple-950/40">
                <span className="text-slate-400 font-medium">Version</span>
                <span className="font-mono text-slate-200 font-semibold text-[11px]">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-purple-950/40">
                <span className="text-slate-400 font-medium">Build</span>
                <span className="font-mono text-slate-300 text-[11px]">2025.09.12</span>
              </div>
              
              <div className="pt-1 text-[11px] text-slate-300 leading-tight">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span>Made with</span>
                  <span className="text-rose-500 animate-pulse">❤️</span>
                  <span>by the REALM Team</span>
                </div>
                <p className="text-[10px] text-purple-300/80 italic mt-0.5">
                  Live a better you.
                </p>
              </div>

              <button
                id="btn-check-updates"
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdate}
                className="w-full mt-2 py-2 px-3 rounded-xl border border-blue-600/40 bg-[#131936] hover:bg-blue-950/40 text-slate-200 hover:text-blue-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Checking Realm Servers...' : 'Check for Updates'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right-Side Column (col-span-12 lg:col-span-4 xl:col-span-3 space-y-5) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          
          {/* 1. Top Twilight Castle Spire Card */}
          <div className="rounded-2xl overflow-hidden border border-purple-800/40 bg-[#090b1c] shadow-xl group">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={settingsCastleWidget}
                alt="Twilight Fantasy Castle Spire"
                className="w-full h-full object-cover object-center filter saturate-125 brightness-105 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b1c] via-transparent to-transparent" />
            </div>

            {/* Quote directly under the castle image */}
            <div className="p-4 pt-2 text-center space-y-2">
              <p className="font-cinzel text-xs font-bold tracking-widest text-slate-200 uppercase leading-relaxed">
                “A MORE DISCIPLINED YOU<br />
                A BRIGHTER TOMORROW.”
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] text-purple-400 select-none">
                <span className="w-8 h-[1px] bg-purple-500/50" />
                <span>✦</span>
                <span className="w-8 h-[1px] bg-purple-500/50" />
              </div>
            </div>
          </div>

          {/* 2. REALM Parchment Goals Card */}
          <div className="rounded-2xl overflow-hidden border border-amber-900/40 shadow-xl relative group">
            <img
              src={settingsParchmentBanner}
              alt="REALM Core Tenets"
              className="w-full h-auto object-cover object-center filter saturate-115 brightness-95"
            />
          </div>

          {/* 3. Bottom Table Vignette with Glowing Lantern & "Progress Lives Here." */}
          <div className="rounded-2xl overflow-hidden border border-purple-900/50 shadow-xl relative group">
            <img
              src={settingsDeskVignette}
              alt="Progress Lives Here"
              className="w-full h-auto object-cover object-center filter saturate-125 brightness-100"
            />
          </div>

        </div>

      </div>

      {/* Password Change Dialog Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0c0d22] border border-amber-500/60 p-6 shadow-[0_0_35px_rgba(245,158,11,0.3)] space-y-4">
            <div className="flex items-center gap-3 border-b border-purple-950/60 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white tracking-wider">
                  CHANGE PASSKEY
                </h3>
                <p className="text-xs text-slate-400">Update your realm encryption credentials.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#141836] border border-purple-900/50 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter strong passkey..."
                  className="w-full px-3 py-2 rounded-xl bg-[#141836] border border-purple-900/50 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  soundFx.playQuestComplete();
                  setIsPasswordModalOpen(false);
                  showToast("Passkey sealed! Realm credentials secured.");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              >
                Update Passkey
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
