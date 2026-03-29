import { useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassmorphicHeader } from '@/components/ui/glassmorphic-header';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MediaCard } from '@/components/ui/media-card';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { JoinEventModal } from '@/components/ui/join-event-modal';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/hooks/use-api';
import { getFeed, getFeedFriends } from '@/lib/api';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';

export default function HomeFeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: friendsData, isLoading: friendsLoading, refetch: friendsRefetch } = useApi(
    () => getFeedFriends(),
    [],
  );
  const { data: feedData, isLoading: feedLoading, error: feedError, refetch } = useApi(
    () => getFeed(),
    [],
  );

  const refetchAll = useCallback(() => {
    refetch();
    friendsRefetch();
  }, [refetch, friendsRefetch]);

  useRefetchOnFocus(refetchAll);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), friendsRefetch()]);
    setRefreshing(false);
  }, [refetch, friendsRefetch]);

  const [headerHeight, setHeaderHeight] = useState(insets.top + 60);

  if (feedLoading && friendsLoading) {
    return <LoadingState />;
  }

  if (feedError) {
    return <LoadingState error={feedError} onRetry={refetch} />;
  }

  const friends = friendsData ?? [];
  const posts = feedData?.posts ?? [];

  return (
    <View style={styles.screen} testID="homeFeed.container">
      <GlassmorphicHeader onHeightChange={setHeaderHeight}>
        <View style={styles.headerRow}>
          <AppText variant="displaySmall" style={styles.logo}>dump</AppText>
          <View style={styles.headerActions}>
            <Pressable testID="homeFeed.btn.search" onPress={() => router.push('/(tabs)/(feed)/search')} hitSlop={12}>
              <Icon name="search" size={22} color={Colors.onSurface} />
            </Pressable>
            <Avatar testID="homeFeed.avatar.user" source={user?.avatarUrl ?? ''} size={36} />
          </View>
        </View>
      </GlassmorphicHeader>

      <ScrollView
        testID="homeFeed.scroll"
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* New From Friends */}
        {friends.length > 0 && (
          <View style={styles.section}>
            <AppText variant="titleMedium" style={styles.sectionTitle}>
              New From Friends
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsRow}
            >
              {friends.map((friend) => (
                <Pressable key={friend.id} style={styles.friendItem} onPress={() => router.push(`/(tabs)/(feed)/user/${friend.id}`)}>
                  <Avatar source={friend.avatarUrl} size={60} showStoryRing />
                  <AppText
                    variant="labelSmall"
                    color={Colors.onSurfaceVariant}
                    style={styles.friendName}
                  >
                    {friend.name}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Event Feed */}
        <View style={styles.section}>
          <AppText variant="titleMedium" style={styles.sectionTitle}>
            Event Recap
          </AppText>
          {posts.length === 0 ? (
            <EmptyState
              icon="camera"
              title="Welcome to Dump"
              description="Create an event or join one with friends to start sharing photos together."
              actions={[
                {
                  title: 'Create Event',
                  onPress: () => router.push('/(tabs)/(upload)/create-event'),
                  variant: 'primary',
                },
                {
                  title: 'Join Event',
                  onPress: () => setShowJoinModal(true),
                  variant: 'secondary',
                },
              ]}
            />
          ) : (
            posts.map((post) => (
              <MediaCard
                key={post.id}
                imageUrl={post.imageUrl}
                title={post.title}
                date={post.date}
                likes={post.likes}
                comments={post.comments}
                onPress={() => router.push(`/(tabs)/(feed)/event-media/${post.eventId}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <JoinEventModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={refetchAll}
      />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    letterSpacing: -0.72,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  friendsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  friendItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  friendName: {
    textAlign: 'center',
  },
  emptyState: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
});
