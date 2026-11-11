import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { LifeTree } from '@/components/art/LifeTree';
import { Plant } from '@/components/art/Plant';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { decorItems, PLANT_STAGE_NAMES, PLANT_STAGE_THRESHOLDS } from '@/data/catalog';
import { useOpenHabitEditor } from '@/hooks/useOpenHabitEditor';
import { completionsToNextStage, dayCompletion } from '@/lib/gamification';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Sky = { gradient: readonly [string, string, string]; isNight: boolean; label: string };

function skyFor(hour: number, isDark: boolean): Sky {
  if (isDark || hour >= 21 || hour < 5) return { gradient: ['#2C2766', '#2A2F6B', '#17213D'], isNight: true, label: 'Starry night' };
  if (hour < 10) return { gradient: ['#FFD9BF', '#FFF0E3', '#E3F7EA'], isNight: false, label: 'Golden morning' };
  if (hour < 17) return { gradient: ['#B9E0FF', '#E6F4FF', '#E2F8EA'], isNight: false, label: 'Sunny day' };
  return { gradient: ['#FFB39E', '#FFD6C6', '#EEE4FF'], isNight: false, label: 'Sunset glow' };
}

const DECOR_SPOTS = [
  { left: '4%', top: '6%' }, { right: '4%', top: '10%' }, { left: '2%', top: '62%' }, { right: '3%', top: '58%' },
  { left: '18%', top: '84%' }, { right: '18%', top: '86%' }, { left: '40%', top: '-2%' }, { left: '10%', top: '34%' },
  { right: '10%', top: '34%' }, { left: '44%', top: '92%' },
] as const;

export default function GardenScreen() {
  const { state, stats, today, coins } = useStore();
  const { colors, isDark } = useTheme();
  const openEditor = useOpenHabitEditor();
  const sky = skyFor(new Date().getHours(), isDark);
  const { ratio, done, total } = dayCompletion(state.habits, state.logs, today);
  const textColor = sky.isNight ? '#FFFFFF' : '#1F1A3D';
  const placed = decorItems.filter((item) => state.placedDecor.includes(item.id));
  const habitStats = state.habits.map((habit) => ({ habit, stats: stats.habitStats[habit.id] }));
  const blooming = habitStats.filter(({ stats: entry }) => entry?.stage === 4).length;
  const wilted = habitStats.filter(({ stats: entry }) => entry?.wilted).length;

  return (
    <Screen hasTabBar gradient={sky.gradient}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color={sky.isNight ? 'rgba(255,255,255,0.7)' : colors.textMuted}>
            {sky.label}
          </AppText>
          <AppText variant="title" color={textColor}>
            My Garden
          </AppText>
        </View>
        <View style={[styles.coins, { backgroundColor: 'rgba(255,255,255,0.75)' }]}>
          <AppText variant="label" color="#B07F00">
            🪙 {coins}
          </AppText>
        </View>
        <IconButton icon="storefront-outline" accessibilityLabel="Open garden shop" onPress={() => router.push('/shop')} />
      </View>

      <Animated.View entering={FadeIn.duration(600)} style={styles.scene}>
        {placed.map((item, index) => (
          <Animated.View key={item.id} entering={ZoomIn.delay(200 + index * 80)} style={[styles.decor, DECOR_SPOTS[index % DECOR_SPOTS.length]]}>
            <AppText style={styles.decorEmoji}>{item.emoji}</AppText>
          </Animated.View>
        ))}
        <ProgressRing progress={ratio} size={262} strokeWidth={12} colors={['#FFC93C', '#FF7EA8']} trackColor="rgba(255,255,255,0.45)">
          <LifeTree level={stats.level.level} size={220} />
        </ProgressRing>
      </Animated.View>

      <View style={styles.treeCaption}>
        <AppText variant="heading" color={textColor} align="center">
          Life Tree · Level {stats.level.level}
        </AppText>
        <AppText variant="caption" color={sky.isNight ? 'rgba(255,255,255,0.75)' : colors.textMuted} align="center">
          {total === 0 ? 'Add habits to start growing' : `${done}/${total} habits watered today · ${stats.level.xpForNext - stats.level.xpIntoLevel} XP to the next fruit`}
        </AppText>
      </View>

      <View style={styles.summary}>
        {[
          { label: 'Plants', value: state.habits.length, emoji: '🪴' },
          { label: 'In bloom', value: blooming, emoji: '🌸' },
          { label: 'Need water', value: wilted, emoji: '💧' },
        ].map((item) => (
          <Card key={item.label} style={styles.summaryCard}>
            <AppText style={styles.summaryEmoji}>{item.emoji}</AppText>
            <AppText variant="title">{item.value}</AppText>
            <AppText variant="caption" tone="muted">
              {item.label}
            </AppText>
          </Card>
        ))}
      </View>

      <SectionHeader title="Garden beds" actionLabel="+ Plant" onAction={openEditor} />
      {state.habits.length === 0 ? (
        <Card style={styles.empty}>
          <Plant species="daisy" stage={0} size={90} />
          <AppText variant="subheading" align="center">
            Every habit grows a plant
          </AppText>
          <Button label="Plant your first seed" icon="leaf" onPress={openEditor} style={{ alignSelf: 'stretch' }} />
        </Card>
      ) : (
        <View style={styles.grid}>
          {habitStats.map(({ habit, stats: entry }) => {
            const completions = entry?.completions ?? 0;
            const stage = entry?.stage ?? 0;
            const toNext = completionsToNextStage(completions);
            const stageStart = PLANT_STAGE_THRESHOLDS[stage];
            const stageSpan = toNext === null ? 1 : completions + toNext - stageStart;
            return (
              <Card key={habit.id} style={styles.plantCard} onPress={() => router.push(`/habit/${habit.id}`)} accessibilityLabel={`${habit.name} plant`}>
                <View style={styles.plantArt}>
                  <Plant species={habit.plant} stage={stage} size={92} isWilted={entry?.wilted} />
                </View>
                <AppText variant="label" numberOfLines={1}>
                  {habit.emoji} {habit.name}
                </AppText>
                <AppText variant="caption" color={entry?.wilted ? colors.danger : colors.textMuted}>
                  {entry?.wilted ? 'Thirsty! Complete to revive' : PLANT_STAGE_NAMES[stage]}
                </AppText>
                <ProgressBar progress={toNext === null ? 1 : (completions - stageStart) / stageSpan} height={6} colors={['#6EE0B0', '#22B07D']} />
                <AppText variant="micro" tone="soft">
                  {toNext === null ? 'Fully grown 🌟' : `${toNext} more to grow`}
                </AppText>
              </Card>
            );
          })}
        </View>
      )}

      <Card style={[styles.tip, { backgroundColor: colors.surfaceAlt }]}>
        <AppText variant="subheading">🌱 How your garden grows</AppText>
        <AppText variant="caption" tone="muted">
          Each check-in waters its plant. Plants evolve from seed to full bloom at 3, 7, 14 and 30 check-ins. Miss two scheduled days and a plant gets thirsty, but one check-in revives it. Spend coins in the shop to decorate.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  coins: { paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radii.pill },
  scene: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md },
  decor: { position: 'absolute', zIndex: 2 },
  decorEmoji: { fontSize: 30, lineHeight: 38 },
  treeCaption: { gap: 2, marginBottom: spacing.md },
  summary: { flexDirection: 'row', gap: spacing.xs },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, gap: 0 },
  summaryEmoji: { fontSize: 22, lineHeight: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  plantCard: { width: '47.8%', gap: 4, padding: spacing.sm },
  plantArt: { alignItems: 'center', paddingVertical: spacing.xs },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  tip: { marginTop: spacing.xl, gap: spacing.xs },
});
