import { ARTISTS } from '../artists';
import { cardVariant, INK_COUNT, LAYOUTS, PATTERNS } from '../card-variant';

describe('cardVariant', () => {
  it('renvoie toujours la même variante pour un artiste', () => {
    const a = ARTISTS[0];
    expect(cardVariant(a)).toEqual(cardVariant({ ...a }));
  });

  it('reste dans les bornes', () => {
    for (const a of ARTISTS) {
      const v = cardVariant(a);
      expect(PATTERNS).toContain(v.pattern);
      expect(LAYOUTS).toContain(v.layout);
      expect(v.ink).toBeGreaterThanOrEqual(0);
      expect(v.ink).toBeLessThan(INK_COUNT);
    }
  });

  it('n’écrit jamais un nom long à la verticale', () => {
    for (const a of ARTISTS.filter((x) => x.name.length > 13)) {
      expect(cardVariant(a).layout).not.toBe('vert');
    }
  });

  it('utilise toutes les trames, compositions et encres', () => {
    const vs = ARTISTS.map(cardVariant);
    expect(new Set(vs.map((v) => v.pattern)).size).toBe(PATTERNS.length);
    expect(new Set(vs.map((v) => v.layout)).size).toBe(LAYOUTS.length);
    expect(new Set(vs.map((v) => v.ink)).size).toBe(INK_COUNT);
  });

  it('varie assez les cartes au sein d’un même genre', () => {
    // 6 trames × 3 compositions × 3 encres = 54 combinaisons par genre.
    for (const g of ['rap', 'chant', 'dj'] as const) {
      const keys = ARTISTS.filter((a) => a.genre === g).map((a) => {
        const v = cardVariant(a);
        return `${v.pattern}/${v.layout}/${v.ink}`;
      });
      expect(new Set(keys).size / keys.length).toBeGreaterThan(0.45);
    }
  });

  it('ne dépend pas de la position dans la base', () => {
    expect(cardVariant({ id: 'laylow', name: 'Laylow' })).toEqual(
      cardVariant(ARTISTS.find((a) => a.id === 'laylow')!)
    );
  });
});
