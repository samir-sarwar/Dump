import { Pressable, View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography';
import { Icon } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants';

interface EventListItemProps {
  title: string;
  date: string;
  location: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function EventListItem({ title, date, location, selected = false, onPress, testID }: EventListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, selected && styles.selected]}
      testID={testID}
    >
      <View style={styles.info}>
        <AppText variant="titleSmall">{title}</AppText>
        <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
          {date} — {location}
        </AppText>
      </View>
      <Icon
        name={selected ? 'check-circle' : 'chevron-right'}
        size={20}
        color={selected ? Colors.primary : Colors.outline}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  selected: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
    marginRight: Spacing.md,
  },
});
