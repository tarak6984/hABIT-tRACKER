import type { DateKey } from '@/lib/dates';
import type { HabitColorId } from '@/theme/tokens';

export type CategoryId = 'health' | 'fitness' | 'mind' | 'learning' | 'productivity' | 'social';

export type MascotId = 'sprout' | 'mochi' | 'bun' | 'pip' | 'boba' | 'ember' | 'nimbus' | 'luna' | 'zest';

export type PlantSpecies = 'daisy' | 'tulip' | 'sunflower' | 'cactus' | 'cherry' | 'lavender';

export type HabitGoal = { kind: 'check' } | { kind: 'count'; target: number; unit: string };

export type Reminder = { hour: number; minute: number };

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  color: HabitColorId;
  category: CategoryId;
  goal: HabitGoal;
  /** Weekdays the habit is scheduled on, 0 = Sunday. */
  days: number[];
  reminder: Reminder | null;
  notificationIds: string[];
  plant: PlantSpecies;
  createdAt: DateKey;
};

export type Mood = 1 | 2 | 3 | 4 | 5;

export type ThemePreference = 'system' | 'light' | 'dark';

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export type Profile = {
  name: string;
  mascot: MascotId;
  onboarded: boolean;
  joinedAt: DateKey;
  isPremium: boolean;
  premiumPlan: PlanId | null;
};

export type Settings = {
  theme: ThemePreference;
  haptics: boolean;
  remindersEnabled: boolean;
};

export type PostKind = 'text' | 'badge' | 'level' | 'streak' | 'challenge';

export type Post = {
  id: string;
  authorId: string;
  kind: PostKind;
  text: string;
  createdAt: string;
  groupId: string | null;
  baseCheers: number;
};

export type Group = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: HabitColorId;
  isPrivate: boolean;
  inviteCode: string;
  memberIds: string[];
  memberCount: number;
  ownerId: string;
};

export type ChallengeJoin = { challengeId: string; joinedAt: DateKey };

export type Celebration = { kind: 'badge'; badgeId: string } | { kind: 'level'; level: number };

/** Progress value per habit per day: 1 for a checked habit, or the logged count. */
export type Logs = Record<DateKey, Record<string, number>>;

export type AppState = {
  version: 1;
  profile: Profile;
  settings: Settings;
  habits: Habit[];
  logs: Logs;
  /** Completions from deleted habits, kept so deleting a habit never takes earned XP away. */
  retiredCompletions: number;
  moods: Record<DateKey, Mood>;
  unlockedBadges: Record<string, DateKey>;
  celebratedLevel: number;
  celebrationQueue: Celebration[];
  coinsSpent: number;
  ownedDecor: string[];
  placedDecor: string[];
  joinedGroupIds: string[];
  customGroups: Group[];
  joinedChallenges: ChallengeJoin[];
  myPosts: Post[];
  cheeredPostIds: string[];
};
