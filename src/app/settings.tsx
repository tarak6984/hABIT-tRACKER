import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Screen, ScreenHeader, SectionHeader } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { APP_NAME, mascotIds, mascots } from '@/data/catalog';
import { useStore } from '@/store/AppStore';
import type { ThemePreference } from '@/store/types';
import { fonts, radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function SettingsScreen() {
  const { state, dispatch, actions } = useStore();
  const { colors } = useTheme();
  const [name, setName] = useState(state.profile.name);

  const commitName = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setName(state.profile.name);
      return;
    }
    dispatch({ type: 'updateProfile', patch: { name: trimmed } });
  };

  const confirmReset = () =>
    Alert.alert('Erase everything?', 'This permanently deletes your habits, history, garden and badges on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Erase',
        style: 'destructive',
        onPress: async () => {
          await actions.resetAll();
          router.dismissAll();
          router.replace('/onboarding');
        },
      },
    ]);

  const switchColors = { true: colors.primary, false: colors.border };

  return (
    <Screen>
      <ScreenHeader title="Settings" />

      <SectionHeader title="Profile" />
      <Card style={{ gap: spacing.md }}>
        <View>
          <AppText variant="label" tone="muted">
            Name
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={commitName}
            onSubmitEditing={commitName}
            maxLength={24}
            returnKeyType="done"
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSunken, fontFamily: fonts.bold }]}
            accessibilityLabel="Your name"
          />
        </View>
        <View>
          <AppText variant="label" tone="muted" style={{ marginBottom: spacing.xs }}>
            Companion
          </AppText>
          <View style={styles.mascots}>
            {mascotIds.map((id) => {
              const isLocked = mascots[id].premium && !state.profile.isPremium;
              const isSelected = state.profile.mascot === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => (isLocked ? router.push('/premium') : dispatch({ type: 'updateProfile', patch: { mascot: id } }))}
                  accessibilityRole="button"
                  accessibilityLabel={`${mascots[id].name}${isLocked ? ', premium' : ''}`}
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.mascot, { borderColor: isSelected ? colors.primary : 'transparent', opacity: isLocked ? 0.4 : 1 }]}
                >
                  <Mascot id={id} size={48} hasBackdrop />
                  {isLocked ? (
                    <AppText variant="micro" style={styles.lock}>
                      👑
                    </AppText>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      <SectionHeader title="Appearance" />
      <Card>
        <Segmented<ThemePreference>
          options={[
            { value: 'system', label: '⚙️ System' },
            { value: 'light', label: '☀️ Light' },
            { value: 'dark', label: '🌙 Dark' },
          ]}
          value={state.settings.theme}
          onChange={(theme) => dispatch({ type: 'updateSettings', patch: { theme } })}
        />
      </Card>

      <SectionHeader title="Preferences" />
      <Card style={{ paddingVertical: spacing.xs }}>
        <ListRow
          icon="notifications-outline"
          title="Habit reminders"
          subtitle="Daily nudges at the time you choose"
          right={<Switch value={state.settings.remindersEnabled} onValueChange={(isEnabled) => void actions.setRemindersEnabled(isEnabled)} trackColor={switchColors} thumbColor="#FFFFFF" />}
        />
        <ListRow
          icon="phone-portrait-outline"
          title="Haptic feedback"
          subtitle="Little taps when you complete habits"
          right={<Switch value={state.settings.haptics} onValueChange={(haptics) => dispatch({ type: 'updateSettings', patch: { haptics } })} trackColor={switchColors} thumbColor="#FFFFFF" />}
        />
      </Card>

      <SectionHeader title="Membership" />
      <Card style={{ paddingVertical: spacing.xs }}>
        <ListRow
          icon="sparkles"
          title={state.profile.isPremium ? 'Premium active 👑' : 'Upgrade to Premium'}
          subtitle={state.profile.isPremium ? 'Manage your plan' : 'Unlimited habits, insights & more'}
          tint={colors.streak}
          onPress={() => router.push('/premium')}
        />
      </Card>

      <SectionHeader title="Data" />
      <Card style={{ paddingVertical: spacing.xs }}>
        <ListRow icon="cloud-offline-outline" title="Stored on this device" subtitle="Bloomly works fully offline. Cloud sync is coming soon." />
        <ListRow icon="trash-outline" title="Erase all data" isDestructive onPress={confirmReset} />
      </Card>

      <AppText variant="caption" tone="soft" align="center" style={{ marginTop: spacing.xl }}>
        {APP_NAME} v{Constants.expoConfig?.version ?? '1.0.0'} · Made with 💜
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { height: 46, borderRadius: radii.md, paddingHorizontal: spacing.sm, fontSize: 16, marginTop: spacing.xs },
  mascots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  mascot: { borderWidth: 2.5, borderRadius: 30, padding: 2 },
  lock: { position: 'absolute', right: -2, top: -4, fontSize: 12 },
});
