import { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is not yet available.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        testID="login.container"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <AppText variant="displayLarge" style={styles.hero}>
          Welcome{'\n'}Back
        </AppText>
        <AppText variant="labelMedium" color={Colors.onSurfaceVariant} style={styles.subtitle}>
          Enter your credentials to access your events
        </AppText>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Input
              testID="login.input.email"
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.passwordLabelRow}>
              <AppText variant="labelMedium" color={Colors.onSurfaceVariant}>
                Password
              </AppText>
              <Pressable testID="login.btn.forgotPassword" onPress={showComingSoon} hitSlop={8}>
                <AppText variant="labelSmall" color={Colors.onSurfaceVariant}>
                  Forgot Password?
                </AppText>
              </Pressable>
            </View>
            <Input
              testID="login.input.password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              secureTextToggle
              textContentType="none"
              autoComplete="off"
            />
          </View>

          {error && (
            <AppText testID="login.text.error" variant="bodySmall" color={Colors.error}>
              {error}
            </AppText>
          )}

          {/* Sign In Button */}
          <View style={styles.buttonWrapper}>
            <Button
              testID="login.btn.signIn"
              variant="primary"
              title={loading ? 'Signing in...' : 'Sign In'}
              fullWidth
              onPress={handleLogin}
              disabled={loading}
              style={styles.primaryButton}
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <AppText variant="labelSmall" color={Colors.outlineVariant} style={styles.dividerText}>
            Or continue with
          </AppText>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialRow}>
          <Pressable testID="login.btn.apple" onPress={showComingSoon} hitSlop={8}>
            <AppText variant="labelMedium" color={Colors.onSurface}>
              Apple
            </AppText>
          </Pressable>
          <Pressable testID="login.btn.google" onPress={showComingSoon} hitSlop={8}>
            <AppText variant="labelMedium" color={Colors.onSurface}>
              Google
            </AppText>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
            Don't have an account?{' '}
          </AppText>
          <Pressable testID="login.btn.createAccount" onPress={() => router.push('/(auth)/register')}>
            <AppText
              variant="bodyMedium"
              color={Colors.onSurface}
              style={styles.footerLink}
            >
              Create one
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    lineHeight: 58,
  },
  subtitle: {
    marginTop: Spacing.md,
  },
  form: {
    marginTop: Spacing.xxl,
  },
  fieldGroup: {
    marginBottom: Spacing.xxl,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  buttonWrapper: {
    paddingTop: Spacing.lg,
  },
  primaryButton: {
    paddingVertical: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: `${Colors.outlineVariant}4D`, // 30% opacity
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginTop: Spacing.xxl,
  },
  footerLink: {
    borderBottomWidth: 0.5,
    borderBottomColor: `${Colors.onSurface}33`, // 20% opacity
  },
});
