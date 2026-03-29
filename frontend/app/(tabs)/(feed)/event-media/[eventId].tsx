import { useState, useRef, useCallback } from 'react';
import {
  View,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Avatar } from '@/components/ui/avatar';
import { InteractionBar } from '@/components/ui/interaction-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { MasonryGrid, type MasonryItem } from '@/components/ui/masonry-grid';
import { LoadingState } from '@/components/ui/loading-state';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useApi } from '@/hooks/use-api';
import { getEvent, getMediaFeed, getEventMedia } from '@/lib/api';
import { CommentSheet } from '@/components/ui/comment-sheet';
import { likeMedia, unlikeMedia, bookmarkMedia, removeBookmark, followUser, unfollowUser } from '@/lib/api';
import type { MediaResponseDto } from '@/lib/types';

type ViewMode = 'SCROLL' | 'COLLAGE';
const GALLERY_TABS = ['ALL', 'PHOTOS', 'VIDEOS', 'HIGHLIGHTS'];

function mediaToMasonryItem(item: MediaResponseDto): MasonryItem {
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.caption,
    aspectRatio: item.aspectRatio || 1,
  };
}

export default function EventMediaFeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { height: screenHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();

  const [viewMode, setViewMode] = useState<ViewMode>('SCROLL');
  const [galleryTab, setGalleryTab] = useState('ALL');
  const [lightboxItem, setLightboxItem] = useState<MasonryItem | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [likeCountOverrides, setLikeCountOverrides] = useState<Record<string, number>>({});
  const [commentMediaId, setCommentMediaId] = useState<string | null>(null);
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});

  const { data: event } = useApi(
    () => getEvent(eventId!),
    [eventId],
  );

  const { data: feedData, isLoading: feedLoading } = useApi(
    () => getMediaFeed(eventId!),
    [eventId],
  );

  const { data: galleryData, isLoading: galleryLoading } = useApi(
    () => getEventMedia(eventId!, galleryTab),
    [eventId, galleryTab],
  );

  const mediaFeed = feedData?.items ?? [];
  const galleryItems = galleryData?.items?.map(mediaToMasonryItem) ?? [];

  const itemHeight = screenHeight - tabBarHeight;
  const isCollage = viewMode === 'COLLAGE';
  const headerColor = isCollage ? Colors.onSurface : '#fff';
  const headerInactiveColor = isCollage ? Colors.outline : 'rgba(255,255,255,0.5)';

  const headerTotalHeight = insets.top + Spacing.sm + 36 + Spacing.sm + 32;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerHidden = useRef(false);

  const handleCollageScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    lastScrollY.current = currentY;

    if (diff > 10 && !headerHidden.current && currentY > 20) {
      headerHidden.current = true;
      Animated.timing(headerTranslateY, {
        toValue: -headerTotalHeight,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (diff < -10 && headerHidden.current) {
      headerHidden.current = false;
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [headerTranslateY, headerTotalHeight]);

  const handleCollageItemPress = useCallback((item: MasonryItem) => {
    setLightboxItem(item);
  }, []);

  const handleLike = useCallback((mediaId: string, currentCount: number) => {
    const isLiked = likedMap[mediaId];
    setLikedMap((prev) => ({ ...prev, [mediaId]: !isLiked }));
    setLikeCountOverrides((prev) => ({ ...prev, [mediaId]: isLiked ? currentCount - 1 : currentCount + 1 }));
    (isLiked ? unlikeMedia(mediaId) : likeMedia(mediaId)).catch(() => {
      setLikedMap((prev) => ({ ...prev, [mediaId]: isLiked }));
      setLikeCountOverrides((prev) => ({ ...prev, [mediaId]: currentCount }));
    });
  }, [likedMap]);

  const handleBookmark = useCallback((mediaId: string) => {
    const isBookmarked = bookmarkedMap[mediaId];
    setBookmarkedMap((prev) => ({ ...prev, [mediaId]: !isBookmarked }));
    (isBookmarked ? removeBookmark(mediaId) : bookmarkMedia(mediaId)).catch(() => {
      setBookmarkedMap((prev) => ({ ...prev, [mediaId]: isBookmarked }));
    });
  }, [bookmarkedMap]);

  const handleFollow = useCallback((userId: string) => {
    const isFollowed = followedMap[userId];
    setFollowedMap((prev) => ({ ...prev, [userId]: !isFollowed }));
    (isFollowed ? unfollowUser(userId) : followUser(userId)).catch(() => {
      setFollowedMap((prev) => ({ ...prev, [userId]: isFollowed }));
    });
  }, [followedMap]);

  if (feedLoading && mediaFeed.length === 0) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.screen, isCollage && styles.screenCollage]}>
      <StatusBar style={isCollage ? 'dark' : 'light'} />

      {/* Floating header + toggle */}
      <Animated.View
        style={[
          styles.headerContainer,
          isCollage && styles.headerContainerCollage,
          isCollage && { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <Pressable testID="eventMedia.btn.back" onPress={() => router.back()} hitSlop={12}>
            <Icon name="chevron-left" size={24} color={headerColor} />
          </Pressable>
          <AppText variant="titleSmall" color={headerColor} style={styles.headerTitle} numberOfLines={1}>
            {event?.title ?? ''}
          </AppText>
          <Pressable testID="eventMedia.btn.details" onPress={() => router.push(`/(tabs)/(feed)/event-details/${eventId}`)} hitSlop={12}>
            <Icon name="more-vertical" size={20} color={headerColor} />
          </Pressable>
        </View>

        <View style={styles.toggleRow}>
          {(['SCROLL', 'COLLAGE'] as ViewMode[]).map((mode) => (
            <Pressable key={mode} testID={`eventMedia.toggle.${mode}`} onPress={() => {
              setViewMode(mode);
              headerTranslateY.setValue(0);
              headerHidden.current = false;
              lastScrollY.current = 0;
            }}>
              <AppText
                variant="labelLarge"
                color={viewMode === mode ? headerColor : headerInactiveColor}
              >
                {mode}
              </AppText>
              {viewMode === mode && <View style={[styles.toggleIndicator, isCollage && styles.toggleIndicatorDark]} />}
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Scroll mode: Reels-style vertical feed */}
      {viewMode === 'SCROLL' && (
        <FlatList
          data={mediaFeed}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          ListEmptyComponent={
            <View style={[styles.emptyFeed, { height: itemHeight }]}>
              <AppText variant="bodyLarge" color={Colors.onSurfaceVariant}>
                No media yet for this event.
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.postContainer, { height: itemHeight }]}>
              <Image
                source={{ uri: item.imageUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              />

              {/* Right-side vertical interaction bar */}
              <View style={[styles.sideBar, { bottom: 120 }]}>
                <InteractionBar
                  layout="vertical"
                  actions={[
                    {
                      icon: 'heart',
                      count: likeCountOverrides[item.id] ?? item.likeCount,
                      onPress: () => handleLike(item.id, likeCountOverrides[item.id] ?? item.likeCount),
                      color: likedMap[item.id] ? '#FF4458' : '#fff',
                    },
                    {
                      icon: 'message-circle',
                      count: item.commentCount,
                      onPress: () => setCommentMediaId(item.id),
                    },
                    { icon: 'send' },
                    {
                      icon: 'bookmark',
                      onPress: () => handleBookmark(item.id),
                      color: bookmarkedMap[item.id] ? Colors.primary : '#fff',
                    },
                  ]}
                  color="#fff"
                  size={22}
                />
              </View>

              {/* Bottom-left overlay: user + caption */}
              <View style={[styles.overlay, { paddingBottom: Spacing.xl }]}>
                <View style={styles.userRow}>
                  <Avatar source={item.user?.avatarUrl ?? ''} size={32} />
                  <AppText variant="titleSmall" color="#fff">{item.user?.name ?? ''}</AppText>
                  {item.user?.id && (
                    <Button
                      variant="secondary"
                      title={followedMap[item.user.id] ? 'FOLLOWING' : 'FOLLOW'}
                      onPress={() => handleFollow(item.user!.id)}
                      style={styles.followButton}
                    />
                  )}
                </View>
                <AppText variant="bodyMedium" color="#fff">{item.caption}</AppText>
                {item.audioAttribution ? (
                  <View style={styles.audioRow}>
                    <Icon name="music" size={14} color="rgba(255,255,255,0.6)" />
                    <AppText variant="labelSmall" color="rgba(255,255,255,0.6)">
                      {item.audioAttribution}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        />
      )}

      {/* Collage mode: Masonry grid */}
      {viewMode === 'COLLAGE' && (
        <ScrollView
          style={styles.collageScroll}
          contentContainerStyle={[
            styles.collageContent,
            { paddingTop: insets.top + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleCollageScroll}
          scrollEventThrottle={16}
        >
          <FilterTabs
            tabs={GALLERY_TABS}
            activeTab={galleryTab}
            onTabChange={setGalleryTab}
          />
          {galleryLoading ? (
            <LoadingState />
          ) : galleryItems.length === 0 ? (
            <View style={styles.emptyGallery}>
              <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
                No media found.
              </AppText>
            </View>
          ) : (
            <View style={styles.grid}>
              <MasonryGrid items={galleryItems} onItemPress={handleCollageItemPress} />
            </View>
          )}
        </ScrollView>
      )}

      {/* Lightbox modal for collage item tap */}
      <Modal visible={!!lightboxItem} transparent animationType="fade">
        <Pressable style={styles.lightbox} onPress={() => setLightboxItem(null)}>
          <Pressable onPress={() => setLightboxItem(null)} style={styles.lightboxClose}>
            <Icon name="x" size={24} color="#fff" />
          </Pressable>
          {lightboxItem && (
            <Image
              source={{ uri: lightboxItem.imageUrl }}
              style={styles.lightboxImage}
              contentFit="contain"
            />
          )}
        </Pressable>
      </Modal>

      {/* Comment sheet */}
      <CommentSheet
        mediaId={commentMediaId ?? ''}
        visible={!!commentMediaId}
        onClose={() => setCommentMediaId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  screenCollage: {
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContainerCollage: {
    backgroundColor: 'rgba(252, 249, 248, 0.92)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  toggleIndicator: {
    marginTop: 4,
    height: 2,
    width: '100%',
    backgroundColor: '#fff',
  },
  toggleIndicatorDark: {
    backgroundColor: Colors.onSurface,
  },
  postContainer: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  sideBar: {
    position: 'absolute',
    right: Spacing.md,
    alignItems: 'center',
  },
  overlay: {
    paddingHorizontal: Spacing.md,
    paddingRight: 64,
    gap: Spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  followButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  collageScroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  collageContent: {
    paddingBottom: Spacing.xxl,
  },
  grid: {
    marginTop: Spacing.lg,
  },
  emptyFeed: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGallery: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 60,
    right: Spacing.md,
    zIndex: 10,
    padding: Spacing.sm,
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },
});
