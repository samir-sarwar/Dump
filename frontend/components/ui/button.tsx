import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <AppText
        variant="labelLarge"
        color={variant === 'primary' ? Colors.onPrimary : Colors.onSurface}
        style={variant === 'tertiary' ? styles.tertiaryText : undefined}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 0,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  tertiaryText: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  tertiary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: Spacing.xs,
  },
};
