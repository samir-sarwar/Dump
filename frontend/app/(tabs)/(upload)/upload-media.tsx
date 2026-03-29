import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { GlassmorphicHeader } from '@/components/ui/glassmorphic-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { initiateUpload, confirmUpload } from '@/lib/api';
import { getMimeType } from '@/lib/media-utils';

interface QueueItem {
  id: string;
  uri: string;
  filename: string;
  type: 'PHOTO' | 'VIDEO';
  width: number;
  height: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export default function UploadMediaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);

  const [headerHeight, setHeaderHeight] = useState(insets.top + 80);

  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const newItems: QueueItem[] = result.assets.map((asset, i) => ({
      id: `${Date.now()}-${i}`,
      uri: asset.uri,
      filename: asset.fileName ?? `media-${Date.now()}-${i}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
      type: asset.type === 'video' ? 'VIDEO' as const : 'PHOTO' as const,
      width: asset.width,
      height: asset.height,
      status: 'pending' as const,
    }));

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItemStatus = (id: string, status: QueueItem['status']) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const handleUpload = useCallback(async () => {
    if (!eventId || queue.length === 0) return;

    setUploading(true);
    let allSucceeded = true;

    for (const item of queue) {
      if (item.status === 'done') continue;

      updateItemStatus(item.id, 'uploading');

      try {
        const aspectRatio = item.width / item.height || 1;

        const { presignedUploadUrl, mediaId } = await initiateUpload({
          eventId,
          caption: caption || undefined,
          location: location || undefined,
          type: item.type,
          filename: item.filename,
          aspectRatio,
        });

        const fileResponse = await fetch(item.uri);
        const blob = await fileResponse.blob();
        const mimeType = getMimeType(item.filename, item.type);

        const s3Response = await fetch(presignedUploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': mimeType },
          body: blob,
        });

        if (!s3Response.ok) {
          throw new Error(`S3 upload failed (${s3Response.status})`);
        }

        await confirmUpload(mediaId);

        updateItemStatus(item.id, 'done');
      } catch (error) {
        console.error('[Upload] Failed:', item.filename, error instanceof Error ? error.message : error);
        updateItemStatus(item.id, 'error');
        allSucceeded = false;
      }
    }

    setUploading(false);

    if (allSucceeded) {
      router.back();
    }
  }, [eventId, queue, caption, location, router]);

  const pendingCount = queue.filter((item) => item.status !== 'done').length;

  return (
    <View style={styles.screen}>
      <GlassmorphicHeader onHeightChange={setHeaderHeight}>
        <AppText variant="displaySmall" style={styles.logo}>dump</AppText>
        <AppText variant="headlineSmall" style={styles.subtitle}>Upload</AppText>
      </GlassmorphicHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Import Section */}
        <View style={styles.section}>
          <AppText variant="titleMedium">Import your media</AppText>
          <AppText variant="bodySmall" color={Colors.onSurfaceVariant} style={styles.formatText}>
            Supports HEIC, JPEG, PNG, TIFF, RAW, MP4, and MOV formats
          </AppText>
          <Pressable testID="uploadMedia.btn.pickMedia" style={styles.dropZone} onPress={pickMedia}>
            <Icon name="upload-cloud" size={48} color={Colors.outline} />
            <AppText variant="bodyLarge" color={Colors.onSurfaceVariant}>
              Tap to select or
            </AppText>
            <AppText
              variant="bodyLarge"
              color={Colors.primary}
              style={styles.browseText}
            >
              browse your photos
            </AppText>
          </Pressable>
        </View>

        {/* Queue Section */}
        {queue.length > 0 && (
          <View style={styles.section}>
            <View style={styles.queueHeader}>
              <AppText variant="titleMedium">Queue</AppText>
              <View style={styles.badge}>
                <AppText variant="labelSmall" color={Colors.onSurfaceVariant}>
                  {queue.length} items selected
                </AppText>
              </View>
            </View>
            {queue.map((item) => (
              <View key={item.id} style={styles.queueItem}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
                <View style={styles.queueItemInfo}>
                  <AppText variant="bodySmall" style={styles.filename} numberOfLines={1}>
                    {item.filename}
                  </AppText>
                  {item.status === 'uploading' && (
                    <AppText variant="labelSmall" color={Colors.primary}>
                      Uploading...
                    </AppText>
                  )}
                  {item.status === 'done' && (
                    <AppText variant="labelSmall" color={Colors.secondary}>
                      Done
                    </AppText>
                  )}
                  {item.status === 'error' && (
                    <AppText variant="labelSmall" color={Colors.error}>
                      Failed
                    </AppText>
                  )}
                </View>
                {item.status !== 'uploading' && (
                  <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                    <Icon name="x" size={18} color={Colors.outline} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Input
            testID="uploadMedia.input.caption"
            label="Caption"
            placeholder="Journal Entry / Caption"
            value={caption}
            onChangeText={setCaption}
          />
          <Input
            testID="uploadMedia.input.location"
            label="Location"
            placeholder="Add location"
            iconName="map-pin"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Upload Button */}
        <View style={styles.buttonSection}>
          <Button
            testID="uploadMedia.btn.upload"
            variant="primary"
            title={uploading ? 'Uploading...' : 'Upload to Event'}
            fullWidth
            disabled={pendingCount === 0 || uploading}
            onPress={handleUpload}
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
  logo: {
    letterSpacing: -0.72,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginTop: Spacing.xl,
  },
  formatText: {
    marginTop: Spacing.xs,
  },
  dropZone: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
  },
  browseText: {
    textDecorationLine: 'underline',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  queueItemInfo: {
    flex: 1,
    gap: 2,
  },
  thumbnail: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  filename: {
    flex: 1,
  },
  buttonSection: {
    marginTop: Spacing.xl,
  },
});
