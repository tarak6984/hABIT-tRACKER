import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

import { LifeTree } from '@/components/art/LifeTree';
import { Mascot } from '@/components/art/Mascot';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { APP_NAME, categories, categoryIds, FREE_HABIT_LIMIT, habitTemplates, mascotIds, mascots } from '@/data/catalog';
import { formatTime } from '@/lib/dates';
import { createId } from '@/lib/ids';
import { useStore } from '@/store/AppStore';
import type { CategoryId, Habit, MascotId, Reminder } from '@/store/types';
import { fonts, radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const STEPS = ['welcome', 'name', 'companion', 'goals', 'habits', 'reminder', 'ready'] as const;
type Step = (typeof STEPS)[number];

const REMINDER_OPTIONS: { label: string; emoji: string; time: Reminder | null }[] = [
  { label: 'Morning', emoji: '🌅', time: { hour: 8, minute: 0 } },
  { label: 'Midday', emoji: '☀️', time: { hour: 12, minute: 30 } },
  { label: 'Evening', emoji: '🌇', time: { hour: 19, minute: 0 } },
  { label: 'Night', emoji: '🌙', time: { hour: 21, minute: 0 } },
  { label: 'No reminders', emoji: '🔕', time: null },
];

export default function OnboardingScreen() {
  const { today, actions } = useStore();
  const { colors, habitTint } = useTheme();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [mascot, setMascot] = useState<MascotId>('sprout');
  const [goals, setGoals] = useState<CategoryId[]>([]);
  const [templateIds, setTemplateIds] = useState<string[]>([]);
  const [reminderIndex, setReminderIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const suggestions = habitTemplates.filter((template) => goals.length === 0 || goals.includes(template.category));

  const goTo = (next: Step) => {
    if (next === 'habits' && templateIds.length === 0) {
      const picks = goals.map((goal) => habitTemplates.find((template) => template.category === goal)?.id).filter((id): id is string => id !== undefined);
      setTemplateIds(picks.slice(0, 3));
    }
    setStep(next);
  };
  const next = () => goTo(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const back = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);

  const finish = async () => {
    setIsFinishing(true);
    const reminder = REMINDER_OPTIONS[reminderIndex].time;
    const habits: Habit[] = habitTemplates
      .filter((template) => templateIds.includes(template.id))
      .map((template) => ({
        id: createId('habit'),
        name: template.name,
        emoji: template.emoji,
        color: template.color,
        category: template.category,
        goal: template.goal,
        days: [0, 1, 2, 3, 4, 5, 6],
        reminder,
        notificationIds: [],
        plant: template.plant,
        createdAt: today,
      }));
    await actions.completeOnboarding({ name: name.trim(), mascot }, habits);
    router.replace('/');
  };

  const canContinue: Record<Step, boolean> = {
    welcome: true,
    name: name.trim().length > 0,
    companion: true,
    goals: goals.length > 0,
    habits: templateIds.length > 0,
    reminder: true,
    ready: true,
  };

  const footer =
    step === 'ready' ? (
      <Button label="Start growing 🌱" onPress={finish} isLoading={isFinishing} />
    ) : (
      <Button label={step === 'welcome' ? "Let's begin" : 'Continue'} onPress={next} isDisabled={!canContinue[step]} />
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={footer}>
        {step !== 'welcome' ? (
          <View style={styles.topBar}>
            <IconButton icon="chevron-back" accessibilityLabel="Previous step" onPress={back} />
            <View style={styles.dots}>
              {STEPS.slice(1).map((candidate, index) => (
                <View
                  key={candidate}
                  style={[styles.dot, { backgroundColor: index < stepIndex ? colors.primary : colors.border, width: index === stepIndex - 1 ? 22 : 8 }]}
                />
              ))}
            </View>
            <View style={{ width: 44 }} />
          </View>
        ) : null}

        {step === 'welcome' ? (
          <Animated.View entering={FadeIn.duration(600)} style={styles.welcome}>
            <View style={styles.parade}>
              {(['bun', 'sprout', 'mochi', 'pip', 'boba', 'ember'] as MascotId[]).map((id, index) => (
                <Animated.View key={id} entering={FadeInDown.delay(index * 90).springify()} style={styles.paradeTile}>
                  <Mascot id={id} size={86} hasBackdrop isAnimated mood={index % 2 ? 'joy' : 'happy'} />
                </Animated.View>
              ))}
            </View>
            <AppText variant="display" align="center">
              Welcome to {APP_NAME}
            </AppText>
            <AppText variant="body" tone="muted" align="center" style={styles.lead}>
              Build tiny habits, earn XP and badges, grow a cozy garden, and cheer each other on.
            </AppText>
          </Animated.View>
        ) : null}

        {step === 'name' ? (
          <Animated.View key="name" entering={FadeInRight} style={styles.step}>
            <View style={styles.speech}>
              <Mascot id={mascot} size={84} isAnimated />
              <Card style={styles.bubble}>
                <AppText variant="subheading">Hi there! I’m so happy you’re here. What should I call you?</AppText>
              </Card>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textSoft}
              autoFocus
              maxLength={24}
              returnKeyType="next"
              onSubmitEditing={() => canContinue.name && next()}
              style={[styles.nameInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, fontFamily: fonts.extraBold }]}
              accessibilityLabel="Your name"
            />
          </Animated.View>
        ) : null}

        {step === 'companion' ? (
          <Animated.View key="companion" entering={FadeInRight} style={styles.step}>
            <AppText variant="title">Pick your companion</AppText>
            <AppText variant="body" tone="muted">
              They’ll cheer you on and celebrate every win.
            </AppText>
            <View style={styles.mascotGrid}>
              {mascotIds.map((id) => {
                const meta = mascots[id];
                const isSelected = id === mascot;
                return (
                  <Pressable
                    key={id}
                    disabled={meta.premium}
                    onPress={() => setMascot(id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: meta.premium }}
                    accessibilityLabel={`${meta.name}${meta.premium ? ', premium' : ''}`}
                    style={[styles.mascotTile, { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border }, isSelected && { borderWidth: 2.5 }]}
                  >
                    <View style={{ opacity: meta.premium ? 0.45 : 1 }}>
                      <Mascot id={id} size={70} mood={isSelected ? 'joy' : 'happy'} />
                    </View>
                    <AppText variant="label">{meta.name}</AppText>
                    {meta.premium ? (
                      <View style={[styles.lock, { backgroundColor: colors.coinSoft }]}>
                        <AppText variant="micro" color={colors.coin}>
                          👑 Premium
                        </AppText>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <AppText variant="bodyBold" tone="primary" align="center">
              {mascots[mascot].name}: {mascots[mascot].personality}
            </AppText>
          </Animated.View>
        ) : null}

        {step === 'goals' ? (
          <Animated.View key="goals" entering={FadeInRight} style={styles.step}>
            <AppText variant="title">What do you want to grow?</AppText>
            <AppText variant="body" tone="muted">
              Pick as many as you like.
            </AppText>
            <View style={styles.goalGrid}>
              {categoryIds.map((id) => {
                const meta = categories[id];
                const isSelected = goals.includes(id);
                const tint = habitTint(meta.color);
                return (
                  <Pressable
                    key={id}
                    onPress={() => setGoals((current) => (isSelected ? current.filter((goal) => goal !== id) : [...current, id]))}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    style={[styles.goal, { backgroundColor: isSelected ? tint.soft : colors.surface, borderColor: isSelected ? tint.base : colors.border }]}
                  >
                    <AppText style={styles.goalEmoji}>{meta.emoji}</AppText>
                    <AppText variant="subheading">{meta.label}</AppText>
                    <AppText variant="caption" tone="muted">
                      {meta.blurb}
                    </AppText>
                    {isSelected ? (
                      <View style={[styles.goalCheck, { backgroundColor: tint.base }]}>
                        <Icon name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        ) : null}

        {step === 'habits' ? (
          <Animated.View key="habits" entering={FadeInRight} style={styles.step}>
            <AppText variant="title">Choose your first habits</AppText>
            <AppText variant="body" tone="muted">
              Start small: 2–3 habits is the sweet spot. You can add more anytime.
            </AppText>
            {suggestions.map((template) => {
              const isSelected = templateIds.includes(template.id);
              const isBlocked = !isSelected && templateIds.length >= FREE_HABIT_LIMIT;
              const tint = habitTint(template.color);
              return (
                <Pressable
                  key={template.id}
                  disabled={isBlocked}
                  onPress={() => setTemplateIds((current) => (isSelected ? current.filter((id) => id !== template.id) : [...current, template.id]))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected, disabled: isBlocked }}
                  style={[styles.templateRow, { backgroundColor: isSelected ? tint.soft : colors.surface, borderColor: isSelected ? tint.base : colors.border, opacity: isBlocked ? 0.5 : 1 }]}
                >
                  <AppText style={styles.templateEmoji}>{template.emoji}</AppText>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyBold">{template.name}</AppText>
                    <AppText variant="caption" tone="muted">
                      {template.goal.kind === 'count' ? `${template.goal.target} ${template.goal.unit} a day` : 'Once a day'} · {categories[template.category].label}
                    </AppText>
                  </View>
                  <View style={[styles.checkCircle, isSelected ? { backgroundColor: tint.base, borderColor: tint.base } : { borderColor: colors.border }]}>
                    {isSelected ? <Icon name="checkmark" size={16} color="#FFFFFF" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </Animated.View>
        ) : null}

        {step === 'reminder' ? (
          <Animated.View key="reminder" entering={FadeInRight} style={styles.step}>
            <AppText variant="title">When should we nudge you?</AppText>
            <AppText variant="body" tone="muted">
              A gentle daily reminder doubles your chances of sticking with it. You can fine-tune each habit later.
            </AppText>
            {REMINDER_OPTIONS.map((option, index) => {
              const isSelected = index === reminderIndex;
              return (
                <Pressable
                  key={option.label}
                  onPress={() => setReminderIndex(index)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.templateRow, { backgroundColor: isSelected ? colors.primarySoft : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
                >
                  <AppText style={styles.templateEmoji}>{option.emoji}</AppText>
                  <AppText variant="bodyBold" style={{ flex: 1 }}>
                    {option.label}
                  </AppText>
                  {option.time ? (
                    <AppText variant="label" tone="muted">
                      {formatTime(option.time.hour, option.time.minute)}
                    </AppText>
                  ) : null}
                </Pressable>
              );
            })}
          </Animated.View>
        ) : null}

        {step === 'ready' ? (
          <Animated.View key="ready" entering={FadeIn.duration(500)} style={[styles.step, styles.ready]}>
            <LifeTree level={1} size={220} />
            <View style={styles.readyMascot}>
              <Mascot id={mascot} size={90} mood="joy" isAnimated />
            </View>
            <AppText variant="display" align="center">
              Your garden is ready, {name.trim()}!
            </AppText>
            <AppText variant="body" tone="muted" align="center">
              {templateIds.length} {templateIds.length === 1 ? 'seed is' : 'seeds are'} planted. Complete habits to earn XP, grow your plants and unlock badges.
            </AppText>
          </Animated.View>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  welcome: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xxl },
  parade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg, maxWidth: 330 },
  paradeTile: { padding: 4 },
  lead: { maxWidth: 320 },
  step: { gap: spacing.sm },
  speech: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.md },
  bubble: { flex: 1, borderBottomLeftRadius: 4 },
  nameInput: { height: 64, borderRadius: radii.lg, borderWidth: 1.5, paddingHorizontal: spacing.lg, fontSize: 22 },
  mascotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between', marginVertical: spacing.sm },
  mascotTile: { width: '31%', alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.lg, borderWidth: 1.5, gap: 2 },
  lock: { position: 'absolute', top: 6, right: 6, paddingHorizontal: 5, paddingVertical: 2, borderRadius: radii.sm },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between', marginTop: spacing.sm },
  goal: { width: '48%', borderRadius: radii.lg, borderWidth: 1.5, padding: spacing.md, gap: 2 },
  goalEmoji: { fontSize: 30, lineHeight: 38, marginBottom: 4 },
  goalCheck: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, paddingRight: spacing.md, borderRadius: radii.lg, borderWidth: 1.5 },
  templateEmoji: { fontSize: 26, lineHeight: 32, width: 40, textAlign: 'center' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  ready: { alignItems: 'center', paddingTop: spacing.lg },
  readyMascot: { marginTop: -60, marginBottom: spacing.sm },
});
