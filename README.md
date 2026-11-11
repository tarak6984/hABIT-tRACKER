# Bloomly — Gamified Social Habit Tracker

Bloomly is a cute, offline-first habit tracker built with **React Native + Expo SDK 58**. Every habit you build grows a plant in your virtual garden, earns XP and coins, levels up your Life Tree, and unlocks collectible badges. A community layer adds groups, challenges, a feed, and weekly leaderboards.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go 58** (Android or iOS). Everything runs inside Expo Go — no custom native build needed.

| Command | What it does |
| --- | --- |
| `npm start` | Start the Metro dev server |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint with `eslint-config-expo` |

## Features

**Habits**
- Yes/no habits and counted habits (e.g. 8 glasses, 20 pages)
- Daily, weekday, weekend or custom-day schedules
- 18 ready-made templates across 6 categories, or build your own (icon, color, category, plant)
- Per-habit local reminders (daily or per weekday)
- Slide-to-complete "Up next" card, tap/long-press to log or reset, retro-log past days from the calendar

**Gamification**
- XP per completion plus a perfect-day bonus; levels on an increasing curve
- Coins from habits, perfect days, badges and challenges, spent in the garden shop
- 17 badges with progress tracking and confetti celebrations
- Per-habit and overall day streaks; deleting a habit never removes XP you already earned

**Virtual garden**
- One plant per habit (6 species × 5 growth stages: seed → bloom at 3/7/14/30 check-ins)
- Plants get thirsty after two missed scheduled days and revive with one check-in
- Life Tree centerpiece that grows and bears fruit with your level, wrapped in today's progress ring
- Time-of-day sky and placeable decorations from the shop

**Community**
- Feed with posts, cheers and auto-shareable achievements
- Public groups to join, private groups with invite codes, group feeds and rankings
- Category-based challenges with daily progress and coin rewards
- Weekly XP leaderboards (global and your groups)

**Insights**
- Week / month / year activity charts, success rate, perfect days
- XP-by-category donut, mood check-ins and weekly mood history
- 30-day consistency per habit
- Premium: consistency heatmap, power day, most/least consistent habits

**Premium (freemium model)**
- Free: up to 5 habits, 2 groups, 1 private group, 6 companions, 4 plant species
- Premium: unlimited habits and groups, advanced insights, 3 rare companions, exclusive plants and decor

**Polish**
- 9 original illustrated companions with expressions, all drawn in SVG
- Light, dark and system themes; haptics; accessibility labels throughout

## Architecture

```
src/
  app/            Expo Router routes (tabs, modals, detail screens)
  components/     UI kit (ui/), illustrations (art/), charts, feature components
  data/           Static catalog (templates, plants, decor, plans) and community seed data
  hooks/          Screen-level hooks (community helpers, habit editor gating)
  lib/            Pure logic: dates, gamification, achievements; edge adapters: notifications, haptics
  store/          Types, reducer, and the AppStore provider (persistence + derived stats)
  theme/          Design tokens and the useTheme hook
```

- **Single source of truth:** all state lives in one reducer (`src/store/reducer.ts`) and persists to AsyncStorage.
- **Derived, not stored:** XP, levels, coins, streaks and plant stages are computed from the habit logs (`src/lib/gamification.ts`), so undoing a check-in always rolls everything back consistently.
- **Side effects at the edges:** reminder scheduling happens in the store's action layer (`src/store/AppStore.tsx`); the reducer stays pure.

## Known limitations

- **Community is local.** Members, public groups, challenges and seeded posts come from `src/data/community.ts` and evolve deterministically by date. Your own posts, groups and cheers are real, but they stay on your device. Real multi-user sync needs a backend (for example Supabase or Firebase).
- **Purchases are simulated.** `IS_BILLING_LIVE` in `src/data/catalog.ts` is `false`, and the paywall says so on screen. Real subscriptions need a billing SDK such as RevenueCat, which requires a development build rather than Expo Go.
- **Data is device-only.** There's no account or cloud backup yet.

## Design credits

The visual direction draws on four free Figma Community files: Lavora, Main Habits, Daily Health Journey and Habitize. All illustrations, mascots and code in this repo are original.
