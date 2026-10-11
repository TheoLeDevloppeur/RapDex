import { Text, type TextProps } from 'react-native';

/**
 * Texte qui garde sa taille quand l'utilisateur agrandit le texte du téléphone.
 * Réservé aux textes qui font partie d'un dessin (carte, billet, tampon) : ils
 * sont proportionnels au dessin et déjà décrits en entier aux lecteurs d'écran.
 */
export function FixedText(props: TextProps) {
  return <Text allowFontScaling={false} {...props} />;
}
