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
import { UserRole } from '@/types/auth';

const COUNTRY_CODES = [
  { flag: '🇷🇼', code: '+250', country: 'Rwanda' },
  { flag: '🇰🇪', code: '+254', country: 'Kenya' },
  { flag: '🇺🇬', code: '+256', country: 'Uganda' },
  { flag: '🇺🇸', code: '+1', country: 'United States' },
];

export default function SignupScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { signup, isLoading } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('user');
  const [adminSecurityKey, setAdminSecurityKey] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Compute password strength
  const getPasswordStrength = () => {
    if (!password) return { label: 'None', score: 0, color: colors.textSecondary };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', score: 1, color: '#EF4444' };
    if (score <= 3) return { label: 'Medium', score: 2, color: '#F59E0B' };
    return { label: 'Strong', score: 3, color: '#10B981' };
  };

  const strength = getPasswordStrength();

  const handleSignupSubmit = async () => {
    if (!name.trim()) {
      showToast('Please enter your full legal name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (!phoneNumber.trim()) {
      showToast('Please enter your mobile phone number', 'error');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (role === 'admin' && adminSecurityKey !== 'Admin@123' && adminSecurityKey !== 'admin') {
      showToast('Invalid Admin Authorization Key. Use demo key: Admin@123', 'error');
      return;
    }
    if (!agreeTerms) {
      showToast('Please agree to the AeroPay terms & privacy policy', 'error');
      return;
    }

    const fullPhone = `${selectedCountry.code} ${phoneNumber.trim()}`;
    const res = await signup({
      name,
      email,
      phone: fullPhone,
      password,
      role,
    });

    if (res.success && res.user) {
      showToast(
        `Welcome to AeroPay, ${res.user.name}! ${role === 'admin' ? '(Admin Access Granted)' : '($50 Welcome Bonus Credited)'}`,
        'success'
      );
      if (res.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      showToast(res.error || 'Signup failed', 'error');
    }
  };

  const handleNextCountry = () => {
    const currentIndex = COUNTRY_CODES.findIndex((c) => c.code === selectedCountry.code);
    const nextIndex = (currentIndex + 1) % COUNTRY_CODES.length;
    setSelectedCountry(COUNTRY_CODES[nextIndex]);
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
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.push('/welcome'))}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
              <View style={{ width: 32 }} />
            </Animated.View>

            {/* Registration Card */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(450)}
              style={[
                styles.formCard,
                {
                  backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Get Started with AeroPay
              </Text>
              <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                Instant zero-friction cross-border payments & multi-currency wallet
              </Text>

              {/* Account Role Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  SELECT ACCOUNT ROLE
                </Text>
                <View
                  style={[
                    styles.roleToggleContainer,
                    {
                      backgroundColor: isDark ? 'rgba(26, 32, 48, 0.8)' : '#F1F5F9',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => setRole('user')}
                    style={[
                      styles.roleOption,
                      role === 'user' && {
                        backgroundColor: colors.accent,
                      },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={15}
                      color={role === 'user' ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.roleOptionText,
                        { color: role === 'user' ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      Consumer User
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setRole('admin')}
                    style={[
                      styles.roleOption,
                      role === 'admin' && {
                        backgroundColor: '#6366F1',
                      },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={15}
                      color={role === 'admin' ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.roleOptionText,
                        { color: role === 'admin' ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      Admin Operations
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* If Admin selected: Admin Key Prompt */}
              {role === 'admin' && (
                <Animated.View entering={FadeInDown.duration(300)} style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.inputLabel, { color: '#6366F1' }]}>
                      ADMIN AUTHORIZATION KEY
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Demo Key: Admin@123
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDark
                          ? 'rgba(99, 102, 241, 0.1)'
                          : 'rgba(99, 102, 241, 0.05)',
                        borderColor: '#6366F1',
                      },
                    ]}
                  >
                    <Ionicons name="key" size={18} color="#6366F1" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: colors.text }]}
                      placeholder="Enter Admin Key (Admin@123)"
                      placeholderTextColor={colors.textSecondary}
                      value={adminSecurityKey}
                      onChangeText={setAdminSecurityKey}
                      secureTextEntry
                    />
                  </View>
                </Animated.View>
              )}

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  FULL LEGAL NAME
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
                    name="person-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    placeholder="e.g. Shema Arafati"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

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
                    placeholder="e.g. user@aeropay.network"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Phone Number with Country Flag Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  MOBILE PHONE NUMBER (TAP FLAG TO SWITCH)
                </Text>
                <View
                  style={[
                    styles.phoneWrapper,
                    {
                      backgroundColor: isDark ? 'rgba(26, 32, 48, 0.8)' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                    },
                  ]}
                >
                  <Pressable onPress={handleNextCountry} style={styles.countryPicker}>
                    <Text style={{ fontSize: 18, marginRight: 4 }}>{selectedCountry.flag}</Text>
                    <Text style={[styles.countryCode, { color: colors.text }]}>
                      {selectedCountry.code}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={12}
                      color={colors.textSecondary}
                      style={{ marginLeft: 2 }}
                    />
                  </Pressable>
                  <View style={[styles.phoneDivider, { backgroundColor: colors.divider }]} />
                  <TextInput
                    style={[styles.phoneInput, { color: colors.text }]}
                    placeholder="788 123 456"
                    placeholderTextColor={colors.textSecondary}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  CREATE PASSWORD
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
                    name="lock-closed-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    placeholder="At least 6 characters"
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

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3].map((bar) => (
                        <View
                          key={bar}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                bar <= strength.score
                                  ? strength.color
                                  : isDark
                                    ? '#333'
                                    : '#E2E8F0',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Terms Agreement Checkbox */}
              <Pressable style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
                <Ionicons
                  name={agreeTerms ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={agreeTerms ? colors.accent : colors.textSecondary}
                />
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                  I agree to AeroPay's{' '}
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>Terms of Service</Text>{' '}
                  and{' '}
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>Privacy Policy</Text>.
                </Text>
              </Pressable>

              {/* Submit Registration Button */}
              <Pressable
                style={[
                  styles.submitButton,
                  { backgroundColor: role === 'admin' ? '#6366F1' : colors.accent },
                ]}
                onPress={handleSignupSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>
                      {role === 'admin' ? 'Create Admin Account' : 'Create Account'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </Pressable>
            </Animated.View>

            {/* Bottom Login Redirect */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(450)}
              style={styles.loginRedirectRow}
            >
              <Text style={[styles.loginRedirectText, { color: colors.textSecondary }]}>
                Already have an AeroPay account?
              </Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={[styles.loginRedirectLink, { color: colors.accent }]}>Sign In</Text>
              </Pressable>
            </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
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
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    gap: 6,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
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
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  phoneDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: 10,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRedirectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 16,
  },
  loginRedirectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginRedirectLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
