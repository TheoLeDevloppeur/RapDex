import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ArtistCard, CARD_RATIO } from '@/components/card/artist-card';
import { LandingCard } from '@/components/card/landing-card';
import { GenreChips, type GenreFilter } from '@/components/genre-chips';
import { PrimaryButton } from '@/components/primary-button';
import { getArtist } from '@/data/artists';
import type { CollectionEntry } from '@/data/collection';
import { formatLongDate } from '@/data/format';
import { useCollection } from '@/hooks/use-collection';
import { colors, fonts, genres, radius, space, type } from '@/theme/theme';

const GAP = space.md;
/** Hauteur réservée en bas de liste pour ne pas cacher de carte sous le bouton. */
const CTA_SPACE = 120;

type GridItem = CollectionEntry | 'slot';

export default function CollectionScreen() {
  const { entries, lastAdded, markLanded } = useCollection();
  const [filter, setFilter] = useState<GenreFilter>('all');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const listRef = useRef<FlatList<GridItem>>(null);

  // Arrivée de la nouvelle carte, jouée quand on revient sur la collection.
  const pendingId = lastAdded && !lastAdded.landed ? lastAdded.id : null;
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [bumped, setBumped] = useState(true);
  const countScale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      if (!pendingId) return;
      setFilter('all');
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
      setBumped(false);
      setPlayingId(pendingId);
      const bump = setTimeout(
        () => {
          setBumped(true);
          if (!reduceMotion) {
            countScale.value = withSequence(
              withTiming(1.35, { duration: 180 }),
              withTiming(1, { duration: 280, easing: Easing.out(Easing.back(2)) })
            );
          }
          if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
        },
        reduceMotion ? 0 : 560
      );
      const done = setTimeout(() => {
        markLanded();
        setPlayingId(null);
      }, reduceMotion ? 0 : 900);
      return () => {
        clearTimeout(bump);
        clearTimeout(done);
      };
    }, [pendingId, reduceMotion, markLanded, countScale])
  );

  const countStyle = useAnimatedStyle(() => ({ transform: [{ scale: countScale.value }, { rotate: `${(countScale.value - 1) * -12}deg` }] }));

  const counts = useMemo(() => {
    const c: Record<GenreFilter, number> = { all: entries.length, rap: 0, chant: 0, dj: 0 };
    for (const e of entries) {
      const a = getArtist(e.id);
      if (a) c[a.genre]++;
    }
    return c;
  }, [entries]);

  const shown = filter === 'all' ? entries : entries.filter((e) => getArtist(e.id)?.genre === filter);
  const total = entries.length;
  // Tant que la carte n'est pas tombée, le compteur affiche encore l'ancien total.
  const shownTotal = pendingId && (!playingId || !bumped) ? total - 1 : total;
  const items: GridItem[] = total > 0 ? [...shown, 'slot'] : [];
  const cardWidth = (Math.min(width, 600) - space.lg * 2 - GAP) / 2;
  const openAdd = () => router.push('/add');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.head}>
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>R</Text>
            </View>
            <Text style={styles.brandText}>RapDex</Text>
          </View>
          {__DEV__ && (
            <Pressable accessibilityRole="button" onPress={() => router.push('/design')} style={styles.devLink}>
              <Text style={type.label}>Dev</Text>
            </Pressable>
          )}
        </View>
        <View>
          <Text style={type.label}>Ma collection</Text>
          <View style={styles.counter} accessible accessibilityRole="header" accessibilityLabel={`${shownTotal} ${shownTotal > 1 ? 'cartes' : 'carte'}`}>
            <Animated.Text style={[type.counter, { color: colors.surligneur }, countStyle]}>{shownTotal}</Animated.Text>
            <Text style={type.counter}> {shownTotal > 1 ? 'cartes' : 'carte'}</Text>
          </View>
        </View>
      </View>

      {total > 0 && (
        <View style={styles.chips}>
          <GenreChips value={filter} onChange={setFilter} counts={counts} />
        </View>
      )}

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => (item === 'slot' ? 'slot' : item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={[styles.list, { paddingBottom: CTA_SPACE + insets.bottom }]}
        ListHeaderComponent={
          shown.length === 0 && total > 0 && filter !== 'all' ? (
            <Text style={styles.none}>Aucune carte {genres[filter].label} pour l’instant.</Text>
          ) : null
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) =>
          item === 'slot' ? (
            <NextSlot width={cardWidth} onPress={openAdd} />
          ) : (
            <LandingCard pending={item.id === pendingId} play={item.id === playingId} isNew={item.id === lastAdded?.id}>
              <CollectionCard entry={item} width={cardWidth} />
            </LandingCard>
          )
        }
      />

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + space.lg }]} pointerEvents="box-none">
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id="ctaFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.nuit} stopOpacity={0} />
              <Stop offset="0.4" stopColor={colors.nuit} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#ctaFade)" />
        </Svg>
        <PrimaryButton icon="+" label="Ajouter une carte" onPress={openAdd} />
      </View>
    </SafeAreaView>
  );
}

function CollectionCard({ entry, width }: { entry: CollectionEntry; width: number }) {
  const artist = getArtist(entry.id);
  if (!artist) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${artist.name}, ${genres[artist.genre].label.toLowerCase()}, ajoutée le ${formatLongDate(entry.addedAt)}`}
      accessibilityHint="Ouvre la carte"
      onPress={() => router.push({ pathname: '/card/[id]', params: { id: artist.id } })}
      style={({ pressed }) => (pressed ? styles.cardPressed : undefined)}>
      <ArtistCard artist={artist} width={width} />
    </Pressable>
  );
}

/** Case vide en fin de grille : invite à ajouter la prochaine carte. */
function NextSlot({ width, onPress }: { width: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ajouter une carte"
      onPress={onPress}
      style={({ pressed }) => [
        styles.slot,
        { width, height: width * CARD_RATIO, borderRadius: width * 0.06 },
        pressed && styles.slotPressed,
      ]}>
      <Text style={styles.slotMark}>?</Text>
      <Text style={styles.slotText}>Prochaine carte</Text>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.ghostCard}>
        <Text style={styles.ghostMark}>?</Text>
      </View>
      <Text style={[type.heading, styles.center]}>Ta collection est vide</Text>
      <Text style={[type.body, styles.center, { color: colors.brume, maxWidth: 280 }]}>
        Ajoute la carte du dernier artiste que tu as vu en concert.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nuit },
  head: { paddingHorizontal: space.lg, paddingTop: space.xs, paddingBottom: space.md, gap: space.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colors.surligneur,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  brandMarkText: { fontFamily: fonts.display, fontSize: 18, color: colors.encre, includeFontPadding: false },
  brandText: { fontFamily: fonts.display, fontSize: 22, color: colors.papier, textTransform: 'uppercase', letterSpacing: 0.5 },
  devLink: { minHeight: 32, paddingHorizontal: space.sm, justifyContent: 'center', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.trait },
  counter: { flexDirection: 'row', alignItems: 'flex-end', alignSelf: 'flex-start' },
  chips: { paddingBottom: space.md },
  // paddingTop : de la place pour l'étiquette « NEW » qui dépasse de la première carte.
  list: { paddingHorizontal: space.lg, paddingTop: space.sm + 2, gap: GAP, flexGrow: 1 },
  cardPressed: { transform: [{ scale: 0.97 }] },
  none: { ...type.body, color: colors.brume, textAlign: 'center', paddingVertical: space.xl },
  slot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.trait,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.md,
  },
  slotPressed: { borderColor: colors.surligneur },
  slotMark: { fontFamily: fonts.display, fontSize: 72, lineHeight: 70, color: colors.trait, includeFontPadding: false },
  slotText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.brume, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingVertical: space.xxl },
  ghostCard: {
    width: 150,
    aspectRatio: 5 / 7,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.trait,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
    marginBottom: space.sm,
  },
  ghostMark: { fontFamily: fonts.display, fontSize: 90, color: colors.trait, includeFontPadding: false },
  center: { textAlign: 'center' },
  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: space.xxl, paddingHorizontal: space.lg },
});
