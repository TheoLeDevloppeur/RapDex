import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { FixedText } from '@/components/fixed-text';
import { fonts } from '@/theme/theme';

import { CARD_RATIO } from './artist-card';

type Props = {
  width: number;
  /** Fond du dos : l'encre de la carte. */
  background?: string;
  /** Logo et rayons : la couleur de fond de la face. */
  mark?: string;
};

/**
 * Le dos des cartes RapDex : logo sur fond de rayons, imprimé avec les deux
 * couleurs de la carte, en inversé par rapport à la face.
 */
export function CardBack({ width: w, background = '#1B1526', mark = '#FFD23F' }: Props) {
  const h = w * CARD_RATIO;
  const u = w / 100;
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.hypot(w, h);
  const rays = [];
  for (let a = 0; a < 360; a += 14) {
    const p = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return `${cx + R * Math.cos(rad)},${cy + R * Math.sin(rad)}`;
    };
    rays.push(<Path key={a} d={`M${cx},${cy} L${p(a)} L${p(a + 6)} Z`} fill={mark} />);
  }

  return (
    <View style={[styles.back, { width: w, height: h, borderRadius: 6 * u, backgroundColor: background }]}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <G opacity={0.16}>{rays}</G>
      </Svg>
      <View
        style={[
          styles.mark,
          {
            borderColor: mark,
            backgroundColor: background,
            borderWidth: 1.2 * u,
            borderRadius: 5 * u,
            paddingHorizontal: 9 * u,
            paddingVertical: 6 * u,
          },
        ]}>
        <FixedText style={[styles.markText, { color: mark, fontSize: 30 * u, lineHeight: 26 * u }]}>{'RAP\nDEX'}</FixedText>
      </View>
      <FixedText
        numberOfLines={1}
        style={[
          styles.sub,
          { color: mark, backgroundColor: background, fontSize: 4.3 * u, marginTop: 9 * u, paddingHorizontal: 2 * u },
        ]}>
        Carte artiste · Vu en live
      </FixedText>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mark: {
    transform: [{ rotate: '-6deg' }],
  },
  markText: {
    fontFamily: fonts.display,
    textAlign: 'center',
    includeFontPadding: false,
  },
  sub: {
    fontFamily: fonts.monoSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
