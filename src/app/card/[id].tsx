import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { ArtistCard, CARD_RATIO } from '@/components/card/artist-card';
import { GenreIcon } from '@/components/genre-icon';
import { getArtist } from '@/data/artists';
import type { CollectionEntry } from '@/data/collection';
import { formatLongDate } from '@/data/format';
import { useCollection } from '@/hooks/use-collection';
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

  const confirmRemove = () => {
    setRemovedEntry(entry);
    remove(artist.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <BackButton />
      </View>

      <View style={styles.stage}>
        <Text style={styles.srOnly} accessibilityRole="header">
          {artist.name}
        </Text>

        <Animated.View
          entering={FadeInDown.duration(450).springify().damping(14)}
          accessible
          accessibilityLabel={`Carte ${artist.name}, ${genre.label}, ajoutée le ${formatLongDate(entry.addedAt)}`}>
          <ArtistCard artist={artist} width={cardWidth} size="full" addedAt={entry.addedAt} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(250)} style={styles.facts}>
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
        {confirming ? (
          <Animated.View entering={FadeIn.duration(150)} style={styles.confirm}>
            <Text ref={question} style={[type.body, styles.center]} maxFontSizeMultiplier={1.6}>
              Retirer la carte <Text style={styles.strong}>{artist.name}</Text> ?
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
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  center: { textAlign: 'center' },
});
