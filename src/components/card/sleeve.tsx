import { StyleSheet, Text, View } from 'react-native';

import type { Artist } from '@/data/artists';
import { cardVariant } from '@/data/card-variant';
import { initials } from '@/data/format';
import { fonts, genres } from '@/theme/theme';

import { CardPattern } from './card-pattern';

/** Mini pochette carrée : la trame et les initiales de la carte, pour les listes. */
export function Sleeve({ artist, size = 50 }: { artist: Artist; size?: number }) {
  const { pattern, ink: inkIndex } = cardVariant(artist);
  const { stock, ink } = genres[artist.genre].inks[inkIndex];
  return (
    <View style={[styles.sleeve, { width: size, height: size, borderRadius: size * 0.18, backgroundColor: ink }]}>
      <CardPattern pattern={pattern} width={size} height={size} color={stock} />
      <Text style={[styles.mono, { color: stock, fontSize: size * 0.6, lineHeight: size * 0.62, left: size * 0.1 }]}>
        {initials(artist.name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sleeve: {
    overflow: 'hidden',
  },
  mono: {
    position: 'absolute',
    bottom: 1,
    fontFamily: fonts.display,
    includeFontPadding: false,
  },
});
