import { View, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';

type FeatherIconName = React.ComponentProps<typeof Icon>['name'];

interface Action {
  icon: FeatherIconName;
  count?: number;
  onPress?: () => void;
  color?: string;
}

interface InteractionBarProps {
  actions: Action[];
  color?: string;
  size?: number;
  layout?: 'horizontal' | 'vertical';
}

export function InteractionBar({ actions, color = Colors.onSurface, size = 20, layout = 'horizontal' }: InteractionBarProps) {
  const isVertical = layout === 'vertical';

  const handlePress = (action: Action) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action.onPress?.();
  };

  return (
    <View style={isVertical ? styles.containerVertical : styles.container}>
      {actions.map((action, index) => (
        <Pressable
          key={index}
          onPress={() => handlePress(action)}
          style={isVertical ? styles.actionVertical : styles.action}
          testID={`interaction.${action.icon}`}
        >
          <Icon name={action.icon} size={isVertical ? size + 4 : size} color={action.color ?? color} />
          {action.count !== undefined && (
            <AppText variant="bodySmall" color={color} style={isVertical ? styles.countVertical : styles.count}>
              {formatCount(action.count)}
            </AppText>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  containerVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  count: {
    marginTop: 1,
  },
  countVertical: {
    marginTop: 0,
  },
});
