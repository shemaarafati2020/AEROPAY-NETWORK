import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

const TIMELINE_STEPS = [
  { id: '1', title: 'Initiated', description: 'Transaction started', time: '10:42 AM' },
  { id: '2', title: 'Converting', description: 'USDC → RWF locked', time: '10:42 AM' },
  { id: '3', title: 'Sent to MoMo', description: 'Broadcasting to MTN', time: '10:43 AM' },
  { id: '4', title: 'Delivered', description: 'Funds available to recipient', time: '' },
];

export default function SendStatusScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1500);
    const timer2 = setTimeout(() => setCurrentStep(2), 3000);
    const timer3 = setTimeout(() => setCurrentStep(3), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transfer Status</Text>
        <Pressable onPress={() => router.navigate('/')} style={styles.closeButton}>
          <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.heroAmount}>
        <Text style={[styles.heroAmountText, { color: colors.text }]}>130,500 <Text style={styles.heroCurrency}>RWF</Text></Text>
        <Text style={[styles.heroRecipient, { color: colors.textSecondary }]}>To J•••• M••••</Text>
      </View>

      <View style={[styles.timelineCard, { backgroundColor: colors.backgroundElement }]}>
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isLast = index === TIMELINE_STEPS.length - 1;
          const isCurrent = index === currentStep;

          return (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepIndicatorContainer}>
                <View style={[
                  styles.stepDot,
                  { backgroundColor: isCompleted ? colors.success : colors.backgroundSelected },
                  isCurrent && { backgroundColor: colors.accent }
                ]} />
                {!isLast && <View style={[styles.stepLine, { backgroundColor: isCompleted ? colors.success : colors.backgroundSelected }]} />}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle, 
                  { color: isCompleted ? colors.text : colors.textSecondary },
                  isCurrent && { color: colors.text }
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
      </View>

      <View style={styles.referenceContainer}>
        <Text style={[styles.referenceText, { color: colors.textSecondary }]}>Ref: OMNI-8X92-K4F1</Text>
        <Pressable style={styles.supportButton}>
          <Text style={[styles.supportText, { color: colors.accent }]}>Need help?</Text>
        </Pressable>
      </View>

      {currentStep === 3 && (
        <Pressable 
          style={[styles.doneButton, { backgroundColor: colors.backgroundElement }]}
          onPress={() => router.navigate('/')}
        >
          <Text style={[styles.doneButtonText, { color: colors.text }]}>Done</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  heroAmount: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  heroAmountText: {
    fontSize: 40,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  heroCurrency: {
    fontSize: 20,
    color: '#8B95A5',
    fontWeight: '400',
  },
  heroRecipient: {
    fontSize: 16,
    marginTop: 8,
  },
  timelineCard: {
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 64,
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
    paddingBottom: Spacing.four,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
  },
  stepTimeContainer: {
    alignItems: 'flex-end',
  },
  stepTime: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  referenceContainer: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  referenceText: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  supportButton: {
    paddingVertical: 8,
  },
  supportText: {
    fontSize: 14,
    fontWeight: '500',
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: Spacing.four,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
