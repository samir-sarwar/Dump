import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EventGalleryScreen } from '@/components/screens/event-gallery-screen';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { JoinEventModal } from '@/components/ui/join-event-modal';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useApi } from '@/hooks/use-api';
import { listUserEvents } from '@/lib/api';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { data, isLoading, error, refetch } = useApi(
    () => listUserEvents(),
    [],
  );

  useRefetchOnFocus(refetch);

  const events = data?.events ?? [];
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  if (isLoading) return <LoadingState />;
  if (error) return <LoadingState error={error} onRetry={refetch} />;

  if (events.length === 0) {
    return (
      <>
        <EmptyState
          icon="grid"
          title="Your Library"
          description="Photos and videos from your events will appear here. Create or join an event to get started."
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
        <JoinEventModal
          visible={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={refetch}
        />
      </>
    );
  }

  return (
    <View testID="library.container" style={styles.screen}>
      {events.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.eventSelectorBar, { paddingTop: insets.top + Spacing.sm }]}
          contentContainerStyle={styles.eventSelector}
        >
          {events.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => setSelectedEventId(event.id)}
              style={[
                styles.eventChip,
                selectedEventId === event.id && styles.eventChipActive,
              ]}
            >
              <AppText
                variant="labelMedium"
                color={selectedEventId === event.id ? Colors.primary : Colors.onSurfaceVariant}
              >
                {event.title}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <EventGalleryScreen eventId={selectedEventId ?? events[0].id} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  eventSelectorBar: {
    zIndex: 11,
  },
  eventSelector: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  eventChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
  },
  eventChipActive: {
    backgroundColor: Colors.primaryContainer,
  },
});
