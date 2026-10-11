import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArtistCard } from '@/components/card/artist-card';
import { ARTISTS, getArtist } from '@/data/artists';
import { todayISO } from '@/data/collection';
import { colors, space, touch, type } from '@/theme/theme';

// Écran de contrôle de l'étape 5 : toutes les cartes de la base. Il sera retiré avant la sortie.

const COLUMNS = 2;
const GAP = space.md;

export default function Gallery() {
  const { width } = useWindowDimensions();
  const [focusId, setFocusId] = useState('laylow');
  const focus = getArtist(focusId) ?? ARTISTS[0];
  const cardWidth = (Math.min(width, 520) - space.lg * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const bigWidth = Math.min(width - space.xxl * 2, 300);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={[type.itemTitle, { fontSize: 16 }]}>‹ Retour</Text>
        </Pressable>
      </View>
      <FlatList
        data={ARTISTS}
        keyExtractor={(a) => a.id}
        numColumns={COLUMNS}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        windowSize={5}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={type.label}>Étape 5 · Galerie</Text>
            <Text style={type.title}>{ARTISTS.length} cartes</Text>
            <Text style={type.bodySmall}>Touche une carte pour la voir en grand.</Text>
            <View style={styles.big}>
              <ArtistCard artist={focus} width={bigWidth} size="full" addedAt={todayISO()} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => setFocusId(item.id)}
            style={({ pressed }) => (pressed ? { transform: [{ scale: 0.97 }] } : undefined)}>
            <ArtistCard artist={item} width={cardWidth} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nuit },
  topbar: { paddingHorizontal: space.sm, minHeight: 52, justifyContent: 'center' },
  back: { minHeight: touch.min, minWidth: touch.min, justifyContent: 'center', paddingHorizontal: space.sm },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxl * 2, gap: GAP },
  header: { gap: space.sm, marginBottom: space.lg },
  big: { alignItems: 'center', paddingVertical: space.xl },
});
