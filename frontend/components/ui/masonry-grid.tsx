import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';

export interface MasonryItem {
  id: string;
  imageUrl: string;
  title?: string;
  aspectRatio: number;
}

interface MasonryGridProps {
  items: MasonryItem[];
  onItemPress?: (item: MasonryItem) => void;
}

export function MasonryGrid({ items, onItemPress }: MasonryGridProps) {
  const { width } = useWindowDimensions();
  const columnWidth = (width - Spacing.md * 3) / 2;

  const leftColumn: MasonryItem[] = [];
  const rightColumn: MasonryItem[] = [];
  let leftHeight = 0;
  let rightHeight = 0;

  for (const item of items) {
    const itemHeight = columnWidth / item.aspectRatio;
    if (leftHeight <= rightHeight) {
      leftColumn.push(item);
      leftHeight += itemHeight + Spacing.md;
    } else {
      rightColumn.push(item);
      rightHeight += itemHeight + Spacing.md;
    }
  }

  const renderColumn = (column: MasonryItem[]) =>
    column.map((item) => (
      <Pressable
        key={item.id}
        onPress={() => onItemPress?.(item)}
        style={styles.item}
        testID={`masonryItem.${item.id}`}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.image, { width: columnWidth, height: columnWidth / item.aspectRatio }]}
          contentFit="cover"
        />
        {item.title && (
          <AppText
            variant="bodySmall"
            color={Colors.onSurfaceVariant}
            style={styles.title}
            numberOfLines={1}
          >
            {item.title}
          </AppText>
        )}
      </Pressable>
    ));

  return (
    <View style={styles.container}>
      <View style={styles.column}>{renderColumn(leftColumn)}</View>
      <View style={styles.column}>{renderColumn(rightColumn)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
  item: {
    marginBottom: Spacing.md,
  },
  image: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 0,
  },
  title: {
    marginTop: Spacing.xs,
  },
});
