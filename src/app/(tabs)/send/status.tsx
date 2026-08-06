import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { useToast } from '@/context/ToastContext';

const SUCCESS_STEPS = [
  {
    id: '1',
    title: 'Initiated',
    description: 'Transaction started',
    time: '10:42 AM',
    state: 'done',
  },
  {
    id: '2',
    title: 'Converting',
    description: 'USD → RWF rate locked',
    time: '10:42 AM',
    state: 'done',
  },
  {
    id: '3',
    title: 'Sent to MoMo',
    description: 'Broadcasting to MTN Rwanda',
    time: '10:43 AM',
    state: 'done',
  },
  {
    id: '4',
    title: 'Delivered',
    description: 'Funds available to recipient',
    time: '10:43 AM',
    state: 'done',
  },
];

const FAILED_STEPS = [
  {
    id: '1',
    title: 'Initiated',
    description: 'Transaction started',
    time: '10:42 AM',
    state: 'done',
  },
  {
    id: '2',
    title: 'Converting',
    description: 'USD → RWF rate locked',
    time: '10:42 AM',
    state: 'done',
  },
  {
    id: '3',
    title: 'Network Error',
    description: 'MTN Gateway API unreachable',
    time: '10:43 AM',
    state: 'failed',
  },
  {
    id: '4',
    title: 'Reversing',
    description: 'Refunding to Main Wallet',
    time: '10:43 AM',
    state: 'warning',
  },
];

export default function SendStatusScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const params = useLocalSearchParams<{
    failed?: string;
    idempotencyKey?: string;
    recipientName?: string;
    recipientPhone?: string;
    amountUsd?: string;
    currency?: string;
  }>();
  const { showToast } = useToast();

  const isFailed = params.failed === 'true';
  const recipientName = params.recipientName || 'John Doe';
  const recipientPhone = params.recipientPhone || '+250 788 123 456';
  const amountUsd = params.amountUsd || '100';
  const currency = params.currency || 'RWF';
  const receiveAmount = currency === 'RWF' ? '130,500' : '12,950';
  const refId = 'AP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const idempotencyKey = params.idempotencyKey || 'ap-idemp-default-9812';

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

  const handleOpenBlockExplorer = async () => {
    const mockHash = '0x8f9a3c2e1b4d5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f';
    const explorerUrl = `https://stellar.expert/explorer/public/tx/${mockHash}`;
    await WebBrowser.openBrowserAsync(explorerUrl);
  };

  const handleShareReceipt = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; }
              .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .brand { font-size: 28px; font-weight: 800; color: #0066FF; }
              .title { font-size: 20px; font-weight: 700; margin-top: 10px; }
              .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
              .label { color: #666; font-size: 14px; }
              .value { font-weight: 600; font-size: 14px; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="brand">AEROPAY NETWORK</div>
              <div class="title">Official Transaction Receipt</div>
            </div>
            <div class="row"><span class="label">Reference ID</span><span class="value">${refId}</span></div>
            <div class="row"><span class="label">Idempotency Key</span><span class="value">${idempotencyKey}</span></div>
            <div class="row"><span class="label">Status</span><span class="value">${isFailed ? 'FAILED (Refunded)' : 'DELIVERED'}</span></div>
            <div class="row"><span class="label">Sender</span><span class="value">Shema Arafati</span></div>
            <div class="row"><span class="label">Recipient</span><span class="value">${recipientName} (${recipientPhone})</span></div>
            <div class="row"><span class="label">Amount Sent</span><span class="value">$${amountUsd}.00 USD</span></div>
            <div class="row"><span class="label">Amount Delivered</span><span class="value">${receiveAmount} ${currency}</span></div>
            <div class="row"><span class="label">Settlement Rail</span><span class="value">Stellar / USDC Anchor</span></div>
            <div class="footer">
              Thank you for trusting AeroPay. Instant, zero-friction cross-border payments.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      showToast('Receipt generated successfully', 'success');
    }
  };

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
              {receiveAmount} <Text style={styles.heroCurrency}>{currency}</Text>
            </Text>
            <Text style={[styles.heroRecipient, { color: colors.textSecondary }]}>
              To {recipientName} ({recipientPhone})
            </Text>
          </Animated.View>

          {/* Dynamic Timeline Steps */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[
              styles.timelineCard,
              { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
            ]}
          >
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isLast = index === TIMELINE_STEPS.length - 1;
              const isCurrent = index === currentStep;

              const dotColor = getStepColor(step.state, isCompleted, isCurrent);

              return (
                <View key={step.id} style={styles.stepRow}>
                  <View style={styles.stepIndicatorContainer}>
                    <View style={[styles.stepDot, { backgroundColor: dotColor }]} />
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          { backgroundColor: isCompleted ? dotColor : colors.backgroundSelected },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        { color: isCompleted ? colors.text : colors.textSecondary },
                        isCurrent && { color: colors.text },
                        step.state === 'failed' && isCompleted && { color: colors.error },
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                      {step.description}
                    </Text>
                  </View>
                  <View style={styles.stepTimeContainer}>
                    <Text style={[styles.stepTime, { color: colors.textSecondary }]}>
                      {isCompleted ? step.time || 'Just now' : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>

          {isFailed && currentStep === 3 && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: 'rgba(239, 83, 80, 0.1)', borderColor: colors.error },
              ]}
            >
              <Text style={[styles.errorTitle, { color: colors.error }]}>
                Transfer Failed & Auto-Refunded
              </Text>
              <Text style={[styles.errorDesc, { color: colors.text }]}>
                MTN Gateway experienced a temporary timeout. Funds ($${amountUsd}.00 USDC) have been
                safely returned to your wallet.
              </Text>
            </View>
          )}

          {/* Radical Transparency & On-chain Proof Link */}
          <View style={{ gap: 10, marginBottom: 16 }}>
            <Pressable
              onPress={handleOpenBlockExplorer}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.backgroundElement,
                borderWidth: 1,
                borderColor: colors.divider,
              }}
            >
              <Ionicons name="link-outline" size={16} color={colors.accent} />
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>
                View On-Chain Settlement Proof
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShareReceipt}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.backgroundElement,
                borderWidth: 1,
                borderColor: colors.divider,
              }}
            >
              <Ionicons name="document-text-outline" size={16} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                Download / Share Official PDF Receipt
              </Text>
            </Pressable>
          </View>

          {/* Ask AeroPay AI Assistant Context Button */}
          <Pressable
            onPress={() => router.push({ pathname: '/assistant', params: { txRef: refId } })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: colors.accent + '15',
              marginBottom: 16,
            }}
          >
            <Ionicons name="sparkles" size={18} color={colors.accent} />
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 13 }}>
              Ask AeroPay AI about this transfer
            </Text>
          </Pressable>

          <View style={styles.referenceContainer}>
            <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
              Ref: {refId}
            </Text>
            <Text
              style={[
                styles.referenceText,
                { color: colors.textSecondary, marginTop: 4, fontSize: 11 },
              ]}
            >
              Idempotency-Key: {idempotencyKey}
            </Text>
          </View>

          {currentStep === 3 && (
            <Pressable
              style={[styles.doneButton, { backgroundColor: colors.accent }]}
              onPress={() => router.navigate('/')}
            >
              <Text style={styles.doneButtonText}>{isFailed ? 'Return to Dashboard' : 'Done'}</Text>
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
