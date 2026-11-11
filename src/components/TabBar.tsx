import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const tabMeta: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  index: { label: 'Today', icon: 'sunny-outline', activeIcon: 'sunny' },
  garden: { label: 'Garden', icon: 'leaf-outline', activeIcon: 'leaf' },
  community: { label: 'Social', icon: 'people-outline', activeIcon: 'people' },
  stats: { label: 'Stats', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  profile: { label: 'Me', icon: 'person-outline', activeIcon: 'person' },
};

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const { feedback } = useStore();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.tabBar,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOpacity: isDark ? 0.5 : 0.14,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const meta = tabMeta[route.name];
          if (!meta) return null;
          const isFocused = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={meta.label}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (isFocused || event.defaultPrevented) return;
                feedback.select();
                navigateToTab(route.key);
              }}
              style={styles.slot}
            >
              <Animated.View
                layout={LinearTransition.springify().damping(18)}
                style={[styles.item, isFocused && { backgroundColor: colors.primarySoft, paddingHorizontal: spacing.sm + 2 }]}
              >
                <Icon name={isFocused ? meta.activeIcon : meta.icon} size={22} color={isFocused ? colors.primary : colors.textSoft} />
                {isFocused ? (
                  <AppText variant="label" tone="primary" numberOfLines={1}>
                    {meta.label}
                  </AppText>
                ) : null}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.md },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    height: 68,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  slot: { flexGrow: 1, alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 46, borderRadius: radii.lg, paddingHorizontal: spacing.xs },
});
