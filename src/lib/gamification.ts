import { PLANT_STAGE_THRESHOLDS } from '@/data/catalog';
import { addDays, weekdayOf, weekKeys, type DateKey } from '@/lib/dates';
import type { AppState, CategoryId, Habit, Logs } from '@/store/types';

export const XP_PER_COMPLETION = 10;
export const XP_PER_PERFECT_DAY = 25;
export const COINS_PER_COMPLETION = 2;
export const COINS_PER_PERFECT_DAY = 5;

export function goalTarget(habit: Habit): number {
  return habit.goal.kind === 'count' ? habit.goal.target : 1;
}

export function progressOn(logs: Logs, habitId: string, key: DateKey): number {
  return logs[key]?.[habitId] ?? 0;
}

export function isScheduledOn(habit: Habit, key: DateKey): boolean {
  return key >= habit.createdAt && habit.days.includes(weekdayOf(key));
}

export function isCompletedOn(habit: Habit, logs: Logs, key: DateKey): boolean {
  return progressOn(logs, habit.id, key) >= goalTarget(habit);
}

export function habitsScheduledOn(habits: Habit[], key: DateKey): Habit[] {
  return habits.filter((habit) => isScheduledOn(habit, key));
}

export function dayCompletion(habits: Habit[], logs: Logs, key: DateKey) {
  const scheduled = habitsScheduledOn(habits, key);
  const done = scheduled.filter((habit) => isCompletedOn(habit, logs, key)).length;
  return { done, total: scheduled.length, ratio: scheduled.length === 0 ? 0 : done / scheduled.length };
}

export function currentStreak(habit: Habit, logs: Logs, today: DateKey): number {
  let cursor = today;
  // An unfinished habit today is still "pending", so it must not break the streak yet.
  if (isScheduledOn(habit, cursor) && !isCompletedOn(habit, logs, cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (cursor >= habit.createdAt) {
    if (isScheduledOn(habit, cursor)) {
      if (!isCompletedOn(habit, logs, cursor)) break;
      streak += 1;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(habit: Habit, logs: Logs, today: DateKey): number {
  let best = 0;
  let running = 0;
  for (let cursor = habit.createdAt; cursor <= today; cursor = addDays(cursor, 1)) {
    if (!isScheduledOn(habit, cursor)) continue;
    if (isCompletedOn(habit, logs, cursor)) {
      running += 1;
      best = Math.max(best, running);
    } else if (cursor < today) {
      running = 0;
    }
  }
  return best;
}

export function completionCount(habit: Habit, logs: Logs): number {
  const target = goalTarget(habit);
  let count = 0;
  for (const day of Object.values(logs)) {
    if ((day[habit.id] ?? 0) >= target) count += 1;
  }
  return count;
}

export function plantStage(completions: number): number {
  let stage = 0;
  PLANT_STAGE_THRESHOLDS.forEach((threshold, index) => {
    if (completions >= threshold) stage = index;
  });
  return stage;
}

export function completionsToNextStage(completions: number): number | null {
  const next = PLANT_STAGE_THRESHOLDS.find((threshold) => threshold > completions);
  return next === undefined ? null : next - completions;
}

/** A plant wilts after its two most recent scheduled days (before today) were both missed. */
export function isWilted(habit: Habit, logs: Logs, today: DateKey): boolean {
  const recentScheduled: DateKey[] = [];
  for (let offset = 1; offset <= 14 && recentScheduled.length < 2; offset += 1) {
    const key = addDays(today, -offset);
    if (key < habit.createdAt) break;
    if (isScheduledOn(habit, key)) recentScheduled.push(key);
  }
  if (recentScheduled.length < 2) return false;
  if (isCompletedOn(habit, logs, today)) return false;
  return recentScheduled.every((key) => !isCompletedOn(habit, logs, key));
}

export function completionRate(habit: Habit, logs: Logs, keys: DateKey[]): number {
  const scheduled = keys.filter((key) => isScheduledOn(habit, key));
  if (scheduled.length === 0) return 0;
  return scheduled.filter((key) => isCompletedOn(habit, logs, key)).length / scheduled.length;
}

export type LevelInfo = { level: number; xpIntoLevel: number; xpForNext: number; progress: number };

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let floor = 0;
  let need = 100;
  while (xp >= floor + need) {
    floor += need;
    level += 1;
    need = 100 + 50 * (level - 1);
  }
  return { level, xpIntoLevel: xp - floor, xpForNext: need, progress: (xp - floor) / need };
}

export type HabitStats = {
  streak: number;
  best: number;
  completions: number;
  stage: number;
  wilted: boolean;
};

export type AppStats = {
  xp: number;
  weekXp: number;
  level: LevelInfo;
  coinsEarned: number;
  totalCompletions: number;
  perfectDays: number;
  dayStreak: number;
  bestHabitStreak: number;
  categoryXp: Record<CategoryId, number>;
  completionsByDay: Record<DateKey, number>;
  xpByDay: Record<DateKey, number>;
  habitStats: Record<string, HabitStats>;
};

function computeDayStreak(completionsByDay: Record<DateKey, number>, today: DateKey): number {
  let cursor = (completionsByDay[today] ?? 0) > 0 ? today : addDays(today, -1);
  let streak = 0;
  while ((completionsByDay[cursor] ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeStats(state: AppState, today: DateKey, bonusCoins: number): AppStats {
  const habitsById = new Map(state.habits.map((habit) => [habit.id, habit]));
  const categoryXp: Record<CategoryId, number> = {
    health: 0, fitness: 0, mind: 0, learning: 0, productivity: 0, social: 0,
  };
  const completionsByDay: Record<DateKey, number> = {};
  const xpByDay: Record<DateKey, number> = {};
  let totalCompletions = state.retiredCompletions;
  let perfectDays = 0;

  for (const [key, day] of Object.entries(state.logs)) {
    let completedToday = 0;
    for (const [habitId, value] of Object.entries(day)) {
      const habit = habitsById.get(habitId);
      if (!habit || value < goalTarget(habit)) continue;
      completedToday += 1;
      categoryXp[habit.category] += XP_PER_COMPLETION;
    }
    const { done, total } = dayCompletion(state.habits, state.logs, key);
    const isPerfect = total > 0 && done === total;
    if (isPerfect) perfectDays += 1;
    completionsByDay[key] = completedToday;
    xpByDay[key] = completedToday * XP_PER_COMPLETION + (isPerfect ? XP_PER_PERFECT_DAY : 0);
    totalCompletions += completedToday;
  }

  const xp = totalCompletions * XP_PER_COMPLETION + perfectDays * XP_PER_PERFECT_DAY;
  const weekXp = weekKeys(today).reduce((sum, key) => sum + (xpByDay[key] ?? 0), 0);

  const habitStats: Record<string, HabitStats> = {};
  let bestHabitStreak = 0;
  for (const habit of state.habits) {
    const completions = completionCount(habit, state.logs);
    const best = bestStreak(habit, state.logs, today);
    bestHabitStreak = Math.max(bestHabitStreak, best);
    habitStats[habit.id] = {
      streak: currentStreak(habit, state.logs, today),
      best,
      completions,
      stage: plantStage(completions),
      wilted: isWilted(habit, state.logs, today),
    };
  }

  const coinsEarned = totalCompletions * COINS_PER_COMPLETION + perfectDays * COINS_PER_PERFECT_DAY + bonusCoins;

  return {
    xp,
    weekXp,
    level: levelFromXp(xp),
    coinsEarned,
    totalCompletions,
    perfectDays,
    dayStreak: computeDayStreak(completionsByDay, today),
    bestHabitStreak,
    categoryXp,
    completionsByDay,
    xpByDay,
    habitStats,
  };
}
