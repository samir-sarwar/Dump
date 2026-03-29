import { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useAuth } from '@/lib/auth-context';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms and Privacy Policy');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(name, username, email, password);
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable testID="register.btn.close" onPress={() => router.back()} hitSlop={12}>
            <Icon name="x" size={22} color={Colors.onSurface} />
          </Pressable>
          <AppText variant="labelLarge" style={styles.brandText}>
            dump
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <AppText variant="displayMedium">
            Join the{'\n'}Circle
          </AppText>
          <AppText
            variant="bodyMedium"
            color={Colors.onSurfaceVariant}
            style={styles.subtitle}
          >
            Enter your details to begin your curated journey.
          </AppText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Input
              testID="register.input.name"
              label="Full Name"
              placeholder="Your full name"
              value={name}
              onChangeText={setName}
              iconName="user"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Input
              testID="register.input.username"
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              iconName="at-sign"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Input
              testID="register.input.email"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              iconName="mail"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Input
              testID="register.input.password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              secureTextToggle
              iconName="lock"
              textContentType="none"
              autoComplete="off"
            />
          </View>

          {/* Terms */}
          <Pressable
            testID="register.checkbox.terms"
            style={styles.termsRow}
            onPress={() => setTermsAccepted((v) => !v)}
          >
            <View
              style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked,
              ]}
            >
              {termsAccepted && (
                <Icon name="check" size={12} color={Colors.onPrimary} />
              )}
            </View>
            <AppText variant="bodySmall" color={Colors.onSurfaceVariant} style={styles.termsText}>
              I agree to the{' '}
              <AppText variant="bodySmall" color={Colors.onSurfaceVariant} style={styles.termsLink}>
                Terms
              </AppText>
              {' '}and{' '}
              <AppText variant="bodySmall" color={Colors.onSurfaceVariant} style={styles.termsLink}>
                Privacy Policy
              </AppText>
            </AppText>
          </Pressable>

          {error && (
            <AppText testID="register.text.error" variant="bodySmall" color={Colors.error} style={styles.error}>
              {error}
            </AppText>
          )}

          {/* Create Account Button */}
          <View style={styles.buttonWrapper}>
            <Button
              testID="register.btn.createAccount"
              variant="primary"
              title={loading ? 'Creating account...' : 'Create Account'}
              fullWidth
              onPress={handleRegister}
              disabled={loading}
              style={styles.primaryButton}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AppText variant="bodyMedium" color={Colors.onSurfaceVariant}>
            Already have an account?{' '}
          </AppText>
          <Pressable testID="register.btn.login" onPress={() => router.back()} style={styles.loginLink}>
            <AppText variant="bodyMedium" color={Colors.onSurface} style={styles.loginLinkText}>
              Log in
            </AppText>
            <Icon name="arrow-right" size={14} color={Colors.onSurface} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  brandText: {
    letterSpacing: 2.4,
  },
  headerSpacer: {
    width: 22,
  },
  heroSection: {
    marginTop: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  form: {
    marginTop: Spacing.xxl,
  },
  fieldGroup: {
    marginBottom: Spacing.xxl,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  error: {
    marginBottom: Spacing.sm,
  },
  buttonWrapper: {
    paddingTop: Spacing.sm,
  },
  primaryButton: {
    paddingVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginLinkText: {
    fontWeight: '500',
  },
});
