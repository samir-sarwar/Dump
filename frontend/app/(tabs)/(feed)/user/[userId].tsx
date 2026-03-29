import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { getUser, checkFollowStatus, getUserEvents } from '@/lib/api';
import { followUser, unfollowUser } from '@/lib/api';
import type { UserProfileDto, EventResponseDto } from '@/lib/types';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [events, setEvents] = useState<EventResponseDto[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [userData, followData, eventsData] = await Promise.all([
        getUser(userId),
        checkFollowStatus(userId),
        getUserEvents(userId),
      ]);
      setUser(userData);
      setIsFollowing(followData.following);
      setEvents(eventsData.events ?? []);
      setError(null);
    } catch {
      setError('Could not load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleFollowToggle = useCallback(async () => {
    if (!userId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                stats: { ...prev.stats, followers: prev.stats.followers - 1 },
              }
            : prev,
        );
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                stats: { ...prev.stats, followers: prev.stats.followers + 1 },
              }
            : prev,
        );
      }
    } catch {
      // revert on failure
    } finally {
      setFollowLoading(false);
    }
  }, [userId, isFollowing, followLoading]);

  if (isLoading) return <LoadingState />;
  if (error || !user) return <LoadingState error={error ?? 'User not found'} onRetry={fetchData} />;

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

      {/* Back button */}
      <Pressable
        testID="userProfile.btn.back"
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Icon name="arrow-left" size={20} color={Colors.onSurfaceVariant} />
      </Pressable>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarRow}>
          <Avatar source={user.avatarUrl} size={80} />
        </View>
        <AppText testID="userProfile.text.name" variant="headlineLarge" style={styles.name}>
          {user.name}
        </AppText>
        <AppText testID="userProfile.text.username" variant="bodySmall" color={Colors.onSurfaceVariant}>
          @{user.username}
        </AppText>
        {user.bio ? (
          <AppText
            variant="bodySmall"
            color={Colors.onSurfaceVariant}
            style={styles.bio}
          >
            {user.bio}
          </AppText>
        ) : null}
        <Button
          testID="userProfile.btn.follow"
          variant={isFollowing ? 'secondary' : 'primary'}
          title={followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
          onPress={handleFollowToggle}
          style={styles.followButton}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem count={user.stats.clippings} label="Clippings" />
        <StatItem count={user.stats.followers} label="Followers" />
        <StatItem count={user.stats.events} label="Events" />
      </View>

      {/* Their Events */}
      {events.length > 0 && (
        <View style={styles.section}>
          <AppText variant="titleMedium" style={styles.sectionTitle}>
            Events
          </AppText>
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
          {events.slice(1, 4).map((event) => (
            <Pressable
              key={event.id}
              style={styles.eventItem}
              onPress={() =>
                router.push(`/(tabs)/(feed)/event-details/${event.id}`)
              }
            >
              <AppText variant="bodyLarge">{event.title}</AppText>
              <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
                {event.date}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatItem({ count, label }: { count: number; label: string }) {
  return (
    <View style={styles.statItem}>
      <AppText variant="titleLarge">{count}</AppText>
      <AppText variant="labelSmall" color={Colors.onSurfaceVariant}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.md,
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
  bio: {
    marginTop: Spacing.xs,
  },
  followButton: {
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
  eventItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
});
