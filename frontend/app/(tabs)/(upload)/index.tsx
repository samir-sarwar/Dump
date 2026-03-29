import { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassmorphicHeader } from '@/components/ui/glassmorphic-header';
import { EventListItem } from '@/components/ui/event-list-item';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { JoinEventModal } from '@/components/ui/join-event-modal';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useApi } from '@/hooks/use-api';
import { listUserEvents } from '@/lib/api';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';

export default function SelectEventScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: eventsData, isLoading, error, refetch } = useApi(
    () => listUserEvents(),
    [],
  );

  useRefetchOnFocus(refetch);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const [headerHeight, setHeaderHeight] = useState(insets.top + 90);
  const events = eventsData?.events ?? [];

  return (
    <View testID="selectEvent.container" style={styles.screen}>
      <GlassmorphicHeader onHeightChange={setHeaderHeight}>
        <AppText variant="displaySmall" style={styles.logo}>dump</AppText>
        <View style={styles.headerInfo}>
          <AppText variant="headlineSmall">Select Event</AppText>
          <AppText variant="labelSmall" color={Colors.onSurfaceVariant}>
            Step 1 of 3: Choose Destination
          </AppText>
        </View>
      </GlassmorphicHeader>

      <ScrollView
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
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <LoadingState error={error} onRetry={refetch} />
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
              No events yet. Create one to get started.
            </AppText>
          </View>
        ) : (
          events.map((event) => (
            <EventListItem
              key={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              selected={selectedId === event.id}
              onPress={() => setSelectedId(event.id)}
            />
          ))
        )}

        <View style={styles.missingSection}>
          <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
            Missing your event?
          </AppText>
          <Button
            testID="selectEvent.btn.createEvent"
            variant="tertiary"
            title="Create a New Event"
            onPress={() => router.push('/(tabs)/(upload)/create-event')}
          />
          <Button
            testID="selectEvent.btn.joinEvent"
            variant="tertiary"
            title="Join an Event"
            onPress={() => setShowJoinModal(true)}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          testID="selectEvent.btn.continue"
          variant="primary"
          title="CONTINUE TO UPLOAD"
          fullWidth
          disabled={!selectedId}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/(upload)/upload-media',
              params: { eventId: selectedId! },
            })
          }
        />
      </View>

      <JoinEventModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logo: {
    letterSpacing: -0.72,
  },
  headerInfo: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  emptyState: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  missingSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
  },
});
