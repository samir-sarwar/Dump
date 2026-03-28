import { StyleSheet, type ViewProps, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/constants';
import { useCallback } from 'react';

interface GlassmorphicHeaderProps extends ViewProps {
  onHeightChange?: (height: number) => void;
}

export function GlassmorphicHeader({ children, style, onHeightChange, ...props }: GlassmorphicHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    onHeightChange?.(e.nativeEvent.layout.height);
  }, [onHeightChange]);

  return (
    <BlurView
      intensity={20}
      tint="light"
      onLayout={handleLayout}
      style={[
        styles.header,
        { paddingTop: insets.top + Spacing.sm },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(252, 249, 248, 0.8)',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
});
