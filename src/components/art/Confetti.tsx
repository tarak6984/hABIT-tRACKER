import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const COLORS = ['#6C5CE7', '#FF7EA8', '#FFC93C', '#3DD9A4', '#3BA7F5', '#FF8A5B'];
const PIECE_COUNT = 42;

type PieceSpec = { x: number; drift: number; delay: number; duration: number; rotation: number; color: string; width: number; height: number };

// Randomized once per app launch, outside render, so every burst stays stable while it animates.
const PIECES: PieceSpec[] = Array.from({ length: PIECE_COUNT }, (_, index) => ({
  x: Math.random(),
  drift: (Math.random() - 0.5) * 120,
  delay: Math.random() * 350,
  duration: 1800 + Math.random() * 1200,
  rotation: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
  color: COLORS[index % COLORS.length],
  width: 7 + Math.random() * 6,
  height: 10 + Math.random() * 8,
}));

function Piece({ spec, fallDistance }: { spec: PieceSpec; fallDistance: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(spec.delay, withTiming(1, { duration: spec.duration, easing: Easing.out(Easing.quad) }));
  }, [progress, spec.delay, spec.duration]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.85 ? 1 : (1 - progress.value) / 0.15,
    transform: [
      { translateX: spec.x + spec.drift * progress.value },
      { translateY: -40 + fallDistance * progress.value },
      { rotate: `${spec.rotation * progress.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[styles.piece, { width: spec.width, height: spec.height, backgroundColor: spec.color, borderRadius: spec.width / 3 }, style]}
    />
  );
}

export function Confetti() {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PIECES.map((spec, index) => (
        <Piece key={index} spec={{ ...spec, x: spec.x * width }} fallDistance={height * 0.85} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, left: 0 },
});
