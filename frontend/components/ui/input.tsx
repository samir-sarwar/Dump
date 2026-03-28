import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, type TextInputProps } from 'react-native';
import { AppText } from '@/components/typography';
import { Icon } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants';

interface InputProps extends TextInputProps {
  label?: string;
  iconName?: React.ComponentProps<typeof Icon>['name'];
  secureTextToggle?: boolean;
}

export function Input({ label, iconName, secureTextToggle, style, secureTextEntry, testID, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="labelMedium" color={Colors.onSurfaceVariant}>
          {label}
        </AppText>
      )}
      <View style={styles.inputRow}>
        {iconName && (
          <Icon name={iconName} size={18} color={Colors.outline} />
        )}
        <TextInput
          style={[styles.input, iconName && styles.inputWithIcon, style]}
          placeholderTextColor={Colors.outline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isSecure}
          testID={testID}
          {...props}
        />
        {secureTextToggle && secureTextEntry && (
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} testID={testID ? `${testID}.toggle` : undefined}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={18}
              color={Colors.onSurfaceVariant}
            />
          </Pressable>
        )}
      </View>
      <View
        style={[
          styles.underline,
          focused && styles.underlineFocused,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.onSurface,
    paddingVertical: Spacing.sm,
  },
  inputWithIcon: {
    marginLeft: Spacing.sm,
  },
  underline: {
    height: 0.5,
    backgroundColor: Colors.outline,
  },
  underlineFocused: {
    height: 1.5,
    backgroundColor: Colors.primary,
  },
});
