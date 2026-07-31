import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const EXCHANGE_RATE = 1305;

export default function SendAmountScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [amount, setAmount] = useState('100.00');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyPress = (key: string) => {
    if (key === 'del') {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount((prev) => prev + '.');
    } else {
      setAmount((prev) => (prev === '0' ? key : prev + key));
    }
  };

  const numericAmount = parseFloat(amount || '0');
  const convertedAmount = (numericAmount * EXCHANGE_RATE).toLocaleString('en-US');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Send Money</Text>
      </View>

      <View style={styles.amountSection}>
        <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>You Send</Text>
        <Text style={[styles.amountValue, { color: colors.text }]}>
          ${amount} <Text style={styles.currency}>USD</Text>
        </Text>
      </View>

      <View style={[styles.conversionCard, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.conversionRow}>
          <View>
            <Text style={[styles.conversionLabel, { color: colors.textSecondary }]}>Recipient gets</Text>
            <Text style={[styles.conversionValue, { color: colors.text }]}>{convertedAmount} RWF</Text>
          </View>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.success }]}>Zero Fees</Text>
            </View>
            <Text style={[styles.countdown, { color: colors.textSecondary }]}>{countdown}s locked</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <Pressable style={styles.rateDetails}>
          <Text style={[styles.rateText, { color: colors.textSecondary }]}>How this rate works</Text>
          <Text style={{ color: colors.textSecondary }}>▼</Text>
        </Pressable>
      </View>

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map((key) => (
          <Pressable
            key={key}
            style={styles.key}
            onPress={() => handleKeyPress(key)}
          >
            <Text style={[styles.keyText, { color: colors.text }]}>
              {key === 'del' ? '⌫' : key}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable 
        style={[styles.nextButton, { backgroundColor: colors.accent }]}
        onPress={() => router.push('/(tabs)/send/recipient')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  amountSection: {
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.five,
  },
  amountLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 56,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    fontFamily: 'Inter',
  },
  currency: {
    fontSize: 24,
    color: '#8B95A5',
  },
  conversionCard: {
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  conversionValue: {
    fontSize: 24,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countdown: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  rateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 14,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  key: {
    width: (width - 48) / 3,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: Spacing.four,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
