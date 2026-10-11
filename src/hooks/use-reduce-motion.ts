import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * true si « Réduire les animations » est activé sur le téléphone.
 *
 * Lit le réglage en direct et suit ses changements. (Le hook de Reanimated ne le
 * lit qu'au démarrage de l'app : après avoir désactivé le réglage, il restait
 * bloqué sur true jusqu'au redémarrage complet.)
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduceMotion(value);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}
