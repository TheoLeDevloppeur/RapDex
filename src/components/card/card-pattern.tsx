import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { Pattern } from '@/data/card-variant';

type Props = {
  pattern: Pattern;
  width: number;
  height: number;
  /** Couleur de la trame (le fond de la carte), posée sur l'encre de la pochette. */
  color: string;
};

/**
 * Trame imprimée dans la pochette d'une carte : points de trame, rayons,
 * sillons de vinyle, rayures, coupe ou grille. Les tailles suivent la largeur
 * pour que la carte garde le même aspect en grille et en grand.
 */
export const CardPattern = memo(function CardPattern({ pattern, width: w, height: h, color }: Props) {
  if (w <= 0 || h <= 0) return null;
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      {renderPattern(pattern, w, h, color)}
    </Svg>
  );
});

function renderPattern(pattern: Pattern, w: number, h: number, color: string) {
  switch (pattern) {
    case 'halftone': {
      // Points de trame dont la taille diminue en s'éloignant du coin haut droit.
      const step = Math.max(6, w / 11);
      const dots = [];
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const t = ((w - x) / w) * 0.45 + (y / h) * 0.55;
          const r = step * 0.46 * (1 - t / 0.8);
          if (r > 0.5) dots.push(<Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={color} />);
        }
      }
      return <G opacity={0.6}>{dots}</G>;
    }
    case 'rays': {
      // Rayons de soleil partant du bas de la pochette.
      const cx = w / 2;
      const cy = h * 1.18;
      const R = Math.hypot(w, h) * 1.5;
      const rays = [];
      for (let a = -180; a < 0; a += 12) {
        const p = (deg: number) => {
          const rad = (deg * Math.PI) / 180;
          return `${cx + R * Math.cos(rad)},${cy + R * Math.sin(rad)}`;
        };
        rays.push(<Path key={a} d={`M${cx},${cy} L${p(a)} L${p(a + 5)} Z`} fill={color} />);
      }
      return <G opacity={0.3}>{rays}</G>;
    }
    case 'grooves': {
      // Sillons de vinyle autour d'un point décentré.
      const cx = w * 0.72;
      const cy = h * 0.3;
      const step = Math.max(4, w / 18);
      const max = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
      const rings = [];
      for (let r = step; r < max; r += step) {
        rings.push(<Circle key={r} cx={cx} cy={cy} r={r} stroke={color} strokeWidth={Math.max(1, w / 140)} fill="none" />);
      }
      return <G opacity={0.34}>{rings}</G>;
    }
    case 'stripes': {
      const band = Math.max(4, w * 0.045);
      const d = Math.hypot(w, h);
      const bands = [];
      for (let x = -d; x < d * 2; x += band * 2.3) {
        bands.push(<Rect key={x} x={x} y={-d} width={band} height={d * 3} fill={color} />);
      }
      return (
        <G opacity={0.22} transform={`rotate(-55 ${w / 2} ${h / 2})`}>
          {bands}
        </G>
      );
    }
    case 'split':
      return <Polygon points={`0,0 ${w},0 ${w},${h * 0.17} 0,${h * 0.62}`} fill={color} opacity={0.26} />;
    case 'grid': {
      const step = w / 12;
      const sw = Math.max(1, w / 160);
      const lines = [];
      for (let x = step; x < w; x += step) lines.push(<Line key={`x${x}`} x1={x} y1={0} x2={x} y2={h} stroke={color} strokeWidth={sw} />);
      for (let y = step; y < h; y += step) lines.push(<Line key={`y${y}`} x1={0} y1={y} x2={w} y2={y} stroke={color} strokeWidth={sw} />);
      return <G opacity={0.26}>{lines}</G>;
    }
  }
}
