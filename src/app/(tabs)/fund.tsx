import { StyleSheet, Text, View, Pressable, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';

const FUNDING_METHODS = [
  { 
    id: 'momo', 
    title: 'Mobile Money Top-Up', 
    subtitle: 'Instant via MTN / Airtel Money', 
    icon: 'phone-portrait-outline', 
    badge: 'Popular',
    badgeColor: '#10B981',
    fields: ['Phone Number', 'Provider (MTN/Airtel)']
  },
  { 
    id: 'card', 
    title: 'Credit or Debit Card', 
    subtitle: 'Instant deposit, 1.5% fee', 
    icon: 'card-outline',
    badge: 'Instant',
    badgeColor: '#3B82F6',
    fields: ['Card Number', 'Expiry & CVV']
  },
  { 
    id: 'bank', 
    title: 'Bank Transfer (ACH/WIRE)', 
    subtitle: '1-2 business days, $0 fee', 
    icon: 'business-outline',
    badge: 'Zero Fee',
    badgeColor: '#8B5CF6',
    fields: ['Account Number', 'Routing / IBAN']
  },
  { 
    id: 'crypto', 
    title: 'Connect Web3 Wallet', 
    subtitle: 'USDC / USDT on Polygon & Base', 
    icon: 'wallet-outline',
    badge: 'On-Chain',
    badgeColor: '#F59E0B',
    fields: ['Wallet Address']
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MethodCard({ method, colors, index, onSelect }: { method: any; colors: any; index: number; onSelect: (m: any) => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <AnimatedPressable 
        style={[styles.methodCard, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }, animatedStyle]}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() => onSelect(method)}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
          <Ionicons name={method.icon as any} size={24} color={colors.accent} />
        </View>
        <View style={styles.methodInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.methodTitle, { color: colors.text }]}>{method.title}</Text>
            <View style={[styles.badge, { backgroundColor: method.badgeColor + '20' }]}>
              <Text style={[styles.badgeText, { color: method.badgeColor }]}>{method.badge}</Text>
            </View>
          </View>
          <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>{method.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function FundScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const { showToast } = useToast();

  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('100');
  const [accountDetail, setAccountDetail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }
    setIsSuccess(true);
    showToast(`Successfully deposited $${depositAmount} USD into your wallet!`, 'success');
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setIsSuccess(false);
    setDepositAmount('100');
    setAccountDetail('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Money</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
        {/* Wallet Balance Summary Card */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={[styles.balanceCard, { backgroundColor: isDark ? '#7A131A' : '#A51C24' }]}>
          <Text style={styles.balanceLabel}>Main Wallet Balance</Text>
          <Text style={styles.balanceValue}>$4,250.00 <Text style={styles.balanceCurrency}>USD</Text></Text>
          <View style={styles.balanceFooter}>
            <Ionicons name="shield-checkmark" size={14} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.balanceFooterText}>FDIC Insured up to $250,000</Text>
          </View>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SELECT FUNDING METHOD</Text>

        {FUNDING_METHODS.map((method, index) => (
          <MethodCard 
            key={method.id} 
            method={method} 
            colors={colors} 
            index={index} 
            onSelect={(m) => setSelectedMethod(m)} 
          />
        ))}

        {/* Security Disclosure Footnote */}
        <View style={styles.securityFootnote}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.footnoteText, { color: colors.textSecondary }]}>
            All transactions are encrypted with 256-bit SSL security.
          </Text>
        </View>
        </View>
      </ScrollView>

      {/* Deposit Flow Modal */}
      <Modal
        visible={selectedMethod !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]} onPress={() => {}}>
            
            {isSuccess ? (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.successContainer}>
                <View style={[styles.successIconCircle, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                </View>
                <Text style={[styles.successTitle, { color: colors.text }]}>Deposit Initiated!</Text>
                <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                  Your deposit of <Text style={{ fontWeight: '700', color: colors.text }}>${depositAmount} USD</Text> via {selectedMethod?.title} is being processed.
                </Text>
                <Pressable style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={handleClose}>
                  <Text style={styles.actionBtnText}>Done</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <View>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={selectedMethod?.icon as any} size={22} color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedMethod?.title}</Text>
                  </View>
                  <Pressable onPress={handleClose}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </Pressable>
                </View>

                {/* Amount Input */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>AMOUNT TO DEPOSIT (USD)</Text>
                <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2C2C2C' : '#F0F0F0', borderColor: colors.divider }]}>
                  <Text style={[styles.currencySymbol, { color: colors.accent }]}>$</Text>
                  <TextInput
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    keyboardType="numeric"
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>

                {/* Detail Input */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{selectedMethod?.fields[0].toUpperCase()}</Text>
                <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2C2C2C' : '#F0F0F0', borderColor: colors.divider }]}>
                  <TextInput
                    placeholder={`Enter ${selectedMethod?.fields[0]}...`}
                    placeholderTextColor={colors.textSecondary}
                    value={accountDetail}
                    onChangeText={setAccountDetail}
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>

                <Pressable style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={handleDeposit}>
                  <Text style={styles.actionBtnText}>Confirm Deposit</Text>
                </Pressable>
              </View>
            )}

          </Pressable>
        </Pressable>
      </Modal>

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
  content: {
    padding: Spacing.four,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: Spacing.five,
    shadowColor: '#A51C24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceFooterText: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: Spacing.three,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  methodInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  methodSubtitle: {
    fontSize: 13,
  },
  securityFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  footnoteText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  actionBtn: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.four,
    lineHeight: 22,
  },
});
