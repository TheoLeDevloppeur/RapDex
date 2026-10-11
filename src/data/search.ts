import { ARTISTS, getArtist, type Artist } from './artists';

/**
 * Met un caractère sous forme comparable : minuscule, sans accent.
 * Renvoie toujours un seul caractère, pour que les positions restent alignées
 * avec le nom d'origine (utile pour surligner la partie trouvée).
 */
function foldChar(c: string): string {
  if (c === '$') return 's'; // A$AP → asap
  const base = c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return base.length === 1 ? base : c.toLowerCase().slice(0, 1) || c;
}

export function fold(text: string): string {
  return [...text].map(foldChar).join('');
}

/** Sans espaces ni ponctuation : « Jay-Z » et « jay z » deviennent « jayz ». */
function compact(text: string): string {
  return fold(text).replace(/[^a-z0-9]/g, '');
}

export type SearchResult = {
  artist: Artist;
  /** Partie du nom à surligner, si la recherche correspond à un passage continu. */
  match?: { start: number; end: number };
};

/**
 * Cherche des artistes par nom. Ignore les accents, la casse et la ponctuation.
 * Ordre : le nom commence par la recherche, puis un mot du nom, puis le reste.
 */
export function searchArtists(query: string, limit = 50): SearchResult[] {
  const q = fold(query.trim());
  const qc = compact(query);
  if (!qc) return [];

  const scored: { result: SearchResult; rank: number }[] = [];
  for (const artist of ARTISTS) {
    const name = fold(artist.name);
    const at = name.indexOf(q);
    let rank: number;
    if (at === 0) rank = 0;
    else if (at > 0 && /[^a-z0-9]/.test(name[at - 1])) rank = 1;
    else if (at > 0) rank = 2;
    else if (compact(artist.name).includes(qc)) rank = 3;
    else continue;
    scored.push({ result: { artist, match: at >= 0 ? { start: at, end: at + q.length } : undefined }, rank });
  }

  return scored
    .sort((a, b) => a.rank - b.rank || a.result.artist.name.localeCompare(b.result.artist.name, 'fr'))
    .slice(0, limit)
    .map((s) => s.result);
}

/** Artistes proposés avant de taper quoi que ce soit. */
const SUGGESTION_IDS = ['laylow', 'aya-nakamura', 'ninho', 'sza', 'travis-scott', 'peggy-gou', 'jul', 'david-guetta'];

export const SUGGESTIONS: Artist[] = SUGGESTION_IDS.map((id) => getArtist(id)).filter((a): a is Artist => !!a);
