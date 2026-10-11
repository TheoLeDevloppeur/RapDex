import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/back-button';
import { ArtistCard } from '@/components/card/artist-card';
import { Sleeve } from '@/components/card/sleeve';
import { Ticket } from '@/components/reveal/ticket';
import { ARTISTS } from '@/data/artists';
import { colors, space, type } from '@/theme/theme';

// Outil de développement : toutes les cartes dans toutes leurs tailles, sans
// virtualisation, pour vérifier qu'aucun texte n'est coupé ni ne déborde.

/** Largeurs réelles : grille d'un iPhone SE, révélation, détail d'un grand iPhone. */
const SIZES = [{ label: 'grille', width: 163 }, { label: 'révélation', width: 225 }, { label: 'détail', width: 300 }];

export default function Audit() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <BackButton />
      <Text style={type.title}>Contrôle des cartes</Text>
      {ARTISTS.map((a) => (
        <View key={a.id} style={styles.row} testID={`audit-${a.id}`}>
          <Text style={type.label}>
            #{a.no} {a.name}
          </Text>
          <View style={styles.items}>
            {SIZES.map((s) => (
              <View key={s.label} testID={`card-${s.label}`}>
                <ArtistCard artist={a} width={s.width} size={s.label === 'grille' ? 'compact' : 'full'} addedAt="2026-10-11" />
              </View>
            ))}
            <View testID="sleeve">
              <Sleeve artist={a} />
            </View>
          </View>
          <View testID="ticket">
            <Ticket artist={a} date="2026-10-11" band={colors.surligneur} mainStyle={{}} stubStyle={{}} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nuit },
  content: { padding: space.lg, gap: space.xl },
  row: { gap: space.sm },
  items: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, alignItems: 'flex-start' },
});
