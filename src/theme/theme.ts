import type { TextStyle } from 'react-native';

/**
 * Système de design RapDex : reprend les tokens de design/maquette-v1.html.
 * L'interface est sombre (la salle avant le show), la couleur vient des cartes.
 */

export const colors = {
  /** Fond de l'app */
  nuit: '#15111D',
  /** Surfaces, champs */
  coulisse: '#211B2C',
  coulisse2: '#2C2439',
  /** Bordures, pointillés */
  trait: '#433857',
  /** Texte principal (15,9:1 sur nuit) */
  papier: '#F3EEE6',
  /** Texte secondaire (8,2:1 sur nuit) */
  brume: '#B3A9C2',
  /** Action principale (12,9:1 avec encre) */
  surligneur: '#FFD23F',
  surligneurOmbre: '#B38A12',
  /** Texte posé sur un fond clair */
  encre: '#15111D',
  danger: '#FF6B6B',
} as const;

export type Genre = 'rap' | 'chant' | 'dj';

/** Une paire d'encres de carte : fond de la carte (stock) et encre d'impression (ink). */
export type InkPair = { stock: string; ink: string };

export const genres: Record<Genre, { label: string; color: string; inks: readonly InkPair[] }> = {
  rap: {
    label: 'Rap',
    color: '#FF6B2C',
    inks: [
      { stock: '#FF6B2C', ink: '#1C0D05' },
      { stock: '#FFC93C', ink: '#2A1500' },
      { stock: '#D42A32', ink: '#FFE9DC' },
    ],
  },
  chant: {
    label: 'Chant',
    color: '#C59BFF',
    inks: [
      { stock: '#C59BFF', ink: '#1E0B3A' },
      { stock: '#FF8FC1', ink: '#3A0820' },
      { stock: '#F3EEE6', ink: '#5A1E8C' },
    ],
  },
  dj: {
    label: 'DJ',
    color: '#2EE6C8',
    inks: [
      { stock: '#2EE6C8', ink: '#03211C' },
      { stock: '#2F5BFF', ink: '#F1F4FF' },
      { stock: '#0F1F3A', ink: '#7FE3FF' },
    ],
  },
};

/** Noms des polices tels que chargés par useFonts (voir src/theme/fonts.ts). */
export const fonts = {
  display: 'BigShouldersDisplay_900Black',
  body: 'SchibstedGrotesk_500Medium',
  bodySemiBold: 'SchibstedGrotesk_600SemiBold',
  bodyBold: 'SchibstedGrotesk_700Bold',
  bodyExtraBold: 'SchibstedGrotesk_800ExtraBold',
  mono: 'MartianMono_400Regular',
  monoSemiBold: 'MartianMono_600SemiBold',
} as const;

/** Échelle d'espacement (px), base 4. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 18,
  pill: 999,
} as const;

/** Taille minimale d'une zone de tap. Le bouton principal fait 56. */
export const touch = {
  min: 48,
  primary: 56,
} as const;

/**
 * Styles de texte. Avec des polices personnalisées, la graisse vient de la police
 * elle-même : on ne règle jamais fontWeight.
 */
export const type = {
  /** Compteur « 12 cartes » */
  counter: { fontFamily: fonts.display, fontSize: 64, lineHeight: 58, textTransform: 'uppercase', color: colors.papier },
  /** Titres d'écran */
  title: { fontFamily: fonts.display, fontSize: 42, lineHeight: 40, textTransform: 'uppercase', color: colors.papier },
  /** Titres secondaires */
  heading: { fontFamily: fonts.display, fontSize: 34, lineHeight: 34, textTransform: 'uppercase', color: colors.papier },
  /** Bouton principal */
  button: { fontFamily: fonts.bodyExtraBold, fontSize: 17, lineHeight: 22, color: colors.encre },
  /** Nom d'artiste dans une liste */
  itemTitle: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 22, color: colors.papier },
  /** Texte courant */
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.papier },
  bodySmall: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.brume },
  /** Étiquettes en capitales (eyebrow) */
  label: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.brume,
  },
  /** Numéros, dates */
  mono: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, letterSpacing: 0.5, color: colors.papier },
} satisfies Record<string, TextStyle>;
