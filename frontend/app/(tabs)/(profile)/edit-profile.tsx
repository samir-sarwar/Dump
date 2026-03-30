import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useAuth } from '@/lib/auth-context';
import { uploadProfileImage, updateProfile } from '@/lib/api';
import { getMimeType } from '@/lib/media-utils';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePickImage = useCallback(async (type: 'avatar' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: type === 'avatar',
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const filename = asset.fileName ?? `${type}-${Date.now()}.jpg`;

    try {
      const { presignedUploadUrl, publicUrl } = await uploadProfileImage(filename);
      const blob = await (await fetch(asset.uri)).blob();
      await fetch(presignedUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': getMimeType(filename, 'PHOTO') },
        body: blob,
      });

      if (type === 'avatar') {
        setAvatarUrl(publicUrl);
        setAvatarPreview(asset.uri);
      } else {
        setCoverUrl(publicUrl);
        setCoverPreview(asset.uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to upload image.');
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl,
        coverUrl,
      });
      updateUser({ ...user!, ...updated });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }, [name, bio, avatarUrl, coverUrl, updateUser, router]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover */}
        <Pressable testID="editProfile.btn.changeCover" onPress={() => handlePickImage('cover')}>
          <Image
            source={{ uri: coverPreview ?? coverUrl }}
            style={styles.cover}
            contentFit="cover"
          />
          <View style={styles.coverOverlay}>
            <Icon name="camera" size={20} color="#fff" />
            <AppText variant="labelSmall" color="#fff">Change Cover</AppText>
          </View>
        </Pressable>

        {/* Back button */}
        <Pressable
          testID="editProfile.btn.back"
          style={[styles.backButton, { top: insets.top + Spacing.sm }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Icon name="chevron-left" size={24} color="#fff" />
        </Pressable>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable testID="editProfile.btn.changeAvatar" onPress={() => handlePickImage('avatar')}>
            <Avatar source={avatarPreview ?? avatarUrl} size={80} />
            <View style={styles.avatarBadge}>
              <Icon name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <AppText variant="labelMedium" color={Colors.onSurfaceVariant}>Name</AppText>
            <Input
              testID="editProfile.input.name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
          </View>
          <View style={styles.field}>
            <AppText variant="labelMedium" color={Colors.onSurfaceVariant}>Bio</AppText>
            <Input
              testID="editProfile.input.bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
            />
          </View>
        </View>

        {/* Save */}
        <View style={styles.saveSection}>
          <Button
            testID="editProfile.btn.save"
            variant="primary"
            title={saving ? 'Saving...' : 'Save Changes'}
            fullWidth
            disabled={saving}
            onPress={handleSave}
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
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  avatarSection: {
    paddingHorizontal: Spacing.md,
    marginTop: -40,
    marginBottom: Spacing.md,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  saveSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xl,
  },
});
