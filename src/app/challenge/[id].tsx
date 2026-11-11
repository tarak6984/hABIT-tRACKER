import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen, ScreenHeader, SectionHeader } from '@/components/ui/Screen';
import { categories } from '@/data/catalog';
import { challengesById, memberChallengeProgress, membersById, type Member } from '@/data/community';
import { challengeProgress } from '@/lib/achievements';
import { addDays } from '@/lib/dates';
import { isCompletedOn } from '@/lib/gamification';
import { useStore } from '@/store/AppStore';
import { habitColors, radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, today, dispatch, feedback, actions } = useStore();
  const { colors } = useTheme();
  const challenge = challengesById.get(id);

  if (!challenge) {
    return (
      <Screen>
        <ScreenHeader title="Challenge" />
        <AppText variant="body" tone="muted" align="center">
          This challenge has ended.
        </AppText>
      </Screen>
    );
  }

  const join = state.joinedChallenges.find((candidate) => candidate.challengeId === challenge.id);
  const progress = join ? challengeProgress(challenge, join, state, today) : 0;
  const isComplete = join !== undefined && progress >= challenge.durationDays;
  const hasMatchingHabit = state.habits.some((habit) => habit.category === challenge.category);
  const category = categories[challenge.category];
  const participants = challenge.memberIds
    .map((memberId) => membersById.get(memberId))
    .filter((member): member is Member => member !== undefined)
    .map((member) => ({ member, done: memberChallengeProgress(member, challenge, today) }))
    .sort((a, b) => b.done - a.done);

  const days = Array.from({ length: challenge.durationDays }, (_, index) => {
    if (!join) return 'upcoming' as const;
    const key = addDays(join.joinedAt, index);
    if (key > today) return 'upcoming' as const;
    const isDone = state.habits.some((habit) => habit.category === challenge.category && isCompletedOn(habit, state.logs, key));
    if (isDone) return 'done' as const;
    return key === today ? ('today' as const) : ('missed' as const);
  });

  const joinChallenge = () => {
    feedback.success();
    dispatch({ type: 'joinChallenge', challengeId: challenge.id, date: today });
    actions.share(`Just joined the ${challenge.title} challenge ${challenge.emoji} Who's with me?`, 'challenge');
  };

  const leave = () =>
    Alert.alert('Leave challenge?', 'Your progress in this challenge will be lost.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => dispatch({ type: 'leaveChallenge', challengeId: challenge.id }) },
    ]);

  return (
    <Screen
      footer={
        join ? (
          isComplete ? undefined : <Button label="Leave challenge" variant="ghost" size="sm" onPress={leave} />
        ) : (
          <Button label="Join challenge" icon="flag" onPress={joinChallenge} gradient={habitColors[challenge.color].gradient} />
        )
      }
    >
      <ScreenHeader title="Challenge" />
      <LinearGradient colors={habitColors[challenge.color].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <AppText style={styles.emoji}>{challenge.emoji}</AppText>
        <AppText variant="title" color="#FFFFFF" align="center">
          {challenge.title}
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.92)" align="center">
          {challenge.description}
        </AppText>
        <View style={styles.heroStats}>
          {[
            { value: `${challenge.durationDays}`, label: 'days' },
            { value: challenge.participants.toLocaleString(), label: 'joined' },
            { value: `🪙 ${challenge.rewardCoins}`, label: 'reward' },
          ].map((item) => (
            <View key={item.label} style={styles.heroStat}>
              <AppText variant="heading" color="#FFFFFF">
                {item.value}
              </AppText>
              <AppText variant="micro" color="rgba(255,255,255,0.85)">
                {item.label.toUpperCase()}
              </AppText>
            </View>
          ))}
        </View>
      </LinearGradient>

      {join ? (
        <>
          <SectionHeader title={isComplete ? '🏆 Challenge complete!' : `Your progress · ${progress}/${challenge.durationDays}`} />
          <Card style={{ gap: spacing.md }}>
            <ProgressBar progress={progress / challenge.durationDays} height={12} colors={habitColors[challenge.color].gradient} />
            <View style={styles.days}>
              {days.map((status, index) => (
                <View
                  key={index}
                  style={[
                    styles.day,
                    {
                      backgroundColor:
                        status === 'done' ? habitColors[challenge.color].base : status === 'missed' ? colors.dangerSoft : colors.surfaceSunken,
                      borderColor: status === 'today' ? habitColors[challenge.color].base : 'transparent',
                    },
                  ]}
                >
                  <AppText variant="micro" color={status === 'done' ? '#FFFFFF' : colors.textMuted}>
                    {index + 1}
                  </AppText>
                </View>
              ))}
            </View>
            <AppText variant="caption" tone="muted">
              Complete any {category.label.toLowerCase()} habit {category.emoji} each day to fill a circle.
              {isComplete ? ` You earned ${challenge.rewardCoins} coins!` : ''}
            </AppText>
          </Card>
        </>
      ) : (
        <Card style={{ marginTop: spacing.lg, gap: spacing.xs }}>
          <AppText variant="subheading">How it works</AppText>
          <AppText variant="body" tone="muted">
            Complete at least one {category.label.toLowerCase()} habit {category.emoji} on each of the next {challenge.durationDays} days. Finish to earn {challenge.rewardCoins} coins and the Challenger badge.
          </AppText>
          {!hasMatchingHabit ? (
            <AppText variant="caption" tone="danger">
              Tip: you don’t have a {category.label.toLowerCase()} habit yet. Add one after joining!
            </AppText>
          ) : null}
        </Card>
      )}

      <SectionHeader title="Friends taking part" />
      <Card style={{ gap: spacing.sm }}>
        {participants.map(({ member, done }) => (
          <View key={member.id} style={styles.participant}>
            <Mascot id={member.mascot} size={38} hasBackdrop />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.participantLine}>
                <AppText variant="bodyBold">{member.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {done}/{challenge.durationDays}
                </AppText>
              </View>
              <ProgressBar progress={done / challenge.durationDays} height={6} colors={habitColors[challenge.color].gradient} />
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 52, lineHeight: 62 },
  heroStats: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  heroStat: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: spacing.xs, borderRadius: radii.md },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  participant: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  participantLine: { flexDirection: 'row', justifyContent: 'space-between' },
});
