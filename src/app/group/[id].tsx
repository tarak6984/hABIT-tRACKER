import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';

import { Composer, Leaderboard, PostCard } from '@/components/community';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Screen, ScreenHeader, SectionHeader } from '@/components/ui/Screen';
import { APP_NAME } from '@/data/catalog';
import { ME, seededPosts } from '@/data/community';
import { useCommunity, type Person } from '@/hooks/useCommunity';
import { useStore } from '@/store/AppStore';
import { habitColors, radii, spacing } from '@/theme/tokens';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const { findGroup, joinGroup, personFor, me } = useCommunity();
  const seeds = useMemo(() => seededPosts(), []);
  const group = findGroup(id);

  if (!group) {
    return (
      <Screen>
        <ScreenHeader title="Group" />
        <AppText variant="body" tone="muted" align="center">
          This group doesn’t exist anymore.
        </AppText>
      </Screen>
    );
  }

  const isOwner = group.ownerId === ME;
  const isMember = isOwner || state.joinedGroupIds.includes(group.id);
  const people = group.memberIds
    .filter((memberId) => memberId !== ME)
    .map(personFor)
    .filter((person): person is Person => person !== undefined);
  const ranking = [...(isMember ? [me] : []), ...people].sort((a, b) => b.weekXp - a.weekXp);
  const posts = [...state.myPosts, ...seeds].filter((post) => post.groupId === group.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const invite = () =>
    Share.share({ message: `Join my group "${group.name}" ${group.emoji} on ${APP_NAME}! Use invite code ${group.inviteCode} 🌱` }).catch((error: unknown) =>
      console.warn('[share] could not open share sheet', error),
    );

  const leave = () =>
    Alert.alert(isOwner ? `Delete ${group.name}?` : `Leave ${group.name}?`, isOwner ? 'The group will be removed for you.' : 'You can rejoin anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isOwner ? 'Delete' : 'Leave',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'leaveGroup', groupId: group.id });
          router.back();
        },
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title={group.name} />
      <LinearGradient colors={habitColors[group.color].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <AppText style={styles.emoji}>{group.emoji}</AppText>
        <AppText variant="title" color="#FFFFFF" align="center">
          {group.name}
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.92)" align="center">
          {group.description}
        </AppText>
        <View style={styles.meta}>
          {group.isPrivate ? <Icon name="lock-closed" size={14} color="#FFFFFF" /> : null}
          <AppText variant="label" color="#FFFFFF">
            {group.isPrivate ? 'Private' : 'Public'} · {group.memberCount.toLocaleString()} members
          </AppText>
        </View>
      </LinearGradient>

      <View style={styles.actions}>
        {isMember ? (
          <>
            <Button label="Invite friends" icon="person-add-outline" onPress={invite} style={{ flex: 1 }} />
            <Button label={isOwner ? 'Delete' : 'Leave'} variant="danger" onPress={leave} />
          </>
        ) : (
          <Button label="Join group" icon="enter-outline" onPress={() => joinGroup(group.id)} style={{ flex: 1 }} />
        )}
      </View>

      {isMember ? (
        <Card style={styles.code}>
          <AppText variant="caption" tone="muted">
            Invite code
          </AppText>
          <AppText variant="title" style={{ letterSpacing: 4 }}>
            {group.inviteCode}
          </AppText>
        </Card>
      ) : null}

      <SectionHeader title="This week's ranking" />
      {ranking.length === 0 ? (
        <AppText variant="body" tone="muted">
          No members yet. Share your invite code to get started!
        </AppText>
      ) : (
        <Leaderboard people={ranking} />
      )}

      <SectionHeader title="Group feed" />
      {isMember ? <Composer groupId={group.id} placeholder={`Say hi to ${group.name}…`} /> : null}
      {posts.length === 0 ? (
        <AppText variant="body" tone="muted">
          No posts yet. Be the first to share a win!
        </AppText>
      ) : (
        posts.map((post) => {
          const author = personFor(post.authorId);
          return author ? <PostCard key={post.id} post={post} author={author} /> : null;
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 48, lineHeight: 58 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radii.pill },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  code: { alignItems: 'center', marginTop: spacing.sm, gap: 2 },
});
