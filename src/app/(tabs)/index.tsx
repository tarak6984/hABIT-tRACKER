import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Mascot, type MascotMood } from '@/components/art/Mascot';
import { DateStrip } from '@/components/DateStrip';
import { HabitRow } from '@/components/HabitRow';
import { SlideToComplete } from '@/components/SlideToComplete';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { moodOptions, quotes } from '@/data/catalog';
import { useOpenHabitEditor } from '@/hooks/useOpenHabitEditor';
import { daysBetween, formatLongDate, greetingFor } from '@/lib/dates';
import { dayCompletion, goalTarget, habitsScheduledOn, isCompletedOn, progressOn } from '@/lib/gamification';
import { useStore } from '@/store/AppStore';
import type { Mood } from '@/store/types';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function heroMessage(done: number, total: number): string {
  if (total === 0) return 'A calm day. Enjoy the rest 🌤';
  if (done === total) return 'Perfect day! Your garden is glowing ✨';
  if (done === 0) return "Let's plant some progress today 🌱";
  if (done / total >= 0.5) return 'Over halfway there, keep blooming!';
  return 'Nice start! One habit at a time 💜';
}

export default function TodayScreen() {
  const { state, stats, today, coins, actions, dispatch, feedback } = useStore();
  const { colors, habitTint } = useTheme();
  const openEditor = useOpenHabitEditor();
  const [picked, setPicked] = useState({ day: today, pickedOn: today });
  const selected = picked.pickedOn === today ? picked.day : today;
  const setSelected = (day: string) => setPicked({ day, pickedOn: today });

  const isToday = selected === today;
  const scheduled = habitsScheduledOn(state.habits, selected);
  const { done, total, ratio } = dayCompletion(state.habits, state.logs, selected);
  const nextUp = isToday ? scheduled.find((habit) => !isCompletedOn(habit, state.logs, today)) : undefined;
  const quote = quotes[Math.abs(daysBetween('2025-01-01', today)) % quotes.length];
  const mascotMood: MascotMood = total > 0 && done === total ? 'joy' : new Date().getHours() >= 21 ? 'sleepy' : 'happy';
  const firstName = state.profile.name.split(' ')[0] || 'friend';

  return (
    <Screen hasTabBar>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel="Open profile">
          <Mascot id={state.profile.mascot} size={50} hasBackdrop mood={mascotMood} />
        </Pressable>
        <View style={styles.headerText}>
          <AppText variant="caption" tone="muted">
            {formatLongDate(today)}
          </AppText>
          <AppText variant="heading" numberOfLines={1}>
            {greetingFor(new Date())}, {firstName}!
          </AppText>
        </View>
        <IconButton icon="add" tone="primary" accessibilityLabel="Add a new habit" onPress={openEditor} />
      </View>

      <View style={styles.pills}>
        <View style={[styles.pill, { backgroundColor: colors.streakSoft }]}>
          <AppText variant="label" color={colors.streak}>
            🔥 {stats.dayStreak} day streak
          </AppText>
        </View>
        <Pressable onPress={() => router.push('/shop')} style={[styles.pill, { backgroundColor: colors.coinSoft }]} accessibilityRole="button" accessibilityLabel={`${coins} coins, open garden shop`}>
          <AppText variant="label" color={colors.coin}>
            🪙 {coins}
          </AppText>
        </Pressable>
        <View style={[styles.pill, { backgroundColor: colors.primarySoft }]}>
          <AppText variant="label" tone="primary">
            ⭐ Lv {stats.level.level}
          </AppText>
        </View>
      </View>

      <DateStrip selected={selected} onSelect={setSelected} />

      <Animated.View entering={FadeInDown.duration(500)}>
        <LinearGradient colors={['#8F7CFF', '#6C5CE7', '#5442D6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroBubble} />
          <View style={styles.heroText}>
            <AppText variant="label" color="rgba(255,255,255,0.8)">
              {isToday ? "Today's progress" : formatLongDate(selected)}
            </AppText>
            <AppText variant="display" color="#FFFFFF">
              {done}
              <AppText variant="title" color="rgba(255,255,255,0.7)">
                /{total}
              </AppText>
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.9)">
              {heroMessage(done, total)}
            </AppText>
            <View style={styles.levelRow}>
              <AppText variant="micro" color="#FFFFFF">
                LV {stats.level.level}
              </AppText>
              <View style={{ flex: 1 }}>
                <ProgressBar progress={stats.level.progress} height={8} colors={['#FFE38A', '#FFC93C']} trackColor="rgba(255,255,255,0.25)" />
              </View>
              <AppText variant="micro" color="rgba(255,255,255,0.85)">
                {stats.level.xpIntoLevel}/{stats.level.xpForNext} XP
              </AppText>
            </View>
          </View>
          <ProgressRing progress={ratio} size={108} strokeWidth={9} colors={['#FFE38A', '#FFFFFF']} trackColor="rgba(255,255,255,0.22)">
            <Mascot id={state.profile.mascot} size={74} mood={mascotMood} isAnimated />
          </ProgressRing>
        </LinearGradient>
      </Animated.View>

      {nextUp ? (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <SectionHeader title="Up next" />
          <Card style={styles.upNext}>
            <View style={styles.upNextTop}>
              <View style={[styles.upNextEmoji, { backgroundColor: habitTint(nextUp.color).soft }]}>
                <AppText style={styles.bigEmoji}>{nextUp.emoji}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="heading">{nextUp.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {nextUp.goal.kind === 'count' ? `Goal: ${nextUp.goal.target} ${nextUp.goal.unit}` : 'One tap closer to your goal'}
                </AppText>
              </View>
              <View style={[styles.goalBadge, { backgroundColor: habitTint(nextUp.color).base }]}>
                <AppText variant="micro" color="#FFFFFF">
                  +10 XP
                </AppText>
              </View>
            </View>
            <SlideToComplete
              key={nextUp.id}
              label="Slide when you're done"
              tint={habitTint(nextUp.color).base}
              onComplete={() => {
                feedback.success();
                actions.setProgress(nextUp.id, today, goalTarget(nextUp));
              }}
            />
            <AppText variant="caption" tone="soft" align="center">
              {done} done today · {total - done} to go
            </AppText>
          </Card>
        </Animated.View>
      ) : null}

      <SectionHeader title={isToday ? 'Your habits' : 'Habits that day'} actionLabel={state.habits.length > 0 ? '+ New' : undefined} onAction={openEditor} />

      {state.habits.length === 0 ? (
        <Card style={styles.empty}>
          <Mascot id={state.profile.mascot} size={96} mood="sleepy" isAnimated />
          <AppText variant="heading" align="center">
            Your garden is empty
          </AppText>
          <AppText variant="body" tone="muted" align="center">
            Plant your first habit and watch it grow into something beautiful.
          </AppText>
          <Button label="Plant a habit" icon="leaf" onPress={openEditor} style={styles.emptyButton} />
        </Card>
      ) : scheduled.length === 0 ? (
        <Card style={styles.empty}>
          <AppText style={styles.bigEmoji}>🌤</AppText>
          <AppText variant="subheading" align="center">
            Rest day, nothing scheduled
          </AppText>
        </Card>
      ) : (
        scheduled.map((habit, index) => (
          <Animated.View key={habit.id} entering={FadeInDown.delay(150 + index * 50).duration(400)}>
            <HabitRow
              habit={habit}
              value={progressOn(state.logs, habit.id, selected)}
              streak={stats.habitStats[habit.id]?.streak ?? 0}
              isEditable={selected <= today}
              onChange={(value) => actions.setProgress(habit.id, selected, value)}
              onOpen={() => router.push(`/habit/${habit.id}`)}
            />
          </Animated.View>
        ))
      )}

      {isToday ? (
        <>
          <SectionHeader title="How are you feeling?" />
          <Card style={styles.moodRow}>
            {moodOptions.map((option) => {
              const isSelected = state.moods[today] === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    feedback.select();
                    dispatch({ type: 'setMood', date: today, mood: option.value as Mood });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Mood: ${option.label}`}
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.mood, isSelected && { backgroundColor: colors.primarySoft, transform: [{ scale: 1.08 }] }]}
                >
                  <AppText style={[styles.moodEmoji, { opacity: state.moods[today] && !isSelected ? 0.45 : 1 }]}>{option.emoji}</AppText>
                  <AppText variant="micro" tone={isSelected ? 'primary' : 'soft'}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </Card>
        </>
      ) : null}

      <Card style={[styles.quote, { backgroundColor: colors.surfaceAlt }]}>
        <AppText variant="display" tone="primary" style={styles.quoteMark}>
          “
        </AppText>
        <AppText variant="bodyBold">{quote.text}</AppText>
        <AppText variant="caption" tone="muted">
          — {quote.author}
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headerText: { flex: 1 },
  pills: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.pill },
  hero: { marginTop: spacing.md, borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, overflow: 'hidden' },
  heroBubble: { position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -70, top: -80, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroText: { flex: 1, gap: 2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  upNext: { gap: spacing.md },
  upNextTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  upNextEmoji: { width: 60, height: 60, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 32, lineHeight: 40 },
  goalBadge: { paddingHorizontal: spacing.xs + 2, paddingVertical: 5, borderRadius: radii.sm },
  empty: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  emptyButton: { marginTop: spacing.sm, alignSelf: 'stretch' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  mood: { alignItems: 'center', paddingVertical: spacing.xs, paddingHorizontal: 6, borderRadius: radii.md, gap: 2, flex: 1 },
  moodEmoji: { fontSize: 30, lineHeight: 38 },
  quote: { marginTop: spacing.xl, gap: spacing.xs },
  quoteMark: { fontSize: 48, lineHeight: 48, marginBottom: -18 },
});
