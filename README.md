# 🏰 REALM — RPG Life Gamification Dashboard

An immersive, cinematic medieval dark-fantasy RPG life gamification dashboard designed to turn everyday habits, focus sessions, and real-world milestones into an epic hero's journey.

---

## 🌟 Features

- **Authoritative RPG Progression Engine**: Non-linear level progression calculated server-side using the formula:
  $$\text{requiredXP} = \lfloor 100 \times \text{level}^{1.5} \rfloor$$
- **Atomic Gameplay Operations**: Quest completions, loot roll drops, level-ups, energy deductions, stat boosts, activity logging, and ledger transactions committed together in atomic database transactions.
- **5 Core Attributes**:
  - **Strength** (Fitness, physical resistance)
  - **Intellect** (Study, coding, mental clarity)
  - **Wisdom** (Meditation, journaling, discernment)
  - **Discipline** (Consistency, routines, daily focus)
  - **Vitality** (Sleep, nutrition, health capacity)
- **Real Gold Economy & Merchant Vault**: Buy potions, equipment, relics, and themes with gold earned exclusively by conquering quests.
- **Dynamic Vitals**: Maximum Health and Energy automatically scale with Vitality and Discipline. Campfire Rest mechanics allow players to recover stamina and health.
- **Daily Streak Sealing**: Streak tracking with calendar validation, milestone rewards, and recovery mechanics.
- **Automatic Milestone & Achievement Evaluation**: Real-time evaluation of player feats including First Blood, Consistent Mind, Fitness Fighter, and Quest Master.
- **JWT Authentication & Security**: Salted bcrypt password hashing, secure JWT claims, protected endpoints, and role/ownership validations.

---

## 🏗️ Architecture

```
realm---rpg-life-gamification-dashboard/
├── backend/                             # Production-Ready Node.js/Express Service
│   ├── prisma/
│   │   ├── schema.prisma                # Relational schema (11 models)
│   │   └── seed.ts                      # Codex seed script for items & achievements
│   ├── src/
│   │   ├── config/env.ts                # Environment configurations
│   │   ├── controllers/                 # REST Controllers
│   │   │   ├── authController.ts
│   │   │   ├── characterController.ts
│   │   │   ├── questController.ts
│   │   │   ├── inventoryController.ts
│   │   │   ├── achievementController.ts
│   │   │   ├── streakController.ts
│   │   │   └── activityController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts        # JWT validation
│   │   │   └── errorMiddleware.ts       # Centralized error handler
│   │   ├── routes/                      # Route modules
│   │   ├── services/
│   │   │   ├── progressionService.ts    # Authoritative math & stats
│   │   │   ├── rewardService.ts         # Bonuses & loot drops
│   │   │   ├── streakService.ts         # Consecutive day logic
│   │   │   └── achievementService.ts    # Milestone evaluation
│   │   ├── utils/jwt.ts
│   │   ├── prisma.ts                    # PrismaClient singleton
│   │   └── server.ts                    # Express entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── .env.example
│
├── src/                                 # Vite + React Frontend
│   ├── components/                      # Medieval RPG UI components & modals
│   │   ├── AuthModal.tsx                # RPG Authentication Gateway Modal
│   │   ├── TopHeader.tsx                # RPG Status HUD
│   │   ├── Sidebar.tsx                  # Tab navigation
│   │   ├── QuestBoard.tsx               # Quest codex & tracker
│   │   ├── QuestRewardModal.tsx         # Victory & Loot celebration
│   │   ├── LevelUpCelebration.tsx       # Ascendance celebration
│   │   └── ...
│   ├── services/
│   │   └── api.ts                       # Modular, typed API client
│   ├── data.ts
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 💾 Database Schema (Supabase PostgreSQL / Prisma)

Prisma manages 11 relational models with strict foreign keys, cascade deletes, and indexes:

| Entity | Description |
| :--- | :--- |
| **`User`** | Adventurer account credentials, email, username, and password hash. |
| **`Character`** | Level, XP, Gold, Health, Energy, and 5 core attributes (STR, INT, WIS, DIS, VIT). |
| **`Quest`** | Active and completed trials with XP/Gold reward tiers and stamina costs. |
| **`QuestCompletion`** | Strict completion history preventing duplicate quest claims. |
| **`InventoryItem`** | Catalog of potions, gear, relics, and consumables with stats and bonuses. |
| **`UserInventory`** | Player's vaulted items, stack quantities, and equipped loadout. |
| **`Achievement`** | Milestone codex with unlock requirements and rewards. |
| **`UserAchievement`** | Player progress towards achievements with unlock timestamps. |
| **`Streak`** | Consecutive active days and longest unbroken run. |
| **`ActivityLog`** | Chronological ledger of triumphs, acquisitions, and level ascensions. |
| **`Transaction`** | Financial audit log for all gold earnings and expenditures. |

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

```env
# Supabase PostgreSQL Connection Strings
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# Security & Server
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

A template with placeholders is located at `backend/.env.example`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+
- **npm** or **bun**
- **Supabase PostgreSQL** database (or local PostgreSQL instance)

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template and configure your database credentials
cp .env.example .env

# Push schema to database
npx prisma db push

# Seed items and achievements catalog
npm run prisma:seed

# Start backend development server (Runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup

```bash
# In project root directory
npm install

# Start Vite frontend development server (Runs on http://localhost:3000)
npm run dev
```

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new adventurer & initialize character
- `POST /api/auth/login` — Authenticate & receive JWT
- `GET /api/auth/me` — Fetch authenticated profile & character state

### Character (`/api/character`)
- `GET /api/character` — Get character stats, vitals, and XP requirements
- `POST /api/character/rest` — Rest at the campfire (+35 Energy, +20 Health)

### Quests (`/api/quests`)
- `GET /api/quests` — List player's quests
- `POST /api/quests` — Inscribe a new quest
- `GET /api/quests/:id` — View quest details
- `PUT /api/quests/:id` — Update quest details (active only)
- `DELETE /api/quests/:id` — Delete quest from active roster
- `POST /api/quests/:id/complete` — **Authoritative completion engine**: calculates rewards, awards XP/Gold, scales attributes, tests level-ups, evaluates achievements, and rolls loot drops atomically

### Inventory & Shop (`/api/inventory`)
- `GET /api/inventory` — List player inventory & shop catalog
- `POST /api/inventory/buy` — Buy item with gold
- `POST /api/inventory/use` — Consume potion/elixir for vitals and boosts
- `POST /api/inventory/equip` — Toggle equipment loadout
- `POST /api/inventory/sell` — Sell item to merchant for gold

### Achievements & Streaks
- `GET /api/achievements` — List achievements with player's live progress
- `GET /api/streak` — Retrieve consecutive days and 7-day tracker
- `POST /api/streak/check-in` — Claim daily check-in and restore vitals
- `GET /api/activity` — Retrieve player's adventure history log

---

## 🛡️ Security & Integrity

- **Authoritative Backend**: The frontend is never trusted for XP, gold, level, or rewards. All computations occur on the server.
- **Atomic Operations**: Database modifications are wrapped in `prisma.$transaction`.
- **Validation**: Strict checks prevent negative energy, negative gold, or duplicate completions.
- **CORS Protection**: Access restricted to verified client origins.
- **Sanitized Outputs**: Sensitive data such as password hashes are never returned by any endpoint.
