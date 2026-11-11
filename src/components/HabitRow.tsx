import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { ProgressRing } from '@/components/ui/Progress';
import { goalTarget } from '@/lib/gamification';
import { useStore } from '@/store/AppStore';
import type { Habit } from '@/store/types';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type HabitRowProps = {
  habit: Habit;
  value: number;
  streak: number;
  isEditable: boolean;
  onChange: (value: number) => void;
  onOpen: () => void;
};

export function countStep(target: number): number {
  return target >= 20 ? 5 : 1;
}

export function HabitRow({ habit, value, streak, isEditable, onChange, onOpen }: HabitRowProps) {
  const { colors, habitTint } = useTheme();
  const { feedback } = useStore();
  const tint = habitTint(habit.color);
  const target = goalTarget(habit);
  const isDone = value >= target;
  const pop = useSharedValue(1);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const handleAction = () => {
    pop.set(withSequence(withTiming(0.82, { duration: 90 }), withSpring(1, { damping: 8, stiffness: 260 })));
    if (habit.goal.kind === 'check') {
      onChange(isDone ? 0 : 1);
      if (isDone) feedback.tap();
      else feedback.success();
      return;
    }
    const next = isDone ? 0 : Math.min(target, value + countStep(target));
    onChange(next);
    if (next >= target) feedback.success();
    else feedback.tap();
  };

  const subtitle =
    habit.goal.kind === 'count' ? `${value}/${habit.goal.target} ${habit.goal.unit}` : isDone ? 'Done for today' : 'Tap to complete';

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${habit.name}, ${subtitle}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: isDone ? tint.soft : colors.surface, borderColor: isDone ? 'transparent' : colors.border },
        pressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <View style={[styles.emojiTile, { backgroundColor: isDone ? colors.surface : tint.soft }]}>
        <AppText style={styles.emoji}>{habit.emoji}</AppText>
      </View>
      <View style={styles.text}>
        <AppText variant="subheading" numberOfLines={1}>
          {habit.name}
        </AppText>
        <View style={styles.meta}>
          {streak > 0 ? (
            <AppText variant="caption" color={colors.streak}>
              🔥 {streak}
            </AppText>
          ) : null}
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
      </View>
      <Pressable
        onPress={handleAction}
        onLongPress={() => {
          if (!isEditable || value === 0) return;
          feedback.warning();
          onChange(0);
        }}
        disabled={!isEditable}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={isDone ? `Undo ${habit.name}` : habit.goal.kind === 'count' ? `Add to ${habit.name}` : `Complete ${habit.name}`}
        accessibilityState={{ checked: isDone, disabled: !isEditable }}
      >
        <Animated.View style={[popStyle, !isEditable && { opacity: 0.4 }]}>
          {habit.goal.kind === 'count' && !isDone ? (
            <ProgressRing progress={value / target} size={44} strokeWidth={4} colors={tint.gradient} trackColor={colors.surfaceSunken}>
              <Icon name="add" size={22} color={tint.base} />
            </ProgressRing>
          ) : (
            <View style={[styles.check, isDone ? { backgroundColor: tint.base, borderColor: tint.base } : { borderColor: colors.border }]}>
              {isDone ? <Icon name="checkmark" size={24} color="#FFFFFF" /> : null}
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  emojiTile: { width: 52, height: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26, lineHeight: 32 },
  text: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  check: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
});
