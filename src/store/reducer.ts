import { completionCount } from '@/lib/gamification';
import { todayKey, type DateKey } from '@/lib/dates';
import type { AppState, Group, Habit, Mood, PlanId, Post, Profile, Settings } from '@/store/types';

export function createInitialState(): AppState {
  return {
    version: 1,
    profile: { name: '', mascot: 'sprout', onboarded: false, joinedAt: todayKey(), isPremium: false, premiumPlan: null },
    settings: { theme: 'system', haptics: true, remindersEnabled: true },
    habits: [],
    logs: {},
    retiredCompletions: 0,
    moods: {},
    unlockedBadges: {},
    celebratedLevel: 1,
    celebrationQueue: [],
    coinsSpent: 0,
    ownedDecor: [],
    placedDecor: [],
    joinedGroupIds: [],
    customGroups: [],
    joinedChallenges: [],
    myPosts: [],
    cheeredPostIds: [],
  };
}

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'completeOnboarding'; profile: Pick<Profile, 'name' | 'mascot'>; habits: Habit[] }
  | { type: 'setProgress'; habitId: string; date: DateKey; value: number }
  | { type: 'upsertHabit'; habit: Habit }
  | { type: 'deleteHabit'; habitId: string }
  | { type: 'setMood'; date: DateKey; mood: Mood }
  | { type: 'unlockBadges'; badgeIds: string[]; date: DateKey }
  | { type: 'celebrateLevel'; level: number }
  | { type: 'dismissCelebration' }
  | { type: 'buyDecor'; decorId: string; price: number }
  | { type: 'toggleDecor'; decorId: string }
  | { type: 'joinGroup'; groupId: string }
  | { type: 'leaveGroup'; groupId: string }
  | { type: 'createGroup'; group: Group }
  | { type: 'joinChallenge'; challengeId: string; date: DateKey }
  | { type: 'leaveChallenge'; challengeId: string }
  | { type: 'addPost'; post: Post }
  | { type: 'deletePost'; postId: string }
  | { type: 'toggleCheer'; postId: string }
  | { type: 'updateProfile'; patch: Partial<Pick<Profile, 'name' | 'mascot'>> }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'setPremium'; plan: PlanId | null }
  | { type: 'reset' };

const without = <T,>(items: T[], item: T) => items.filter((candidate) => candidate !== item);

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;

    case 'completeOnboarding':
      return {
        ...state,
        profile: { ...state.profile, ...action.profile, onboarded: true, joinedAt: todayKey() },
        habits: action.habits,
      };

    case 'setProgress': {
      const day = { ...(state.logs[action.date] ?? {}) };
      if (action.value <= 0) delete day[action.habitId];
      else day[action.habitId] = action.value;
      const logs = { ...state.logs };
      if (Object.keys(day).length === 0) delete logs[action.date];
      else logs[action.date] = day;
      return { ...state, logs };
    }

    case 'upsertHabit': {
      const exists = state.habits.some((habit) => habit.id === action.habit.id);
      const habits = exists
        ? state.habits.map((habit) => (habit.id === action.habit.id ? action.habit : habit))
        : [...state.habits, action.habit];
      return { ...state, habits };
    }

    case 'deleteHabit': {
      const habit = state.habits.find((candidate) => candidate.id === action.habitId);
      if (!habit) return state;
      const logs: AppState['logs'] = {};
      for (const [date, day] of Object.entries(state.logs)) {
        const { [action.habitId]: _removed, ...rest } = day;
        if (Object.keys(rest).length > 0) logs[date] = rest;
      }
      return {
        ...state,
        habits: state.habits.filter((candidate) => candidate.id !== action.habitId),
        logs,
        retiredCompletions: state.retiredCompletions + completionCount(habit, state.logs),
      };
    }

    case 'setMood':
      return { ...state, moods: { ...state.moods, [action.date]: action.mood } };

    case 'unlockBadges': {
      const fresh = action.badgeIds.filter((id) => !state.unlockedBadges[id]);
      if (fresh.length === 0) return state;
      const unlockedBadges = { ...state.unlockedBadges };
      for (const id of fresh) unlockedBadges[id] = action.date;
      return {
        ...state,
        unlockedBadges,
        celebrationQueue: [...state.celebrationQueue, ...fresh.map((badgeId) => ({ kind: 'badge' as const, badgeId }))],
      };
    }

    case 'celebrateLevel':
      if (action.level <= state.celebratedLevel) return state;
      return {
        ...state,
        celebratedLevel: action.level,
        celebrationQueue: [...state.celebrationQueue, { kind: 'level', level: action.level }],
      };

    case 'dismissCelebration':
      return { ...state, celebrationQueue: state.celebrationQueue.slice(1) };

    case 'buyDecor':
      if (state.ownedDecor.includes(action.decorId)) return state;
      return {
        ...state,
        coinsSpent: state.coinsSpent + action.price,
        ownedDecor: [...state.ownedDecor, action.decorId],
        placedDecor: [...state.placedDecor, action.decorId],
      };

    case 'toggleDecor':
      return {
        ...state,
        placedDecor: state.placedDecor.includes(action.decorId)
          ? without(state.placedDecor, action.decorId)
          : [...state.placedDecor, action.decorId],
      };

    case 'joinGroup':
      if (state.joinedGroupIds.includes(action.groupId)) return state;
      return { ...state, joinedGroupIds: [...state.joinedGroupIds, action.groupId] };

    case 'leaveGroup':
      return {
        ...state,
        joinedGroupIds: without(state.joinedGroupIds, action.groupId),
        customGroups: state.customGroups.filter((group) => group.id !== action.groupId),
      };

    case 'createGroup':
      return { ...state, customGroups: [...state.customGroups, action.group] };

    case 'joinChallenge':
      if (state.joinedChallenges.some((join) => join.challengeId === action.challengeId)) return state;
      return {
        ...state,
        joinedChallenges: [...state.joinedChallenges, { challengeId: action.challengeId, joinedAt: action.date }],
      };

    case 'leaveChallenge':
      return {
        ...state,
        joinedChallenges: state.joinedChallenges.filter((join) => join.challengeId !== action.challengeId),
      };

    case 'addPost':
      return { ...state, myPosts: [action.post, ...state.myPosts] };

    case 'deletePost':
      return { ...state, myPosts: state.myPosts.filter((post) => post.id !== action.postId) };

    case 'toggleCheer':
      return {
        ...state,
        cheeredPostIds: state.cheeredPostIds.includes(action.postId)
          ? without(state.cheeredPostIds, action.postId)
          : [...state.cheeredPostIds, action.postId],
      };

    case 'updateProfile':
      return { ...state, profile: { ...state.profile, ...action.patch } };

    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'setPremium':
      return { ...state, profile: { ...state.profile, isPremium: action.plan !== null, premiumPlan: action.plan } };

    case 'reset':
      return createInitialState();
  }
}
