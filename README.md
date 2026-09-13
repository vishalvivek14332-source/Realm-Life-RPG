# 🏰 REALM — RPG Life Gamification Dashboard

An immersive, cinematic medieval dark-fantasy RPG life gamification dashboard designed to turn everyday habits, focus sessions, and real-world milestones into an epic hero's journey.

---

## 🌐 Live Application & Links

- **🚀 Live Web App (Render)**: [https://realm-life-rpg.onrender.com](https://realm-life-rpg.onrender.com)

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

### Supabase & Server Configuration (`.env` / `backend/.env`)

```env
# Supabase PostgreSQL Connection Strings
# Port 6543 = PgBouncer Transaction Pooler (Requires pgbouncer=true and sslmode=require)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Port 5432 = Session Pooler / Direct Connection (Requires sslmode=require)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Security & Server
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV="production"
CLIENT_URL="http://localhost:3000"
```

> [!NOTE]
> Prisma Client automatically sanitizes and ensures `pgbouncer=true` and `sslmode=require` flags at runtime to eliminate prepared statement caching errors on PgBouncer.

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js** v18+
- **npm** or **bun**
- **Supabase PostgreSQL** instance

### 2. Quick Unified Local Launch

```bash
# Install root and backend dependencies
npm install
npm --prefix backend install

# Generate Prisma client and compile
npm run build

# Start unified application on http://localhost:5000
npm start
```

### 3. Separate Frontend & Backend Development

```bash
# Terminal 1: Start Express API server (port 5000)
cd backend
npm run dev

# Terminal 2: Start Vite client dev server (port 3000)
npm run dev
```

---

## ☁️ Render Production Deployment

The project is configured to build and deploy as a single, unified service on Render using the included `render.yaml` blueprint:

1. Connect your repository on [dashboard.render.com](https://dashboard.render.com).
2. Create a **Web Service** with the following settings:
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install --include=dev && npm --prefix backend install --include=dev && npm --prefix backend run prisma:generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
3. Set the Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `DATABASE_URL` = *(Your Supabase Transaction Pooler URL with `?pgbouncer=true&sslmode=require`)*
   - `DIRECT_URL` = *(Your Supabase Session Pooler URL with `?sslmode=require`)*
   - `JWT_SECRET` = *(Your secure random token key)*
4. The Express server serves both the production React bundle (`dist/`) and all `/api/*` endpoints from the same URL with seamless SPA fallback routing.

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
