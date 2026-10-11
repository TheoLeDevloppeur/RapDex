import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ARTISTS, getArtist } from '@/data/artists';
import { useCollection } from '@/hooks/use-collection';
import { colors, fonts, genres, radius, space, touch, type, type Genre } from '@/theme/theme';

// Écran de démo des étapes 2 à 4 : il sera remplacé par la Collection à l'étape 6.

const SALLE: { name: string; value: string; use: string }[] = [
  { name: 'Nuit', value: colors.nuit, use: 'Fond' },
  { name: 'Coulisse', value: colors.coulisse, use: 'Surfaces' },
  { name: 'Trait', value: colors.trait, use: 'Bordures' },
  { name: 'Papier', value: colors.papier, use: 'Texte' },
  { name: 'Brume', value: colors.brume, use: 'Texte secondaire' },
  { name: 'Surligneur', value: colors.surligneur, use: 'Action' },
];

export default function DesignDemo() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={type.label}>Étape 2 · Système de design</Text>
          <Text style={styles.brand}>
            RAP<Text style={{ color: colors.surligneur }}>DEX</Text>
          </Text>
        </View>

        <CollectionTest />

        <Section title="La salle">
          <View style={styles.swatches}>
            {SALLE.map((c) => (
              <View key={c.name} style={styles.swatch}>
                <View style={[styles.swatchColor, { backgroundColor: c.value }]} />
                <View style={styles.swatchText}>
                  <Text style={styles.swatchName}>{c.name}</Text>
                  <Text style={styles.swatchMeta}>{c.value}</Text>
                  <Text style={styles.swatchMeta}>{c.use}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Les encres de genre">
          {(Object.keys(genres) as Genre[]).map((g) => (
            <View key={g} style={styles.inkRow}>
              <Text style={[styles.inkLabel, { color: genres[g].color }]}>{genres[g].label}</Text>
              <View style={styles.inkPairs}>
                {genres[g].inks.map((p) => (
                  <View key={p.stock} style={[styles.miniCard, { backgroundColor: p.stock }]}>
                    <View style={[styles.miniArt, { backgroundColor: p.ink }]}>
                      <Text style={[styles.miniMono, { color: p.stock }]}>{genres[g].label.slice(0, 2)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Section>

        <Section title="Typographie">
          <View style={styles.specimen}>
            <Text style={type.label}>Big Shoulders Display · titres</Text>
            <Text style={type.counter}>
              <Text style={{ color: colors.surligneur }}>12</Text>
              <Text style={{ color: colors.papier }}> cartes</Text>
            </Text>
          </View>
          <View style={styles.specimen}>
            <Text style={type.label}>Schibsted Grotesk · interface</Text>
            <Text style={[type.body, { color: colors.papier }]}>
              Ajoute la carte des artistes que tu as vus en live.
            </Text>
          </View>
          <View style={styles.specimen}>
            <Text style={type.label}>Martian Mono · numéros et dates</Text>
            <Text style={[type.mono, { color: colors.papier }]}>#014 · AJOUTÉE LE 14.09.26</Text>
          </View>
        </Section>

        <Section title="Bouton principal">
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}>
            <Text style={styles.primaryText}>+ Ajouter une carte</Text>
          </Pressable>
          <Text style={[type.bodySmall, { color: colors.brume }]}>
            Hauteur {touch.primary} px. Toutes les zones de tap font au moins {touch.min} px.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Test manuel de l'étape 4 : ajoute des cartes, ferme l'app, rouvre-la. */
function CollectionTest() {
  const { entries, has, add, remove } = useCollection();

  const addRandom = () => {
    const free = ARTISTS.filter((a) => !has(a.id));
    if (free.length) add(free[Math.floor(Math.random() * free.length)].id);
  };

  return (
    <Section title="Test de la collection">
      <Text style={type.counter}>
        <Text style={{ color: colors.surligneur }}>{entries.length}</Text>
        {entries.length > 1 ? ' cartes' : ' carte'}
      </Text>
      {entries.slice(0, 5).map((e) => (
        <Text key={e.id} style={type.body}>
          {getArtist(e.id)?.name} <Text style={type.mono}>· ajoutée le {e.addedAt}</Text>
        </Text>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={addRandom}
        style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}>
        <Text style={styles.primaryText}>+ Ajouter un artiste au hasard</Text>
      </Pressable>
      {entries.length > 0 && (
        <Pressable accessibilityRole="button" onPress={() => remove(entries[0].id)} style={styles.secondary}>
          <Text style={[type.button, { color: colors.papier }]}>Retirer la dernière carte</Text>
        </Pressable>
      )}
      <Text style={type.bodySmall}>Ajoute quelques cartes, ferme complètement l’app, puis rouvre-la.</Text>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nuit },
  content: { padding: space.lg, paddingBottom: space.xxl * 2, gap: space.xxl },
  header: { gap: space.xs },
  brand: { fontFamily: fonts.display, fontSize: 72, lineHeight: 66, color: colors.papier },
  section: { gap: space.md },
  sectionTitle: { ...type.heading, color: colors.papier },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  swatch: {
    width: '31.5%',
    flexGrow: 1,
    backgroundColor: colors.coulisse,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.trait,
    overflow: 'hidden',
  },
  swatchColor: { height: 56 },
  swatchText: { padding: space.sm, gap: 2 },
  swatchName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.papier },
  swatchMeta: { fontFamily: fonts.mono, fontSize: 10, color: colors.brume },
  inkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.coulisse,
    borderRadius: radius.md,
    padding: space.md,
  },
  inkLabel: { fontFamily: fonts.bodyBold, fontSize: 16, width: 64 },
  inkPairs: { flexDirection: 'row', gap: space.sm },
  miniCard: { width: 50, aspectRatio: 5 / 7, borderRadius: 5, padding: 4 },
  miniArt: { flex: 1, borderRadius: 3, justifyContent: 'flex-end', padding: 3 },
  miniMono: { fontFamily: fonts.display, fontSize: 20, lineHeight: 18, textTransform: 'uppercase' },
  specimen: { gap: space.sm, backgroundColor: colors.coulisse, borderRadius: radius.md, padding: space.lg },
  primary: {
    minHeight: touch.primary,
    borderRadius: radius.md + 2,
    backgroundColor: colors.surligneur,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    boxShadow: `0 4px 0 ${colors.surligneurOmbre}`,
  },
  primaryPressed: { transform: [{ translateY: 3 }], boxShadow: `0 1px 0 ${colors.surligneurOmbre}` },
  primaryText: { ...type.button, color: colors.encre },
  secondary: {
    minHeight: touch.min + 4,
    borderRadius: radius.md + 2,
    borderWidth: 1.5,
    borderColor: colors.trait,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
