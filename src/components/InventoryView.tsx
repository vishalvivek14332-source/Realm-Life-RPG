import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Sparkles, 
  ChevronDown, 
  Clock, 
  Coins, 
  Shield, 
  Check, 
  Zap, 
  Flame, 
  Compass, 
  Dumbbell, 
  Brain, 
  Leaf, 
  Trophy, 
  Scroll, 
  BookOpen, 
  Coffee, 
  Feather, 
  Apple, 
  Hourglass, 
  FlaskRound as Flask, 
  Footprints,
  CheckCircle2,
  Store,
  Palette,
  Award,
  ShoppingCart
} from 'lucide-react';
import { InventoryItem } from '../types';
import { soundFx } from '../sound';

import inventoryVaultBanner from '../assets/images/inventory_vault_banner.jpg';
import showcaseMindfulCloak from '../assets/images/showcase_mindful_cloak.jpg';
import itemCloakImg from '../assets/images/item_mindful_cloak_1789202806025.jpg';
import itemRingImg from '../assets/images/item_pathfinders_ring.jpg';
import itemBladeImg from '../assets/images/item_trackers_blade_1789202830581.jpg';
import itemJournalImg from '../assets/images/item_explorers_journal_1789202848219.jpg';
import itemTimeShard from '../assets/images/item_time_shard.jpg';
import itemFocusPotion from '../assets/images/item_focus_potion.jpg';
import itemHealthPotion from '../assets/images/item_health_potion.jpg';
import itemKnowledgeTome from '../assets/images/item_knowledge_tome.jpg';
import itemEnergyBar from '../assets/images/item_energy_bar.jpg';
import itemPhoenixFeather from '../assets/images/item_phoenix_feather.jpg';
import itemProductivityBrew from '../assets/images/item_productivity_brew.jpg';
import itemExplorersCompass from '../assets/images/item_explorers_compass.jpg';
import itemIronToken from '../assets/images/item_iron_token.jpg';
import itemClarityCrystal from '../assets/images/item_clarity_crystal.jpg';
import itemVitalityLeaf from '../assets/images/item_vitality_leaf.jpg';
import itemChampionsTrophy from '../assets/images/item_champions_trophy.jpg';
import itemAncientScroll from '../assets/images/item_ancient_scroll.jpg';
import itemStreakGuardian from '../assets/images/item_streak_guardian.jpg';
import itemGrandmasterBadge from '../assets/images/item_grandmaster_badge.jpg';

// Comprehensive picture map for every single inventory item
export const ITEM_PICTURES: Record<string, string> = {
  mindful_cloak: itemCloakImg,
  time_shard: itemTimeShard,
  focus_potion: itemFocusPotion,
  health_potion: itemHealthPotion,
  knowledge_tome: itemKnowledgeTome,
  energy_bar: itemEnergyBar,
  phoenix_feather: itemPhoenixFeather,
  productivity_brew: itemProductivityBrew,
  pathfinders_ring: itemRingImg,
  explorers_compass: itemExplorersCompass,
  iron_token: itemIronToken,
  clarity_crystal: itemClarityCrystal,
  vitality_leaf: itemVitalityLeaf,
  champions_trophy: itemChampionsTrophy,
  ancient_scroll: itemAncientScroll,
  streak_guardian: itemStreakGuardian,
  grandmaster_badge: itemGrandmasterBadge,
  trackers_blade_item: itemBladeImg,
};

// Shop Catalog Definitions
interface ShopItemDef {
  id: string;
  name: string;
  type: InventoryItem['type'];
  category: InventoryItem['category'];
  rarity: InventoryItem['rarity'];
  price: number;
  description: string;
  bonus: string;
  icon: string;
  image: string;
  healthRestore?: number;
  energyRestore?: number;
}

const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'health_potion',
    name: 'Health Elixir',
    type: 'potion',
    category: 'consumables',
    rarity: 'Common',
    price: 35,
    description: 'Brewed with enchanted herbs to heal fatigue and restore physical vitality.',
    bonus: 'Restores +50 HP instantly',
    icon: 'flask',
    image: itemHealthPotion,
    healthRestore: 50
  },
  {
    id: 'focus_potion',
    name: 'Focus Potion',
    type: 'potion',
    category: 'consumables',
    rarity: 'Common',
    price: 45,
    description: 'A shimmering azure distillation that sharpens focus and banishes procrastination.',
    bonus: 'Restores +40 Energy & +350 XP',
    icon: 'coffee',
    image: itemFocusPotion,
    energyRestore: 40
  },
  {
    id: 'productivity_brew',
    name: 'Productivity Brew',
    type: 'potion',
    category: 'consumables',
    rarity: 'Rare',
    price: 70,
    description: 'A rich roasted espresso potion infused with stamina runes.',
    bonus: 'Restores +50 Energy, +20 HP, +400 XP',
    icon: 'coffee',
    image: itemProductivityBrew,
    energyRestore: 50,
    healthRestore: 20
  },
  {
    id: 'vitality_leaf',
    name: 'Vitality Leaf',
    type: 'relic',
    category: 'boosts',
    rarity: 'Rare',
    price: 90,
    description: 'An evergreen leaf from the World Tree that rejuvenates your life force.',
    bonus: 'Restores +40 HP, +25 Energy & +1 Vitality',
    icon: 'leaf',
    image: itemVitalityLeaf,
    healthRestore: 40,
    energyRestore: 25
  },
  {
    id: 'clarity_crystal',
    name: 'Clarity Crystal',
    type: 'relic',
    category: 'special',
    rarity: 'Epic',
    price: 120,
    description: 'A prism that dispels mental fog and grants profound cognitive clarity.',
    bonus: '+10 Focus & +1 Intellect point',
    icon: 'sparkles',
    image: itemClarityCrystal
  },
  {
    id: 'ancient_scroll',
    name: 'Ancient Tome Scroll',
    type: 'relic',
    category: 'special',
    rarity: 'Epic',
    price: 150,
    description: 'Forgotten knowledge inscribed by the Grand Masters of the Astral Spire.',
    bonus: '+1 Intellect & +500 XP immediately',
    icon: 'scroll',
    image: itemAncientScroll
  },
  {
    id: 'streak_guardian',
    name: 'Streak Guardian',
    type: 'relic',
    category: 'special',
    rarity: 'Legendary',
    price: 200,
    description: 'A sacred golden aegis that shields and revives your daily streak.',
    bonus: 'Revives lapsed streak (once) & +10% XP',
    icon: 'shield',
    image: itemStreakGuardian
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    type: 'relic',
    category: 'special',
    rarity: 'Legendary',
    price: 250,
    description: 'A radiant feather imbued with perpetual flame that wards off total exhaustion.',
    bonus: 'Full HP & Energy resurrection ward',
    icon: 'feather',
    image: itemPhoenixFeather
  }
];

interface ShopThemeDef {
  id: string;
  name: string;
  price: number;
  description: string;
  previewBg: string;
  accent: string;
  colorScheme?: string;
}

const SHOP_THEMES: ShopThemeDef[] = [
  {
    id: 'theme-default',
    name: 'Cyber Void',
    price: 0,
    description: 'Deep obsidian twilight with neon purple and electric cyan glows.',
    previewBg: 'from-[#070814] via-[#100824] to-[#070814]',
    accent: 'border-purple-500 text-purple-300'
  },
  {
    id: 'theme-solar',
    name: 'Solar Citadel',
    price: 120,
    description: 'Warm golden sunbeams, radiant amber flames, and gilded fortress borders.',
    previewBg: 'from-[#170a04] via-[#2a1306] to-[#120702]',
    accent: 'border-amber-500 text-amber-300'
  },
  {
    id: 'theme-emerald',
    name: 'Emerald Glade',
    price: 120,
    description: 'Lush bioluminescent jade sanctuary infused with forest vitality.',
    previewBg: 'from-[#03140c] via-[#082b1b] to-[#021009]',
    accent: 'border-emerald-500 text-emerald-300'
  },
  {
    id: 'theme-crimson',
    name: 'Crimson Dragon Keep',
    price: 180,
    description: 'Battle-forged blood moon aesthetic with ruby red runes and dark iron.',
    previewBg: 'from-[#140407] via-[#2d0910] to-[#100305]',
    accent: 'border-rose-500 text-rose-300'
  }
];

interface ShopBadgeDef {
  id: string;
  title: string;
  price: number;
  description: string;
  bonus: string;
  rarity: InventoryItem['rarity'];
}

const SHOP_BADGES: ShopBadgeDef[] = [
  {
    id: 'title-unstoppable',
    title: 'The Unstoppable',
    price: 100,
    description: 'Earned by those who refuse to let obstacles or fatigue break their momentum.',
    bonus: '+10% Gold earned on all completed quests',
    rarity: 'Rare'
  },
  {
    id: 'title-code-alchemist',
    title: 'Code Alchemist',
    price: 150,
    description: 'Transmutes complex logic into elegant reality through focused intellect.',
    bonus: '+20% XP on all STUDY and Coding quests',
    rarity: 'Epic'
  },
  {
    id: 'title-ironclad',
    title: 'Ironclad Disciplinarian',
    price: 200,
    description: 'Possesses unbreakable routine and immovable dedication to daily habit.',
    bonus: 'Energy drains 20% slower on active quests',
    rarity: 'Epic'
  },
  {
    id: 'title-apex-ascendant',
    title: 'Apex Ascendant',
    price: 350,
    description: 'The pinnacle of self-mastery. Same person, supreme standards.',
    bonus: '+15% XP & +15% Gold across all adventures',
    rarity: 'Legendary'
  }
];

interface InventoryViewProps {
  items: InventoryItem[];
  gold: number;
  onUseItem: (itemId: string) => void;
  onSellItem: (itemId: string, goldPrice: number) => void;
  onBuyItem: (item: any) => void;
  onBuyTheme: (themeId: string, name: string, price: number) => void;
  onBuyBadge: (title: string, price: number) => void;
  unlockedThemes?: string[];
  currentTheme?: string;
  unlockedTitles?: string[];
  currentTitle?: string;
  showToast: (msg: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  gold,
  onUseItem,
  onSellItem,
  onBuyItem,
  onBuyTheme,
  onBuyBadge,
  unlockedThemes = ['theme-default'],
  currentTheme = 'theme-default',
  unlockedTitles = ['Novice Wanderer', 'Trailblazer'],
  currentTitle = 'Novice Wanderer',
  showToast
}) => {
  // Top view mode: 'vault' | 'shop'
  const [viewMode, setViewMode] = useState<'vault' | 'shop'>('vault');
  const [shopCategory, setShopCategory] = useState<'items' | 'themes' | 'badges'>('items');

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'boosts' | 'consumables' | 'special' | 'trophies'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'curated' | 'rarity' | 'name' | 'quantity'>('curated');
  const [selectedItemId, setSelectedItemId] = useState<string>('mindful_cloak');

  // Selected item object
  const selectedItem = items.find(i => i.id === selectedItemId) || items[0];

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: items.length,
      boosts: items.filter(i => i.category === 'boosts').length,
      consumables: items.filter(i => i.category === 'consumables').length,
      special: items.filter(i => i.category === 'special').length,
      trophies: items.filter(i => i.category === 'trophies').length,
    };
  }, [items]);

  // Filtering & Sorting
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(i => i.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) ||
        i.bonus.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortOption === 'rarity') {
      const rarityRank: Record<string, number> = {
        Legendary: 5,
        Epic: 4,
        Rare: 3,
        Uncommon: 2,
        Common: 1
      };
      result.sort((a, b) => (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0));
    } else if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'quantity') {
      result.sort((a, b) => b.quantity - a.quantity);
    }

    return result;
  }, [items, selectedCategory, searchQuery, sortOption]);

  // Item icon visual helper
  const renderItemArtwork = (item: InventoryItem, sizeClasses: string = "w-16 h-16") => {
    const imgSrc = ITEM_PICTURES[item.id] || item.image || itemCloakImg;

    let borderGlow = "border-slate-700/80 shadow-[0_0_8px_rgba(148,163,184,0.2)]";
    if (item.rarity === 'Legendary') {
      borderGlow = "border-amber-500/80 shadow-[0_0_14px_rgba(245,158,11,0.5)]";
    } else if (item.rarity === 'Epic') {
      borderGlow = "border-purple-500/80 shadow-[0_0_14px_rgba(168,85,247,0.5)]";
    } else if (item.rarity === 'Rare') {
      borderGlow = "border-cyan-500/80 shadow-[0_0_14px_rgba(6,182,212,0.5)]";
    } else if (item.rarity === 'Uncommon') {
      borderGlow = "border-emerald-500/80 shadow-[0_0_14px_rgba(16,185,129,0.5)]";
    }

    return (
      <div className={`relative ${sizeClasses} rounded-2xl overflow-hidden border-2 ${borderGlow} bg-[#0a0518] group-hover:border-purple-300 transition-all duration-300 shrink-0`}>
        <img
          src={imgSrc}
          alt={item.name}
          className="w-full h-full object-cover object-center filter saturate-110 group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
    );
  };

  // Rarity Styling Helper
  const getRarityBadgeStyle = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-950/90 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
      case 'Epic':
        return 'bg-purple-950/90 border-purple-500/80 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]';
      case 'Rare':
        return 'bg-cyan-950/90 border-cyan-500/80 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]';
      case 'Uncommon':
        return 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
      case 'Common':
      default:
        return 'bg-slate-900/90 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Banner with Mode Selector: My Vault vs Merchant Emporium */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-purple-900/40 bg-[#0c0822] shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        {/* Background Artwork */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={inventoryVaultBanner}
            alt="Realm Inventory Vault"
            className="w-full h-full object-cover object-[center_40%] opacity-50 filter saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070514] via-[#0d0724]/85 to-[#070514]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070514] via-transparent to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 p-5 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#241706] to-[#45280b] border border-amber-500/60 p-2.5 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
              {viewMode === 'vault' ? (
                <Package className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              ) : (
                <Store className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black tracking-widest text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  {viewMode === 'vault' ? 'INVENTORY VAULT' : 'MERCHANT EMPORIUM'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {viewMode === 'vault' 
                  ? 'Your personal store of elixirs, equipment, and relics. Equip gear or sell surplus for Gold.'
                  : 'Spend your hard-earned Gold on restorative elixirs, realm themes, and prestige profile badges.'}
              </p>
            </div>
          </div>

          {/* Right Mode Switcher Tabs + Gold Pouch */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            {/* Live Gold Badge */}
            <div 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a0e04]/90 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-default"
              title="Your Available Gold Currency"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.8)] border border-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-950" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black text-amber-300 font-sans">
                  {gold.toLocaleString()} Gold
                </span>
                <span className="text-[9px] text-amber-400/80 font-semibold uppercase tracking-wider">Currency</span>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-black/60 border border-purple-900/60 shadow-inner">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'vault'}
                onClick={() => {
                  soundFx.playClick();
                  setViewMode('vault');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none cursor-pointer ${
                  viewMode === 'vault'
                    ? 'bg-purple-700 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Vault</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'shop'}
                onClick={() => {
                  soundFx.playClick();
                  setViewMode('shop');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none cursor-pointer ${
                  viewMode === 'shop'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-amber-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                    : 'text-amber-300/80 hover:text-amber-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shop (Buy)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: MERCHANT EMPORIUM / SHOP                          */}
      {/* ========================================================= */}
      {viewMode === 'shop' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Shop Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                role="tab"
                aria-selected={shopCategory === 'items'}
                onClick={() => {
                  soundFx.playClick();
                  setShopCategory('items');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  shopCategory === 'items'
                    ? 'bg-amber-600 text-amber-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-[#100b24]/80 border border-purple-950 text-slate-300 hover:text-white'
                }`}
              >
                <Flask className="w-4 h-4" />
                <span>Virtual Items & Elixirs ({SHOP_ITEMS.length})</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={shopCategory === 'themes'}
                onClick={() => {
                  soundFx.playClick();
                  setShopCategory('themes');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  shopCategory === 'themes'
                    ? 'bg-amber-600 text-amber-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-[#100b24]/80 border border-purple-950 text-slate-300 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Realm Themes ({SHOP_THEMES.length})</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={shopCategory === 'badges'}
                onClick={() => {
                  soundFx.playClick();
                  setShopCategory('badges');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  shopCategory === 'badges'
                    ? 'bg-amber-600 text-amber-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-[#100b24]/80 border border-purple-950 text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Profile Badges & Titles ({SHOP_BADGES.length})</span>
              </button>
            </div>

            <span className="text-xs text-amber-300 font-semibold">
              Economy: Earn Gold from Quests, Streaks & Achievements
            </span>
          </div>

          {/* 1. SHOP: ITEMS & POTIONS */}
          {shopCategory === 'items' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SHOP_ITEMS.map((item) => {
                const currentQty = items.find(i => i.id === item.id)?.quantity || 0;
                const canAfford = gold >= item.price;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 bg-gradient-to-b from-[#130a28]/95 to-[#0b0518]/95 border border-purple-900/40 hover:border-amber-500/60 shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div>
                      {/* Top Row: Artwork + Rarity */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-500/40 bg-purple-950/40 shrink-0 shadow-md">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getRarityBadgeStyle(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>

                      {/* Name & Desc */}
                      <h3 className="font-sans text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Stat Bonus */}
                      <div className="mt-3 p-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-[11px] font-bold text-amber-300">
                        ⚡ {item.bonus}
                      </div>

                      {/* Owned in Vault Counter */}
                      <div className="mt-2 text-[10px] font-semibold text-slate-400">
                        In Vault: <span className="text-white font-bold">{currentQty}x</span>
                      </div>
                    </div>

                    {/* Buy Action Button */}
                    <div className="mt-4 pt-3 border-t border-purple-900/40">
                      <button
                        type="button"
                        onClick={() => onBuyItem(item)}
                        aria-label={`Buy ${item.name} for ${item.price} Gold`}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-95'
                            : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:border-amber-700/50'
                        }`}
                      >
                        <Coins className="w-4 h-4 text-amber-950" />
                        <span>Buy for {item.price} Gold</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. SHOP: REALM THEMES */}
          {shopCategory === 'themes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SHOP_THEMES.map((th) => {
                const isUnlocked = unlockedThemes.includes(th.id);
                const isActive = currentTheme === th.id;
                const canAfford = gold >= th.price;

                return (
                  <div
                    key={th.id}
                    className={`rounded-2xl p-4 bg-gradient-to-b ${th.previewBg} border ${th.accent} shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div>
                      {/* Top Preview Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                          {th.colorScheme}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] font-black">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <h3 className="font-cinzel text-base font-black text-white tracking-wider">
                        {th.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {th.description}
                      </p>

                      {/* Visual Swatch */}
                      <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-around">
                        <span className="w-5 h-5 rounded-full bg-purple-500 shadow-md" />
                        <span className="w-5 h-5 rounded-full bg-amber-400 shadow-md" />
                        <span className="w-5 h-5 rounded-full bg-cyan-400 shadow-md" />
                        <span className="w-5 h-5 rounded-full bg-emerald-400 shadow-md" />
                      </div>
                    </div>

                    {/* Theme Action Button */}
                    <div className="mt-5 pt-3 border-t border-white/10">
                      {isActive ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Check className="w-4 h-4" />
                          <span>Currently Active</span>
                        </button>
                      ) : isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => onBuyTheme(th.id, th.name, 0)}
                          className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-purple-400"
                        >
                          <Palette className="w-4 h-4" />
                          <span>Switch to Theme</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onBuyTheme(th.id, th.name, th.price)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 hover:from-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                              : 'bg-slate-900/80 border border-slate-800 text-slate-400'
                          }`}
                        >
                          <Coins className="w-4 h-4 text-amber-950" />
                          <span>Unlock for {th.price} Gold</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. SHOP: PROFILE BADGES & TITLES */}
          {shopCategory === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SHOP_BADGES.map((b) => {
                const isUnlocked = unlockedTitles.includes(b.title);
                const isEquipped = currentTitle === b.title;
                const canAfford = gold >= b.price;

                return (
                  <div
                    key={b.id}
                    className="rounded-2xl p-4 bg-gradient-to-b from-[#180e30]/95 to-[#0e0720]/95 border border-purple-500/50 hover:border-amber-500/60 shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div>
                      {/* Top Crest */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                          <Award className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getRarityBadgeStyle(b.rarity)}`}>
                          {b.rarity}
                        </span>
                      </div>

                      <h3 className="font-cinzel text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                        "{b.title}"
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {b.description}
                      </p>

                      {/* Perk Bonus */}
                      <div className="mt-3 p-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-[11px] font-bold text-amber-300">
                        🛡️ {b.bonus}
                      </div>
                    </div>

                    {/* Badge Action Button */}
                    <div className="mt-4 pt-3 border-t border-purple-900/40">
                      {isEquipped ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Check className="w-4 h-4" />
                          <span>Equipped Title</span>
                        </button>
                      ) : isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => onBuyBadge(b.title, 0)}
                          className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-purple-400"
                        >
                          <Award className="w-4 h-4" />
                          <span>Equip Title</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onBuyBadge(b.title, b.price)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 hover:from-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                              : 'bg-slate-900/80 border border-slate-800 text-slate-400'
                          }`}
                        >
                          <Coins className="w-4 h-4 text-amber-950" />
                          <span>Buy for {b.price} Gold</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* ========================================================= */
        /* MODE 2: MY VAULT (INVENTORY)                              */
        /* ========================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Filter Tabs & Search Bar Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Inventory categories">
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'all'}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                  selectedCategory === 'all'
                    ? 'bg-purple-900/90 border border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-[#100b24]/80 border border-purple-950 text-slate-300 hover:bg-purple-950/50 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>All ({categoryCounts.all})</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'boosts'}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory('boosts');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                  selectedCategory === 'boosts'
                    ? 'bg-purple-900/90 border border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-[#100b24]/80 border border-purple-950 text-slate-300 hover:bg-purple-950/50 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Boosts ({categoryCounts.boosts})</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'consumables'}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory('consumables');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                  selectedCategory === 'consumables'
                    ? 'bg-purple-900/90 border border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-[#100b24]/80 border border-purple-950 text-slate-300 hover:bg-purple-950/50 hover:text-white'
                }`}
              >
                <Flask className="w-3.5 h-3.5" />
                <span>Consumables ({categoryCounts.consumables})</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'special'}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory('special');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                  selectedCategory === 'special'
                    ? 'bg-purple-900/90 border border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-[#100b24]/80 border border-purple-950 text-slate-300 hover:bg-purple-950/50 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special ({categoryCounts.special})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 max-w-sm w-full lg:w-72">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vault items..."
                  aria-label="Search vault items"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#100b24]/90 text-slate-200 placeholder-slate-500 rounded-xl border border-purple-900/40 focus:outline-none focus:border-purple-500/70 transition-all shadow-inner focus-visible:ring-2 focus-visible:ring-purple-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid of Vault Items & Right Item Details Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Grid: Items in Vault (8 cols) */}
            <div className="lg:col-span-8">
              {filteredItems.length === 0 ? (
                <div className="rounded-2xl p-10 bg-[#0d0720]/80 border border-purple-900/40 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="font-cinzel text-base font-bold text-white">No Items in this Vault Category</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Visit the Merchant Emporium to buy elixirs and gear with your Gold, or complete quests to discover loot!
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('shop')}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-600 text-amber-950 font-black text-xs transition-all shadow-lg hover:bg-amber-500 cursor-pointer"
                  >
                    Open Merchant Shop
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const isOwned = item.quantity > 0;

                    return (
                      <div
                        key={item.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`${item.name}, ${item.rarity} ${item.type}. Quantity: ${item.quantity}. ${item.equipped ? 'Equipped' : ''}`}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedItemId(item.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            soundFx.playClick();
                            setSelectedItemId(item.id);
                          }
                        }}
                        className={`
                          relative rounded-2xl p-3 bg-gradient-to-b from-[#130b28]/90 to-[#080414]/95
                          cursor-pointer transition-all duration-200 flex flex-col justify-between group
                          focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none
                          ${isSelected 
                            ? 'border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02]' 
                            : 'border border-purple-900/40 hover:border-purple-500/60 shadow-md hover:scale-[1.01]'}
                          ${!isOwned ? 'opacity-65' : ''}
                        `}
                      >
                        {/* Artwork Preview */}
                        <div className="flex justify-center my-1">
                          {renderItemArtwork(item, "w-16 h-16 sm:w-20 sm:h-20")}
                        </div>

                        {/* Item Details */}
                        <div className="mt-2 text-center">
                          <h4 className="font-sans text-xs font-bold text-white tracking-wide truncate group-hover:text-purple-300 transition-colors">
                            {item.name}
                          </h4>

                          <div className="flex items-center justify-center gap-1.5 mt-1">
                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black border ${getRarityBadgeStyle(item.rarity)}`}>
                              {item.rarity}
                            </span>
                            {item.equipped && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[9px] font-black">
                                EQUIPPED
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 text-[10px] font-semibold text-slate-400">
                            Qty: <span className="text-white font-bold">{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Pane: Selected Item Showcase & Controls (4 cols) */}
            {selectedItem && (
              <div className="lg:col-span-4 rounded-2xl p-5 bg-[#0e0722]/95 border-2 border-purple-500/50 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
                  <h3 className="font-cinzel text-sm font-black text-white tracking-wider">
                    ITEM DETAILS
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getRarityBadgeStyle(selectedItem.rarity)}`}>
                    {selectedItem.rarity}
                  </span>
                </div>

                {/* Big Preview Artwork */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-purple-500/40 bg-purple-950/30 flex items-center justify-center shadow-lg">
                  <img
                    src={selectedItem.id === 'mindful_cloak' ? showcaseMindfulCloak : (ITEM_PICTURES[selectedItem.id] || itemCloakImg)}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0722] via-transparent to-transparent opacity-80" />
                  
                  {selectedItem.equipped && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] font-black shadow-lg">
                      EQUIPPED
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-sans text-lg font-black text-white">
                    {selectedItem.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Perk Bonus */}
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/50 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Effect & Bonus</span>
                  <p className="text-xs font-bold text-amber-300">{selectedItem.bonus}</p>
                </div>

                {/* Action Buttons: Equip / Consume + Sell */}
                <div className="pt-2 space-y-2.5">
                  {selectedItem.type === 'equipment' ? (
                    <button
                      type="button"
                      disabled={!selectedItem.equipped && selectedItem.quantity <= 0}
                      onClick={() => onUseItem(selectedItem.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 ${
                        selectedItem.equipped
                          ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
                          : selectedItem.quantity > 0
                            ? 'bg-purple-700 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                            : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>{selectedItem.equipped ? 'Unequip Gear' : selectedItem.quantity > 0 ? 'Equip Gear' : 'Not in Vault (0)'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={selectedItem.quantity <= 0}
                      onClick={() => onUseItem(selectedItem.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 ${
                        selectedItem.quantity > 0
                          ? 'bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 hover:from-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Flask className="w-4 h-4" />
                      <span>{selectedItem.quantity > 0 ? 'Drink / Consume (+Vitals & XP)' : 'Depleted (0 Charges)'}</span>
                    </button>
                  )}

                  {/* Sell for Gold Button */}
                  <button
                    type="button"
                    disabled={selectedItem.quantity <= 0}
                    onClick={() => {
                      const price = selectedItem.sellPrice || 50;
                      onSellItem(selectedItem.id, price);
                    }}
                    className="w-full py-2 rounded-xl bg-[#170a24]/80 hover:bg-purple-950/60 border border-purple-900/50 hover:border-amber-500/60 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sell 1x for +{selectedItem.sellPrice || 50} Gold</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Quote Bar */}
      <div className="rounded-2xl p-4 sm:p-5 border border-purple-950/40 bg-gradient-to-r from-[#0d061c]/90 via-[#130a2a]/95 to-[#0d061c]/90 text-center shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)] animate-ping" />
          <p className="font-serif italic text-xs sm:text-sm text-slate-300 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            "Same person. Higher standards. Turn real-life actions into permanent heroic progression."
          </p>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)] animate-ping" />
        </div>
      </div>

    </div>
  );
};
