import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Colors, Spacing } from '@/constants';

interface LoadingStateProps {
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingState({ error, onRetry }: LoadingStateProps) {
  if (error) {
    return (
      <View style={styles.container}>
        <AppText variant="bodyLarge" color={Colors.error}>
          {error}
        </AppText>
        {onRetry && (
          <Button
            variant="secondary"
            title="Try Again"
            onPress={onRetry}
            style={styles.retryButton}
            testID="loadingState.btn.retry"
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  retryButton: {
    marginTop: Spacing.sm,
  },
});
