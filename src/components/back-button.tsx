import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts, radius, space, touch } from '@/theme/theme';

/** Retour à l'écran précédent, toujours en haut à gauche. */
export function BackButton({ label = 'Collection' }: { label?: string }) {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Retour à ${label}`}
      onPress={goBack}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M15 5l-7 7 7 7" stroke={colors.papier} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touch.min,
    minWidth: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingLeft: space.xs,
    paddingRight: space.md,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  pressed: {
    backgroundColor: colors.coulisse,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.papier,
  },
});
