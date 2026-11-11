import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { ChallengeCard, Composer, GroupRow, Leaderboard, PostCard } from '@/components/community';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { challenges, seededPosts } from '@/data/community';
import { useCommunity } from '@/hooks/useCommunity';
import { challengeProgress } from '@/lib/achievements';
import { useStore } from '@/store/AppStore';
import { fonts, radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Tab = 'feed' | 'groups' | 'challenges' | 'ranks';

const TABS = [
  { value: 'feed', label: 'Feed' },
  { value: 'groups', label: 'Groups' },
  { value: 'challenges', label: 'Challenges' },
  { value: 'ranks', label: 'Ranks' },
] as const;

function FeedTab() {
  const { state } = useStore();
  const { personFor } = useCommunity();
  const seeds = useMemo(() => seededPosts(), []);
  const posts = [...state.myPosts, ...seeds].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <View>
      <Composer />
      {posts.map((post) => {
        const author = personFor(post.authorId);
        return author ? <PostCard key={post.id} post={post} author={author} /> : null;
      })}
    </View>
  );
}

function GroupsTab() {
  const { colors } = useTheme();
  const { myGroups, discoverGroups, joinGroup, openCreateGroup, findByInviteCode } = useCommunity();
  const { state } = useStore();
  const [code, setCode] = useState('');

  const joinWithCode = () => {
    const group = findByInviteCode(code);
    if (!group) {
      Alert.alert('No group found', `We couldn't find a group with the code "${code.trim().toUpperCase()}". Double-check it with your friend.`);
      return;
    }
    const isMember = state.joinedGroupIds.includes(group.id) || state.customGroups.some((custom) => custom.id === group.id);
    if (isMember) {
      Alert.alert('Already a member', `You're already in ${group.name}.`);
      return;
    }
    if (joinGroup(group.id)) setCode('');
  };

  return (
    <View>
      <Card style={styles.codeCard}>
        <AppText variant="subheading">Have an invite code?</AppText>
        <View style={styles.codeRow}>
          <TextInput
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            placeholder="e.g. EARLY1"
            placeholderTextColor={colors.textSoft}
            autoCapitalize="characters"
            maxLength={6}
            style={[styles.codeInput, { color: colors.text, backgroundColor: colors.surfaceSunken, fontFamily: fonts.extraBold }]}
            accessibilityLabel="Invite code"
          />
          <Button label="Join" size="sm" isDisabled={code.trim().length < 4} onPress={joinWithCode} />
        </View>
      </Card>
      <Button label="Create a private group" icon="people-circle-outline" variant="secondary" onPress={openCreateGroup} />

      <SectionHeader title="My groups" />
      {myGroups.length === 0 ? (
        <AppText variant="body" tone="muted">
          You haven’t joined a group yet. Groups keep you accountable together.
        </AppText>
      ) : (
        myGroups.map((group) => <GroupRow key={group.id} group={group} isJoined />)
      )}

      {discoverGroups.length > 0 ? (
        <>
          <SectionHeader title="Discover" />
          {discoverGroups.map((group) => (
            <GroupRow key={group.id} group={group} isJoined={false} onJoin={() => joinGroup(group.id)} />
          ))}
        </>
      ) : null}
    </View>
  );
}

function ChallengesTab() {
  const { state, today } = useStore();
  return (
    <View>
      <AppText variant="body" tone="muted" style={{ marginBottom: spacing.md }}>
        Team up with the community. Any habit in the challenge’s category counts toward your daily progress.
      </AppText>
      {challenges.map((challenge) => {
        const join = state.joinedChallenges.find((candidate) => candidate.challengeId === challenge.id);
        return <ChallengeCard key={challenge.id} challenge={challenge} progress={join ? challengeProgress(challenge, join, state, today) : null} />;
      })}
    </View>
  );
}

function RanksTab() {
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const { leaderboard } = useCommunity();
  const people = leaderboard(scope);
  return (
    <View style={{ gap: spacing.md }}>
      <Segmented
        options={[
          { value: 'global', label: '🌍 Global' },
          { value: 'friends', label: '💜 My groups' },
        ]}
        value={scope}
        onChange={setScope}
      />
      <AppText variant="caption" tone="muted" align="center">
        Weekly XP · resets every Monday
      </AppText>
      {people.length <= 1 ? (
        <AppText variant="body" tone="muted" align="center">
          Join a group to compete with friends.
        </AppText>
      ) : (
        <Leaderboard people={people} />
      )}
    </View>
  );
}

export default function CommunityScreen() {
  const [tab, setTab] = useState<Tab>('feed');
  return (
    <Screen hasTabBar>
      <AppText variant="title" style={styles.title}>
        Community
      </AppText>
      <AppText variant="body" tone="muted" style={styles.subtitle}>
        Grow together, cheer each other on 💜
      </AppText>
      <View style={styles.tabs}>
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </View>
      {tab === 'feed' ? <FeedTab /> : null}
      {tab === 'groups' ? <GroupsTab /> : null}
      {tab === 'challenges' ? <ChallengesTab /> : null}
      {tab === 'ranks' ? <RanksTab /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  subtitle: { marginBottom: spacing.md },
  tabs: { marginBottom: spacing.md },
  codeCard: { gap: spacing.sm, marginBottom: spacing.sm },
  codeRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  codeInput: { flex: 1, height: 40, borderRadius: radii.sm, paddingHorizontal: spacing.sm, fontSize: 15, letterSpacing: 2 },
});
