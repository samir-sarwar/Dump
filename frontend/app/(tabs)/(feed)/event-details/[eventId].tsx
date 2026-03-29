import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/loading-state';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/hooks/use-api';
import { getEvent, getEventMembers, generateInviteCode, leaveEvent } from '@/lib/api';
import { getBatchUsers } from '@/lib/api';
import type { UserProfileDto } from '@/lib/types';

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useAuth();

  const [members, setMembers] = useState<UserProfileDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const { data: event, isLoading, error, refetch } = useApi(
    () => getEvent(eventId!),
    [eventId],
  );

  // Load members
  const { data: membersData } = useApi(
    async () => {
      const res = await getEventMembers(eventId!);
      if (res.userIds.length > 0) {
        const profiles = await getBatchUsers(res.userIds);
        setMembers(profiles);
      }
      setMembersLoading(false);
      return res;
    },
    [eventId],
  );

  const handleShareInviteCode = useCallback(async () => {
    try {
      const result = await generateInviteCode(eventId!);
      setInviteCode(result.code);
      await Clipboard.setStringAsync(result.code);
      Alert.alert('Invite Code Copied', `Code: ${result.code}\n\nShare this with friends to invite them.`);
    } catch {
      Alert.alert('Error', 'Failed to generate invite code.');
    }
  }, [eventId]);

  const handleLeaveEvent = useCallback(() => {
    if (event?.creatorId === user?.id) {
      Alert.alert('Cannot Leave', 'You are the creator of this event and cannot leave it.');
      return;
    }
    Alert.alert('Leave Event', 'Are you sure you want to leave this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveEvent(eventId!);
            router.back();
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to leave event.');
          }
        },
      },
    ]);
  }, [eventId, event, user, router]);

  if (isLoading) return <LoadingState />;
  if (error) return <LoadingState error={error} onRetry={refetch} />;
  if (!event) return <LoadingState />;

  const isCreator = event.creatorId === user?.id;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover */}
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.cover}
          contentFit="cover"
        />

        {/* Back button overlay */}
        <Pressable
          testID="eventDetails.btn.back"
          style={[styles.backButton, { top: insets.top + Spacing.sm }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Icon name="chevron-left" size={24} color="#fff" />
        </Pressable>

        {/* Event Info */}
        <View style={styles.info}>
          <AppText testID="eventDetails.text.title" variant="headlineLarge">{event.title}</AppText>

          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color={Colors.onSurfaceVariant} />
            <AppText variant="bodyLarge" color={Colors.onSurfaceVariant}>{event.date}</AppText>
          </View>

          {event.location ? (
            <View style={styles.detailRow}>
              <Icon name="map-pin" size={16} color={Colors.onSurfaceVariant} />
              <AppText variant="bodyLarge" color={Colors.onSurfaceVariant}>{event.location}</AppText>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Icon name="users" size={16} color={Colors.onSurfaceVariant} />
            <AppText variant="bodyLarge" color={Colors.onSurfaceVariant}>
              {event.memberCount} {event.memberCount === 1 ? 'member' : 'members'}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <Icon name="image" size={16} color={Colors.onSurfaceVariant} />
            <AppText variant="bodyLarge" color={Colors.onSurfaceVariant}>
              {event.mediaCount} photos & videos
            </AppText>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            testID="eventDetails.btn.shareInvite"
            variant="primary"
            title={inviteCode ? `Code: ${inviteCode}` : 'Share Invite Code'}
            fullWidth
            onPress={handleShareInviteCode}
          />
          {!isCreator && (
            <Button
              testID="eventDetails.btn.leaveEvent"
              variant="tertiary"
              title="Leave Event"
              fullWidth
              onPress={handleLeaveEvent}
            />
          )}
        </View>

        {/* Members */}
        <View style={styles.membersSection}>
          <AppText variant="titleMedium" style={styles.sectionTitle}>Members</AppText>
          {membersLoading ? (
            <LoadingState />
          ) : members.length === 0 ? (
            <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
              No members found.
            </AppText>
          ) : (
            members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <Avatar source={member.avatarUrl} size={40} />
                <View style={styles.memberInfo}>
                  <AppText variant="titleSmall">{member.name}</AppText>
                  <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
                    @{member.username}
                  </AppText>
                </View>
                {member.id === event.creatorId && (
                  <AppText variant="labelSmall" color={Colors.primary}>CREATOR</AppText>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cover: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.md,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  info: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actions: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  membersSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  memberInfo: {
    flex: 1,
  },
});
