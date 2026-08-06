import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SUCCESS_STEPS = [
  { id: '1', title: 'Initiated', description: 'Transaction started', time: '10:42 AM', state: 'done' },
  { id: '2', title: 'Converting', description: 'USD → RWF rate locked', time: '10:42 AM', state: 'done' },
  { id: '3', title: 'Sent to MoMo', description: 'Broadcasting to MTN Rwanda', time: '10:43 AM', state: 'done' },
  { id: '4', title: 'Delivered', description: 'Funds available to recipient', time: '10:43 AM', state: 'done' },
];

const FAILED_STEPS = [
  { id: '1', title: 'Initiated', description: 'Transaction started', time: '10:42 AM', state: 'done' },
  { id: '2', title: 'Converting', description: 'USD → RWF rate locked', time: '10:42 AM', state: 'done' },
  { id: '3', title: 'Network Error', description: 'MTN Gateway API unreachable', time: '10:43 AM', state: 'failed' },
  { id: '4', title: 'Reversing', description: 'Refunding to Main Wallet', time: '10:43 AM', state: 'warning' },
];

export default function SendStatusScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const params = useLocalSearchParams();
  
  const isFailed = params.failed === 'true';
  const TIMELINE_STEPS = isFailed ? FAILED_STEPS : SUCCESS_STEPS;
  
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1000);
    const timer2 = setTimeout(() => setCurrentStep(2), 2000);
    const timer3 = setTimeout(() => setCurrentStep(3), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const getStepColor = (stepState: string, isCompleted: boolean, isCurrent: boolean) => {
    if (stepState === 'failed' && isCompleted) return colors.error;
    if (stepState === 'warning' && isCompleted) return '#F59E0B'; // Amber
    if (isCompleted) return colors.success;
    if (isCurrent) return colors.accent;
    return colors.backgroundSelected;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transfer Status</Text>
        <Pressable onPress={() => router.navigate('/')} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
        
        {/* Amount Header */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.heroAmount}>
          <Text style={[styles.heroAmountText, { color: isFailed ? colors.error : colors.text }]}>
            130,500 <Text style={styles.heroCurrency}>RWF</Text>
          </Text>
          <Text style={[styles.heroRecipient, { color: colors.textSecondary }]}>To John Doe (+250 788 123 456)</Text>
        </Animated.View>

        {/* Dynamic Timeline Steps */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[
          styles.timelineCard, 
          { backgroundColor: colors.backgroundElement, borderColor: colors.divider }
        ]}>
          {TIMELINE_STEPS.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isLast = index === TIMELINE_STEPS.length - 1;
            const isCurrent = index === currentStep;
            
            const dotColor = getStepColor(step.state, isCompleted, isCurrent);

            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepIndicatorContainer}>
                  <View style={[styles.stepDot, { backgroundColor: dotColor }]} />
                  {!isLast && <View style={[styles.stepLine, { backgroundColor: isCompleted ? dotColor : colors.backgroundSelected }]} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle, 
                    { color: isCompleted ? colors.text : colors.textSecondary },
                    isCurrent && { color: colors.text },
                    (step.state === 'failed' && isCompleted) && { color: colors.error }
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{step.description}</Text>
                </View>
                <View style={styles.stepTimeContainer}>
                  <Text style={[styles.stepTime, { color: colors.textSecondary }]}>
                    {isCompleted ? (step.time || 'Just now') : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {isFailed && currentStep === 3 && (
          <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 83, 80, 0.1)', borderColor: colors.error }]}>
            <Text style={[styles.errorTitle, { color: colors.error }]}>Transfer Failed</Text>
            <Text style={[styles.errorDesc, { color: colors.text }]}>
              We couldn't reach the mobile money provider. Your funds are safe and have been fully refunded to your Main Wallet.
            </Text>
          </View>
        )}

        <View style={styles.referenceContainer}>
          <Text style={[styles.referenceText, { color: colors.textSecondary }]}>Ref: AERO-8X92-K4F1</Text>
          <Text style={[styles.referenceText, { color: colors.textSecondary, marginTop: 4, fontSize: 11 }]}>Idempotency-Key: req_9x12nf821ms</Text>
          <Pressable style={styles.supportButton} onPress={() => router.navigate('/')}>
            <Text style={[styles.supportText, { color: colors.accent }]}>Need help? Contact Aeropay Support</Text>
          </Pressable>
        </View>

        {currentStep === 3 && (
          <Pressable 
            style={[styles.doneButton, { backgroundColor: isFailed ? colors.accent : colors.accent }]}
            onPress={() => router.navigate('/')}
          >
            <Text style={styles.doneButtonText}>
              {isFailed ? 'Return to Dashboard' : 'Done'}
            </Text>
          </Pressable>
        )}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  heroAmount: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  heroAmountText: {
    fontSize: 38,
    fontWeight: '800',
    fontFamily: 'Inter',
    fontVariant: ['tabular-nums'],
  },
  heroCurrency: {
    fontSize: 18,
    color: '#8B95A5',
    fontWeight: '600',
  },
  heroRecipient: {
    fontSize: 14,
    marginTop: 6,
  },
  timelineCard: {
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 58,
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.three,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    zIndex: 1,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: -4,
    marginBottom: -4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.three,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
  },
  stepTimeContainer: {
    alignItems: 'flex-end',
  },
  stepTime: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  errorBox: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  referenceContainer: {
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: Spacing.four,
  },
  referenceText: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  supportButton: {
    paddingVertical: 8,
  },
  supportText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doneButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
