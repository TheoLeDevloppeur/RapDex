import { fireEvent, render, screen } from '@testing-library/react-native';

import { FixedText } from '../fixed-text';
import { GenreChips } from '../genre-chips';
import { PrimaryButton } from '../primary-button';

describe('PrimaryButton', () => {
  it('est annoncé comme un bouton désactivé tant qu’aucun artiste n’est choisi', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Choisis un artiste" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Choisis un artiste' });
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('déclenche l’action quand il est actif', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Ajouter la carte · Laylow" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: /Laylow/ }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('GenreChips', () => {
  const counts = { all: 4, rap: 2, chant: 1, dj: 1 };

  it('annonce chaque filtre avec son nombre de cartes et son état', async () => {
    await render(<GenreChips value="rap" onChange={() => {}} counts={counts} />);
    expect(screen.getByRole('button', { name: 'Rap, 2 cartes' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Chant, 1 carte' })).not.toBeSelected();
  });

  it('change de filtre au toucher', async () => {
    const onChange = jest.fn();
    await render(<GenreChips value="all" onChange={onChange} counts={counts} />);
    fireEvent.press(screen.getByRole('button', { name: 'DJ, 1 carte' }));
    expect(onChange).toHaveBeenCalledWith('dj');
  });
});

describe('FixedText', () => {
  it('ne grossit pas avec le texte du téléphone', async () => {
    await render(<FixedText>NEW</FixedText>);
    expect(screen.getByText('NEW').props.allowFontScaling).toBe(false);
  });
});
