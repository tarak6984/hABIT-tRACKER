import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useStore } from '@/store/AppStore';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type SegmentedProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const { colors } = useTheme();
  const { feedback } = useStore();

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceSunken }]} accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              feedback.select();
              onChange(option.value);
            }}
            style={[
              styles.segment,
              isActive && {
                backgroundColor: colors.surface,
                shadowColor: colors.shadow,
                shadowOpacity: 0.12,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              },
            ]}
          >
            <AppText variant="label" tone={isActive ? 'default' : 'muted'} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, borderRadius: radii.md, gap: 4 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: radii.sm + 2 },
});
