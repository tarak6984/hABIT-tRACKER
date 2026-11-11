import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

const FRUIT_COLORS = ['#FF7EA8', '#FFC93C', '#FF8A5B', '#B794F6'];

/** The garden centerpiece: grows with the player's level and bears one fruit per level. */
export function LifeTree({ level, size }: { level: number; size: number }) {
  const growth = Math.min(1, (level - 1) / 9);
  const trunkHeight = 26 + growth * 40;
  const baseY = 168;
  const crownY = baseY - trunkHeight - 8;
  const radius = 26 + growth * 30;
  const trunkWidth = 7 + growth * 7;
  const fruitCount = Math.min(level, 14);

  const blobs = [
    { dx: 0, dy: -radius * 0.45, r: radius * 0.78, color: '#6BD69C' },
    { dx: -radius * 0.62, dy: 0, r: radius * 0.66, color: '#4CC285' },
    { dx: radius * 0.62, dy: 0, r: radius * 0.66, color: '#4CC285' },
    { dx: 0, dy: radius * 0.18, r: radius * 0.8, color: '#5BC98A' },
    { dx: -radius * 0.3, dy: -radius * 0.3, r: radius * 0.34, color: '#8BE3B2' },
  ];

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Ellipse cx={100} cy={172} rx={70} ry={12} fill="#7AD9A1" opacity={0.55} />
      <Ellipse cx={100} cy={170} rx={46} ry={7} fill="#5BC98A" opacity={0.6} />
      <Path
        d={`M${100 - trunkWidth / 2} ${baseY} Q${100 - trunkWidth / 3} ${baseY - trunkHeight / 2} ${100 - trunkWidth / 4} ${crownY + 10} L${100 + trunkWidth / 4} ${crownY + 10} Q${100 + trunkWidth / 3} ${baseY - trunkHeight / 2} ${100 + trunkWidth / 2} ${baseY} Z`}
        fill="#9A6A4F"
      />
      {growth > 0.3 ? (
        <Path d={`M100 ${crownY + 22} Q${88 - growth * 10} ${crownY + 12} ${80 - growth * 12} ${crownY + 4}`} stroke="#9A6A4F" strokeWidth={4} strokeLinecap="round" fill="none" />
      ) : null}
      <G>
        {blobs.map((blob, index) => (
          <Circle key={index} cx={100 + blob.dx} cy={crownY + blob.dy} r={blob.r} fill={blob.color} />
        ))}
      </G>
      {Array.from({ length: fruitCount }, (_, index) => {
        const angle = index * 2.399963;
        const distance = radius * (0.35 + ((index * 37) % 50) / 100);
        return (
          <Circle
            key={index}
            cx={100 + Math.cos(angle) * distance}
            cy={crownY + Math.sin(angle) * distance * 0.75}
            r={3.4 + growth}
            fill={FRUIT_COLORS[index % FRUIT_COLORS.length]}
          />
        );
      })}
    </Svg>
  );
}
