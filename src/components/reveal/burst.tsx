import { memo } from 'react';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '@/theme/theme';

/** Rayons à l'encre du genre, qui s'estompent vers les bords. */
export const Burst = memo(function Burst({ size, color }: { size: number; color: string }) {
  const c = size / 2;
  const rays = [];
  for (let a = 0; a < 360; a += 18) {
    const p = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return `${c + c * Math.cos(rad)},${c + c * Math.sin(rad)}`;
    };
    rays.push(<Path key={a} d={`M${c},${c} L${p(a)} L${p(a + 7)} Z`} fill={color} />);
  }
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="burstFade" cx="50%" cy="50%" r="50%">
          <Stop offset="0.25" stopColor={colors.nuit} stopOpacity={0} />
          <Stop offset="0.9" stopColor={colors.nuit} stopOpacity={1} />
        </RadialGradient>
      </Defs>
      <G>{rays}</G>
      <Circle cx={c} cy={c} r={c} fill="url(#burstFade)" />
    </Svg>
  );
});

/** Halo blanc du flash au moment où la carte se retourne. */
export const Flash = memo(function Flash({ size }: { size: number }) {
  const c = size / 2;
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="flashFade" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#fff" stopOpacity={1} />
          <Stop offset="1" stopColor="#fff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={c} fill="url(#flashFade)" />
    </Svg>
  );
});
