import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Plant } from '@/components/art/Plant';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { categories, categoryIds, habitEmojis, habitTemplates, plantIds, plants, type HabitTemplate } from '@/data/catalog';
import { formatTime, WEEKDAY_LETTER } from '@/lib/dates';
import { createId } from '@/lib/ids';
import { useStore } from '@/store/AppStore';
import type { CategoryId, Habit, PlantSpecies } from '@/store/types';
import { fonts, habitColorIds, habitColors, radii, spacing, type HabitColorId } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];

const sameDays = (a: number[], b: number[]) => a.length === b.length && a.every((day) => b.includes(day));

function Stepper({ value, onChange, min, max, step, format }: { value: number; onChange: (value: number) => void; min: number; max: number; step: number; format?: (value: number) => string }) {
  const { colors } = useTheme();
  const { feedback } = useStore();
  const change = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    feedback.select();
    onChange(next);
  };
  return (
    <View style={[styles.stepper, { backgroundColor: colors.surfaceSunken }]}>
      <Pressable onPress={() => change(-step)} hitSlop={6} accessibilityRole="button" accessibilityLabel="Decrease" style={styles.stepButton}>
        <Icon name="remove" size={20} color={colors.text} />
      </Pressable>
      <AppText variant="subheading" style={styles.stepValue}>
        {format ? format(value) : value}
      </AppText>
      <Pressable onPress={() => change(step)} hitSlop={6} accessibilityRole="button" accessibilityLabel="Increase" style={styles.stepButton}>
        <Icon name="add" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <AppText variant="label" tone="muted" style={styles.fieldLabel}>
      {children}
    </AppText>
  );
}

export default function HabitEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, today, actions } = useStore();
  const { colors, habitTint } = useTheme();
  const existing = state.habits.find((habit) => habit.id === id);
  const isPremium = state.profile.isPremium;

  const [mode, setMode] = useState<'templates' | 'custom'>(existing ? 'custom' : 'templates');
  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '💧');
  const [color, setColor] = useState<HabitColorId>(existing?.color ?? 'violet');
  const [category, setCategory] = useState<CategoryId>(existing?.category ?? 'health');
  const [goalKind, setGoalKind] = useState<'check' | 'count'>(existing?.goal.kind ?? 'check');
  const [target, setTarget] = useState(existing?.goal.kind === 'count' ? existing.goal.target : 8);
  const [unit, setUnit] = useState(existing?.goal.kind === 'count' ? existing.goal.unit : 'times');
  const [days, setDays] = useState<number[]>(existing?.days ?? EVERY_DAY);
  const [hasReminder, setHasReminder] = useState(existing ? existing.reminder !== null : false);
  const [hour, setHour] = useState(existing?.reminder?.hour ?? 9);
  const [minute, setMinute] = useState(existing?.reminder?.minute ?? 0);
  const [plant, setPlant] = useState<PlantSpecies>(existing?.plant ?? 'daisy');
  const [isSaving, setIsSaving] = useState(false);

  const applyTemplate = (template: HabitTemplate) => {
    setName(template.name);
    setEmoji(template.emoji);
    setColor(template.color);
    setCategory(template.category);
    setGoalKind(template.goal.kind);
    if (template.goal.kind === 'count') {
      setTarget(template.goal.target);
      setUnit(template.goal.unit);
    }
    setPlant(template.plant);
    setMode('custom');
  };

  const canSave = name.trim().length > 0 && days.length > 0 && (goalKind === 'check' || unit.trim().length > 0);

  const save = async () => {
    setIsSaving(true);
    const habit: Habit = {
      id: existing?.id ?? createId('habit'),
      createdAt: existing?.createdAt ?? today,
      notificationIds: existing?.notificationIds ?? [],
      name: name.trim(),
      emoji,
      color,
      category,
      goal: goalKind === 'count' ? { kind: 'count', target, unit: unit.trim() } : { kind: 'check' },
      days: [...days].sort((a, b) => a - b),
      reminder: hasReminder ? { hour, minute } : null,
      plant,
    };
    await actions.saveHabit(habit);
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(`Delete "${existing.name}"?`, 'Its plant and history will be removed. XP you already earned stays.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await actions.deleteHabit(existing.id);
          router.dismissAll();
        },
      },
    ]);
  };

  const tint = habitTint(color);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        footer={
          mode === 'custom' ? <Button label={existing ? 'Save changes' : 'Plant this habit 🌱'} onPress={save} isDisabled={!canSave} isLoading={isSaving} gradient={tint.gradient} /> : undefined
        }
      >
        <ScreenHeader title={existing ? 'Edit habit' : 'New habit'} />
        {!existing ? (
          <View style={{ marginBottom: spacing.md }}>
            <Segmented
              options={[
                { value: 'templates', label: '✨ Ideas' },
                { value: 'custom', label: '✏️ Create' },
              ]}
              value={mode}
              onChange={setMode}
            />
          </View>
        ) : null}

        {mode === 'templates' ? (
          categoryIds.map((categoryId) => (
            <View key={categoryId} style={{ marginBottom: spacing.md }}>
              <AppText variant="subheading" style={{ marginBottom: spacing.xs }}>
                {categories[categoryId].emoji} {categories[categoryId].label}
              </AppText>
              {habitTemplates
                .filter((template) => template.category === categoryId)
                .map((template) => (
                  <Card key={template.id} style={styles.templateRow} onPress={() => applyTemplate(template)} accessibilityLabel={`Use template ${template.name}`}>
                    <View style={[styles.templateEmoji, { backgroundColor: habitTint(template.color).soft }]}>
                      <AppText style={styles.emojiText}>{template.emoji}</AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyBold">{template.name}</AppText>
                      <AppText variant="caption" tone="muted">
                        {template.goal.kind === 'count' ? `${template.goal.target} ${template.goal.unit} a day` : 'Once a day'}
                      </AppText>
                    </View>
                    <Icon name="add-circle" size={26} color={habitTint(template.color).base} />
                  </Card>
                ))}
            </View>
          ))
        ) : (
          <View>
            <Card style={[styles.preview, { backgroundColor: tint.soft }]}>
              <AppText style={styles.previewEmoji}>{emoji}</AppText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Name your habit"
                placeholderTextColor={colors.textSoft}
                maxLength={40}
                style={[styles.nameInput, { color: colors.text, fontFamily: fonts.extraBold }]}
                accessibilityLabel="Habit name"
              />
            </Card>

            <FieldLabel>ICON</FieldLabel>
            <View style={styles.emojiGrid}>
              {habitEmojis.map((candidate) => (
                <Pressable
                  key={candidate}
                  onPress={() => setEmoji(candidate)}
                  accessibilityRole="button"
                  accessibilityLabel={`Icon ${candidate}`}
                  accessibilityState={{ selected: candidate === emoji }}
                  style={[styles.emojiCell, { backgroundColor: candidate === emoji ? tint.soft : colors.surface, borderColor: candidate === emoji ? tint.base : colors.border }]}
                >
                  <AppText style={styles.emojiText}>{candidate}</AppText>
                </Pressable>
              ))}
            </View>

            <FieldLabel>COLOR</FieldLabel>
            <View style={styles.colorRow}>
              {habitColorIds.map((candidate) => (
                <Pressable
                  key={candidate}
                  onPress={() => setColor(candidate)}
                  accessibilityRole="button"
                  accessibilityLabel={`Color ${candidate}`}
                  accessibilityState={{ selected: candidate === color }}
                  style={[styles.swatch, { backgroundColor: habitColors[candidate].base }, candidate === color && { borderColor: colors.text, borderWidth: 3 }]}
                >
                  {candidate === color ? <Icon name="checkmark" size={16} color="#FFFFFF" /> : null}
                </Pressable>
              ))}
            </View>

            <FieldLabel>CATEGORY</FieldLabel>
            <View style={styles.wrapRow}>
              {categoryIds.map((candidate) => (
                <Chip key={candidate} label={categories[candidate].label} emoji={categories[candidate].emoji} isSelected={candidate === category} onPress={() => setCategory(candidate)} tint={tint.base} />
              ))}
            </View>

            <FieldLabel>GOAL</FieldLabel>
            <Card style={{ gap: spacing.sm }}>
              <Segmented
                options={[
                  { value: 'check', label: 'Yes / No' },
                  { value: 'count', label: 'Amount' },
                ]}
                value={goalKind}
                onChange={setGoalKind}
              />
              {goalKind === 'count' ? (
                <View style={styles.goalRow}>
                  <Stepper value={target} onChange={setTarget} min={1} max={999} step={target >= 20 ? 5 : 1} />
                  <TextInput
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="unit, e.g. glasses"
                    placeholderTextColor={colors.textSoft}
                    maxLength={14}
                    style={[styles.unitInput, { color: colors.text, backgroundColor: colors.surfaceSunken, fontFamily: fonts.bold }]}
                    accessibilityLabel="Goal unit"
                  />
                </View>
              ) : (
                <AppText variant="caption" tone="muted">
                  Simply mark it done once a day.
                </AppText>
              )}
            </Card>

            <FieldLabel>SCHEDULE</FieldLabel>
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.wrapRow}>
                <Chip label="Every day" isSelected={sameDays(days, EVERY_DAY)} onPress={() => setDays(EVERY_DAY)} tint={tint.base} />
                <Chip label="Weekdays" isSelected={sameDays(days, WEEKDAYS)} onPress={() => setDays(WEEKDAYS)} tint={tint.base} />
                <Chip label="Weekends" isSelected={sameDays(days, WEEKENDS)} onPress={() => setDays(WEEKENDS)} tint={tint.base} />
              </View>
              <View style={styles.dayRow}>
                {MONDAY_FIRST.map((day) => {
                  const isOn = days.includes(day);
                  return (
                    <Pressable
                      key={day}
                      onPress={() => setDays((current) => (isOn ? current.filter((candidate) => candidate !== day) : [...current, day]))}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isOn }}
                      style={[styles.dayCell, { backgroundColor: isOn ? tint.base : colors.surfaceSunken }]}
                    >
                      <AppText variant="label" color={isOn ? '#FFFFFF' : colors.textMuted}>
                        {WEEKDAY_LETTER[day]}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
              {days.length === 0 ? (
                <AppText variant="caption" tone="danger">
                  Pick at least one day.
                </AppText>
              ) : null}
            </Card>

            <FieldLabel>REMINDER</FieldLabel>
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.reminderRow}>
                <Icon name="notifications-outline" size={20} color={tint.base} />
                <AppText variant="bodyBold" style={{ flex: 1 }}>
                  {hasReminder ? `Remind me at ${formatTime(hour, minute)}` : 'No reminder'}
                </AppText>
                <Switch value={hasReminder} onValueChange={setHasReminder} trackColor={{ true: tint.base, false: colors.border }} thumbColor="#FFFFFF" />
              </View>
              {hasReminder ? (
                <View style={styles.goalRow}>
                  <Stepper value={hour} onChange={setHour} min={0} max={23} step={1} format={(value) => formatTime(value, 0).replace(':00', '')} />
                  <Stepper value={minute} onChange={setMinute} min={0} max={55} step={5} format={(value) => `:${String(value).padStart(2, '0')}`} />
                </View>
              ) : null}
              {hasReminder && !state.settings.remindersEnabled ? (
                <AppText variant="caption" tone="danger">
                  Reminders are turned off in Settings.
                </AppText>
              ) : null}
            </Card>

            <FieldLabel>PLANT</FieldLabel>
            <View style={styles.plantRow}>
              {plantIds.map((candidate) => {
                const meta = plants[candidate];
                const isLocked = meta.premium && !isPremium;
                const isSelected = candidate === plant;
                return (
                  <Pressable
                    key={candidate}
                    onPress={() => (isLocked ? router.push('/premium') : setPlant(candidate))}
                    accessibilityRole="button"
                    accessibilityLabel={`${meta.name}${isLocked ? ', premium' : ''}`}
                    accessibilityState={{ selected: isSelected }}
                    style={[styles.plantCell, { backgroundColor: colors.surface, borderColor: isSelected ? tint.base : colors.border }, isSelected && { borderWidth: 2.5 }]}
                  >
                    <View style={{ opacity: isLocked ? 0.4 : 1 }}>
                      <Plant species={candidate} stage={4} size={50} />
                    </View>
                    <AppText variant="micro" numberOfLines={1}>
                      {isLocked ? '👑 ' : ''}
                      {meta.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {existing ? <Button label="Delete habit" variant="danger" icon="trash-outline" onPress={confirmDelete} style={{ marginTop: spacing.xl }} /> : null}
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, marginBottom: spacing.xs },
  templateEmoji: { width: 44, height: 44, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 22, lineHeight: 28 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 0 },
  previewEmoji: { fontSize: 38, lineHeight: 46 },
  nameInput: { flex: 1, fontSize: 20, minHeight: 48 },
  fieldLabel: { marginTop: spacing.lg, marginBottom: spacing.xs, letterSpacing: 1 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiCell: { width: 46, height: 46, borderRadius: radii.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.md, height: 46, paddingHorizontal: 4 },
  stepButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 56, textAlign: 'center' },
  unitInput: { flex: 1, height: 46, borderRadius: radii.md, paddingHorizontal: spacing.sm, fontSize: 15 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  plantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'space-between' },
  plantCell: { width: '31.5%', alignItems: 'center', paddingVertical: spacing.xs, borderRadius: radii.md, borderWidth: 1.5, gap: 2 },
});
