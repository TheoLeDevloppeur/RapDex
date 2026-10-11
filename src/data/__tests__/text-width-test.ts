import { ARTISTS } from '../artists';
import { displayWidth, fitFontSize } from '../text-width';

describe('displayWidth', () => {
  it('tient compte des lettres larges et étroites', () => {
    expect(displayWidth('MW')).toBeGreaterThan(displayWidth('II') * 3);
  });

  it('traite les accents comme la lettre de base', () => {
    expect(displayWidth('Angèle')).toBeCloseTo(displayWidth('Angele'));
  });
});

describe('fitFontSize', () => {
  it('ne dépasse jamais la taille maximale', () => {
    expect(fitFontSize('PNL', 1000, 40)).toBe(40);
  });

  it('fait tenir chaque nom d’artiste dans la largeur donnée', () => {
    for (const a of ARTISTS) {
      const size = fitFontSize(a.name, 150, 30);
      expect(displayWidth(a.name) * size).toBeLessThanOrEqual(150.0001);
    }
  });
});
