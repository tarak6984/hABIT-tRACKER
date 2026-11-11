import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const KNOB_SIZE = 52;
const INSET = 5;
const COMPLETE_THRESHOLD = 0.8;

type SlideToCompleteProps = { label: string; tint: string; onComplete: () => void };

export function SlideToComplete({ label, tint, onComplete }: SlideToCompleteProps) {
  const { colors } = useTheme();
  const trackWidth = useSharedValue(0);
  const offset = useSharedValue(0);

  const pan = usePanGesture({
    activeOffsetX: [-8, 8],
    failOffsetY: [-14, 14],
    onUpdate: (event) => {
      'worklet';
      const max = trackWidth.value - KNOB_SIZE - INSET * 2;
      offset.value = Math.min(Math.max(event.translationX, 0), max);
    },
    onDeactivate: () => {
      'worklet';
      const max = trackWidth.value - KNOB_SIZE - INSET * 2;
      if (max > 0 && offset.value >= max * COMPLETE_THRESHOLD) {
        offset.value = withTiming(max, { duration: 120 });
        scheduleOnRN(onComplete);
        return;
      }
      offset.value = withSpring(0, { damping: 15, stiffness: 180 });
    },
  });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: offset.value + KNOB_SIZE + INSET * 2 }));
  const labelStyle = useAnimatedStyle(() => {
    const max = Math.max(1, trackWidth.value - KNOB_SIZE - INSET * 2);
    return { opacity: interpolate(offset.value, [0, max * 0.6], [1, 0], 'clamp') };
  });

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityHint="Slide right to mark as done, or double tap"
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={onComplete}
      onLayout={(event) => {
        trackWidth.set(event.nativeEvent.layout.width);
      }}
      style={[styles.track, { backgroundColor: colors.surfaceSunken }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: `${tint}33` }, fillStyle]} />
      <Animated.View style={[styles.labelWrap, labelStyle]} pointerEvents="none">
        <AppText variant="bodyBold" tone="muted">
          {label}
        </AppText>
        <Icon name="chevron-forward" size={16} color={colors.textSoft} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, { backgroundColor: tint, shadowColor: tint }, knobStyle]}>
          <Icon name="checkmark" size={26} color="#FFFFFF" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: KNOB_SIZE + INSET * 2, borderRadius: radii.pill, justifyContent: 'center', overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: radii.pill },
  labelWrap: { position: 'absolute', left: KNOB_SIZE + INSET * 3, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  knob: {
    position: 'absolute',
    left: INSET,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
