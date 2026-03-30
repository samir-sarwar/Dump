import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { MasonryGrid, type MasonryItem } from '@/components/ui/masonry-grid';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useApi } from '@/hooks/use-api';
import { getCollectionItems } from '@/lib/api';
import type { MediaResponseDto } from '@/lib/types';

function mediaToMasonryItem(item: MediaResponseDto): MasonryItem {
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.caption,
    aspectRatio: item.aspectRatio || 1,
  };
}

export default function CollectionDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useApi(
    () => getCollectionItems(collectionId!),
    [collectionId],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = (item: MasonryItem) => {
    const media = data?.items?.find((m) => m.id === item.id);
    if (media?.eventId) {
      router.push(`/(tabs)/(feed)/event-media/${media.eventId}`);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <LoadingState error={error} onRetry={refetch} />;

  const items = data?.items?.map(mediaToMasonryItem) ?? [];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          testID="collectionDetail.btn.back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={24} color={Colors.onSurface} />
        </Pressable>
        <View style={styles.headerText}>
          <AppText variant="titleLarge" numberOfLines={1}>{data?.title ?? 'Collection'}</AppText>
          <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
            {data?.itemCount ?? 0} {(data?.itemCount ?? 0) === 1 ? 'item' : 'items'}
          </AppText>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon="image"
            title="No items yet"
            description="Add media to this collection from any event."
          />
        ) : (
          <MasonryGrid items={items} onItemPress={handleItemPress} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
