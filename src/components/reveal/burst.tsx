import { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme/theme';

/**
 * Rayons à l'encre du genre. Le carré est assez grand pour couvrir tout l'écran
 * même quand il tourne : rien ne s'estompe en cercle.
 */
export const Burst = memo(function Burst({ size, color }: { size: number; color: string }) {
  const c = size / 2;
  const rays = [];
  for (let a = 0; a < 360; a += 15) {
    const p = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return `${c + c * Math.cos(rad)},${c + c * Math.sin(rad)}`;
    };
    rays.push(<Path key={a} d={`M${c},${c} L${p(a)} L${p(a + 6)} Z`} fill={color} />);
  }
  return (
    <Svg width={size} height={size}>
      <G>{rays}</G>
    </Svg>
  );
});

/** Dégradé droit qui fonce le bas de l'écran, pour garder le texte lisible. */
export const BottomFade = memo(function BottomFade({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.nuit} stopOpacity={0} />
          <Stop offset="0.45" stopColor={colors.nuit} stopOpacity={0.92} />
          <Stop offset="1" stopColor={colors.nuit} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#bottomFade)" />
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
