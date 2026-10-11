import AsyncStorage from '@react-native-async-storage/async-storage';

import { getArtist } from './artists';

/** Une carte de la collection de l'utilisateur. */
export type CollectionEntry = {
  /** Identifiant de l'artiste (voir artists.json). */
  id: string;
  /** Date d'ajout, au format AAAA-MM-JJ (heure locale du téléphone). */
  addedAt: string;
  /** Ordre d'ajout, pour départager deux cartes ajoutées le même jour. */
  seq: number;
};

export const STORAGE_KEY = 'rapdex.collection';
const STORAGE_VERSION = 1;

/** Date du jour au format AAAA-MM-JJ, en heure locale. */
export function todayISO(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function hasCard(entries: readonly CollectionEntry[], id: string): boolean {
  return entries.some((e) => e.id === id);
}

/** Ajoute une carte. Renvoie la même liste si l'artiste est inconnu ou déjà présent. */
export function addCard(
  entries: readonly CollectionEntry[],
  id: string,
  addedAt: string = todayISO()
): readonly CollectionEntry[] {
  if (!getArtist(id) || hasCard(entries, id)) return entries;
  const seq = entries.reduce((max, e) => Math.max(max, e.seq), 0) + 1;
  return [...entries, { id, addedAt, seq }];
}

export function removeCard(entries: readonly CollectionEntry[], id: string): readonly CollectionEntry[] {
  return hasCard(entries, id) ? entries.filter((e) => e.id !== id) : entries;
}

/** Les cartes les plus récentes d'abord. */
export function newestFirst(entries: readonly CollectionEntry[]): CollectionEntry[] {
  return [...entries].sort((a, b) => b.addedAt.localeCompare(a.addedAt) || b.seq - a.seq);
}

function isEntry(value: unknown): value is CollectionEntry {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.addedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.addedAt) &&
    typeof e.seq === 'number'
  );
}

/**
 * Lit la collection enregistrée. Ne plante jamais : une donnée illisible donne
 * une collection vide, et les cartes d'artistes retirés de la base sont ignorées.
 */
export async function loadCollection(): Promise<CollectionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const list = (parsed as { entries?: unknown })?.entries;
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    return list.filter((e): e is CollectionEntry => {
      if (!isEntry(e) || !getArtist(e.id) || seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  } catch {
    return [];
  }
}

export async function saveCollection(entries: readonly CollectionEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, entries }));
}
