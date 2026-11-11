import { challengesById, type Challenge } from '@/data/community';
import { addDays, type DateKey } from '@/lib/dates';
import { isCompletedOn, XP_PER_COMPLETION, type AppStats } from '@/lib/gamification';
import type { HabitColorId } from '@/theme/tokens';
import type { AppState, ChallengeJoin, MascotId } from '@/store/types';

export function challengeProgress(challenge: Challenge, join: ChallengeJoin, state: AppState, today: DateKey): number {
  const lastDay = addDays(join.joinedAt, challenge.durationDays - 1);
  const end = lastDay < today ? lastDay : today;
  const relevant = state.habits.filter((habit) => habit.category === challenge.category);
  let done = 0;
  for (let key = join.joinedAt; key <= end; key = addDays(key, 1)) {
    if (relevant.some((habit) => isCompletedOn(habit, state.logs, key))) done += 1;
  }
  return done;
}

export function completedChallengeIds(state: AppState, today: DateKey): string[] {
  return state.joinedChallenges
    .filter((join) => {
      const challenge = challengesById.get(join.challengeId);
      return challenge !== undefined && challengeProgress(challenge, join, state, today) >= challenge.durationDays;
    })
    .map((join) => join.challengeId);
}

type BadgeContext = { stats: AppStats; state: AppState; completedChallenges: number };

export type Badge = {
  id: string;
  title: string;
  description: string;
  mascot: MascotId;
  color: HabitColorId;
  rewardCoins: number;
  progress: (context: BadgeContext) => { current: number; target: number };
};

const categoryCompletions = (context: BadgeContext, category: keyof AppStats['categoryXp']) =>
  context.stats.categoryXp[category] / XP_PER_COMPLETION;

export const badges: Badge[] = [
  { id: 'first-bloom', title: 'First Bloom', description: 'Complete your very first habit.', mascot: 'sprout', color: 'mint', rewardCoins: 15,
    progress: ({ stats }) => ({ current: stats.totalCompletions, target: 1 }) },
  { id: 'perfect-day', title: 'Perfect Day', description: 'Finish every habit planned for a day.', mascot: 'pip', color: 'sun', rewardCoins: 20,
    progress: ({ stats }) => ({ current: stats.perfectDays, target: 1 }) },
  { id: 'streak-3', title: 'On a Roll', description: 'Keep any habit going 3 days in a row.', mascot: 'ember', color: 'peach', rewardCoins: 20,
    progress: ({ stats }) => ({ current: stats.bestHabitStreak, target: 3 }) },
  { id: 'streak-7', title: 'Week Warrior', description: 'Reach a 7-day streak on any habit.', mascot: 'bun', color: 'pink', rewardCoins: 40,
    progress: ({ stats }) => ({ current: stats.bestHabitStreak, target: 7 }) },
  { id: 'hydration', title: 'Hydration Hero', description: 'Complete 20 health habits.', mascot: 'nimbus', color: 'sky', rewardCoins: 40,
    progress: (context) => ({ current: categoryCompletions(context, 'health'), target: 20 }) },
  { id: 'athlete', title: 'Little Athlete', description: 'Complete 20 fitness habits.', mascot: 'boba', color: 'coral', rewardCoins: 40,
    progress: (context) => ({ current: categoryCompletions(context, 'fitness'), target: 20 }) },
  { id: 'bookworm', title: 'Bookworm', description: 'Complete 20 learning habits.', mascot: 'mochi', color: 'sun', rewardCoins: 40,
    progress: (context) => ({ current: categoryCompletions(context, 'learning'), target: 20 }) },
  { id: 'zen', title: 'Zen Master', description: 'Complete 20 mindfulness habits.', mascot: 'luna', color: 'violet', rewardCoins: 40,
    progress: (context) => ({ current: categoryCompletions(context, 'mind'), target: 20 }) },
  { id: 'social', title: 'Social Butterfly', description: 'Join your first community group.', mascot: 'bun', color: 'pink', rewardCoins: 15,
    progress: ({ state }) => ({ current: state.joinedGroupIds.length + state.customGroups.length, target: 1 }) },
  { id: 'challenger', title: 'Challenger', description: 'Finish a community challenge.', mascot: 'zest', color: 'teal', rewardCoins: 50,
    progress: ({ completedChallenges }) => ({ current: completedChallenges, target: 1 }) },
  { id: 'gardener', title: 'Green Thumb', description: 'Collect 3 garden decorations.', mascot: 'sprout', color: 'mint', rewardCoins: 30,
    progress: ({ state }) => ({ current: state.ownedDecor.length, target: 3 }) },
  { id: 'mood-7', title: 'In Tune', description: 'Check in with your mood on 7 days.', mascot: 'nimbus', color: 'violet', rewardCoins: 30,
    progress: ({ state }) => ({ current: Object.keys(state.moods).length, target: 7 }) },
  { id: 'level-5', title: 'Rising Star', description: 'Reach level 5.', mascot: 'mochi', color: 'sun', rewardCoins: 50,
    progress: ({ stats }) => ({ current: stats.level.level, target: 5 }) },
  { id: 'perfect-10', title: 'Flawless Ten', description: 'Have 10 perfect days.', mascot: 'pip', color: 'peach', rewardCoins: 60,
    progress: ({ stats }) => ({ current: stats.perfectDays, target: 10 }) },
  { id: 'century', title: 'Centurion', description: 'Complete 100 habits in total.', mascot: 'boba', color: 'violet', rewardCoins: 80,
    progress: ({ stats }) => ({ current: stats.totalCompletions, target: 100 }) },
  { id: 'streak-30', title: 'Unstoppable', description: 'Reach a 30-day streak on any habit.', mascot: 'luna', color: 'coral', rewardCoins: 100,
    progress: ({ stats }) => ({ current: stats.bestHabitStreak, target: 30 }) },
  { id: 'level-10', title: 'Garden Legend', description: 'Reach level 10.', mascot: 'zest', color: 'teal', rewardCoins: 100,
    progress: ({ stats }) => ({ current: stats.level.level, target: 10 }) },
];

export const badgesById = new Map(badges.map((badge) => [badge.id, badge]));

export function newlyEarnedBadges(context: BadgeContext): Badge[] {
  return badges.filter((badge) => {
    if (context.state.unlockedBadges[badge.id]) return false;
    const { current, target } = badge.progress(context);
    return current >= target;
  });
}

export function bonusCoins(state: AppState, completedChallenges: string[]): number {
  const badgeCoins = Object.keys(state.unlockedBadges).reduce(
    (sum, id) => sum + (badgesById.get(id)?.rewardCoins ?? 0),
    0,
  );
  const challengeCoins = completedChallenges.reduce(
    (sum, id) => sum + (challengesById.get(id)?.rewardCoins ?? 0),
    0,
  );
  return badgeCoins + challengeCoins;
}
