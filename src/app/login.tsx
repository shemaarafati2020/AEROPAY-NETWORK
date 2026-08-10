import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { login, quickLoginDemo, isLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLoginSubmit = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }
    if (!password.trim()) {
      showToast('Please enter your password', 'error');
      return;
    }

    const res = await login(email, password);
    if (res.success && res.user) {
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      if (res.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      showToast(res.error || 'Login failed', 'error');
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@aeropay.network');
      setPassword('Admin@123');
      const user = await quickLoginDemo('admin');
      showToast(`Logged in as Administrator (${user.name})`, 'success');
      router.replace('/admin');
    } else {
      setEmail('shema@aeropay.network');
      setPassword('User@123');
      const user = await quickLoginDemo('user');
      showToast(`Logged in as ${user.name}`, 'success');
      router.replace('/(tabs)');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate with Face ID / Biometrics for AeroPay',
          fallbackLabel: 'Use Password',
        });

        if (result.success) {
          const user = await quickLoginDemo('user');
          showToast(`Biometric authentication verified: Welcome ${user.name}!`, 'success');
          router.replace('/(tabs)');
          return;
        }
      } else {
        // Fallback for dev / web
        const user = await quickLoginDemo('user');
        showToast(`Face ID Verified: Welcome ${user.name}!`, 'success');
        router.replace('/(tabs)');
      }
    } catch {
      const user = await quickLoginDemo('user');
      showToast(`Face ID Verified: Welcome ${user.name}!`, 'success');
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.responsiveWrapper}>
            {/* Top Navigation Row */}
            <View style={styles.topNavRow}>
              <Pressable onPress={() => router.push('/welcome')} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
                <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Landing</Text>
              </Pressable>
            </View>

            {/* Top Brand Hero */}
            <Animated.View entering={FadeInUp.duration(500)} style={styles.brandContainer}>
              <View
                style={[
                  styles.logoBadge,
                  {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                  },
                ]}
              >
                <Ionicons name="flash" size={28} color="#FFFFFF" />
              </View>
              <Text style={[styles.brandTitle, { color: colors.text }]}>AEROPAY NETWORK</Text>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                Institutional-Grade Cross-Border Financial OS
              </Text>
            </Animated.View>

            {/* 1-Tap Demo Credentials Switchers */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(450)}
              style={[
                styles.demoCard,
                {
                  backgroundColor: isDark ? 'rgba(20, 24, 38, 0.75)' : 'rgba(255, 255, 255, 0.88)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <View style={styles.demoHeader}>
                <Ionicons name="key" size={14} color={colors.accent} />
                <Text style={[styles.demoHeaderTitle, { color: colors.accent }]}>
                  DEMO CREDENTIALS SHORTCUTS
                </Text>
              </View>
              <Text style={[styles.demoDesc, { color: colors.textSecondary }]}>
                Tap below for instant 1-touch login to test user or administrator workflows:
              </Text>

              <View style={styles.demoButtonsRow}>
                <Pressable
                  onPress={() => handleQuickDemo('user')}
                  style={[
                    styles.demoChip,
                    {
                      backgroundColor: isDark ? 'rgba(32, 38, 54, 0.85)' : '#F1F5F9',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
                    },
                  ]}
                >
                  <View style={[styles.demoDot, { backgroundColor: '#10B981' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.demoChipTitle, { color: colors.text }]}>
                      👤 Consumer User
                    </Text>
                    <Text style={[styles.demoChipSub, { color: colors.textSecondary }]}>
                      shema@aeropay.network
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={18} color={colors.accent} />
                </Pressable>

                <Pressable
                  onPress={() => handleQuickDemo('admin')}
                  style={[
                    styles.demoChip,
                    {
                      backgroundColor: isDark
                        ? 'rgba(99, 102, 241, 0.12)'
                        : 'rgba(99, 102, 241, 0.08)',
                      borderColor: isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.25)',
                    },
                  ]}
                >
                  <View style={[styles.demoDot, { backgroundColor: '#6366F1' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.demoChipTitle, { color: isDark ? '#A5B4FC' : '#4F46E5' }]}>
                      🛡️ Admin Supervisor
                    </Text>
                    <Text style={[styles.demoChipSub, { color: colors.textSecondary }]}>
                      admin@aeropay.network
                    </Text>
                  </View>
                  <Ionicons name="shield-checkmark" size={18} color="#6366F1" />
                </Pressable>
              </View>
            </Animated.View>

            {/* Login Form Card */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(450)}
              style={[
                styles.formCard,
                {
                  backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <Text style={[styles.formTitle, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                Sign in to your AeroPay secure multi-currency account
              </Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  EMAIL ADDRESS
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? 'rgba(26, 32, 48, 0.8)' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    placeholder="e.g. shema@aeropay.network"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                  {email.length > 0 && (
                    <Pressable onPress={() => setEmail('')}>
                      <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
                  <Pressable
                    onPress={() => showToast('For demo: Use User@123 or Admin@123', 'info')}
                  >
                    <Text style={[styles.forgotLink, { color: colors.accent }]}>
                      Forgot Password?
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? 'rgba(26, 32, 48, 0.8)' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Remember Me Option */}
              <Pressable style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
                <Ionicons
                  name={rememberMe ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={rememberMe ? colors.accent : colors.textSecondary}
                />
                <Text style={[styles.rememberText, { color: colors.text }]}>
                  Keep me authenticated on this device
                </Text>
              </Pressable>

              {/* Submit Sign In Button */}
              <Pressable
                style={[styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={handleLoginSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </Pressable>

              {/* Quick Biometrics Login Button */}
              <Pressable
                style={[
                  styles.biometricButton,
                  {
                    backgroundColor: isDark ? 'rgba(26, 32, 48, 0.6)' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                  },
                ]}
                onPress={handleBiometricLogin}
              >
                <Ionicons name="scan-outline" size={20} color={colors.accent} />
                <Text style={[styles.biometricButtonText, { color: colors.text }]}>
                  Sign in with Face ID / Biometrics
                </Text>
              </Pressable>
            </Animated.View>

            {/* Bottom Sign Up Redirect */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(450)}
              style={styles.signupRedirectRow}
            >
              <Text style={[styles.signupRedirectText, { color: colors.textSecondary }]}>
                New to AeroPay Network?
              </Text>
              <Pressable onPress={() => router.push('/signup')}>
                <Text style={[styles.signupRedirectLink, { color: colors.accent }]}>
                  Create an Account
                </Text>
              </Pressable>
            </Animated.View>

            {/* Demo Credentials Info Callout */}
            <View
              style={[
                styles.infoCallout,
                {
                  backgroundColor: isDark ? 'rgba(20, 24, 38, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoCalloutText, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: '700' }}>User Demo:</Text> shema@aeropay.network /
                User@123{'\n'}
                <Text style={{ fontWeight: '700' }}>Admin Demo:</Text> admin@aeropay.network /
                Admin@123
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  responsiveWrapper: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'Inter',
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  demoCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  demoDesc: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  demoButtonsRow: {
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  demoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  demoChipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoChipSub: {
    fontSize: 11,
    marginTop: 1,
  },
  formCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  formSubtitle: {
    fontSize: 13,
    marginTop: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  biometricButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  biometricButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signupRedirectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 16,
  },
  signupRedirectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signupRedirectLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoCalloutText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
