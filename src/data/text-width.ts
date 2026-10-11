/**
 * Largeur des caractères de Big Shoulders Display Black, en fraction de la taille
 * de police (mesurée dans un navigateur). Sert à choisir une taille de texte qui
 * tient sans être coupée : un « M » est trois fois plus large qu'un « I ».
 */
const WIDTHS: Record<string, number> = {
  A: 0.48, B: 0.47, C: 0.49, D: 0.5, E: 0.41, F: 0.41, G: 0.49, H: 0.49, I: 0.23,
  J: 0.45, K: 0.5, L: 0.4, M: 0.75, N: 0.54, O: 0.5, P: 0.47, Q: 0.5, R: 0.48,
  S: 0.47, T: 0.42, U: 0.49, V: 0.49, W: 0.8, X: 0.47, Y: 0.47, Z: 0.42,
  '0': 0.51, '1': 0.27, '2': 0.49, '3': 0.5, '4': 0.51, '5': 0.52, '6': 0.5,
  '7': 0.49, '8': 0.5, '9': 0.5,
  ' ': 0.22, '.': 0.25, ',': 0.25, "'": 0.2, '&': 0.62, '$': 0.47, '-': 0.45,
};

/** Largeur d'un caractère inconnu : un peu au-dessus de la moyenne, par prudence. */
const FALLBACK = 0.52;

/** Largeur du texte en capitales, en « em » (multiplier par la taille de police). */
export function displayWidth(text: string): number {
  let total = 0;
  for (const ch of text.toUpperCase()) {
    const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    total += WIDTHS[ch] ?? WIDTHS[base] ?? FALLBACK;
  }
  return total;
}

/** Plus grande taille de police pour que le texte tienne dans `available` px. */
export function fitFontSize(text: string, available: number, max: number): number {
  const w = displayWidth(text);
  return w > 0 ? Math.min(max, available / w) : max;
}
