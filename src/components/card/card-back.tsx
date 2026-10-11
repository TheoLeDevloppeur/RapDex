import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { fonts } from '@/theme/theme';

import { CARD_RATIO } from './artist-card';

const BACK = '#1B1526';
const MARK = '#FFD23F';

/** Le dos commun à toutes les cartes RapDex : logo sur fond de rayons. */
export function CardBack({ width: w }: { width: number }) {
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
    rays.push(<Path key={a} d={`M${cx},${cy} L${p(a)} L${p(a + 6)} Z`} fill={MARK} />);
  }

  return (
    <View style={[styles.back, { width: w, height: h, borderRadius: 6 * u }]}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <G opacity={0.14}>{rays}</G>
      </Svg>
      <View style={[styles.mark, { borderWidth: 1.2 * u, borderRadius: 5 * u, paddingHorizontal: 9 * u, paddingVertical: 6 * u }]}>
        <Text style={[styles.markText, { fontSize: 30 * u, lineHeight: 26 * u }]}>{'RAP\nDEX'}</Text>
      </View>
      <Text style={[styles.sub, { fontSize: 5 * u, marginTop: 9 * u, paddingHorizontal: 2 * u }]}>Carte artiste · Vu en live</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    backgroundColor: BACK,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mark: {
    borderColor: MARK,
    backgroundColor: BACK,
    transform: [{ rotate: '-6deg' }],
  },
  markText: {
    fontFamily: fonts.display,
    color: MARK,
    textAlign: 'center',
    includeFontPadding: false,
  },
  sub: {
    fontFamily: fonts.monoSemiBold,
    color: MARK,
    backgroundColor: BACK,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
