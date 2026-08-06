import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export default function SendConfirmScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  // Slide to Send state
  const [slideProgress, setSlideProgress] = useState(0);

  const handleSlideComplete = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to complete transfer',
        fallbackLabel: 'Use PIN',
      });

      if (!result.success) {
        Alert.alert('Authentication Failed', 'Please verify your identity to proceed.');
        return;
      }
    }

    // Pass a random query param to randomly simulate success or failure for the demo
    const isFailed = Math.random() > 0.5 ? 'true' : 'false';
    router.push(`/(tabs)/send/status?failed=${isFailed}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: colors.textSecondary, fontSize: 24 }}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>You Send</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            $100.00 <Text style={styles.currency}>USD</Text>
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Recipient Gets</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            130,500 <Text style={styles.currency}>RWF</Text>
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Recipient</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rowValue, { color: colors.text }]}>J•••• M••••</Text>
              <Text style={[styles.rowSubValue, { color: colors.textSecondary }]}>MTN MoMo • +250 788 123 456</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Exchange Rate</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>$1 = 1,305 RWF</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Network Fees</Text>
            <Text style={[styles.rowValue, { color: colors.success }]}>Covered</Text>
          </View>

        </View>

        <Pressable style={styles.transparencyLink}>
          <Text style={[styles.transparencyText, { color: colors.textSecondary }]}>Rate Transparency & Breakdown</Text>
        </Pressable>
      </View>

      <View style={styles.sliderContainer}>
        <Pressable 
          style={[styles.sliderTrack, { backgroundColor: colors.backgroundSelected }]}
          onPress={handleSlideComplete} // Mocking slide with a tap for this demo
        >
          <View style={[styles.sliderThumb, { backgroundColor: colors.accent }]}>
            <Text style={{ color: '#FFFFFF', fontSize: 20 }}>→</Text>
          </View>
          <Text style={[styles.sliderText, { color: colors.text }]}>Tap to Send</Text>
        </Pressable>
      </View>
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  summaryContainer: {
    marginTop: Spacing.four,
  },
  summaryCard: {
    borderRadius: 16,
    padding: Spacing.four,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  currency: {
    fontSize: 16,
    color: '#8B95A5',
    fontWeight: '400',
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
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowSubValue: {
    fontSize: 12,
    marginTop: 2,
  },
  transparencyLink: {
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  transparencyText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  sliderContainer: {
    marginTop: 'auto',
    marginBottom: Spacing.four,
  },
  sliderTrack: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  sliderThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 8,
    zIndex: 2,
  },
  sliderText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1,
  },
});
