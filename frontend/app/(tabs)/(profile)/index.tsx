import { useState, useCallback } from 'react';
import { ScrollView, View, Pressable, RefreshControl, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { JoinEventModal } from '@/components/ui/join-event-modal';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/hooks/use-api';
import { listUserEvents, getClippings, getCollections, getMedia } from '@/lib/api';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const clippingSize = (width - Spacing.md * 3) / 2;
  const router = useRouter();
  const { user, logout } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  }, [logout]);

  const { data: eventsData, isLoading: eventsLoading, refetch: eventsRefetch } = useApi(
    () => listUserEvents(),
    [],
  );
  const { data: clippingsData, isLoading: clippingsLoading, refetch: clippingsRefetch } = useApi(
    () => getClippings(),
    [],
  );
  const { data: collectionsData, isLoading: collectionsLoading, refetch: collectionsRefetch } = useApi(
    () => getCollections(),
    [],
  );

  const refetchAll = useCallback(() => {
    eventsRefetch();
    clippingsRefetch();
    collectionsRefetch();
  }, [eventsRefetch, clippingsRefetch, collectionsRefetch]);

  useRefetchOnFocus(refetchAll);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([eventsRefetch(), clippingsRefetch(), collectionsRefetch()]);
    setRefreshing(false);
  }, [eventsRefetch, clippingsRefetch, collectionsRefetch]);

  const handleClippingPress = useCallback(async (mediaId: string) => {
    try {
      const media = await getMedia(mediaId);
      router.push(`/(tabs)/(feed)/event-media/${media.eventId}`);
    } catch {
      // silently fail if media lookup fails
    }
  }, [router]);

  if (!user) return <Redirect href="/(auth)/login" />;

  const events = eventsData?.events ?? [];
  const clippings = clippingsData?.clippings ?? [];
  const collections = collectionsData ?? [];
  const isLoading = eventsLoading && clippingsLoading && collectionsLoading;

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: Spacing.xxl }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Cover Image */}
      <Image
        source={{ uri: user.coverUrl }}
        style={styles.cover}
        contentFit="cover"
      />

      {/* Settings icon */}
      <Pressable
        testID="profile.btn.logout"
        style={styles.settingsButton}
        onPress={handleLogout}
        hitSlop={12}
      >
        <Icon name="log-out" size={20} color={Colors.onSurfaceVariant} />
      </Pressable>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarRow}>
          <Avatar source={user.avatarUrl} size={80} />
        </View>
        <AppText testID="profile.text.name" variant="headlineLarge" style={styles.name}>{user.name}</AppText>
        <AppText testID="profile.text.bio" variant="bodySmall" color={Colors.onSurfaceVariant}>
          {user.bio}
        </AppText>
        <Button
          testID="profile.btn.editProfile"
          variant="secondary"
          title="Edit Profile"
          onPress={() => router.push('/(tabs)/(profile)/edit-profile')}
          style={styles.editButton}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem count={user.stats.clippings} label="Clippings" />
        <StatItem count={user.stats.followers} label="Followers" />
        <StatItem count={user.stats.events} label="Events" />
      </View>

      {/* Empty state for new users */}
      {events.length === 0 && clippings.length === 0 && collections.length === 0 && !isLoading && (
        <EmptyState
          icon="camera"
          title="Get Started"
          description="Create your first event or join one with friends to start building your profile."
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
      )}

      {/* Your Events */}
      {events.length > 0 && (
        <View style={styles.section}>
          <AppText variant="titleMedium" style={styles.sectionTitle}>Your Events</AppText>
          <Pressable testID="profile.card.featuredEvent" onPress={() => router.push(`/(tabs)/(feed)/event-media/${events[0].id}`)}>
            <Card style={styles.featuredEvent}>
              <Image
                source={{ uri: events[0].imageUrl }}
                style={styles.featuredImage}
                contentFit="cover"
              />
              <View style={styles.featuredInfo}>
                <AppText variant="titleSmall">{events[0].title}</AppText>
                <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
                  {events[0].date} — {events[0].location}
                </AppText>
              </View>
            </Card>
          </Pressable>
          {events.slice(1, 3).map((event) => (
            <Pressable key={event.id} onPress={() => router.push(`/(tabs)/(feed)/event-media/${event.id}`)}>
              <View style={styles.upcomingItem}>
                <AppText variant="bodyLarge">{event.title}</AppText>
                <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
                  {event.date}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Recent Clippings */}
      {clippings.length > 0 && (
        <View style={styles.section}>
          <AppText variant="titleMedium" style={styles.sectionTitle}>Recent Clippings</AppText>
          <View style={styles.clippingsGrid}>
            {clippings.map((clip) => (
              <Pressable key={clip.id} onPress={() => handleClippingPress(clip.mediaId)}>
                <Image
                  source={{ uri: clip.imageUrl }}
                  style={[styles.clippingImage, { width: clippingSize, height: clippingSize }]}
                  contentFit="cover"
                />
                <AppText
                  variant="labelSmall"
                  color={Colors.onSurfaceVariant}
                  style={styles.clippingDate}
                >
                  {clip.date}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <View style={styles.section}>
          <AppText variant="titleMedium" style={styles.sectionTitle}>Collections</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionsRow}
          >
            {collections.map((collection) => (
              <Pressable key={collection.id} onPress={() => router.push(`/(tabs)/(profile)/collection/${collection.id}`)}>
                <Card style={styles.collectionCard}>
                  <Image
                    source={{ uri: collection.thumbnailUrl }}
                    style={styles.collectionImage}
                    contentFit="cover"
                  />
                  <View style={styles.collectionInfo}>
                    <AppText variant="titleSmall">{collection.title}</AppText>
                    <AppText variant="labelSmall" color={Colors.onSurfaceVariant}>
                      {collection.itemCount} items
                    </AppText>
                  </View>
                </Card>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Join Event */}
      <View style={styles.joinSection}>
        <Button
          testID="profile.btn.joinEvent"
          variant="secondary"
          title="Join Event"
          onPress={() => setShowJoinModal(true)}
        />
      </View>

      <JoinEventModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={refetchAll}
      />
    </ScrollView>
  );
}

function StatItem({ count, label }: { count: number; label: string }) {
  return (
    <View style={styles.statItem}>
      <AppText variant="titleLarge">{count}</AppText>
      <AppText variant="labelSmall" color={Colors.onSurfaceVariant}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  settingsButton: {
    position: 'absolute',
    top: 52,
    right: Spacing.md,
    zIndex: 10,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  profileSection: {
    paddingHorizontal: Spacing.md,
    marginTop: -40,
    gap: Spacing.xs,
  },
  avatarRow: {
    marginBottom: Spacing.sm,
  },
  name: {
    marginTop: Spacing.xs,
  },
  editButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  featuredEvent: {
    marginHorizontal: Spacing.md,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  featuredInfo: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  upcomingItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  clippingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  clippingImage: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  clippingDate: {
    marginTop: Spacing.xs,
  },
  collectionsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  collectionCard: {
    width: 200,
  },
  collectionImage: {
    width: 200,
    height: 140,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  collectionInfo: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  joinSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
});
