import { Platform, ViewStyle } from 'react-native';

export const Shadows: Record<string, ViewStyle> = {
  ambient: Platform.select({
    ios: {
      shadowColor: 'rgba(50, 50, 51, 1)',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.06,
      shadowRadius: 48,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,

  subtle: Platform.select({
    ios: {
      shadowColor: 'rgba(50, 50, 51, 1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,
};
