import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  // Display — Newsreader Extra Light (serif)
  displayLarge: {
    fontFamily: 'Newsreader_200ExtraLight',
    fontSize: 56,
    letterSpacing: -1.12,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'Newsreader_200ExtraLight',
    fontSize: 44,
    letterSpacing: -0.88,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'Newsreader_200ExtraLight',
    fontSize: 36,
    letterSpacing: -0.72,
    lineHeight: 44,
  },

  // Headline — Newsreader Light (serif)
  headlineLarge: {
    fontFamily: 'Newsreader_300Light',
    fontSize: 32,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'Newsreader_300Light',
    fontSize: 28,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'Newsreader_300Light',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 32,
  },

  // Title — Inter Medium (sans-serif)
  titleLarge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 22,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 22,
  },

  // Body — Inter Regular (sans-serif)
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },

  // Label — Inter SemiBold, UPPERCASE (sans-serif)
  labelLarge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.2,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  labelMedium: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.1,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.0,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
};
