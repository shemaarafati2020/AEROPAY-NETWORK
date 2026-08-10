import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const HIGHLIGHT_METRICS = [
  { id: '1', label: '24H VOLUME', val: '$4.8M+', icon: 'trending-up', color: '#10B981' },
  { id: '2', label: 'AVG SETTLEMENT', val: '1.2s', icon: 'flash-outline', color: '#F59E0B' },
  { id: '3', label: 'FX SPREAD', val: '0.15%', icon: 'swap-horizontal', color: '#6366F1' },
  {
    id: '4',
    label: 'UPTIME SLA',
    val: '99.99%',
    icon: 'shield-checkmark-outline',
    color: '#06B6D4',
  },
];

const FEATURE_PILLARS = [
  {
    id: 'f1',
    title: 'Instant Mobile Money Rail',
    desc: 'Direct sub-second remittance dispatch into MTN MoMo, Airtel Money, and East African commercial bank accounts.',
    icon: 'phone-portrait-outline',
    badge: 'SUB-SECOND',
    color: '#A51C24',
  },
  {
    id: 'f2',
    title: 'Wholesale FX Conversion',
    desc: 'Transparent real-time rates between USD, USDC, Rwandan Franc (RWF), and Kenyan Shilling (KES) without hidden fees.',
    icon: 'swap-horizontal-outline',
    badge: 'BEST RATES',
    color: '#6366F1',
  },
  {
    id: 'f3',
    title: 'Stellar Soroban Paymaster',
    desc: 'Zero-gas client transactions powered by sponsored paymasters and custodial multi-currency settlement vaults.',
    icon: 'server-outline',
    badge: 'ZERO GAS',
    color: '#10B981',
  },
  {
    id: 'f4',
    title: 'Role-Based Control Console',
    desc: 'Enterprise-grade admin console for user directory management, KYC tier verification, and liquidity anchor monitoring.',
    icon: 'shield-checkmark-outline',
    badge: 'SUPERVISOR RBAC',
    color: '#8B5CF6',
  },
];

export default function WelcomeLandingScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { quickLoginDemo } = useAuth();
  const { showToast } = useToast();

  // Subtle glow pulsing animation
  const pulseOpacity = useSharedValue(0.4);
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.85, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulseOpacity]);

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handleQuickConsumerLogin = async () => {
    await quickLoginDemo('user');
    showToast('Signed in as Shema Arafati (Consumer)', 'success');
    router.replace('/(tabs)');
  };

  const handleQuickAdminLogin = async () => {
    await quickLoginDemo('admin');
    showToast('Signed in as Admin Supervisor', 'success');
    router.replace('/admin');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          {/* Top Brand Bar */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={[styles.brandIcon, { backgroundColor: '#A51C24' }]}>
                <Ionicons name="airplane" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.brandName, { color: colors.text }]}>AEROPAY</Text>
                <Text style={[styles.brandSub, { color: colors.accent }]}>NETWORK</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' },
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>MAINNET LIVE</Text>
            </View>
          </Animated.View>

          {/* Glowing Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.heroSection}>
            <Animated.View
              style={[
                styles.glowOrb,
                animatedGlow,
                { backgroundColor: isDark ? 'rgba(165, 28, 36, 0.28)' : 'rgba(165, 28, 36, 0.12)' },
              ]}
            />

            <View
              style={[
                styles.heroPill,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Ionicons name="sparkles" size={13} color="#FFD700" />
              <Text style={[styles.heroPillText, { color: colors.text }]}>
                Next-Gen African Cross-Border Rails
              </Text>
            </View>

            <Text style={[styles.heroHeading, { color: colors.text }]}>
              Borderless payments, <Text style={{ color: colors.accent }}>frictionless</Text> speed.
            </Text>

            <Text style={[styles.heroSubheading, { color: colors.textSecondary }]}>
              Send, spend, convert and save across East Africa with sub-second finality, zero hidden
              spreads, and institutional-grade vault security.
            </Text>

            {/* Primary Action Buttons */}
            <View style={styles.heroCtaContainer}>
              <Pressable
                onPress={() => router.push('/signup')}
                style={[styles.primaryCtaBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.primaryCtaText}>Create Free Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/login')}
                style={[
                  styles.secondaryCtaBtn,
                  {
                    backgroundColor: isDark ? 'rgba(28, 34, 50, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : '#E2E8F0',
                  },
                ]}
              >
                <Ionicons name="log-in-outline" size={18} color={colors.text} />
                <Text style={[styles.secondaryCtaText, { color: colors.text }]}>Sign In</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Live KPI Metrics Bento Strip */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.metricsGrid}>
            {HIGHLIGHT_METRICS.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? 'rgba(20, 24, 38, 0.75)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.metricTop}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    {m.label}
                  </Text>
                  <Ionicons name={m.icon as any} size={14} color={m.color} />
                </View>
                <Text style={[styles.metricValue, { color: colors.text }]}>{m.val}</Text>
              </View>
            ))}
          </Animated.View>

          {/* STATIC DEFAULT DEMO CREDENTIALS CARD */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={[
              styles.credentialsCard,
              {
                backgroundColor: isDark ? 'rgba(22, 27, 44, 0.92)' : '#F8FAFC',
                borderColor: isDark ? 'rgba(99, 102, 241, 0.35)' : '#CBD5E1',
              },
            ]}
          >
            <View style={styles.credentialsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.credBadgeIcon, { backgroundColor: '#6366F125' }]}>
                  <Ionicons name="key" size={16} color="#6366F1" />
                </View>
                <View>
                  <Text style={[styles.credTitle, { color: colors.text }]}>
                    Static Default Credentials
                  </Text>
                  <Text style={[styles.credSub, { color: colors.textSecondary }]}>
                    Pre-configured accounts ready for evaluation & testing
                  </Text>
                </View>
              </View>
            </View>

            {/* Consumer Credentials Box */}
            <View
              style={[
                styles.accountCredBox,
                {
                  backgroundColor: isDark ? 'rgba(15, 18, 30, 0.75)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.accountCredTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.roleDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.roleTitle, { color: colors.text }]}>Consumer User Role</Text>
                </View>
                <Text style={[styles.roleBalance, { color: '#10B981' }]}>$1,450.75 USDC</Text>
              </View>

              <View style={styles.credRow}>
                <Text style={[styles.credFieldLabel, { color: colors.textSecondary }]}>Email:</Text>
                <Text style={[styles.credFieldValue, { color: colors.text }]}>
                  shema@aeropay.network
                </Text>
              </View>
              <View style={styles.credRow}>
                <Text style={[styles.credFieldLabel, { color: colors.textSecondary }]}>
                  Password:
                </Text>
                <Text style={[styles.credFieldValue, { color: colors.accent }]}>User@123</Text>
              </View>

              <Pressable
                onPress={handleQuickConsumerLogin}
                style={[styles.quickAutofillBtn, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="person-outline" size={14} color="#FFFFFF" />
                <Text style={styles.quickAutofillText}>1-Tap Login as Consumer</Text>
              </Pressable>
            </View>

            {/* Admin Credentials Box */}
            <View
              style={[
                styles.accountCredBox,
                {
                  backgroundColor: isDark ? 'rgba(15, 18, 30, 0.75)' : '#FFFFFF',
                  borderColor: '#6366F150',
                  marginTop: 10,
                },
              ]}
            >
              <View style={styles.accountCredTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.roleDot, { backgroundColor: '#6366F1' }]} />
                  <Text style={[styles.roleTitle, { color: colors.text }]}>
                    Admin Supervisor Role
                  </Text>
                </View>
                <Text style={[styles.roleBalance, { color: '#6366F1' }]}>Root Access</Text>
              </View>

              <View style={styles.credRow}>
                <Text style={[styles.credFieldLabel, { color: colors.textSecondary }]}>Email:</Text>
                <Text style={[styles.credFieldValue, { color: colors.text }]}>
                  admin@aeropay.network
                </Text>
              </View>
              <View style={styles.credRow}>
                <Text style={[styles.credFieldLabel, { color: colors.textSecondary }]}>
                  Password:
                </Text>
                <Text style={[styles.credFieldValue, { color: '#6366F1' }]}>Admin@123</Text>
              </View>
              <View style={styles.credRow}>
                <Text style={[styles.credFieldLabel, { color: colors.textSecondary }]}>
                  Admin Key:
                </Text>
                <Text style={[styles.credFieldValue, { color: '#6366F1' }]}>Admin@123</Text>
              </View>

              <Pressable
                onPress={handleQuickAdminLogin}
                style={[styles.quickAutofillBtn, { backgroundColor: '#6366F1' }]}
              >
                <Ionicons name="shield-checkmark-outline" size={14} color="#FFFFFF" />
                <Text style={styles.quickAutofillText}>1-Tap Login as Admin</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Feature Showcase Pillars */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.featuresSection}
          >
            <Text style={[styles.featuresHeading, { color: colors.text }]}>
              Built for Modern Commerce
            </Text>
            <Text style={[styles.featuresSub, { color: colors.textSecondary }]}>
              Everything required to orchestrate cross-border liquidity at scale
            </Text>

            <View style={styles.featuresGrid}>
              {FEATURE_PILLARS.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: isDark ? 'rgba(20, 24, 38, 0.75)' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    },
                  ]}
                >
                  <View style={styles.featureTop}>
                    <View style={[styles.featureIconBadge, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View
                      style={[
                        styles.featureBadge,
                        { backgroundColor: isDark ? '#262D42' : '#F1F5F9' },
                      ]}
                    >
                      <Text style={[styles.featureBadgeText, { color: colors.textSecondary }]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Bottom Landing Footer & Navigation */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            style={styles.footerSection}
          >
            <View
              style={[
                styles.bottomCtaBanner,
                {
                  backgroundColor: isDark ? 'rgba(165, 28, 36, 0.15)' : '#FFF1F2',
                  borderColor: colors.accent,
                },
              ]}
            >
              <Ionicons name="rocket-outline" size={24} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bottomCtaTitle, { color: colors.text }]}>
                  Ready to experience AeroPay?
                </Text>
                <Text style={[styles.bottomCtaSub, { color: colors.textSecondary }]}>
                  Instant registration with $50 welcome demo credit.
                </Text>
              </View>
            </View>

            <View style={styles.bottomNavRow}>
              <Pressable
                onPress={() => router.push('/signup')}
                style={[styles.bottomNavBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.bottomNavBtnText}>Get Started Now</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/login')}
                style={[
                  styles.bottomNavBtn,
                  {
                    backgroundColor: isDark ? '#1F2437' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.bottomNavBtnText, { color: colors.text }]}>Log In</Text>
              </Pressable>
            </View>

            <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
              © 2026 AeroPay Network Inc. • Stellar Soroban Rails • Kigali, Rwanda
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  responsiveWrapper: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A51C24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    lineHeight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroSection: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 18,
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -20,
    alignSelf: 'center',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroHeading: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 10,
  },
  heroSubheading: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 22,
  },
  heroCtaContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryCtaBtn: {
    flex: 1.3,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryCtaBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  secondaryCtaText: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 18,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  credentialsCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  credentialsHeader: {
    marginBottom: 14,
  },
  credBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  credSub: {
    fontSize: 12,
    marginTop: 2,
  },
  accountCredBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  accountCredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  roleBalance: {
    fontSize: 11,
    fontWeight: '800',
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  credFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 70,
  },
  credFieldValue: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  quickAutofillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: 18,
    marginTop: 10,
  },
  quickAutofillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  featuresSection: {
    marginVertical: 16,
  },
  featuresHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  featuresSub: {
    fontSize: 13,
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  featureTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  footerSection: {
    marginTop: 16,
  },
  bottomCtaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  bottomCtaTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bottomCtaSub: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  bottomNavBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
});
