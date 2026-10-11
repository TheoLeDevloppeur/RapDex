import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { BackButton } from '@/components/back-button';
import { Sleeve } from '@/components/card/sleeve';
import { GenreIcon } from '@/components/genre-icon';
import { PrimaryButton } from '@/components/primary-button';
import type { Artist } from '@/data/artists';
import { searchArtists, SUGGESTIONS, type SearchResult } from '@/data/search';
import { useCollection } from '@/hooks/use-collection';
import { colors, fonts, genres, radius, space, touch, type } from '@/theme/theme';

export default function AddScreen() {
  const { has, add } = useCollection();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const trimmed = query.trim();
  const results: SearchResult[] = useMemo(
    () => (trimmed ? searchArtists(trimmed) : SUGGESTIONS.map((artist) => ({ artist }))),
    [trimmed]
  );

  // Une sélection qui n'est plus dans les résultats est abandonnée.
  const selected = results.find((r) => r.artist.id === selectedId)?.artist ?? null;

  const label = !trimmed
    ? 'Suggestions'
    : results.length === 0
      ? 'Aucun résultat'
      : `${results.length} résultat${results.length > 1 ? 's' : ''}`;

  const confirm = (artist: Artist | null = selected) => {
    if (!artist || has(artist.id)) return;
    add(artist.id);
    router.back();
  };

  const onSubmit = () => {
    if (selected) return confirm();
    const first = results.find((r) => !has(r.artist.id));
    if (first) setSelectedId(first.artist.id);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topbar}>
          <BackButton />
        </View>

        <FlatList
          data={results}
          keyExtractor={(r) => r.artist.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={type.title} accessibilityRole="header">
                Qui as-tu vu en concert ?
              </Text>
              <Text style={type.bodySmall}>Cherche l’artiste, choisis-le, sa carte rejoint ta collection.</Text>
              <SearchField value={query} onChange={setQuery} onSubmit={onSubmit} />
              <Text style={[type.label, styles.resultsLabel]} accessibilityLiveRegion="polite">
                {label}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[type.body, { color: colors.brume }]}>
              Aucun artiste ne correspond à <Text style={{ color: colors.papier }}>« {trimmed} »</Text>. Vérifie
              l’orthographe ou essaie une partie du nom.
            </Text>
          }
          renderItem={({ item }) => (
            <ArtistRow
              result={item}
              owned={has(item.artist.id)}
              selected={item.artist.id === selected?.id}
              onPress={() => setSelectedId(item.artist.id === selectedId ? null : item.artist.id)}
            />
          )}
        />

        <View style={styles.cta}>
          <PrimaryButton
            icon={selected ? '+' : undefined}
            label={selected ? `Ajouter la carte · ${selected.name}` : 'Choisis un artiste'}
            disabled={!selected}
            onPress={() => confirm()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SearchField({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.search, focused && styles.searchFocused]}>
      <Svg width={21} height={21} viewBox="0 0 24 24" style={styles.searchIcon}>
        <Circle cx={11} cy={11} r={7} stroke={colors.brume} strokeWidth={2} fill="none" />
        <Path d="M20 20l-4-4" stroke={colors.brume} strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <TextInput
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Nom d’un artiste"
        placeholderTextColor={colors.brume}
        accessibilityLabel="Nom d’un artiste"
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor={colors.surligneur}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Effacer la recherche" onPress={() => onChange('')} style={styles.clear}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M6 6l12 12M18 6L6 18" stroke={colors.brume} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </Pressable>
      )}
    </View>
  );
}

function ArtistRow({
  result,
  owned,
  selected,
  onPress,
}: {
  result: SearchResult;
  owned: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const { artist, match } = result;
  const genre = genres[artist.genre];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: owned }}
      accessibilityLabel={`${artist.name}, ${genre.label}${owned ? ', déjà dans ta collection' : ''}`}
      disabled={owned}
      onPress={onPress}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && !owned && styles.rowPressed]}>
      <Sleeve artist={artist} />
      <View style={styles.rowText}>
        <Text style={[type.itemTitle, owned && { color: colors.brume }]} numberOfLines={1}>
          {match ? (
            <>
              {artist.name.slice(0, match.start)}
              <Text style={styles.highlight}>{artist.name.slice(match.start, match.end)}</Text>
              {artist.name.slice(match.end)}
            </>
          ) : (
            artist.name
          )}
        </Text>
        <View style={styles.genre}>
          <GenreIcon genre={artist.genre} size={15} color={genre.color} />
          <Text style={[styles.genreLabel, { color: genre.color }]}>{genre.label}</Text>
        </View>
      </View>
      {owned ? (
        <Text style={styles.owned}>Dans ta collection</Text>
      ) : (
        <View style={[styles.radio, selected && styles.radioOn]}>
          {selected && (
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path d="M5 12.5l4.5 4.5L19 7" stroke={colors.encre} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nuit },
  flex: { flex: 1 },
  topbar: { paddingHorizontal: space.sm, minHeight: 54, justifyContent: 'center' },
  list: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.xs },
  header: { gap: space.sm, marginBottom: space.xs },
  resultsLabel: { marginTop: space.md, marginLeft: space.xs },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    marginTop: space.md,
    borderRadius: radius.md + 2,
    borderWidth: 2,
    borderColor: colors.trait,
    backgroundColor: colors.coulisse,
  },
  searchFocused: { borderColor: colors.surligneur },
  searchIcon: { marginLeft: space.lg },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: space.md,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.papier,
    // Le cadre jaune du champ signale déjà le focus : pas de contour en plus sur le web.
    outlineWidth: 0,
  },
  clear: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 70,
    paddingVertical: 10,
    paddingHorizontal: space.md,
    borderRadius: radius.lg - 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowSelected: { backgroundColor: colors.coulisse, borderColor: colors.surligneur },
  rowPressed: { backgroundColor: colors.coulisse },
  rowText: { flex: 1, gap: space.xs, minWidth: 0 },
  highlight: { color: colors.surligneur, textDecorationLine: 'underline' },
  genre: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  genreLabel: { fontFamily: fonts.monoSemiBold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase' },
  owned: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.brume,
    textAlign: 'right',
    maxWidth: 90,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.trait,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.surligneur, borderColor: colors.surligneur },
  cta: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.lg },
});
