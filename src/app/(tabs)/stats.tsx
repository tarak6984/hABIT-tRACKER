import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { BarChart, DonutChart, Heatmap } from '@/components/charts';
import { PremiumLock } from '@/components/PremiumLock';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { StatTile } from '@/components/ui/StatTile';
import { categories, categoryIds, moodOptions } from '@/data/catalog';
import { addDays, fromDateKey, lastNDays, MONTH_SHORT, startOfWeek, WEEKDAY_LETTER, WEEKDAY_SHORT, weekKeys, type DateKey } from '@/lib/dates';
import { completionRate, dayCompletion, habitsScheduledOn, isCompletedOn } from '@/lib/gamification';
import { useStore } from '@/store/AppStore';
import { habitColors, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Period = 'week' | 'month' | 'year';

const PERIODS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] as const;

const HEATMAP_WEEKS = 18;

export default function StatsScreen() {
  const { state, stats, today } = useStore();
  const { colors, habitTint } = useTheme();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<Period>('week');

  const periodKeys: DateKey[] =
    period === 'week' ? weekKeys(today) : period === 'month' ? lastNDays(today, 30) : lastNDays(today, 365);
  const pastKeys = periodKeys.filter((key) => key <= today);

  const bars =
    period === 'week'
      ? periodKeys.map((key) => ({ label: WEEKDAY_LETTER[fromDateKey(key).getDay()], value: stats.completionsByDay[key] ?? 0, isHighlighted: key === today }))
      : period === 'month'
        ? periodKeys.map((key, index) => ({ label: index % 5 === 0 ? String(fromDateKey(key).getDate()) : '', value: stats.completionsByDay[key] ?? 0, isHighlighted: key === today }))
        : Array.from({ length: 12 }, (_, index) => {
            const monthDate = fromDateKey(today);
            monthDate.setDate(1);
            monthDate.setMonth(monthDate.getMonth() - 11 + index);
            const prefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
            const value = Object.entries(stats.completionsByDay)
              .filter(([key]) => key.startsWith(prefix))
              .reduce((sum, [, count]) => sum + count, 0);
            return { label: MONTH_SHORT[monthDate.getMonth()][0], value, isHighlighted: index === 11 };
          });

  let scheduledCount = 0;
  let completedCount = 0;
  let perfectCount = 0;
  let periodXp = 0;
  for (const key of pastKeys) {
    const { done, total } = dayCompletion(state.habits, state.logs, key);
    scheduledCount += total;
    completedCount += done;
    if (total > 0 && done === total) perfectCount += 1;
    periodXp += stats.xpByDay[key] ?? 0;
  }
  const rate = scheduledCount === 0 ? 0 : Math.round((completedCount / scheduledCount) * 100);

  const categoryTotal = categoryIds.reduce((sum, id) => sum + stats.categoryXp[id], 0);
  const last30 = lastNDays(today, 30);
  const last7 = lastNDays(today, 7);

  const heatmapStart = addDays(startOfWeek(today), -(HEATMAP_WEEKS - 1) * 7);
  const heatmapColumns = Array.from({ length: HEATMAP_WEEKS }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const key = addDays(heatmapStart, week * 7 + day);
      if (key > today) return -1;
      return dayCompletion(state.habits, state.logs, key).ratio;
    }),
  );
  const cellSize = Math.floor((width - spacing.lg * 2 - spacing.md * 2 - (HEATMAP_WEEKS - 1) * 3) / HEATMAP_WEEKS);

  const weekdayTotals = Array.from({ length: 7 }, () => 0);
  for (const [key, count] of Object.entries(stats.completionsByDay)) weekdayTotals[fromDateKey(key).getDay()] += count;
  const bestWeekday = weekdayTotals.indexOf(Math.max(...weekdayTotals));
  const ranked = [...state.habits]
    .map((habit) => ({ habit, rate: completionRate(habit, state.logs, last30) }))
    .sort((a, b) => b.rate - a.rate);
  const mostConsistent = ranked[0];
  const needsLove = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;
  const scheduledToday = habitsScheduledOn(state.habits, today).length;

  return (
    <Screen hasTabBar>
      <AppText variant="title" style={styles.title}>
        Statistics
      </AppText>
      <AppText variant="body" tone="muted" style={styles.subtitle}>
        Every bar is a step you took 💪
      </AppText>
      <Segmented options={PERIODS} value={period} onChange={setPeriod} />

      <View style={styles.tiles}>
        <StatTile icon="checkmark-done" value={String(completedCount)} label="Completed" tint={colors.success} tintSoft={colors.successSoft} />
        <StatTile icon="pie-chart" value={`${rate}%`} label="Success rate" tint={colors.primary} tintSoft={colors.primarySoft} />
      </View>
      <View style={styles.tiles}>
        <StatTile icon="sparkles" value={String(perfectCount)} label="Perfect days" tint={colors.coin} tintSoft={colors.coinSoft} />
        <StatTile icon="flash" value={String(periodXp)} label="XP earned" tint={colors.streak} tintSoft={colors.streakSoft} />
      </View>

      <SectionHeader title="Activity" />
      <Card>
        <BarChart data={bars} height={150} />
      </Card>

      <SectionHeader title="XP by category" />
      <Card style={styles.donutCard}>
        <DonutChart segments={categoryIds.map((id) => ({ value: stats.categoryXp[id], color: habitColors[categories[id].color].base }))}>
          <AppText variant="display">{stats.xp}</AppText>
          <AppText variant="caption" tone="muted">
            Total XP
          </AppText>
        </DonutChart>
        <View style={styles.legend}>
          {categoryIds.map((id) => (
            <View key={id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: habitColors[categories[id].color].base }]} />
              <AppText variant="caption" tone="muted">
                {categories[id].label}
              </AppText>
              <AppText variant="label">{categoryTotal === 0 ? '0%' : `${Math.round((stats.categoryXp[id] / categoryTotal) * 100)}%`}</AppText>
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Mood this week" />
      <Card style={styles.moodRow}>
        {last7.map((key) => {
          const mood = state.moods[key];
          const option = moodOptions.find((candidate) => candidate.value === mood);
          return (
            <View key={key} style={styles.moodDay}>
              <AppText style={[styles.moodEmoji, !option && { opacity: 0.25 }]}>{option?.emoji ?? '⚪'}</AppText>
              <AppText variant="micro" tone="soft">
                {WEEKDAY_SHORT[fromDateKey(key).getDay()]}
              </AppText>
            </View>
          );
        })}
      </Card>

      <SectionHeader title="Habit consistency · 30 days" />
      {state.habits.length === 0 ? (
        <AppText variant="body" tone="muted">
          Add habits to see how consistent you are.
        </AppText>
      ) : (
        <Card style={{ gap: spacing.md }}>
          {ranked.map(({ habit, rate: habitRate }) => (
            <View key={habit.id} style={{ gap: 6 }}>
              <View style={styles.habitLine}>
                <AppText variant="bodyBold" style={{ flex: 1 }} numberOfLines={1}>
                  {habit.emoji} {habit.name}
                </AppText>
                <AppText variant="caption" color={colors.streak}>
                  🔥 {stats.habitStats[habit.id]?.streak ?? 0}
                </AppText>
                <AppText variant="label">{Math.round(habitRate * 100)}%</AppText>
              </View>
              <ProgressBar progress={habitRate} height={8} colors={habitTint(habit.color).gradient} />
            </View>
          ))}
        </Card>
      )}

      <SectionHeader title="Advanced insights" />
      <PremiumLock title="Deeper insights with Premium" description="See your year-long heatmap, best days and personalized tips.">
        <Card style={{ gap: spacing.md }}>
          <AppText variant="subheading">Consistency heatmap</AppText>
          <Heatmap columns={heatmapColumns} color={colors.success} cellSize={Math.max(8, cellSize)} />
          <View style={styles.insight}>
            <AppText style={styles.insightEmoji}>📅</AppText>
            <AppText variant="body" style={{ flex: 1 }}>
              <AppText variant="bodyBold">{WEEKDAY_SHORT[bestWeekday]}</AppText> is your power day: {weekdayTotals[bestWeekday]} completions so far.
            </AppText>
          </View>
          {mostConsistent ? (
            <View style={styles.insight}>
              <AppText style={styles.insightEmoji}>🏆</AppText>
              <AppText variant="body" style={{ flex: 1 }}>
                <AppText variant="bodyBold">{mostConsistent.habit.name}</AppText> is your most consistent habit at {Math.round(mostConsistent.rate * 100)}%.
              </AppText>
            </View>
          ) : null}
          {needsLove && needsLove.rate < 0.6 ? (
            <View style={styles.insight}>
              <AppText style={styles.insightEmoji}>🌱</AppText>
              <AppText variant="body" style={{ flex: 1 }}>
                <AppText variant="bodyBold">{needsLove.habit.name}</AppText> could use some love. Try a reminder or a smaller goal.
              </AppText>
            </View>
          ) : null}
          <View style={styles.insight}>
            <AppText style={styles.insightEmoji}>⏱</AppText>
            <AppText variant="body" style={{ flex: 1 }}>
              {scheduledToday > 0
                ? `${habitsScheduledOn(state.habits, today).filter((habit) => isCompletedOn(habit, state.logs, today)).length} of ${scheduledToday} done today. Best streak ever: ${stats.bestHabitStreak} days.`
                : `Best streak ever: ${stats.bestHabitStreak} days.`}
            </AppText>
          </View>
        </Card>
      </PremiumLock>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  subtitle: { marginBottom: spacing.md },
  tiles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  donutCard: { alignItems: 'center', gap: spacing.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: '28%' },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodDay: { alignItems: 'center', gap: 2, flex: 1 },
  moodEmoji: { fontSize: 24, lineHeight: 30 },
  habitLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  insight: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  insightEmoji: { fontSize: 20, lineHeight: 24 },
});
