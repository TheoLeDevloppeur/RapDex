import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import type { Artist } from '@/data/artists';
import { formatNumber, formatShortDate } from '@/data/format';
import { colors, fonts, genres } from '@/theme/theme';

type Props = {
  artist: Artist;
  date: string;
  /** Couleur de la bande du billet (l'encre du genre). */
  band: string;
  mainStyle: AnimatedStyle<ViewStyle>;
  stubStyle: AnimatedStyle<ViewStyle>;
};

export const TICKET_WIDTH = 290;
export const TICKET_HEIGHT = 128;

/** Le billet d'entrée : la partie principale et le talon qui se déchire. */
export function Ticket({ artist, date, band, mainStyle, stubStyle }: Props) {
  // Le nom tient sur une ligne dans les ~190 px de la partie principale.
  const nameSize = Math.min(36, 190 / (artist.name.length * 0.5));
  return (
    <View style={styles.ticket}>
      <Animated.View style={[styles.main, { borderTopColor: band }, mainStyle]}>
        <Text style={styles.small}>RapDex · Entrée · Vu en live</Text>
        <Text style={[styles.name, { fontSize: nameSize, lineHeight: nameSize * 0.95 }]} numberOfLines={1}>
          {artist.name}
        </Text>
        <Text style={styles.small}>
          {genres[artist.genre].label} · {formatShortDate(date)}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.stub, { borderTopColor: band }, stubStyle]}>
        {/* Perforation entre le billet et le talon. */}
        <Svg width={2} height={TICKET_HEIGHT - 12} style={styles.perforation}>
          <Line x1={1} y1={0} x2={1} y2={TICKET_HEIGHT} stroke="rgba(21,17,29,0.45)" strokeWidth={2} strokeDasharray="5,4" />
        </Svg>
        <Text style={styles.stubText}>N° {formatNumber(artist.no).slice(1)}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    width: TICKET_WIDTH,
    height: TICKET_HEIGHT,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    backgroundColor: colors.papier,
    borderTopWidth: 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  small: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.encre,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 34,
    textTransform: 'uppercase',
    color: colors.encre,
    includeFontPadding: false,
  },
  stub: {
    width: 72,
    backgroundColor: colors.papier,
    borderTopWidth: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perforation: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  stubText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.encre,
    transform: [{ rotate: '-90deg' }],
    width: 80,
    textAlign: 'center',
  },
});
