import { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassmorphicHeader } from '@/components/ui/glassmorphic-header';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { MasonryGrid, type MasonryItem } from '@/components/ui/masonry-grid';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useApi } from '@/hooks/use-api';
import { getEventMedia } from '@/lib/api';
import type { MediaResponseDto } from '@/lib/types';

const TABS = ['ALL', 'PHOTOS', 'VIDEOS', 'HIGHLIGHTS'];

function mediaToMasonryItem(item: MediaResponseDto): MasonryItem {
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.caption,
    aspectRatio: item.aspectRatio || 1,
  };
}

interface EventGalleryScreenProps {
  eventId?: string;
  extraTopPadding?: number;
}

export function EventGalleryScreen({ eventId, extraTopPadding = 0 }: EventGalleryScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');

  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useApi(
    () => (eventId ? getEventMedia(eventId, activeTab) : Promise.resolve({ items: [], total: 0 })),
    [eventId, activeTab],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const [headerHeight, setHeaderHeight] = useState(insets.top + 60);
  const items = data?.items?.map(mediaToMasonryItem) ?? [];

  const handleItemPress = (item: MasonryItem) => {
    const id = eventId ?? '';
    if (id) {
      router.push(`/(tabs)/(feed)/event-media/${id}`);
    }
  };

  return (
    <View style={styles.screen} testID="eventGallery.container">
      <GlassmorphicHeader onHeightChange={setHeaderHeight}>
        <View style={styles.headerRow}>
          <AppText variant="displaySmall" style={styles.logo}>dump</AppText>
          <Button
            variant="primary"
            title="CONTRIBUTE"
            testID="eventGallery.btn.contribute"
            onPress={() => {
              if (eventId) {
                router.push({
                  pathname: '/(tabs)/(upload)/upload-media',
                  params: { eventId },
                });
              }
            }}
          />
        </View>
      </GlassmorphicHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + extraTopPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <FilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <LoadingState error={error} onRetry={refetch} />
        ) : !eventId ? (
          <View style={styles.emptyState}>
            <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
              No event selected.
            </AppText>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
              No media yet. Upload some content to this event.
            </AppText>
          </View>
        ) : (
          <View style={styles.grid}>
            <MasonryGrid items={items} onItemPress={handleItemPress} />
          </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    letterSpacing: -0.72,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  grid: {
    marginTop: Spacing.lg,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
});
