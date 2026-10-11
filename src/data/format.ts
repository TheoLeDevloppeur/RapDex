/** « Kendrick Lamar » → « KL », « Laylow » → « LA ». */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  if (words.length > 1) {
    return (firstChar(words[0]) + firstChar(words[words.length - 1])).toUpperCase();
  }
  const letters = [...name].filter((c) => /[\p{L}\p{N}]/u.test(c));
  return letters.slice(0, 2).join('').toUpperCase();
}

function firstChar(word: string): string {
  return [...word].find((c) => /[\p{L}\p{N}]/u.test(c)) ?? '';
}

/** « 2026-09-14 » → « 14.09.26 », comme sur un talon de billet. */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y.slice(2)}`;
}

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** « 2026-09-14 » → « 14 septembre 2026 ». */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** « #014 » */
export function formatNumber(no: number): string {
  return `#${String(no).padStart(3, '0')}`;
}
