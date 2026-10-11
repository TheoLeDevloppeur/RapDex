import type { Artist } from './artists';

/** Les trames imprimées dans la pochette de la carte. */
export const PATTERNS = ['halftone', 'rays', 'grooves', 'stripes', 'split', 'grid'] as const;
/** La composition du nom dans la pochette. */
export const LAYOUTS = ['giant', 'stack', 'vert'] as const;
/** Nombre de paires d'encres par genre (voir genres[g].inks dans le thème). */
export const INK_COUNT = 3;

export type Pattern = (typeof PATTERNS)[number];
export type Layout = (typeof LAYOUTS)[number];

export type CardVariant = {
  pattern: Pattern;
  layout: Layout;
  /** Index dans genres[artist.genre].inks */
  ink: number;
};

/** Au-delà de cette longueur, un nom écrit à la verticale devient illisible. */
const MAX_VERTICAL_NAME = 13;

/** Hachage FNV-1a 32 bits : rapide, stable d'une plateforme à l'autre. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Choisit l'apparence d'une carte à partir de l'identifiant de l'artiste.
 * Le résultat est toujours le même pour un artiste donné, et ne change pas
 * quand on ajoute d'autres artistes à la base.
 */
export function cardVariant(artist: Pick<Artist, 'id' | 'name'>): CardVariant {
  const h = hash(artist.id);
  const pattern = PATTERNS[h % PATTERNS.length];
  let layout = LAYOUTS[(h >>> 8) % LAYOUTS.length];
  const ink = (h >>> 16) % INK_COUNT;
  if (layout === 'vert' && artist.name.length > MAX_VERTICAL_NAME) {
    layout = 'stack';
  }
  return { pattern, layout, ink };
}
