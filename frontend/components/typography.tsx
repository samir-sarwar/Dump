import { Text, type TextProps } from 'react-native';
import { Typography as TypographyStyles } from '@/constants/typography';
import { Colors } from '@/constants';

type TypographyVariant = keyof typeof TypographyStyles;

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

export function AppText({
  variant = 'bodyLarge',
  color = Colors.onSurface,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[TypographyStyles[variant], { color }, style]}
      {...props}
    />
  );
}
