import { memo, useId, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';

import { GenreIcon } from '@/components/genre-icon';
import type { Artist } from '@/data/artists';
import { cardVariant, type Layout } from '@/data/card-variant';
import { formatNumber, formatShortDate, initials } from '@/data/format';
import { fonts, genres } from '@/theme/theme';

import { CardPattern } from './card-pattern';

export type ArtistCardProps = {
  artist: Artist;
  /** Largeur de la carte en px. La hauteur suit le format 5:7. */
  width: number;
  /** Date d'ajout AAAA-MM-JJ, imprimée en pied de carte (version complète seulement). */
  addedAt?: string;
  /** compact : pour la grille, sans pied de carte. full : pour le détail et la révélation. */
  size?: 'compact' | 'full';
};

export const CARD_RATIO = 7 / 5;

/**
 * La carte à collectionner : imprimée en duotone (fond + encre), avec une pochette
 * générée à partir de l'artiste. Toutes les tailles sont proportionnelles à la largeur.
 */
export const ArtistCard = memo(function ArtistCard({ artist, width: w, addedAt, size = 'compact' }: ArtistCardProps) {
  const { pattern, layout, ink: inkIndex } = cardVariant(artist);
  const { stock, ink } = genres[artist.genre].inks[inkIndex];
  const [art, setArt] = useState({ w: 0, h: 0 });
  const glossId = `gloss${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const u = w / 100;

  const onArtLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== art.w || height !== art.h) setArt({ w: width, h: height });
  };

  const nameSize = Math.min(14 * u, (86 * u) / (artist.name.length * 0.48));

  return (
    <View
      accessible
      accessibilityLabel={`${artist.name}, ${genres[artist.genre].label}`}
      style={[
        styles.card,
        { width: w, height: w * CARD_RATIO, borderRadius: 6 * u, padding: 5 * u, gap: 2.8 * u, backgroundColor: stock },
      ]}>
      {/* Filet intérieur, comme le cadre imprimé d'une carte. */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { margin: 2.2 * u, borderWidth: Math.max(1, 0.7 * u), borderColor: ink, borderRadius: 4.4 * u, opacity: 0.25 },
        ]}
      />

      <View style={styles.top}>
        <Text style={{ fontFamily: fonts.monoSemiBold, fontSize: 6.6 * u, color: ink }}>{formatNumber(artist.no)}</Text>
        <View
          style={[
            styles.type,
            { backgroundColor: ink, gap: 1.6 * u, paddingVertical: 1.8 * u, paddingLeft: 2.6 * u, paddingRight: 3.2 * u },
          ]}>
          <GenreIcon genre={artist.genre} size={6.8 * u} color={stock} strokeWidth={2.6} />
          <Text style={{ fontFamily: fonts.monoSemiBold, fontSize: 6 * u, color: stock, textTransform: 'uppercase' }}>
            {genres[artist.genre].label}
          </Text>
        </View>
      </View>

      <View style={[styles.art, { backgroundColor: ink, borderRadius: 3.2 * u }]} onLayout={onArtLayout}>
        <CardPattern pattern={pattern} width={art.w} height={art.h} color={stock} />
        {layout === 'vert' && <Orb size={36 * u} stock={stock} ink={ink} style={{ top: 6 * u, right: 6 * u }} />}
        <Monogram name={artist.name} layout={layout} u={u} artHeight={art.h} color={stock} />
      </View>

      <Text
        numberOfLines={1}
        style={[styles.name, { fontSize: nameSize, lineHeight: nameSize * 1.02, color: ink, paddingTop: 0.6 * u }]}>
        {artist.name}
      </Text>

      {size === 'full' && (
        <View style={{ gap: 2.4 * u }}>
          <Svg width="100%" height={Math.max(1, 0.5 * u)}>
            <Line x1="0" y1="0" x2="100%" y2="0" stroke={ink} strokeWidth={Math.max(1, u)} strokeDasharray={`${1.6 * u},${1.2 * u}`} />
          </Svg>
          <View style={styles.foot}>
            <Text style={[styles.footText, { fontSize: 4.8 * u, color: ink }]}>Ajoutée le</Text>
            <Text style={[styles.footText, { fontSize: 4.8 * u, color: ink }]}>
              {addedAt ? formatShortDate(addedAt) : '--.--.--'}
            </Text>
          </View>
        </View>
      )}

      {/* Reflet du vernis. */}
      <Svg width={w} height={w * CARD_RATIO} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={glossId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.2} />
            <Stop offset="0.34" stopColor="#fff" stopOpacity={0} />
            <Stop offset="0.7" stopColor="#fff" stopOpacity={0} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0.07} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${glossId})`} />
      </Svg>
    </View>
  );
});

/** Le nom imprimé en grand dans la pochette, selon la composition de la carte. */
function Monogram({
  name,
  layout,
  u,
  artHeight,
  color,
}: {
  name: string;
  layout: Layout;
  u: number;
  artHeight: number;
  color: string;
}) {
  const base = { fontFamily: fonts.display, color, includeFontPadding: false } as const;

  if (layout === 'giant') {
    const fs = 58 * u;
    return (
      <Text style={[base, styles.abs, { fontSize: fs, lineHeight: fs * 0.88, left: 4 * u, bottom: 0.5 * u }]}>
        {initials(name)}
      </Text>
    );
  }

  const words = name.toUpperCase().split(/\s+/);

  if (layout === 'stack') {
    const longest = Math.max(...words.map((x) => x.length));
    const fs = Math.min(30 * u, (74 * u) / (longest * 0.52), (82 * u) / (words.length * 0.9));
    return (
      <Text style={[base, styles.abs, { fontSize: fs, lineHeight: fs * 0.9, left: 5 * u, right: 4 * u, bottom: 4 * u }]}>
        {words.join('\n')}
      </Text>
    );
  }

  // Vertical : le nom se lit de bas en haut le long du bord gauche.
  if (artHeight <= 0) return null;
  const fs = Math.min(34 * u, (84 * u) / (name.length * 0.52));
  const boxW = artHeight - 8 * u;
  const boxH = fs * 1.05;
  const centerX = 3.5 * u + boxH / 2;
  return (
    <Text
      numberOfLines={1}
      style={[
        base,
        styles.abs,
        {
          fontSize: fs,
          lineHeight: boxH,
          width: boxW,
          height: boxH,
          left: centerX - boxW / 2,
          top: artHeight / 2 - boxH / 2,
          transform: [{ rotate: '-90deg' }],
        },
      ]}>
      {name.toUpperCase()}
    </Text>
  );
}

/** Disque façon vinyle ou soleil, pour la composition verticale. */
function Orb({ size, stock, ink, style }: { size: number; stock: string; ink: string; style: object }) {
  const rings = [];
  for (let r = size / 2; r > size * 0.2; r -= size / 14) rings.push(r);
  return (
    <Svg width={size} height={size} style={[styles.abs, style]}>
      {rings.map((r, i) => (
        <Rect
          key={r}
          x={size / 2 - r}
          y={size / 2 - r}
          width={r * 2}
          height={r * 2}
          rx={r}
          fill={i % 2 === 0 ? stock : ink}
          opacity={i % 2 === 0 ? 1 : 0.18}
        />
      ))}
      <Rect x={size * 0.4} y={size * 0.4} width={size * 0.2} height={size * 0.2} rx={size * 0.1} fill={ink} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    boxShadow: '0 12px 26px -14px rgba(0,0,0,0.85)',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
  },
  art: {
    flex: 1,
    overflow: 'hidden',
  },
  abs: {
    position: 'absolute',
  },
  name: {
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footText: {
    fontFamily: fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
