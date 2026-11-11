import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { ListRow } from '@/components/ui/ListRow';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { StatTile } from '@/components/ui/StatTile';
import { mascots } from '@/data/catalog';
import { badges } from '@/lib/achievements';
import { fromDateKey, MONTH_LONG } from '@/lib/dates';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function ProfileScreen() {
  const { state, stats, coins } = useStore();
  const { colors } = useTheme();
  const joined = fromDateKey(state.profile.joinedAt);
  const unlockedCount = Object.keys(state.unlockedBadges).length;
  const previewBadges = [...badges].sort((a, b) => Number(Boolean(state.unlockedBadges[b.id])) - Number(Boolean(state.unlockedBadges[a.id]))).slice(0, 8);

  return (
    <Screen hasTabBar>
      <View style={styles.topBar}>
        <AppText variant="title">Profile</AppText>
        <IconButton icon="settings-outline" accessibilityLabel="Settings" onPress={() => router.push('/settings')} />
      </View>

      <Card style={styles.identity}>
        <Mascot id={state.profile.mascot} size={96} hasBackdrop isAnimated />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.nameRow}>
            <AppText variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
              {state.profile.name}
            </AppText>
            {state.profile.isPremium ? <AppText style={styles.crown}>👑</AppText> : null}
          </View>
          <AppText variant="caption" tone="muted">
            with {mascots[state.profile.mascot].name} · since {MONTH_LONG[joined.getMonth()]} {joined.getFullYear()}
          </AppText>
          <View style={styles.levelRow}>
            <AppText variant="label" tone="primary">
              Level {stats.level.level}
            </AppText>
            <AppText variant="micro" tone="soft">
              {stats.level.xpIntoLevel}/{stats.level.xpForNext} XP
            </AppText>
          </View>
          <ProgressBar progress={stats.level.progress} height={8} />
        </View>
      </Card>

      <View style={styles.tiles}>
        <StatTile icon="checkmark-done" value={String(stats.totalCompletions)} label="Habits done" tint={colors.success} tintSoft={colors.successSoft} />
        <StatTile icon="flash" value={String(stats.xp)} label="Total XP" tint={colors.xp} tintSoft={colors.primarySoft} />
      </View>
      <View style={styles.tiles}>
        <StatTile icon="flame" value={String(stats.bestHabitStreak)} label="Best streak" tint={colors.streak} tintSoft={colors.streakSoft} />
        <StatTile icon="wallet" value={String(coins)} label="Coins" tint={colors.coin} tintSoft={colors.coinSoft} />
      </View>

      {!state.profile.isPremium ? (
        <Pressable onPress={() => router.push('/premium')} accessibilityRole="button" accessibilityLabel="Upgrade to Premium" style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
          <LinearGradient colors={['#FFC93C', '#FF8A5B', '#F2649B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premium}>
            <AppText style={styles.premiumEmoji}>👑</AppText>
            <View style={{ flex: 1 }}>
              <AppText variant="heading" color="#FFFFFF">
                Bloomly Premium
              </AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.92)">
                Unlimited habits, rare companions, deep insights & more
              </AppText>
            </View>
            <AppText variant="heading" color="#FFFFFF">
              →
            </AppText>
          </LinearGradient>
        </Pressable>
      ) : null}

      <SectionHeader title={`Badges · ${unlockedCount}/${badges.length}`} actionLabel="See all" onAction={() => router.push('/badges')} />
      <Card style={styles.badgeGrid}>
        {previewBadges.map((badge) => {
          const isUnlocked = Boolean(state.unlockedBadges[badge.id]);
          return (
            <View key={badge.id} style={styles.badge}>
              <View style={{ opacity: isUnlocked ? 1 : 0.3 }}>
                <Mascot id={badge.mascot} size={56} hasBackdrop mood={isUnlocked ? 'joy' : 'sleepy'} />
              </View>
              <AppText variant="micro" tone={isUnlocked ? 'default' : 'soft'} align="center" numberOfLines={2}>
                {badge.title}
              </AppText>
            </View>
          );
        })}
      </Card>

      <SectionHeader title="More" />
      <Card style={{ paddingVertical: spacing.xs }}>
        <ListRow icon="storefront-outline" title="Garden shop" subtitle="Decorate with your coins" tint={colors.coin} onPress={() => router.push('/shop')} />
        <ListRow icon="ribbon-outline" title="All badges" subtitle={`${unlockedCount} collected`} tint={colors.streak} onPress={() => router.push('/badges')} />
        <ListRow icon="settings-outline" title="Settings" subtitle="Theme, reminders, data" onPress={() => router.push('/settings')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  crown: { fontSize: 20, lineHeight: 26 },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  tiles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  premium: { marginTop: spacing.lg, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  premiumEmoji: { fontSize: 34, lineHeight: 40 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  badge: { width: '25%', alignItems: 'center', gap: 4 },
});
