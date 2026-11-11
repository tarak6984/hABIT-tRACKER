import { router } from 'expo-router';

import { FREE_HABIT_LIMIT } from '@/data/catalog';
import { useStore } from '@/store/AppStore';

export function useOpenHabitEditor() {
  const { state } = useStore();
  const isAtFreeLimit = !state.profile.isPremium && state.habits.length >= FREE_HABIT_LIMIT;

  return () => {
    if (isAtFreeLimit) {
      router.push({ pathname: '/premium', params: { reason: 'habits' } });
      return;
    }
    router.push('/habit/editor');
  };
}
