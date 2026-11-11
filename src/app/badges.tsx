import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { badges } from '@/lib/achievements';
import { formatLongDate } from '@/lib/dates';
import { useStore } from '@/store/AppStore';
import { habitColors, radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function BadgesScreen() {
  const { state, stats, completedChallenges } = useStore();
  const { habitTint } = useTheme();
  const context = { stats, state, completedChallenges: completedChallenges.length };
  const unlocked = Object.keys(state.unlockedBadges).length;

  return (
    <Screen>
      <ScreenHeader title="Badges" />
      <AppText variant="body" tone="muted" align="center" style={styles.lead}>
        {unlocked} of {badges.length} collected. Each badge rewards you with coins for your garden.
      </AppText>
      <View style={styles.grid}>
        {badges.map((badge) => {
          const unlockedOn = state.unlockedBadges[badge.id];
          const { current, target } = badge.progress(context);
          const tint = habitTint(badge.color);
          return (
            <Card key={badge.id} style={[styles.card, unlockedOn ? { backgroundColor: tint.soft, borderColor: habitColors[badge.color].base } : null]}>
              <View style={{ opacity: unlockedOn ? 1 : 0.35 }}>
                <Mascot id={badge.mascot} size={72} hasBackdrop mood={unlockedOn ? 'joy' : 'sleepy'} />
              </View>
              <AppText variant="subheading" align="center" numberOfLines={1}>
                {badge.title}
              </AppText>
              <AppText variant="caption" tone="muted" align="center" numberOfLines={2} style={styles.description}>
                {badge.description}
              </AppText>
              {unlockedOn ? (
                <AppText variant="micro" color={tint.base}>
                  ✓ {formatLongDate(unlockedOn)}
                </AppText>
              ) : (
                <View style={styles.progress}>
                  <ProgressBar progress={current / target} height={6} colors={tint.gradient} />
                  <AppText variant="micro" tone="soft" align="center">
                    {Math.min(current, target)}/{target} · 🪙 {badge.rewardCoins}
                  </AppText>
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  card: { width: '48%', alignItems: 'center', gap: 4, borderRadius: radii.lg },
  description: { minHeight: 32 },
  progress: { alignSelf: 'stretch', gap: 4 },
});
