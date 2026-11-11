import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { ME, members } from '@/data/community';
import { createId, createInviteCode } from '@/lib/ids';
import { useStore } from '@/store/AppStore';
import { fonts, habitColorIds, habitColors, radii, spacing, type HabitColorId } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const GROUP_EMOJIS = ['🌱', '💪', '📚', '🧘', '💧', '🌅', '🎯', '🎨', '🏃', '💜', '🔥', '🌈'];

export default function CreateGroupScreen() {
  const { dispatch, feedback } = useStore();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState(GROUP_EMOJIS[0]);
  const [color, setColor] = useState<HabitColorId>('violet');
  const [invited, setInvited] = useState<string[]>([]);

  const create = () => {
    const id = createId('group');
    dispatch({
      type: 'createGroup',
      group: {
        id,
        name: name.trim(),
        emoji,
        color,
        description: description.trim() || 'Our little circle of good habits.',
        isPrivate: true,
        inviteCode: createInviteCode(),
        memberIds: [ME, ...invited],
        memberCount: invited.length + 1,
        ownerId: ME,
      },
    });
    feedback.success();
    router.replace(`/group/${id}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button label="Create group" icon="people" onPress={create} isDisabled={name.trim().length < 2} gradient={habitColors[color].gradient} />}>
        <ScreenHeader title="New private group" />

        <Card style={[styles.preview, { backgroundColor: `${habitColors[color].base}22` }]}>
          <AppText style={styles.previewEmoji}>{emoji}</AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Group name"
            placeholderTextColor={colors.textSoft}
            maxLength={30}
            style={[styles.nameInput, { color: colors.text, fontFamily: fonts.extraBold }]}
            accessibilityLabel="Group name"
          />
        </Card>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What's this group about? (optional)"
          placeholderTextColor={colors.textSoft}
          maxLength={90}
          multiline
          style={[styles.description, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, fontFamily: fonts.regular }]}
          accessibilityLabel="Group description"
        />

        <AppText variant="label" tone="muted" style={styles.label}>
          ICON
        </AppText>
        <View style={styles.row}>
          {GROUP_EMOJIS.map((candidate) => (
            <Pressable
              key={candidate}
              onPress={() => setEmoji(candidate)}
              accessibilityRole="button"
              accessibilityState={{ selected: candidate === emoji }}
              style={[styles.emojiCell, { backgroundColor: colors.surface, borderColor: candidate === emoji ? habitColors[color].base : colors.border }]}
            >
              <AppText style={styles.emojiText}>{candidate}</AppText>
            </Pressable>
          ))}
        </View>

        <AppText variant="label" tone="muted" style={styles.label}>
          COLOR
        </AppText>
        <View style={styles.row}>
          {habitColorIds.map((candidate) => (
            <Pressable
              key={candidate}
              onPress={() => setColor(candidate)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${candidate}`}
              accessibilityState={{ selected: candidate === color }}
              style={[styles.swatch, { backgroundColor: habitColors[candidate].base }, candidate === color && { borderWidth: 3, borderColor: colors.text }]}
            />
          ))}
        </View>

        <AppText variant="label" tone="muted" style={styles.label}>
          INVITE FROM YOUR COMMUNITY
        </AppText>
        <Card style={{ paddingVertical: spacing.xs }}>
          {members.slice(0, 8).map((member) => {
            const isInvited = invited.includes(member.id);
            return (
              <Pressable
                key={member.id}
                onPress={() => setInvited((current) => (isInvited ? current.filter((candidate) => candidate !== member.id) : [...current, member.id]))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isInvited }}
                accessibilityLabel={`Invite ${member.name}`}
                style={styles.member}
              >
                <Mascot id={member.mascot} size={38} hasBackdrop />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyBold">{member.name}</AppText>
                  <AppText variant="caption" tone="soft">
                    @{member.handle}
                  </AppText>
                </View>
                <View style={[styles.check, isInvited ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }]}>
                  {isInvited ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
                </View>
              </Pressable>
            );
          })}
        </Card>
        <AppText variant="caption" tone="soft" align="center" style={{ marginTop: spacing.sm }}>
          You’ll also get an invite code to share with anyone.
        </AppText>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 0 },
  previewEmoji: { fontSize: 36, lineHeight: 44 },
  nameInput: { flex: 1, fontSize: 20, minHeight: 48 },
  description: { marginTop: spacing.sm, borderRadius: radii.md, borderWidth: 1, padding: spacing.sm, minHeight: 64, fontSize: 15, textAlignVertical: 'top' },
  label: { marginTop: spacing.lg, marginBottom: spacing.xs, letterSpacing: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiCell: { width: 46, height: 46, borderRadius: radii.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 22, lineHeight: 28 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderColor: 'transparent' },
  member: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
