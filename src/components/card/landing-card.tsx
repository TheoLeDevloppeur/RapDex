import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { FixedText } from '@/components/fixed-text';
import { colors, fonts } from '@/theme/theme';

type Props = {
  children: React.ReactNode;
  /** La carte attend son arrivée : elle reste cachée jusqu'à ce que play passe à true. */
  pending: boolean;
  play: boolean;
  /** Étiquette « NEW » de la dernière carte ajoutée. */
  isNew: boolean;
};

/** Enveloppe d'une carte de la grille : arrivée en chute et étiquette « NEW ». */
export function LandingCard({ children, pending, play, isNew }: Props) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(pending && !reduceMotion ? 0 : 1);

  useEffect(() => {
    if (play) {
      progress.value = reduceMotion
        ? 1
        : withTiming(1, { duration: 750, easing: Easing.bezier(0.2, 0.9, 0.3, 1.15) });
    }
  }, [play, reduceMotion, progress]);

  const style = useAnimatedStyle(() => {
    const rest = 1 - progress.value;
    return {
      opacity: Math.min(1, progress.value * 1.8),
      transform: [{ translateY: -60 * rest }, { scale: 1 + 0.3 * rest }, { rotate: `${-8 * rest}deg` }],
    };
  });

  return (
    <Animated.View style={style}>
      {children}
      {isNew && (
        <View style={styles.tag} pointerEvents="none">
          <FixedText style={styles.tagText}>NEW</FixedText>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tag: {
    position: 'absolute',
    top: -7,
    right: -5,
    backgroundColor: colors.surligneur,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    transform: [{ rotate: '7deg' }],
    boxShadow: `0 3px 0 ${colors.surligneurOmbre}`,
  },
  tagText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.encre,
  },
});
