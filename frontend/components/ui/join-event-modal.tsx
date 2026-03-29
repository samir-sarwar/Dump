import { useState, useCallback } from 'react';
import { View, Modal, Pressable, Alert, StyleSheet } from 'react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { joinByInviteCode } from '@/lib/api';

interface JoinEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JoinEventModal({ visible, onClose, onSuccess }: JoinEventModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await joinByInviteCode(code.trim());
      setCode('');
      onClose();
      Alert.alert('Joined!', 'You have successfully joined the event.');
      onSuccess?.();
    } catch {
      setError('Invalid or expired invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [code, onClose, onSuccess]);

  const handleClose = useCallback(() => {
    setCode('');
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.container}>
        <View style={styles.card}>
          <AppText variant="headlineSmall">Join Event</AppText>
          <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
            Enter the invite code shared with you
          </AppText>

          <Input
            value={code}
            onChangeText={(t) => {
              setCode(t);
              setError(null);
            }}
            placeholder="Enter invite code"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            testID="joinEventModal.input.code"
          />

          {error && (
            <AppText variant="bodySmall" color={Colors.error} testID="joinEventModal.text.error">
              {error}
            </AppText>
          )}

          <View style={styles.actions}>
            <Button
              variant="primary"
              title={loading ? 'Joining...' : 'Join'}
              fullWidth
              disabled={!code.trim() || loading}
              onPress={handleJoin}
              testID="joinEventModal.btn.join"
            />
            <Button
              variant="tertiary"
              title="Cancel"
              fullWidth
              onPress={handleClose}
              testID="joinEventModal.btn.cancel"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
