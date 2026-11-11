import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { fromDateKey, WEEKDAY_SHORT, weekKeys, type DateKey } from '@/lib/dates';
import { dayCompletion } from '@/lib/gamification';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type DateStripProps = { selected: DateKey; onSelect: (key: DateKey) => void };

export function DateStrip({ selected, onSelect }: DateStripProps) {
  const { colors } = useTheme();
  const { state, today, feedback } = useStore();

  return (
    <View style={styles.row}>
      {weekKeys(today).map((key) => {
        const isSelected = key === selected;
        const isFuture = key > today;
        const { done, total } = dayCompletion(state.habits, state.logs, key);
        const dotColor = total === 0 || done === 0 ? 'transparent' : done === total ? colors.success : colors.streak;
        const date = fromDateKey(key);
        return (
          <Pressable
            key={key}
            disabled={isFuture}
            onPress={() => {
              feedback.select();
              onSelect(key);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isFuture }}
            accessibilityLabel={`${WEEKDAY_SHORT[date.getDay()]} ${date.getDate()}${key === today ? ', today' : ''}`}
            style={[
              styles.day,
              { opacity: isFuture ? 0.4 : 1 },
              isSelected && { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
            ]}
          >
            <AppText variant="micro" color={isSelected ? 'rgba(255,255,255,0.8)' : colors.textSoft}>
              {WEEKDAY_SHORT[date.getDay()].toUpperCase()}
            </AppText>
            <AppText variant="heading" color={isSelected ? '#FFFFFF' : colors.text}>
              {date.getDate()}
            </AppText>
            <View style={[styles.dot, { backgroundColor: isSelected && dotColor !== 'transparent' ? '#FFFFFF' : dotColor }]} />
            {key === today && !isSelected ? <View style={[styles.todayRing, { borderColor: colors.primary }]} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  day: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs, borderRadius: radii.md, gap: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  todayRing: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1.5, borderRadius: radii.md },
});
