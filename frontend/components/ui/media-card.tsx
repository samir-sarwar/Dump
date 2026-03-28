import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/typography';
import { InteractionBar } from '@/components/ui/interaction-bar';
import { Colors, Spacing } from '@/constants';

interface MediaCardProps {
  imageUrl: string;
  title: string;
  date: string;
  likes?: number;
  comments?: number;
  onPress?: () => void;
  testID?: string;
}

export function MediaCard({ imageUrl, title, date, likes = 0, comments = 0, onPress, testID }: MediaCardProps) {
  return (
    <Pressable onPress={onPress} testID={testID}>
      <Card style={styles.card}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.content}>
          <View style={styles.textRow}>
            <AppText variant="titleSmall">{title}</AppText>
            <AppText variant="labelSmall" color={Colors.onSurfaceVariant}>
              {date}
            </AppText>
          </View>
          <InteractionBar
            actions={[
              { icon: 'heart', count: likes },
              { icon: 'message-circle', count: comments },
              { icon: 'bookmark' },
            ]}
            size={18}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.xl,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
