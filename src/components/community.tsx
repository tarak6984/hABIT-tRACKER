import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/Progress';
import { ME, type Challenge } from '@/data/community';
import { timeAgo } from '@/lib/dates';
import type { Person } from '@/hooks/useCommunity';
import { useStore } from '@/store/AppStore';
import type { Group, Post } from '@/store/types';
import { fonts, habitColors, radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const KIND_LABEL: Record<Post['kind'], string | null> = {
  text: null,
  badge: '🏅 Badge',
  level: '⭐ Level up',
  streak: '🔥 Streak',
  challenge: '🏆 Challenge',
};

export function PostCard({ post, author }: { post: Post; author: Person }) {
  const { state, dispatch, feedback } = useStore();
  const { colors } = useTheme();
  const isCheered = state.cheeredPostIds.includes(post.id);
  const kindLabel = KIND_LABEL[post.kind];

  return (
    <Card style={styles.post}>
      <View style={styles.postHeader}>
        <Mascot id={author.mascot} size={42} hasBackdrop />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyBold">{author.isMe ? `${author.name} (you)` : author.name}</AppText>
          <AppText variant="caption" tone="soft">
            @{author.handle} · {timeAgo(post.createdAt)}
          </AppText>
        </View>
        {kindLabel ? (
          <View style={[styles.kind, { backgroundColor: colors.primarySoft }]}>
            <AppText variant="micro" tone="primary">
              {kindLabel}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="body">{post.text}</AppText>
      <View style={styles.postFooter}>
        <Pressable
          onPress={() => {
            feedback.tap();
            dispatch({ type: 'toggleCheer', postId: post.id });
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: isCheered }}
          accessibilityLabel={isCheered ? 'Remove cheer' : 'Cheer this post'}
          style={[styles.cheer, { backgroundColor: isCheered ? colors.primarySoft : colors.surfaceSunken }]}
        >
          <AppText variant="label" tone={isCheered ? 'primary' : 'muted'}>
            👏 {post.baseCheers + (isCheered ? 1 : 0)}
          </AppText>
        </Pressable>
        {post.authorId === ME ? (
          <Pressable onPress={() => dispatch({ type: 'deletePost', postId: post.id })} hitSlop={8} accessibilityRole="button" accessibilityLabel="Delete post">
            <Icon name="trash-outline" size={18} color={colors.textSoft} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

export function Composer({ groupId = null, placeholder = 'Share a win or cheer someone on…' }: { groupId?: string | null; placeholder?: string }) {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const trimmed = text.trim();

  return (
    <Card style={styles.composer}>
      <View style={styles.composerRow}>
        <Mascot id={state.profile.mascot} size={38} hasBackdrop />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSoft}
          multiline
          maxLength={280}
          style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
          accessibilityLabel="Write a post"
        />
      </View>
      <View style={styles.composerFooter}>
        <AppText variant="micro" tone="soft">
          {text.length}/280
        </AppText>
        <Button
          label="Post"
          size="sm"
          icon="send"
          isDisabled={trimmed.length === 0}
          onPress={() => {
            actions.share(trimmed, 'text', groupId);
            setText('');
          }}
        />
      </View>
    </Card>
  );
}

export function GroupRow({ group, isJoined, onJoin }: { group: Group; isJoined: boolean; onJoin?: () => void }) {
  const { colors, habitTint } = useTheme();
  const tint = habitTint(group.color);
  return (
    <Card style={styles.groupRow} onPress={() => router.push(`/group/${group.id}`)} accessibilityLabel={`Open ${group.name}`}>
      <View style={[styles.groupEmoji, { backgroundColor: tint.soft }]}>
        <AppText style={styles.emoji}>{group.emoji}</AppText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.inline}>
          <AppText variant="subheading" numberOfLines={1} style={{ flexShrink: 1 }}>
            {group.name}
          </AppText>
          {group.isPrivate ? <Icon name="lock-closed" size={13} color={colors.textSoft} /> : null}
        </View>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {group.memberCount.toLocaleString()} members · {group.description}
        </AppText>
      </View>
      {isJoined ? (
        <Icon name="chevron-forward" size={18} color={colors.textSoft} />
      ) : (
        <Button label="Join" size="sm" variant="secondary" onPress={() => onJoin?.()} />
      )}
    </Card>
  );
}

export function ChallengeCard({ challenge, progress }: { challenge: Challenge; progress: number | null }) {
  const gradient = habitColors[challenge.color].gradient;
  const isJoined = progress !== null;
  const isComplete = isJoined && progress >= challenge.durationDays;
  return (
    <Pressable onPress={() => router.push(`/challenge/${challenge.id}`)} accessibilityRole="button" accessibilityLabel={`Open ${challenge.title}`} style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.challenge}>
        <View style={styles.challengeBubble} />
        <View style={styles.inline}>
          <AppText style={styles.challengeEmoji}>{challenge.emoji}</AppText>
          <View style={{ flex: 1 }}>
            <AppText variant="heading" color="#FFFFFF">
              {challenge.title}
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.88)">
              {challenge.durationDays} days · {challenge.participants.toLocaleString()} joined · 🪙 {challenge.rewardCoins}
            </AppText>
          </View>
        </View>
        {isJoined ? (
          <View style={{ gap: 6 }}>
            <ProgressBar progress={progress / challenge.durationDays} height={8} colors={['#FFFFFF', '#FFF4CC']} trackColor="rgba(255,255,255,0.3)" />
            <AppText variant="label" color="#FFFFFF">
              {isComplete ? '🏆 Completed! Reward collected' : `Day ${progress} of ${challenge.durationDays}`}
            </AppText>
          </View>
        ) : (
          <View style={[styles.joinPill]}>
            <AppText variant="label" color="#1F1A3D">
              View challenge →
            </AppText>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard({ people }: { people: Person[] }) {
  const { colors } = useTheme();
  const podium = people.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter((person): person is Person => person !== undefined);

  return (
    <View style={{ gap: spacing.sm }}>
      <Card style={styles.podium}>
        {podiumOrder.map((person) => {
          const rank = people.indexOf(person);
          const isFirst = rank === 0;
          return (
            <View key={person.id} style={[styles.podiumSlot, { marginTop: isFirst ? 0 : spacing.lg }]}>
              <AppText style={styles.medal}>{MEDALS[rank]}</AppText>
              <Mascot id={person.mascot} size={isFirst ? 76 : 60} hasBackdrop mood={isFirst ? 'joy' : 'happy'} />
              <AppText variant="label" numberOfLines={1} tone={person.isMe ? 'primary' : 'default'}>
                {person.isMe ? 'You' : person.name}
              </AppText>
              <AppText variant="micro" tone="muted">
                {person.weekXp} XP
              </AppText>
            </View>
          );
        })}
      </Card>
      {people.slice(3).map((person, index) => (
        <View
          key={person.id}
          style={[
            styles.rankRow,
            { backgroundColor: person.isMe ? colors.primarySoft : colors.surface, borderColor: person.isMe ? colors.primary : colors.border },
          ]}
        >
          <AppText variant="subheading" tone="muted" style={styles.rank}>
            {index + 4}
          </AppText>
          <Mascot id={person.mascot} size={38} hasBackdrop />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyBold" tone={person.isMe ? 'primary' : 'default'}>
              {person.isMe ? `${person.name} (you)` : person.name}
            </AppText>
            <AppText variant="caption" tone="soft">
              @{person.handle}
            </AppText>
          </View>
          <AppText variant="subheading">{person.weekXp} XP</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  post: { gap: spacing.sm, marginBottom: spacing.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  kind: { paddingHorizontal: spacing.xs, paddingVertical: 4, borderRadius: radii.sm },
  postFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cheer: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.pill },
  composer: { gap: spacing.xs, marginBottom: spacing.md },
  composerRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  input: { flex: 1, fontSize: 15, minHeight: 44, maxHeight: 120, paddingTop: 10, textAlignVertical: 'top' },
  composerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, padding: spacing.sm },
  groupEmoji: { width: 50, height: 50, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26, lineHeight: 32 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  challenge: { borderRadius: radii.lg, padding: spacing.md, gap: spacing.md, marginBottom: spacing.sm, overflow: 'hidden' },
  challengeBubble: { position: 'absolute', width: 160, height: 160, borderRadius: 80, right: -50, top: -60, backgroundColor: 'rgba(255,255,255,0.15)' },
  challengeEmoji: { fontSize: 38, lineHeight: 46 },
  joinPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.pill },
  podium: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', paddingVertical: spacing.lg },
  podiumSlot: { alignItems: 'center', gap: 2, flex: 1 },
  medal: { fontSize: 22, lineHeight: 28 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.lg, borderWidth: 1 },
  rank: { width: 24, textAlign: 'center' },
});
