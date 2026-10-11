import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { GenreIcon } from '@/components/genre-icon';
import { colors, fonts, genres, radius, space, type Genre } from '@/theme/theme';

export type GenreFilter = 'all' | Genre;

type Props = {
  value: GenreFilter;
  onChange: (value: GenreFilter) => void;
  counts: Record<GenreFilter, number>;
};

const OPTIONS: GenreFilter[] = ['all', 'rap', 'chant', 'dj'];

/** Filtres par genre de la collection, avec le nombre de cartes de chacun. */
export function GenreChips({ value, onChange, counts }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option === value;
        const label = option === 'all' ? 'Tout' : genres[option].label;
        const fg = selected ? colors.encre : colors.papier;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${label}, ${counts[option]} ${counts[option] > 1 ? 'cartes' : 'carte'}`}
            onPress={() => onChange(option)}
            style={[styles.chip, selected && styles.chipSelected]}>
            {option !== 'all' && (
              <GenreIcon genre={option} size={17} color={selected ? colors.encre : genres[option].color} />
            )}
            <Text style={[styles.label, { color: fg }]}>{label}</Text>
            <Text style={[styles.count, { color: selected ? colors.encre : colors.brume }]}>{counts[option]}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.trait,
  },
  chipSelected: {
    backgroundColor: colors.papier,
    borderColor: colors.papier,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  count: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
  },
});
