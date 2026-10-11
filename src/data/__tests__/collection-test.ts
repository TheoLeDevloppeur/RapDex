import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  addCard,
  hasCard,
  loadCollection,
  newestFirst,
  removeCard,
  saveCollection,
  STORAGE_KEY,
  todayISO,
  type CollectionEntry,
} from '../collection';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('todayISO', () => {
  it('formate la date locale en AAAA-MM-JJ', () => {
    expect(todayISO(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

describe('addCard / removeCard', () => {
  it('ajoute une carte avec un numéro d’ordre croissant', () => {
    const a = addCard([], 'laylow', '2026-10-11');
    const b = addCard(a, 'damso', '2026-10-11');
    expect(b).toEqual([
      { id: 'laylow', addedAt: '2026-10-11', seq: 1 },
      { id: 'damso', addedAt: '2026-10-11', seq: 2 },
    ]);
  });

  it('n’ajoute pas deux fois le même artiste', () => {
    const a = addCard([], 'laylow');
    expect(addCard(a, 'laylow')).toBe(a);
  });

  it('refuse un artiste inconnu', () => {
    expect(addCard([], 'pas-un-artiste')).toEqual([]);
  });

  it('retire une carte', () => {
    const a = addCard(addCard([], 'laylow'), 'damso');
    const b = removeCard(a, 'laylow');
    expect(hasCard(b, 'laylow')).toBe(false);
    expect(hasCard(b, 'damso')).toBe(true);
    expect(removeCard(b, 'laylow')).toBe(b);
  });
});

describe('newestFirst', () => {
  it('trie par date puis par ordre d’ajout', () => {
    const entries: CollectionEntry[] = [
      { id: 'damso', addedAt: '2025-06-21', seq: 1 },
      { id: 'pnl', addedAt: '2026-04-18', seq: 2 },
      { id: 'laylow', addedAt: '2026-04-18', seq: 3 },
    ];
    expect(newestFirst(entries).map((e) => e.id)).toEqual(['laylow', 'pnl', 'damso']);
  });
});

describe('stockage', () => {
  it('relit ce qui a été enregistré', async () => {
    const entries = addCard(addCard([], 'laylow', '2026-10-11'), 'damso', '2026-10-12');
    await saveCollection(entries);
    expect(await loadCollection()).toEqual(entries);
  });

  it('renvoie une collection vide au premier lancement', async () => {
    expect(await loadCollection()).toEqual([]);
  });

  it('survit à une donnée corrompue', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{pas du json');
    expect(await loadCollection()).toEqual([]);
  });

  it('ignore les cartes invalides, inconnues ou en double', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        entries: [
          { id: 'laylow', addedAt: '2026-10-11', seq: 1 },
          { id: 'artiste-supprime', addedAt: '2026-10-11', seq: 2 },
          { id: 'damso', addedAt: 'hier', seq: 3 },
          { id: 'laylow', addedAt: '2026-10-12', seq: 4 },
        ],
      })
    );
    expect(await loadCollection()).toEqual([{ id: 'laylow', addedAt: '2026-10-11', seq: 1 }]);
  });
});
