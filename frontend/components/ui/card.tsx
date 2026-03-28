import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Shadows } from '@/constants';

export function Card({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 0,
    ...Shadows.ambient,
  },
});
