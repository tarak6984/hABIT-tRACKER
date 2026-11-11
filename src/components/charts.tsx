import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type BarDatum = { label: string; value: number; isHighlighted?: boolean };

function Bar({ ratio, index, gradient, isMuted }: { ratio: number; index: number; gradient: readonly [string, string]; isMuted: boolean }) {
  const height = useSharedValue(0);
  useEffect(() => {
    height.value = withDelay(index * 40, withSpring(ratio, { damping: 16, stiffness: 110 }));
  }, [height, index, ratio]);
  const style = useAnimatedStyle(() => ({ height: `${Math.max(height.value * 100, 3)}%` }));
  return (
    <Animated.View style={[styles.bar, style, isMuted && { opacity: 0.45 }]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

export function BarChart({ data, height = 150, gradient }: { data: BarDatum[]; height?: number; gradient?: readonly [string, string] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((datum) => datum.value));
  const hasHighlight = data.some((datum) => datum.isHighlighted);
  return (
    <View>
      <View style={[styles.bars, { height }]}>
        {data.map((datum, index) => (
          <View key={`${datum.label}-${index}`} style={styles.barColumn}>
            {datum.isHighlighted && datum.value > 0 ? (
              <AppText variant="micro" tone="primary" style={styles.barValue}>
                {datum.value}
              </AppText>
            ) : null}
            <View style={[styles.barTrack, { backgroundColor: colors.surfaceSunken }]}>
              <Bar ratio={datum.value / max} index={index} gradient={gradient ?? [colors.xp, colors.primary]} isMuted={hasHighlight && !datum.isHighlighted} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {data.map((datum, index) => (
          <AppText key={`${datum.label}-${index}`} variant="micro" tone={datum.isHighlighted ? 'primary' : 'soft'} align="center" style={styles.barColumn} numberOfLines={1}>
            {datum.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

type DonutSegment = { value: number; color: string };

export function DonutChart({ segments, size = 168, strokeWidth = 20, children }: { segments: DonutSegment[]; size?: number; strokeWidth?: number; children?: ReactNode }) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const gap = total > 0 && segments.filter((segment) => segment.value > 0).length > 1 ? 6 : 0;
  let cursor = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.surfaceSunken} strokeWidth={strokeWidth} fill="none" />
        {total > 0
          ? segments.map((segment, index) => {
              if (segment.value <= 0) return null;
              const length = (segment.value / total) * circumference;
              const dash = Math.max(0, length - gap);
              const element = (
                <Circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap={gap > 0 ? 'round' : 'butt'}
                  fill="none"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-cursor}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
              cursor += length;
              return element;
            })
          : null}
      </Svg>
      {children}
    </View>
  );
}

type HeatmapProps = { columns: number[][]; color: string; cellSize: number; gap?: number };

/** Columns are weeks, each holding 7 intensity values in [0, 1] (or -1 for "no data"). */
export function Heatmap({ columns, color, cellSize, gap = 3 }: HeatmapProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {columns.map((week, columnIndex) => (
        <View key={columnIndex} style={{ gap }}>
          {week.map((intensity, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: cellSize / 3.5,
                backgroundColor: intensity < 0 ? 'transparent' : intensity === 0 ? colors.surfaceSunken : color,
                opacity: intensity <= 0 ? 1 : 0.3 + intensity * 0.7,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.xs },
  barColumn: { flex: 1, alignItems: 'center' },
  barTrack: { width: '100%', maxWidth: 26, flex: 1, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 8, overflow: 'hidden' },
  barValue: { marginBottom: 2 },
  labels: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
});
