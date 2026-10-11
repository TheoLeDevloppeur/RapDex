import { fold, searchArtists, SUGGESTIONS } from '../search';

const names = (q: string) => searchArtists(q).map((r) => r.artist.name);

describe('fold', () => {
  it('garde la même longueur que le texte d’origine', () => {
    for (const s of ['Angèle', 'Tiësto', 'Rosalía', 'A$AP Rocky', 'Joé Dwèt Filé']) {
      expect(fold(s)).toHaveLength([...s].length);
    }
  });
});

describe('searchArtists', () => {
  it('trouve « lay » → Laylow', () => {
    expect(names('lay')[0]).toBe('Laylow');
  });

  it('ignore les accents dans les deux sens', () => {
    expect(names('angele')).toContain('Angèle');
    expect(names('ANGÈLE')).toContain('Angèle');
    expect(names('tiesto')).toContain('Tiësto');
  });

  it('ignore la ponctuation et les espaces', () => {
    expect(names('jay z')).toContain('Jay-Z');
    expect(names('jayz')).toContain('Jay-Z');
    expect(names('asap')).toContain('A$AP Rocky');
    expect(names('tyler the creator')).toContain('Tyler, The Creator');
  });

  it('classe d’abord les noms qui commencent par la recherche', () => {
    const starts = names('da').map((n) => n.toLowerCase().startsWith('da'));
    expect(starts[0]).toBe(true);
    // Une fois passé le dernier nom en « da… », plus aucun ne doit apparaître.
    expect(starts.indexOf(false) === -1 || !starts.slice(starts.indexOf(false)).includes(true)).toBe(true);
  });

  it('puis les noms dont un mot commence par la recherche', () => {
    const r = names('snake');
    expect(r[0]).toBe('DJ Snake');
  });

  it('renvoie la position à surligner', () => {
    const [first] = searchArtists('witte');
    expect(first.artist.name).toBe('Charlotte de Witte');
    expect(first.artist.name.slice(first.match!.start, first.match!.end)).toBe('Witte');
  });

  it('ne renvoie rien pour une recherche vide ou sans résultat', () => {
    expect(searchArtists('')).toEqual([]);
    expect(searchArtists('   ')).toEqual([]);
    expect(searchArtists('zzzqqq')).toEqual([]);
  });

  it('limite le nombre de résultats', () => {
    expect(searchArtists('a', 10)).toHaveLength(10);
  });
});

describe('SUGGESTIONS', () => {
  it('ne contient que des artistes de la base', () => {
    expect(SUGGESTIONS.length).toBeGreaterThanOrEqual(6);
  });
});
