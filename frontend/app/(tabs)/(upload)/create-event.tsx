import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Platform, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GlassmorphicHeader } from '@/components/ui/glassmorphic-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { createEvent, updateEvent } from '@/lib/api';
import { initiateUpload, confirmUpload } from '@/lib/api';
import { getMimeType } from '@/lib/media-utils';

export default function CreateEventScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverFilename, setCoverFilename] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [headerHeight, setHeaderHeight] = useState(insets.top + 90);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const pickCoverImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setCoverUri(asset.uri);
    setCoverFilename(asset.fileName ?? `cover-${Date.now()}.jpg`);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError('Please enter an event title.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateStr = date.toISOString().split('T')[0];
      const newEvent = await createEvent({
        title: title.trim(),
        date: dateStr,
        location: location.trim() || undefined,
      });

      // Upload cover image if selected
      if (coverUri && coverFilename) {
        try {
          const { presignedUploadUrl, mediaId } = await initiateUpload({
            eventId: newEvent.id,
            type: 'PHOTO',
            filename: coverFilename,
            aspectRatio: 1.78, // 16:9 cover
          });

          const fileResponse = await fetch(coverUri);
          const blob = await fileResponse.blob();
          await fetch(presignedUploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': getMimeType(coverFilename!, 'PHOTO') },
            body: blob,
          });

          const confirmed = await confirmUpload(mediaId);
          if (confirmed.imageUrl) {
            await updateEvent(newEvent.id, { imageUrl: confirmed.imageUrl });
          }
        } catch {
          // Event created but cover upload failed — non-critical
        }
      }

      router.back();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [title, date, location, coverUri, coverFilename, router]);

  return (
    <View style={styles.screen}>
      <GlassmorphicHeader onHeightChange={setHeaderHeight}>
        <View style={styles.headerRow}>
          <Pressable testID="createEvent.btn.back" onPress={() => router.back()} hitSlop={12}>
            <Icon name="chevron-left" size={24} color={Colors.onSurface} />
          </Pressable>
          <AppText variant="titleMedium">Create Event</AppText>
          <View style={{ width: 24 }} />
        </View>
      </GlassmorphicHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover Image */}
        <Pressable testID="createEvent.btn.coverPicker" style={styles.coverPicker} onPress={pickCoverImage}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.coverImage} contentFit="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Icon name="image" size={40} color={Colors.outline} />
              <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
                Add cover image
              </AppText>
            </View>
          )}
        </Pressable>

        {/* Form */}
        <View style={styles.form}>
          <Input
            testID="createEvent.input.title"
            label="Event Title"
            placeholder="Birthday Party, Wedding, etc."
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.dateField}>
            <AppText variant="labelMedium" color={Colors.onSurfaceVariant}>
              DATE
            </AppText>
            <Pressable testID="createEvent.btn.datePicker" style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar" size={18} color={Colors.outline} />
              <AppText variant="bodyLarge">{formatDate(date)}</AppText>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                accentColor={Colors.primary}
              />
            )}
          </View>

          <Input
            testID="createEvent.input.location"
            label="Location"
            placeholder="Add a location"
            iconName="map-pin"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {error && (
          <AppText testID="createEvent.text.error" variant="bodySmall" color={Colors.error} style={styles.error}>
            {error}
          </AppText>
        )}

        <View style={styles.buttonSection}>
          <Button
            testID="createEvent.btn.submit"
            variant="primary"
            title={submitting ? 'Creating...' : 'Create Event'}
            fullWidth
            disabled={!title.trim() || submitting}
            onPress={handleSubmit}
          />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  coverPicker: {
    marginTop: Spacing.lg,
    height: 180,
    backgroundColor: Colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
  },
  form: {
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  dateField: {
    gap: Spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  error: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  buttonSection: {
    marginTop: Spacing.xl,
  },
});
