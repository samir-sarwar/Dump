import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants';

interface AvatarProps {
  source: string;
  size?: number;
  showStoryRing?: boolean;
}

export function Avatar({ source, size = 40, showStoryRing = false }: AvatarProps) {
  const ringPadding = 3;
  const ringSize = size + ringPadding * 2 + 4;

  if (showStoryRing) {
    return (
      <LinearGradient
        colors={Colors.storyRingGradient as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
      >
        <View
          style={[
            styles.ringInner,
            {
              width: size + ringPadding * 2,
              height: size + ringPadding * 2,
              borderRadius: (size + ringPadding * 2) / 2,
            },
          ]}
        >
          <Image
            source={{ uri: source }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            contentFit="cover"
          />
        </View>
      </LinearGradient>
    );
  }

  return (
    <Image
      source={{ uri: source }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
});
