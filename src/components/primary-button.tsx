import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, space, touch, type } from '@/theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Symbole affiché avant le libellé, par exemple « + ». */
  icon?: string;
};

/** Le bouton jaune : une seule action principale par écran, toujours en bas. */
export function PrimaryButton({ label, onPress, disabled = false, icon }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, disabled ? styles.disabled : pressed ? styles.pressed : null]}>
      <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={2} maxFontSizeMultiplier={1.5}>
        {icon ? <Text style={styles.icon}>{icon} </Text> : null}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touch.primary,
    borderRadius: radius.md + 2,
    backgroundColor: colors.surligneur,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    boxShadow: `0 4px 0 ${colors.surligneurOmbre}`,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    boxShadow: `0 1px 0 ${colors.surligneurOmbre}`,
  },
  disabled: {
    backgroundColor: colors.coulisse2,
    boxShadow: 'none',
  },
  label: {
    ...type.button,
    textAlign: 'center',
  },
  labelDisabled: {
    color: colors.brume,
  },
  icon: {
    fontSize: 22,
  },
});
