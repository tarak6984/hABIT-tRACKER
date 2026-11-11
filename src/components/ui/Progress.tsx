import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

type ProgressBarProps = {
  progress: number;
  colors?: readonly [string, string];
  height?: number;
  trackColor?: string;
};

export function ProgressBar({ progress, colors: gradient, height = 10, trackColor }: ProgressBarProps) {
  const { colors } = useTheme();
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withSpring(clamp01(progress), { damping: 18, stiffness: 120 });
  }, [animated, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${animated.value * 100}%` }));

  return (
    <View style={{ height, borderRadius: height, backgroundColor: trackColor ?? colors.surfaceSunken, overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', borderRadius: height, overflow: 'hidden' }, fillStyle]}>
        <LinearGradient
          colors={gradient ?? [colors.xp, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  progress: number;
  size: number;
  strokeWidth?: number;
  colors?: readonly [string, string];
  trackColor?: string;
  children?: ReactNode;
};

export function ProgressRing({ progress, size, strokeWidth = 12, colors: gradient, trackColor, children }: ProgressRingProps) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useSharedValue(0);
  const [from, to] = gradient ?? [colors.xp, colors.primary];
  const gradientId = `ring${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    animated.value = withTiming(clamp01(progress), { duration: 900 });
  }, [animated, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? colors.surfaceSunken}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
