import { formatLongDate, formatNumber, formatShortDate, initials } from '../format';

describe('initials', () => {
  it.each([
    ['Laylow', 'LA'],
    ['Kendrick Lamar', 'KL'],
    ['Charlotte de Witte', 'CW'],
    ['Bigflo & Oli', 'BO'],
    ['21 Savage', '2S'],
    ['A$AP Rocky', 'AR'],
    ["Rim'K", 'RI'],
    ['Angèle', 'AN'],
  ])('%s → %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe('dates et numéros', () => {
  it('formate les dates', () => {
    expect(formatShortDate('2026-09-14')).toBe('14.09.26');
    expect(formatLongDate('2026-09-04')).toBe('4 septembre 2026');
  });

  it('formate le numéro RapDex', () => {
    expect(formatNumber(13)).toBe('#013');
    expect(formatNumber(169)).toBe('#169');
  });
});
