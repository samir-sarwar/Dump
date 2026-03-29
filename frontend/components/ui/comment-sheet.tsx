import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Modal,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/loading-state';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { getComments, commentOnMedia } from '@/lib/api';
import type { CommentResponseDto } from '@/lib/types';

interface CommentSheetProps {
  mediaId: string;
  visible: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function CommentSheet({ mediaId, visible, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (visible && mediaId) {
      setLoading(true);
      getComments(mediaId)
        .then((res) => setComments(res.comments))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [visible, mediaId]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const newComment = await commentOnMedia(mediaId, text.trim());
      setComments((prev) => [newComment, ...prev]);
      setText('');
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }, [mediaId, text, sending]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} testID="commentSheet.modal">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetContainer}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom || Spacing.md }]}>
          {/* Header */}
          <View style={styles.header}>
            <AppText variant="titleMedium">Comments</AppText>
            <Pressable onPress={onClose} hitSlop={8} testID="commentSheet.btn.close">
              <Icon name="x" size={20} color={Colors.onSurface} />
            </Pressable>
          </View>

          {/* List */}
          {loading ? (
            <LoadingState />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              style={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
                    No comments yet. Be the first!
                  </AppText>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Avatar source={item.user?.avatarUrl ?? ''} size={28} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <AppText variant="labelMedium">
                        {item.user?.name ?? 'User'}
                      </AppText>
                      <AppText variant="labelSmall" color={Colors.outline}>
                        {timeAgo(item.createdAt)}
                      </AppText>
                    </View>
                    <AppText variant="bodyMedium">{item.text}</AppText>
                  </View>
                </View>
              )}
            />
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={Colors.outline}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              testID="commentSheet.input.text"
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() || sending}
              style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
              testID="commentSheet.btn.send"
            >
              <Icon name="send" size={18} color={text.trim() ? Colors.primary : Colors.outline} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
  },
  sheet: {
    backgroundColor: Colors.background,
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  commentContent: {
    flex: 1,
    gap: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outlineVariant,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
    maxHeight: 80,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    padding: Spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
