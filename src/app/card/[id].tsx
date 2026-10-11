import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { ArtistCard, CARD_RATIO } from '@/components/card/artist-card';
import { FixedText } from '@/components/fixed-text';
import { GenreIcon } from '@/components/genre-icon';
import { getArtist } from '@/data/artists';
import type { CollectionEntry } from '@/data/collection';
import { formatLongDate } from '@/data/format';
import { useCollection } from '@/hooks/use-collection';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { colors, fonts, genres, radius, space, touch, type } from '@/theme/theme';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, remove } = useCollection();
  const { width, height, fontScale } = useWindowDimensions();
  const [confirming, setConfirming] = useState(false);
  const question = useRef<Text>(null);

  // À l'ouverture de la confirmation, VoiceOver lit directement la question.
  // Uniquement avec VoiceOver actif, et sans jamais bloquer l'écran si l'appel échoue.
  useEffect(() => {
    if (!confirming || Platform.OS === 'web') return;
    let cancelled = false;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((on) => {
        if (!on || cancelled || !question.current) return;
        try {
          AccessibilityInfo.sendAccessibilityEvent(question.current, 'focus');
        } catch {
          // Le focus n'est qu'un confort : on ignore l'échec.
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [confirming]);

  const artist = getArtist(id);
  // Après un retrait, on garde la carte affichée pendant l'animation de retour.
  const [removedEntry, setRemovedEntry] = useState<CollectionEntry | null>(null);
  const entry = entries.find((e) => e.id === id) ?? removedEntry;

  // Animation de retrait : tampon « RETIRÉE », puis la carte tombe.
  const reduceMotion = useReduceMotion();
  const [removing, setRemoving] = useState(false);
  const stamp = useSharedValue(0);
  const fall = useSharedValue(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const fallStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fall.value, [0, 0.75, 1], [1, 0.4, 0]),
    transform: [
      { translateY: fall.value * 260 },
      { rotate: `${fall.value * 14}deg` },
      { scale: 1 - fall.value * 0.2 },
    ],
  }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, stamp.value * 3),
    transform: [{ rotate: '-12deg' }, { scale: 2.4 - stamp.value * 1.4 }],
  }));
  const factsStyle = useAnimatedStyle(() => ({ opacity: 1 - fall.value }));

  if (!artist || !entry) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topbar}>
          <BackButton />
        </View>
        <View style={styles.missing}>
          <Text style={[type.heading, styles.center]} accessibilityRole="header" maxFontSizeMultiplier={1.3}>
            Carte introuvable
          </Text>
          <Text style={[type.body, styles.center, { color: colors.brume }]}>
            Cette carte n’est pas dans ta collection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const genre = genres[artist.genre];
  // La carte occupe l'essentiel de l'écran sans pousser les infos hors de vue,
  // même quand le texte du téléphone est agrandi.
  const reserved = 330 + Math.max(0, fontScale - 1) * 160;
  const cardWidth = Math.max(140, Math.min(width * 0.78, 320, (height - reserved) / CARD_RATIO));

  const finishRemove = () => {
    setRemovedEntry(entry);
    remove(artist.id);
    AccessibilityInfo.announceForAccessibility(`${artist.name} retirée de ta collection.`);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const confirmRemove = () => {
    if (reduceMotion) return finishRemove();
    setRemoving(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    // Le tampon frappe, on le laisse lire un instant, puis la carte tombe.
    stamp.value = withTiming(1, { duration: 240, easing: Easing.bezier(0.3, 1.5, 0.5, 1) });
    timers.current.push(
      setTimeout(() => {
        fall.value = withTiming(1, { duration: 480, easing: Easing.in(Easing.cubic) });
      }, 520),
      setTimeout(finishRemove, 1000)
    );
  };

  return (
    <SafeAreaView style={styles.screen} pointerEvents={removing ? 'none' : 'auto'}>
      <View style={styles.topbar}>
        <BackButton />
      </View>

      <View style={styles.stage}>
        <Text style={styles.srOnly} accessibilityRole="header">
          {artist.name}
        </Text>

        <Animated.View style={fallStyle}>
          <Animated.View
            entering={FadeInDown.duration(450).springify().damping(14)}
            accessible
            accessibilityLabel={`Carte ${artist.name}, ${genre.label}, ajoutée le ${formatLongDate(entry.addedAt)}`}>
            <ArtistCard artist={artist} width={cardWidth} size="full" addedAt={entry.addedAt} />
          </Animated.View>
          {removing && (
            <View style={styles.stampLayer} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Animated.View style={[styles.stamp, stampStyle]}>
                <FixedText style={styles.stampText}>Retirée</FixedText>
              </Animated.View>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(250)} style={[styles.facts, factsStyle]}>
          <View style={styles.genre}>
            <GenreIcon genre={artist.genre} size={16} color={genre.color} />
            <Text style={[styles.genreLabel, { color: genre.color }]} maxFontSizeMultiplier={1.6}>{genre.label}</Text>
          </View>
          <Text style={type.bodySmall} maxFontSizeMultiplier={1.6}>
            Ajoutée le <Text style={styles.strong}>{formatLongDate(entry.addedAt)}</Text>
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        {removing ? null : confirming ? (
          <Animated.View entering={FadeIn.duration(150)} style={styles.confirm}>
            <Text ref={question} style={[type.body, styles.center]} maxFontSizeMultiplier={1.6}>
              Retirer la carte <Text style={styles.strong}>{artist.name}</Text>
              {' '}?
            </Text>
            <View style={styles.confirmRow}>
              <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} style={[styles.choice, styles.keep]}>
                <Text style={[styles.choiceText, { color: colors.papier }]} maxFontSizeMultiplier={1.6}>Garder</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={confirmRemove} style={[styles.choice, styles.danger]}>
                <Text style={[styles.choiceText, { color: colors.encre }]} maxFontSizeMultiplier={1.6}>Retirer</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} style={styles.removeLink}>
            <Text style={styles.removeText} maxFontSizeMultiplier={1.6}>Retirer de ma collection</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nuit },
  topbar: { paddingHorizontal: space.sm, minHeight: 54, justifyContent: 'center' },
  // overflow hidden : la carte ne peut jamais déborder sur le bas et y voler les touchers.
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl, paddingHorizontal: space.xl, overflow: 'hidden' },
  srOnly: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: space.md },
  genre: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  genreLabel: { fontFamily: fonts.monoSemiBold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  strong: { fontFamily: fonts.bodySemiBold, color: colors.papier },
  bottom: { paddingHorizontal: space.lg, paddingBottom: space.lg, minHeight: 120, justifyContent: 'flex-end', zIndex: 1 },
  removeLink: { minHeight: touch.min, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingHorizontal: space.md },
  removeText: { fontFamily: fonts.body, fontSize: 15, color: colors.brume, textDecorationLine: 'underline' },
  confirm: { backgroundColor: colors.coulisse, borderRadius: radius.lg - 2, padding: space.lg, gap: space.md },
  confirmRow: { flexDirection: 'row', gap: space.sm },
  choice: { flex: 1, minHeight: touch.min, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  keep: { borderWidth: 1.5, borderColor: colors.trait },
  danger: { backgroundColor: colors.danger },
  choiceText: { fontFamily: fonts.bodyExtraBold, fontSize: 15 },
  stampLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    borderWidth: 4,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: 'rgba(21,17,29,0.82)',
  },
  stampText: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 46,
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 1,
    includeFontPadding: false,
  },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  center: { textAlign: 'center' },
});
