import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';

import { ME } from '@/data/community';
import { bonusCoins, completedChallengeIds } from '@/lib/achievements';
import { todayKey, type DateKey } from '@/lib/dates';
import { computeStats, type AppStats } from '@/lib/gamification';
import { haptics } from '@/lib/haptics';
import { createId } from '@/lib/ids';
import { cancelAllReminders, cancelReminders, scheduleHabitReminders } from '@/lib/notifications';
import { createInitialState, reducer, type Action } from '@/store/reducer';
import type { AppState, Habit, PostKind, Profile } from '@/store/types';

const STORAGE_KEY = 'bloomly:state:v1';

type Feedback = typeof haptics;

const silentFeedback: Feedback = { tap: () => {}, select: () => {}, success: () => {}, warning: () => {} };

type Actions = {
  setProgress: (habitId: string, date: DateKey, value: number) => void;
  saveHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  completeOnboarding: (profile: Pick<Profile, 'name' | 'mascot'>, habits: Habit[]) => Promise<void>;
  setRemindersEnabled: (isEnabled: boolean) => Promise<void>;
  share: (text: string, kind: PostKind, groupId?: string | null) => void;
  resetAll: () => Promise<void>;
};

type Store = {
  state: AppState;
  dispatch: (action: Action) => void;
  isHydrated: boolean;
  today: DateKey;
  stats: AppStats;
  coins: number;
  completedChallenges: string[];
  feedback: Feedback;
  actions: Actions;
};

const StoreContext = createContext<Store | null>(null);

function mergeWithDefaults(saved: Partial<AppState>): AppState {
  const defaults = createInitialState();
  return {
    ...defaults,
    ...saved,
    profile: { ...defaults.profile, ...saved.profile },
    settings: { ...defaults.settings, ...saved.settings },
  };
}

function useTodayKey(): DateKey {
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const refresh = () => setToday(todayKey());
    const subscription = RNAppState.addEventListener('change', (status) => {
      if (status === 'active') refresh();
    });
    const interval = setInterval(refresh, 60_000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);
  return today;
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const today = useTodayKey();
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'hydrate', state: mergeWithDefaults(JSON.parse(raw) as Partial<AppState>) });
      })
      .catch((error: unknown) => console.warn('[store] could not load saved data, starting fresh', error))
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error: unknown) =>
        console.warn('[store] could not save data', error),
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [state, isHydrated]);

  const completedChallenges = useMemo(
    () => completedChallengeIds(state, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.joinedChallenges, state.habits, state.logs, today],
  );

  const stats = useMemo(
    () => computeStats(state, today, bonusCoins(state, completedChallenges)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.habits, state.logs, state.retiredCompletions, state.unlockedBadges, completedChallenges, today],
  );

  const feedback = state.settings.haptics ? haptics : silentFeedback;

  const actions = useMemo<Actions>(() => {
    const withReminders = async (habit: Habit): Promise<Habit> => {
      if (!stateRef.current.settings.remindersEnabled || !habit.reminder) return { ...habit, notificationIds: [] };
      const notificationIds = await scheduleHabitReminders(habit);
      return { ...habit, notificationIds };
    };

    return {
      setProgress: (habitId, date, value) => dispatch({ type: 'setProgress', habitId, date, value }),

      saveHabit: async (habit) => {
        const previous = stateRef.current.habits.find((candidate) => candidate.id === habit.id);
        if (previous) await cancelReminders(previous.notificationIds);
        dispatch({ type: 'upsertHabit', habit: await withReminders(habit) });
      },

      deleteHabit: async (habitId) => {
        const habit = stateRef.current.habits.find((candidate) => candidate.id === habitId);
        if (habit) await cancelReminders(habit.notificationIds);
        dispatch({ type: 'deleteHabit', habitId });
      },

      completeOnboarding: async (profile, habits) => {
        const scheduled = await Promise.all(habits.map(withReminders));
        dispatch({ type: 'completeOnboarding', profile, habits: scheduled });
      },

      setRemindersEnabled: async (isEnabled) => {
        dispatch({ type: 'updateSettings', patch: { remindersEnabled: isEnabled } });
        stateRef.current = { ...stateRef.current, settings: { ...stateRef.current.settings, remindersEnabled: isEnabled } };
        await cancelAllReminders();
        for (const habit of stateRef.current.habits) {
          dispatch({ type: 'upsertHabit', habit: await withReminders(habit) });
        }
      },

      share: (text, kind, groupId = null) =>
        dispatch({
          type: 'addPost',
          post: { id: createId('post'), authorId: ME, kind, text, createdAt: new Date().toISOString(), groupId, baseCheers: 0 },
        }),

      resetAll: async () => {
        await cancelAllReminders();
        await AsyncStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'reset' });
      },
    };
  }, []);

  const value = useMemo<Store>(
    () => ({
      state,
      dispatch,
      isHydrated,
      today,
      stats,
      coins: stats.coinsEarned - state.coinsSpent,
      completedChallenges,
      feedback,
      actions,
    }),
    [state, isHydrated, today, stats, completedChallenges, feedback, actions],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <AppStoreProvider>');
  return store;
}
