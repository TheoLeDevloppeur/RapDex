import { genres } from '@/theme/theme';

import { ARTISTS, getArtist } from '../artists';

describe('base d’artistes', () => {
  it('contient au moins 150 artistes', () => {
    expect(ARTISTS.length).toBeGreaterThanOrEqual(150);
  });

  it('a des identifiants uniques au format slug', () => {
    const ids = ARTISTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('numérote les artistes 1, 2, 3… sans trou ni doublon', () => {
    ARTISTS.forEach((a, i) => expect(a.no).toBe(i + 1));
  });

  it('n’utilise que les genres du thème', () => {
    for (const a of ARTISTS) {
      expect(Object.keys(genres)).toContain(a.genre);
    }
  });

  it('n’a pas deux fois le même nom', () => {
    const names = ARTISTS.map((a) => a.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('couvre les trois genres', () => {
    for (const g of Object.keys(genres)) {
      expect(ARTISTS.filter((a) => a.genre === g).length).toBeGreaterThanOrEqual(25);
    }
  });

  it('retrouve un artiste par son identifiant', () => {
    expect(getArtist('laylow')?.name).toBe('Laylow');
    expect(getArtist('inconnu')).toBeUndefined();
  });

  it('garde les numéros des artistes de la maquette', () => {
    expect(getArtist('damso')?.no).toBe(1);
    expect(getArtist('laylow')?.no).toBe(13);
  });
});
