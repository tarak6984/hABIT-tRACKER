import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Confetti } from '@/components/art/Confetti';
import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { badgesById, newlyEarnedBadges } from '@/lib/achievements';
import { useStore } from '@/store/AppStore';
import { habitColors, radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function CelebrationHost() {
  const { state, stats, today, dispatch, completedChallenges, feedback, actions } = useStore();
  const { colors } = useTheme();

  useEffect(() => {
    if (!state.profile.onboarded) return;
    if (stats.level.level > state.celebratedLevel) dispatch({ type: 'celebrateLevel', level: stats.level.level });
    const earned = newlyEarnedBadges({ stats, state, completedChallenges: completedChallenges.length });
    if (earned.length > 0) dispatch({ type: 'unlockBadges', badgeIds: earned.map((badge) => badge.id), date: today });
  }, [state, stats, completedChallenges, today, dispatch]);

  const current = state.celebrationQueue[0];
  const badge = current?.kind === 'badge' ? badgesById.get(current.badgeId) : undefined;

  useEffect(() => {
    if (current) feedback.success();
  }, [current, feedback]);

  if (!current || (current.kind === 'badge' && !badge)) return null;

  const dismiss = () => dispatch({ type: 'dismissCelebration' });
  const isBadge = badge !== undefined;
  const level = current.kind === 'level' ? current.level : stats.level.level;
  const gradient = isBadge ? habitColors[badge.color].gradient : habitColors.violet.gradient;
  const title = isBadge ? `You earned ${badge.title}!` : `Level ${level} reached!`;
  const description = isBadge
    ? badge.description
    : 'Your Life Tree just grew a little taller and bore a new fruit. Keep blooming!';
  const shareText = isBadge
    ? `Just unlocked the ${badge.title} badge in my garden ✨`
    : `Reached level ${level}! My Life Tree is growing 🌳`;

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={dismiss}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Confetti key={state.celebrationQueue.length} />
        <Animated.View entering={ZoomIn.springify().damping(14)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <LinearGradient colors={gradient} style={styles.hero}>
            <View style={styles.glow} />
            <Mascot id={isBadge ? badge.mascot : state.profile.mascot} size={128} mood="joy" isAnimated />
          </LinearGradient>
          <Animated.View entering={FadeIn.delay(150)} style={styles.body}>
            <AppText variant="micro" tone="primary" align="center" style={styles.kicker}>
              {isBadge ? 'NEW BADGE' : 'LEVEL UP'}
            </AppText>
            <AppText variant="title" align="center">
              {title}
            </AppText>
            <AppText variant="body" tone="muted" align="center">
              {description}
            </AppText>
            {isBadge ? (
              <View style={[styles.reward, { backgroundColor: colors.coinSoft }]}>
                <AppText variant="label" color={colors.coin}>
                  🪙 +{badge.rewardCoins} coins
                </AppText>
              </View>
            ) : null}
            <Button label="Awesome!" onPress={dismiss} style={styles.button} />
            <Button
              label="Share with friends"
              variant="ghost"
              icon="share-social-outline"
              size="sm"
              onPress={() => {
                actions.share(shareText, isBadge ? 'badge' : 'level');
                dismiss();
              }}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  card: { borderRadius: radii.xl, overflow: 'hidden' },
  hero: { height: 190, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(255,255,255,0.28)' },
  body: { padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.xs, alignItems: 'stretch' },
  kicker: { letterSpacing: 1.5 },
  reward: { alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill, marginTop: spacing.xs },
  button: { marginTop: spacing.md },
});
