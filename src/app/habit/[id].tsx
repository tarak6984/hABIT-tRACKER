import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Plant } from '@/components/art/Plant';
import { countStep } from '@/components/HabitRow';
import { SlideToComplete } from '@/components/SlideToComplete';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressRing } from '@/components/ui/Progress';
import { Screen, ScreenHeader, SectionHeader } from '@/components/ui/Screen';
import { StatTile } from '@/components/ui/StatTile';
import { categories, PLANT_STAGE_NAMES, plants } from '@/data/catalog';
import { formatTime, fromDateKey, lastNDays, MONTH_LONG, monthGrid, WEEKDAY_LETTER, WEEKDAY_SHORT } from '@/lib/dates';
import { completionRate, completionsToNextStage, goalTarget, isScheduledOn, progressOn } from '@/lib/gamification';
import { useStore } from '@/store/AppStore';
import type { Habit } from '@/store/types';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function scheduleLabel(habit: Habit): string {
  if (habit.days.length === 7) return 'Every day';
  if (habit.days.length === 5 && !habit.days.includes(0) && !habit.days.includes(6)) return 'Weekdays';
  if (habit.days.length === 2 && habit.days.includes(0) && habit.days.includes(6)) return 'Weekends';
  return habit.days.map((day) => WEEKDAY_SHORT[day]).join(', ');
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, stats, today, actions, feedback } = useStore();
  const { colors, habitTint } = useTheme();
  const todayDate = fromDateKey(today);
  const [month, setMonth] = useState({ year: todayDate.getFullYear(), month: todayDate.getMonth() });
  const habit = state.habits.find((candidate) => candidate.id === id);

  if (!habit) {
    return (
      <Screen>
        <ScreenHeader title="Habit" />
        <AppText variant="body" tone="muted" align="center">
          This habit no longer exists.
        </AppText>
      </Screen>
    );
  }

  const tint = habitTint(habit.color);
  const habitStats = stats.habitStats[habit.id];
  const target = goalTarget(habit);
  const value = progressOn(state.logs, habit.id, today);
  const isDone = value >= target;
  const isScheduledToday = isScheduledOn(habit, today);
  const toNext = completionsToNextStage(habitStats?.completions ?? 0);
  const stage = habitStats?.stage ?? 0;
  const rate = Math.round(completionRate(habit, state.logs, lastNDays(today, 30)) * 100);
  const cells = monthGrid(month.year, month.month);
  const isCurrentMonth = month.year === todayDate.getFullYear() && month.month === todayDate.getMonth();

  const shiftMonth = (delta: number) => {
    const date = new Date(month.year, month.month + delta, 1);
    setMonth({ year: date.getFullYear(), month: date.getMonth() });
  };

  const setToday = (next: number) => actions.setProgress(habit.id, today, Math.max(0, Math.min(target, next)));

  return (
    <Screen>
      <ScreenHeader
        title={habit.name}
        right={<IconButton icon="create-outline" accessibilityLabel="Edit habit" onPress={() => router.push({ pathname: '/habit/editor', params: { id: habit.id } })} />}
      />

      <LinearGradient colors={tint.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} />
        <Animated.View entering={ZoomIn.springify()} key={`${stage}-${habitStats?.wilted}`}>
          <Plant species={habit.plant} stage={stage} size={150} isWilted={habitStats?.wilted} />
        </Animated.View>
        <View style={styles.heroText}>
          <AppText variant="micro" color="rgba(255,255,255,0.85)">
            {plants[habit.plant].name.toUpperCase()}
          </AppText>
          <AppText variant="title" color="#FFFFFF">
            {habitStats?.wilted ? 'Thirsty…' : PLANT_STAGE_NAMES[stage]}
          </AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.92)">
            {habitStats?.wilted
              ? 'Complete it today to revive your plant'
              : toNext === null
                ? 'Fully grown. Keep it thriving! 🌟'
                : `${toNext} more check-in${toNext === 1 ? '' : 's'} to grow`}
          </AppText>
          <View style={styles.heroChip}>
            <AppText variant="label" color="#FFFFFF">
              {habit.emoji} {categories[habit.category].label}
            </AppText>
          </View>
        </View>
      </LinearGradient>

      <SectionHeader title="Today" />
      {!isScheduledToday ? (
        <Card>
          <AppText variant="body" tone="muted">
            Not scheduled today. Enjoy the break! 🌤
          </AppText>
        </Card>
      ) : habit.goal.kind === 'count' ? (
        <Card style={styles.counter}>
          <Pressable onPress={() => { feedback.tap(); setToday(value - countStep(target)); }} accessibilityRole="button" accessibilityLabel="Decrease" style={[styles.counterButton, { backgroundColor: colors.surfaceSunken }]}>
            <Icon name="remove" size={26} color={colors.text} />
          </Pressable>
          <ProgressRing progress={value / target} size={130} strokeWidth={12} colors={tint.gradient}>
            <AppText variant="display">{value}</AppText>
            <AppText variant="caption" tone="muted">
              of {target} {habit.goal.unit}
            </AppText>
          </ProgressRing>
          <Pressable
            onPress={() => {
              const next = Math.min(target, value + countStep(target));
              if (next >= target && !isDone) feedback.success();
              else feedback.tap();
              setToday(next);
            }}
            accessibilityRole="button"
            accessibilityLabel="Increase"
            style={[styles.counterButton, { backgroundColor: tint.base }]}
          >
            <Icon name="add" size={26} color="#FFFFFF" />
          </Pressable>
        </Card>
      ) : isDone ? (
        <Card style={[styles.doneCard, { backgroundColor: tint.soft }]}>
          <View style={[styles.doneCheck, { backgroundColor: tint.base }]}>
            <Icon name="checkmark" size={26} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="subheading">Done for today!</AppText>
            <AppText variant="caption" tone="muted">
              +10 XP · your plant got watered 💧
            </AppText>
          </View>
          <Button label="Undo" variant="ghost" size="sm" onPress={() => setToday(0)} />
        </Card>
      ) : (
        <SlideToComplete
          label="Slide when you're done"
          tint={tint.base}
          onComplete={() => {
            feedback.success();
            setToday(target);
          }}
        />
      )}

      <View style={styles.tiles}>
        <StatTile icon="flame" value={String(habitStats?.streak ?? 0)} label="Current streak" tint={colors.streak} tintSoft={colors.streakSoft} />
        <StatTile icon="trophy" value={String(habitStats?.best ?? 0)} label="Best streak" tint={colors.coin} tintSoft={colors.coinSoft} />
      </View>
      <View style={styles.tiles}>
        <StatTile icon="checkmark-done" value={String(habitStats?.completions ?? 0)} label="Total check-ins" tint={colors.success} tintSoft={colors.successSoft} />
        <StatTile icon="analytics" value={`${rate}%`} label="Last 30 days" tint={colors.primary} tintSoft={colors.primarySoft} />
      </View>

      <SectionHeader title="History" />
      <Card>
        <View style={styles.monthHeader}>
          <IconButton icon="chevron-back" tone="clear" size={36} accessibilityLabel="Previous month" onPress={() => shiftMonth(-1)} />
          <AppText variant="subheading">
            {MONTH_LONG[month.month]} {month.year}
          </AppText>
          {isCurrentMonth ? <View style={{ width: 36 }} /> : <IconButton icon="chevron-forward" tone="clear" size={36} accessibilityLabel="Next month" onPress={() => shiftMonth(1)} />}
        </View>
        <View style={styles.weekLabels}>
          {[1, 2, 3, 4, 5, 6, 0].map((day) => (
            <AppText key={day} variant="micro" tone="soft" align="center" style={styles.calendarCell}>
              {WEEKDAY_LETTER[day]}
            </AppText>
          ))}
        </View>
        <View style={styles.calendar}>
          {cells.map((key, index) => {
            if (!key) return <View key={`blank-${index}`} style={styles.calendarCell} />;
            const isFuture = key > today;
            const isTracked = key >= habit.createdAt && !isFuture;
            const isComplete = progressOn(state.logs, habit.id, key) >= target;
            const isMissed = isTracked && !isComplete && key < today && isScheduledOn(habit, key);
            return (
              <Pressable
                key={key}
                disabled={!isTracked}
                onPress={() => {
                  feedback.select();
                  actions.setProgress(habit.id, key, isComplete ? 0 : target);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${key}${isComplete ? ', completed' : ''}`}
                style={styles.calendarCell}
              >
                <View
                  style={[
                    styles.calendarDay,
                    isComplete && { backgroundColor: tint.base },
                    isMissed && { backgroundColor: colors.dangerSoft },
                    key === today && !isComplete && { borderWidth: 2, borderColor: tint.base },
                  ]}
                >
                  <AppText variant="label" color={isComplete ? '#FFFFFF' : isFuture || !isTracked ? colors.textSoft : colors.text}>
                    {fromDateKey(key).getDate()}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
        <AppText variant="caption" tone="soft" align="center">
          Tap a past day to log or undo it
        </AppText>
      </Card>

      <SectionHeader title="Details" />
      <Card style={{ gap: spacing.sm }}>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={18} color={tint.base} />
          <AppText variant="body">{scheduleLabel(habit)}</AppText>
        </View>
        <View style={styles.detailRow}>
          <Icon name="notifications-outline" size={18} color={tint.base} />
          <AppText variant="body">{habit.reminder ? `Reminder at ${formatTime(habit.reminder.hour, habit.reminder.minute)}` : 'No reminder'}</AppText>
        </View>
        <View style={styles.detailRow}>
          <Icon name="flag-outline" size={18} color={tint.base} />
          <AppText variant="body">{habit.goal.kind === 'count' ? `${habit.goal.target} ${habit.goal.unit} per day` : 'Complete once per day'}</AppText>
        </View>
      </Card>

      <Button
        label="Share my progress"
        icon="share-social-outline"
        variant="secondary"
        style={{ marginTop: spacing.lg }}
        onPress={() => {
          const streak = habitStats?.streak ?? 0;
          actions.share(
            streak > 1 ? `${streak}-day streak on "${habit.name}" ${habit.emoji} My ${plants[habit.plant].name.toLowerCase()} is growing!` : `Working on "${habit.name}" ${habit.emoji} one day at a time 🌱`,
            streak > 1 ? 'streak' : 'text',
          );
          Alert.alert('Shared!', 'Your progress is now on the community feed.');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radii.xl, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, left: -40, top: -30, backgroundColor: 'rgba(255,255,255,0.22)' },
  heroText: { flex: 1, gap: 2 },
  heroChip: { alignSelf: 'flex-start', marginTop: spacing.xs, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radii.pill },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counterButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  doneCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 0 },
  doneCheck: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  weekLabels: { flexDirection: 'row', marginBottom: 4 },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xs },
  calendarCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  calendarDay: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
