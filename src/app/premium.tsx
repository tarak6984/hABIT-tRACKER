import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { FREE_GROUP_LIMIT, FREE_HABIT_LIMIT, IS_BILLING_LIVE, premiumPlans } from '@/data/catalog';
import { useStore } from '@/store/AppStore';
import type { PlanId } from '@/store/types';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'infinite', title: 'Unlimited habits', body: `Go beyond ${FREE_HABIT_LIMIT} habits and grow a bigger garden.` },
  { icon: 'people', title: 'Unlimited groups', body: `Join more than ${FREE_GROUP_LIMIT} groups and create private circles.` },
  { icon: 'analytics', title: 'Advanced insights', body: 'Heatmaps, power days and personal tips.' },
  { icon: 'happy', title: 'Rare companions', body: 'Unlock Nimbus, Luna and Zest.' },
  { icon: 'flower', title: 'Exclusive plants & decor', body: 'Cherry blossoms, lavender, rainbows and more.' },
];

const REASONS: Record<string, string> = {
  habits: `You've planted ${FREE_HABIT_LIMIT} habits, the free limit. Upgrade to keep growing!`,
  groups: 'Free members can join a couple of groups. Upgrade for unlimited community access.',
};

export default function PremiumScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { state, dispatch, feedback } = useStore();
  const { colors } = useTheme();
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (state.profile.isPremium) {
    return (
      <Screen>
        <View style={styles.close}>
          <IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />
        </View>
        <View style={styles.member}>
          <Mascot id={state.profile.mascot} size={140} mood="joy" isAnimated hasBackdrop />
          <AppText variant="display" align="center">
            You’re Premium 👑
          </AppText>
          <AppText variant="body" tone="muted" align="center">
            Thank you for supporting Bloomly! Every feature is unlocked on your {state.profile.premiumPlan ?? 'current'} plan.
          </AppText>
          <Button label="Back to my garden" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: spacing.lg }} />
          <Button
            label="Cancel subscription"
            variant="ghost"
            size="sm"
            onPress={() =>
              Alert.alert('Cancel Premium?', 'You will keep your data, but premium features will lock again.', [
                { text: 'Keep Premium', style: 'cancel' },
                { text: 'Cancel', style: 'destructive', onPress: () => dispatch({ type: 'setPremium', plan: null }) },
              ])
            }
          />
        </View>
      </Screen>
    );
  }

  const purchase = () => {
    setIsPurchasing(true);
    // Simulated checkout until a billing SDK is integrated (see IS_BILLING_LIVE).
    setTimeout(() => {
      dispatch({ type: 'setPremium', plan });
      feedback.success();
      setIsPurchasing(false);
      router.back();
    }, 700);
  };

  return (
    <Screen
      gradient={['#FFF1DB', colors.background, colors.background]}
      footer={
        <View style={{ gap: spacing.xs }}>
          <Button
            label={plan === 'yearly' ? 'Start 7-day free trial' : 'Upgrade now'}
            icon="sparkles"
            onPress={purchase}
            isLoading={isPurchasing}
            gradient={['#FF9F43', '#F2649B']}
          />
          <AppText variant="micro" tone="soft" align="center">
            {IS_BILLING_LIVE ? 'Cancel anytime in your store settings.' : 'Preview build: purchases are simulated and no payment is taken.'}
          </AppText>
        </View>
      }
    >
      <View style={styles.close}>
        <IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />
      </View>

      <LinearGradient colors={['#FFC93C', '#FF8A5B', '#F2649B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.mascots}>
          <Mascot id="luna" size={74} isAnimated />
          <Mascot id="nimbus" size={96} isAnimated mood="joy" />
          <Mascot id="zest" size={74} isAnimated />
        </View>
        <AppText variant="title" color="#FFFFFF" align="center">
          Bloomly Premium
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.95)" align="center">
          {(reason && REASONS[reason]) ?? 'Unlock everything and grow without limits.'}
        </AppText>
      </LinearGradient>

      <View style={styles.features}>
        {FEATURES.map((feature, index) => (
          <Animated.View key={feature.title} entering={FadeInDown.delay(index * 60)} style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.coinSoft }]}>
              <Icon name={feature.icon} size={20} color={colors.streak} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyBold">{feature.title}</AppText>
              <AppText variant="caption" tone="muted">
                {feature.body}
              </AppText>
            </View>
          </Animated.View>
        ))}
      </View>

      <View style={styles.plans}>
        {premiumPlans.map((candidate) => {
          const isSelected = candidate.id === plan;
          return (
            <Pressable
              key={candidate.id}
              onPress={() => {
                feedback.select();
                setPlan(candidate.id);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${candidate.label} plan, ${candidate.price} ${candidate.cadence}`}
            >
              <Card style={[styles.plan, { borderColor: isSelected ? colors.streak : colors.border, borderWidth: isSelected ? 2.5 : 1 }]}>
                <View style={[styles.radio, { borderColor: isSelected ? colors.streak : colors.border }]}>
                  {isSelected ? <View style={[styles.radioDot, { backgroundColor: colors.streak }]} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="subheading">{candidate.label}</AppText>
                  <AppText variant="caption" tone="muted">
                    {candidate.note}
                  </AppText>
                </View>
                <AppText variant="heading">{candidate.price}</AppText>
                <AppText variant="caption" tone="muted">
                  {candidate.cadence}
                </AppText>
                {candidate.id === 'yearly' ? (
                  <View style={[styles.bestValue, { backgroundColor: colors.streak }]}>
                    <AppText variant="micro" color="#FFFFFF">
                      BEST VALUE
                    </AppText>
                  </View>
                ) : null}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignItems: 'flex-end', marginBottom: spacing.xs },
  member: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
  hero: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.xs, alignItems: 'center' },
  mascots: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.xs },
  features: { marginTop: spacing.lg, gap: spacing.sm },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureIcon: { width: 40, height: 40, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  plans: { marginTop: spacing.lg, gap: spacing.sm },
  plan: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  bestValue: { position: 'absolute', top: -10, right: spacing.md, paddingHorizontal: spacing.xs, paddingVertical: 3, borderRadius: radii.sm },
});
