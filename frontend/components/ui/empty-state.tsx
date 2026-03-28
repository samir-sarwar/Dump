import { View, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Colors, Spacing } from '@/constants';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface EmptyStateAction {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon?: FeatherIconName;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
}

export function EmptyState({ icon, title, description, actions = [] }: EmptyStateProps) {
  return (
    <View style={styles.container} testID="emptyState.container">
      {icon && (
        <View style={styles.iconWrapper}>
          <Icon name={icon} size={40} color={Colors.onSurfaceVariant} />
        </View>
      )}
      <AppText variant="headlineSmall" style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="bodyMedium"
        color={Colors.onSurfaceVariant}
        style={styles.description}
      >
        {description}
      </AppText>
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant ?? (index === 0 ? 'primary' : 'secondary')}
              title={action.title}
              onPress={action.onPress}
              testID={`emptyState.btn.${action.title}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.background,
  },
  iconWrapper: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
});
