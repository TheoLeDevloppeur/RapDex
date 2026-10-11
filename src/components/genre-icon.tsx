import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { Genre } from '@/theme/theme';

type Props = {
  genre: Genre;
  size: number;
  color: string;
  strokeWidth?: number;
};

/** Icône de genre : micro (rap), note (chant), vinyle (DJ). Toujours décorative. */
export function GenreIcon({ genre, size, color, strokeWidth = 2.2 }: Props) {
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {genre === 'rap' && (
        <>
          <Rect x={8.5} y={2.5} width={7} height={12} rx={3.5} {...stroke} />
          <Path d="M5 11.5a7 7 0 0 0 14 0M12 18.5v3" {...stroke} />
        </>
      )}
      {genre === 'chant' && (
        <>
          <Path d="M9 18V5.5l11-2.5v12.5" {...stroke} />
          <Circle cx={6} cy={18} r={3} {...stroke} />
          <Circle cx={17} cy={15.5} r={3} {...stroke} />
        </>
      )}
      {genre === 'dj' && (
        <>
          <Circle cx={12} cy={12} r={9.5} {...stroke} />
          <Circle cx={12} cy={12} r={2.5} {...stroke} />
          <Path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5" {...stroke} />
        </>
      )}
    </Svg>
  );
}
