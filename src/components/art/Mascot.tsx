import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import type { MascotId } from '@/store/types';

export type MascotMood = 'happy' | 'joy' | 'sleepy';

type EarStyle = 'leaf' | 'cat' | 'bunny' | 'tuft' | 'bear' | 'fox' | 'cloud' | 'owl' | 'frog';

type Look = { body: string; belly: string; accent: string; feet: string; ears: EarStyle; backdrop: string };

export const mascotLooks: Record<MascotId, Look> = {
  sprout: { body: '#8EE3B5', belly: '#DDF8E9', accent: '#3FAE72', feet: '#5CC98F', ears: 'leaf', backdrop: '#DDF7EC' },
  mochi: { body: '#FFB8D0', belly: '#FFE8F0', accent: '#FF8FB1', feet: '#F59BBB', ears: 'cat', backdrop: '#FFE4EF' },
  bun: { body: '#C9B8FF', belly: '#F0EBFF', accent: '#FFB8D0', feet: '#A996F0', ears: 'bunny', backdrop: '#ECE8FF' },
  pip: { body: '#FFDB6E', belly: '#FFF3C9', accent: '#FF9F43', feet: '#FF9F43', ears: 'tuft', backdrop: '#FFF4CC' },
  boba: { body: '#9FD3FF', belly: '#E4F3FF', accent: '#6BB8F5', feet: '#78BDF2', ears: 'bear', backdrop: '#E1F2FF' },
  ember: { body: '#FFAB76', belly: '#FFF1E6', accent: '#FFFFFF', feet: '#E8875A', ears: 'fox', backdrop: '#FFEBE1' },
  nimbus: { body: '#F3F5FF', belly: '#FFFFFF', accent: '#C3CCF7', feet: '#D3DAFA', ears: 'cloud', backdrop: '#E6EBFF' },
  luna: { body: '#6A6ED6', belly: '#A9ACF5', accent: '#FFD66B', feet: '#5256B8', ears: 'owl', backdrop: '#E3E4FF' },
  zest: { body: '#A8E66A', belly: '#E8FAD3', accent: '#6CC24A', feet: '#86D157', ears: 'frog', backdrop: '#ECFADF' },
};

const INK = '#2B2140';

const mirror = (path: string) =>
  path.replace(/([ML]) ?(-?[\d.]+) (-?[\d.]+)/g, (_match, command: string, x: string, y: string) => `${command}${100 - Number(x)} ${y}`);

function Ears({ look }: { look: Look }) {
  switch (look.ears) {
    case 'cat': {
      const outer = 'M24 44 L27 17 L45 31 Z';
      const inner = 'M28 38 L29.5 24 L39 32 Z';
      return (
        <G>
          <Path d={outer} fill={look.body} />
          <Path d={inner} fill={look.accent} />
          <Path d={mirror(outer)} fill={look.body} />
          <Path d={mirror(inner)} fill={look.accent} />
        </G>
      );
    }
    case 'fox': {
      const outer = 'M21 46 L23 11 L45 30 Z';
      const inner = 'M26 39 L26 19 L39 30 Z';
      return (
        <G>
          <Path d={outer} fill={look.body} />
          <Path d={inner} fill={look.accent} />
          <Path d={mirror(outer)} fill={look.body} />
          <Path d={mirror(inner)} fill={look.accent} />
        </G>
      );
    }
    case 'bunny':
      return (
        <G>
          <Ellipse cx={37} cy={17} rx={7.5} ry={18} fill={look.body} transform="rotate(-10 37 30)" />
          <Ellipse cx={37} cy={18} rx={3.6} ry={12} fill={look.accent} transform="rotate(-10 37 30)" />
          <Ellipse cx={63} cy={17} rx={7.5} ry={18} fill={look.body} transform="rotate(10 63 30)" />
          <Ellipse cx={63} cy={18} rx={3.6} ry={12} fill={look.accent} transform="rotate(10 63 30)" />
        </G>
      );
    case 'bear':
      return (
        <G>
          <Circle cx={26} cy={35} r={10} fill={look.body} />
          <Circle cx={26} cy={35} r={5.5} fill={look.accent} />
          <Circle cx={74} cy={35} r={10} fill={look.body} />
          <Circle cx={74} cy={35} r={5.5} fill={look.accent} />
        </G>
      );
    case 'tuft':
      return (
        <G fill={look.accent}>
          <Ellipse cx={45} cy={26} rx={3} ry={7} transform="rotate(-25 45 26)" />
          <Ellipse cx={50} cy={23} rx={3.2} ry={8} />
          <Ellipse cx={55} cy={26} rx={3} ry={7} transform="rotate(25 55 26)" />
        </G>
      );
    case 'cloud':
      return (
        <G fill={look.body}>
          <Circle cx={31} cy={40} r={13} />
          <Circle cx={50} cy={31} r={15} />
          <Circle cx={69} cy={40} r={13} />
        </G>
      );
    case 'owl': {
      const tuft = 'M22 42 L19 21 L37 32 Z';
      return (
        <G fill={look.body}>
          <Path d={tuft} />
          <Path d={mirror(tuft)} />
        </G>
      );
    }
    case 'frog':
      return (
        <G fill={look.body}>
          <Circle cx={36} cy={35} r={12} />
          <Circle cx={64} cy={35} r={12} />
        </G>
      );
    case 'leaf':
      return null;
  }
}

function HeadDetail({ look }: { look: Look }) {
  if (look.ears === 'leaf') {
    return (
      <G>
        <Path d="M50 31 Q50 23 52 16" stroke={look.accent} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M52 18 Q62 7 71 13 Q63 24 52 18 Z" fill={look.accent} />
        <Path d="M51 20 Q40 11 33 17 Q41 26 51 20 Z" fill="#5BC98A" />
      </G>
    );
  }
  if (look.ears === 'owl') {
    return (
      <G>
        <Circle cx={50} cy={39} r={5} fill={look.accent} />
        <Circle cx={52.4} cy={37.6} r={4.3} fill={look.body} />
      </G>
    );
  }
  return null;
}

function Eye({ x, y, mood }: { x: number; y: number; mood: MascotMood }) {
  if (mood === 'joy') {
    return <Path d={`M${x - 4.5} ${y + 1.5} Q${x} ${y - 5} ${x + 4.5} ${y + 1.5}`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />;
  }
  if (mood === 'sleepy') {
    return <Path d={`M${x - 4.5} ${y} Q${x} ${y + 4} ${x + 4.5} ${y}`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />;
  }
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={4.3} ry={5.2} fill={INK} />
      <Circle cx={x + 1.5} cy={y - 1.9} r={1.7} fill="#FFFFFF" />
      <Circle cx={x - 1.4} cy={y + 2} r={0.8} fill="#FFFFFF" opacity={0.8} />
    </G>
  );
}

function Face({ look, mood }: { look: Look; mood: MascotMood }) {
  const isFrog = look.ears === 'frog';
  const eyeY = isFrog ? 35 : 56;
  const eyeX = isFrog ? [36, 64] : [39, 61];
  return (
    <G>
      {isFrog ? (
        <G fill="#FFFFFF">
          <Circle cx={36} cy={35} r={7} />
          <Circle cx={64} cy={35} r={7} />
        </G>
      ) : null}
      <Eye x={eyeX[0]} y={eyeY} mood={mood} />
      <Eye x={eyeX[1]} y={eyeY} mood={mood} />
      <Ellipse cx={30} cy={65} rx={5.2} ry={3.2} fill="#FF7E9D" opacity={0.45} />
      <Ellipse cx={70} cy={65} rx={5.2} ry={3.2} fill="#FF7E9D" opacity={0.45} />
      {look.ears === 'tuft' ? (
        <Path d="M45.5 61 L54.5 61 L50 67 Z" fill={look.accent} strokeLinejoin="round" />
      ) : mood === 'joy' ? (
        <Path d="M44.5 62 Q50 71 55.5 62 Z" fill="#7A2E45" />
      ) : (
        <Path d="M46 63 Q50 67 54 63" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      )}
    </G>
  );
}

type MascotProps = {
  id: MascotId;
  size: number;
  mood?: MascotMood;
  isAnimated?: boolean;
  hasBackdrop?: boolean;
};

export function Mascot({ id, size, mood = 'happy', isAnimated = false, hasBackdrop = false }: MascotProps) {
  const look = mascotLooks[id];
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!isAnimated) return;
    bob.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [bob, isAnimated]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * size * 0.04 }, { scaleY: 1 + bob.value * 0.02 }],
  }));

  const art = (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={`${id} companion`}>
      {hasBackdrop ? <Circle cx={50} cy={50} r={50} fill={look.backdrop} /> : null}
      <Ellipse cx={50} cy={93} rx={26} ry={3.5} fill="#1F1A3D" opacity={0.08} />
      <Ears look={look} />
      <Ellipse cx={37} cy={88} rx={8} ry={4.8} fill={look.feet} />
      <Ellipse cx={63} cy={88} rx={8} ry={4.8} fill={look.feet} />
      <Path d="M50 28 C73 28 85 42 85 60 C85 78 71 90 50 90 C29 90 15 78 15 60 C15 42 27 28 50 28 Z" fill={look.body} />
      <Ellipse cx={50} cy={73} rx={19} ry={13.5} fill={look.belly} />
      <Ellipse cx={35} cy={40} rx={10} ry={5.5} fill="#FFFFFF" opacity={0.35} transform="rotate(-25 35 40)" />
      <HeadDetail look={look} />
      <Face look={look} mood={mood} />
    </Svg>
  );

  if (!isAnimated) return <View style={{ width: size, height: size }}>{art}</View>;
  return <Animated.View style={[{ width: size, height: size }, bobStyle]}>{art}</Animated.View>;
}
