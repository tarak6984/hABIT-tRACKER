import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { PlantSpecies } from '@/store/types';

const LEAF = '#5BC98A';
const LEAF_DARK = '#3FAE72';
const WILTED = '#C2A77E';
const WILTED_DARK = '#A88B62';
const STEM_TOPS = [84, 70, 58, 46, 40] as const;
const LEAF_PAIRS = [
  { y: 77, size: 12 },
  { y: 67, size: 15 },
  { y: 57, size: 13 },
] as const;

function Leaf({ x, y, size, side, color }: { x: number; y: number; size: number; side: 1 | -1; color: string }) {
  const tip = size * side;
  const d = `M${x} ${y} Q${x + tip * 0.5} ${y - size * 0.55} ${x + tip} ${y - size * 0.25} Q${x + tip * 0.55} ${y + size * 0.3} ${x} ${y} Z`;
  return <Path d={d} fill={color} />;
}

function Pot({ color = '#EE8E6E', rim = '#F7AC90' }: { color?: string; rim?: string }) {
  return (
    <G>
      <Path d="M27 95 L73 95 L67.5 116 Q66.5 119 63 119 L37 119 Q33.5 119 32.5 116 Z" fill={color} />
      <Rect x={22} y={86} width={56} height={11} rx={4.5} fill={rim} />
      <Ellipse cx={50} cy={87.5} rx={24} ry={3.2} fill="#6B4A3A" />
      <Path d="M33 101 L36 113" stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
    </G>
  );
}

function Bloom({ species, top }: { species: PlantSpecies; top: number }) {
  switch (species) {
    case 'daisy':
      return (
        <G>
          {Array.from({ length: 10 }, (_, index) => (
            <Ellipse key={index} cx={50} cy={top - 8} rx={4.2} ry={8.5} fill="#FFFFFF" stroke="#EDE6FF" strokeWidth={0.8} transform={`rotate(${index * 36} 50 ${top})`} />
          ))}
          <Circle cx={50} cy={top} r={6} fill="#FFC93C" />
          <Circle cx={48} cy={top - 2} r={1.8} fill="#FFE38A" />
        </G>
      );
    case 'sunflower':
      return (
        <G>
          {Array.from({ length: 14 }, (_, index) => (
            <Ellipse key={index} cx={50} cy={top - 10} rx={3.6} ry={9} fill={index % 2 ? '#FFC93C' : '#FFB400'} transform={`rotate(${index * (360 / 14)} 50 ${top})`} />
          ))}
          <Circle cx={50} cy={top} r={8} fill="#7A4A2A" />
          <Circle cx={47} cy={top - 2} r={1.3} fill="#A06A40" />
          <Circle cx={52} cy={top + 2} r={1.3} fill="#A06A40" />
          <Circle cx={53} cy={top - 3} r={1.1} fill="#A06A40" />
        </G>
      );
    case 'tulip':
      return (
        <G>
          <Path d={`M39 ${top - 12} Q38 ${top + 7} 50 ${top + 7} Q62 ${top + 7} 61 ${top - 12} L55.5 ${top - 5} L50 ${top - 15} L44.5 ${top - 5} Z`} fill="#FF7EA8" />
          <Path d={`M44 ${top - 6} Q44 ${top + 3} 49 ${top + 4}`} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'lavender':
      return (
        <G>
          {Array.from({ length: 8 }, (_, index) => (
            <G key={index}>
              <Ellipse cx={46.5} cy={top + index * 2.6} rx={3} ry={2.4} fill={index % 2 ? '#B794F6' : '#9F7AEA'} />
              <Ellipse cx={53.5} cy={top + 1.3 + index * 2.6} rx={3} ry={2.4} fill={index % 2 ? '#9F7AEA' : '#B794F6'} />
            </G>
          ))}
          <Ellipse cx={50} cy={top - 3} rx={2.8} ry={3.4} fill="#B794F6" />
        </G>
      );
    case 'cherry':
      return (
        <G>
          <Circle cx={38} cy={top + 6} r={12} fill="#FFB3CF" />
          <Circle cx={62} cy={top + 6} r={12} fill="#FFB3CF" />
          <Circle cx={50} cy={top - 4} r={14} fill="#FF9CC2" />
          <Circle cx={50} cy={top + 10} r={11} fill="#FFC4D9" />
          {[[42, top - 2], [57, top + 1], [47, top + 12], [62, top + 9], [36, top + 8]].map(([cx, cy], index) => (
            <Circle key={index} cx={cx} cy={cy} r={1.8} fill="#FFFFFF" />
          ))}
        </G>
      );
    case 'cactus':
      return <Circle cx={50} cy={top} r={4.5} fill="#FF7EA8" />;
  }
}

function Cactus({ stage, isWilted }: { stage: number; isWilted: boolean }) {
  const height = [0, 14, 24, 34, 42][stage];
  const top = 87 - height;
  const body = isWilted ? WILTED : LEAF;
  const rib = isWilted ? WILTED_DARK : LEAF_DARK;
  return (
    <G>
      {stage >= 3 ? (
        <G>
          <Path d={`M42 ${top + 20} Q31 ${top + 20} 31 ${top + 10} L31 ${top + 5}`} stroke={body} strokeWidth={8} strokeLinecap="round" fill="none" />
          <Path d={`M58 ${top + 26} Q68 ${top + 26} 68 ${top + 16} L68 ${top + 12}`} stroke={body} strokeWidth={8} strokeLinecap="round" fill="none" />
        </G>
      ) : null}
      <Rect x={41} y={top} width={18} height={height + 2} rx={9} fill={body} />
      <Path d={`M50 ${top + 5} L50 ${87}`} stroke={rib} strokeWidth={1.2} strokeOpacity={0.6} />
      <Path d={`M45.5 ${top + 7} L45.5 ${87}`} stroke={rib} strokeWidth={1} strokeOpacity={0.4} />
      <Path d={`M54.5 ${top + 7} L54.5 ${87}`} stroke={rib} strokeWidth={1} strokeOpacity={0.4} />
      {stage === 4 && !isWilted ? <Bloom species="cactus" top={top - 1} /> : null}
    </G>
  );
}

type PlantProps = { species: PlantSpecies; stage: number; size: number; isWilted?: boolean; potColor?: string };

export function Plant({ species, stage, size, isWilted = false, potColor }: PlantProps) {
  const top = STEM_TOPS[stage] ?? STEM_TOPS[0];
  const leaf = isWilted ? WILTED : LEAF;
  const leafDark = isWilted ? WILTED_DARK : LEAF_DARK;
  const stem = species === 'cherry' ? '#8A5A44' : leafDark;
  const pairs = LEAF_PAIRS.slice(0, Math.min(stage, 3));

  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
      <Ellipse cx={50} cy={118} rx={26} ry={2.5} fill="#1F1A3D" opacity={0.08} />
      <G transform={isWilted ? 'rotate(9 50 87)' : undefined}>
        {stage === 0 ? (
          <G>
            <Ellipse cx={50} cy={86} rx={9} ry={4} fill="#8A6450" />
            <Path d="M50 84 Q50 79 53 77" stroke={leafDark} strokeWidth={2.2} strokeLinecap="round" fill="none" />
          </G>
        ) : species === 'cactus' ? (
          <Cactus stage={stage} isWilted={isWilted} />
        ) : (
          <G>
            <Path d={`M50 87 Q47.5 ${(top + 87) / 2} 50 ${top}`} stroke={stem} strokeWidth={species === 'cherry' && stage >= 3 ? 5 : 3} strokeLinecap="round" fill="none" />
            {pairs.map((pair, index) => (
              <G key={pair.y}>
                <Leaf x={49} y={pair.y} size={pair.size} side={-1} color={index % 2 ? leafDark : leaf} />
                <Leaf x={51} y={pair.y - 3} size={pair.size} side={1} color={index % 2 ? leaf : leafDark} />
              </G>
            ))}
            {stage === 3 ? <Ellipse cx={50} cy={top - 3} rx={5.5} ry={7.5} fill={isWilted ? WILTED_DARK : '#FF9CC2'} /> : null}
            {stage === 4 ? (
              <G opacity={isWilted ? 0.55 : 1}>
                <Bloom species={species} top={top} />
              </G>
            ) : null}
          </G>
        )}
      </G>
      <Pot color={potColor} />
    </Svg>
  );
}
