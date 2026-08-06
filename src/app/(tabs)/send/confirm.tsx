import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SendConfirmScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleConfirmTransfer = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to complete transfer',
          fallbackLabel: 'Use PIN',
        });

        if (!result.success) {
          Alert.alert('Authentication Failed', 'Please verify your identity to proceed.');
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
      // Fallback if local auth is unavailable in dev environment
    }

    // Simulate transfer broadcast
    setTimeout(() => {
      const isFailed = Math.random() > 0.8 ? 'true' : 'false';
      router.push(`/(tabs)/send/status?failed=${isFailed}`);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Review & Confirm</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
        
        {/* Main Review Card */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={[
          styles.summaryCard, 
          { backgroundColor: colors.backgroundElement, borderColor: colors.divider }
        ]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>YOU SEND</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            $100.00 <Text style={styles.currency}>USD</Text>
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>RECIPIENT GETS</Text>
          <Text style={[styles.summaryValue, { color: colors.accent }]}>
            130,500 <Text style={[styles.currency, { color: colors.accent }]}>RWF</Text>
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Recipient</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rowValue, { color: colors.text }]}>John Doe</Text>
              <Text style={[styles.rowSubValue, { color: colors.textSecondary }]}>MTN MoMo • +250 788 123 456</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Guaranteed Exchange Rate</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>$1 = 1,305.00 RWF</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Aeropay Network Fee</Text>
            <View style={[styles.feeBadge, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="sparkles" size={12} color={colors.success} style={{ marginRight: 4 }} />
              <Text style={[styles.feeBadgeText, { color: colors.success }]}>Zero Fee (Free)</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Estimated Delivery</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>Instant (under 5 seconds)</Text>
          </View>

        </Animated.View>

        {/* Security & Guaranteed Lock Info Banner */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[
          styles.infoCard, 
          { backgroundColor: isDark ? 'rgba(32, 32, 36, 0.6)' : 'rgba(255, 255, 255, 0.8)', borderColor: colors.divider }
        ]}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Institutional Grade Security</Text>
            <Text style={[styles.infoSub, { color: colors.textSecondary }]}>
              Protected by 256-bit encryption & real-time fraud monitoring.
            </Text>
          </View>
        </Animated.View>

        {/* Prominent Action Button with Bottom Navigation Bar Clearance */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.actionContainer}>
          <AnimatedPressable
            style={[
              styles.sendButton,
              { backgroundColor: colors.accent },
              buttonAnimatedStyle
            ]}
            onPressIn={() => (scale.value = withSpring(0.96))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={handleConfirmTransfer}
            disabled={isSubmitting}
          >
            <Ionicons name="paper-plane" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.sendButtonText}>
              {isSubmitting ? 'Processing Transfer...' : 'Confirm & Send Money'}
            </Text>
          </AnimatedPressable>
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
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 120, // Clean clearance above floating bottom navigation bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  summaryCard: {
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1.5,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: '800',
    fontFamily: 'Inter',
    fontVariant: ['tabular-nums'],
  },
  currency: {
    fontSize: 16,
    color: '#8B95A5',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSubValue: {
    fontSize: 12,
    marginTop: 2,
  },
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  feeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.five,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  actionContainer: {
    marginTop: Spacing.two,
  },
  sendButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
