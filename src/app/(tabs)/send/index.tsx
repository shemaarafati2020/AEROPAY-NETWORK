import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, ScrollView, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ALL_WORLD_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToRwf: 1305, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToRwf: 1420, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToRwf: 1650, flag: '🇬🇧' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateToRwf: 10.2, flag: '🇰🇪' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', rateToRwf: 1.0, flag: '🇷🇼' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', rateToRwf: 0.35, flag: '🇺🇬' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rateToRwf: 0.49, flag: '🇹🇿' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateToRwf: 0.88, flag: '🇳🇬' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rateToRwf: 86.5, flag: '🇬🇭' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateToRwf: 72.4, flag: '🇿🇦' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToRwf: 960, flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToRwf: 860, flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToRwf: 8.7, flag: '🇯🇵' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToRwf: 1480, flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateToRwf: 182, flag: '🇨🇳' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToRwf: 15.6, flag: '🇮🇳' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToRwf: 355, flag: '🇦🇪' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', rateToRwf: 348, flag: '🇸🇦' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateToRwf: 240, flag: '🇧🇷' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', rateToRwf: 68, flag: '🇲🇽' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToRwf: 970, flag: '🇸🇬' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateToRwf: 790, flag: '🇳🇿' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rateToRwf: 125, flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rateToRwf: 122, flag: '🇳🇴' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rateToRwf: 27.2, flag: '🇪🇬' },
];

const PRESET_AMOUNTS = ['25', '50', '100', '250', '500'];
const AVAILABLE_BALANCE = 4250.0;

function KeypadButton({ item, onPress, colors }: { item: string; onPress: (val: string) => void; colors: any }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={styles.keyWrapper}
      onPressIn={() => (scale.value = withSpring(0.9))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => onPress(item)}
    >
      <Animated.View style={[styles.key, { backgroundColor: colors.backgroundElement }, animatedStyle]}>
        {item === 'del' ? (
          <Ionicons name="backspace-outline" size={24} color={colors.text} />
        ) : (
          <Text style={[styles.keyText, { color: colors.text }]}>{item}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function SendAmountScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  
  const [amount, setAmount] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState(ALL_WORLD_CURRENCIES[0]);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [showRateBreakdown, setShowRateBreakdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!currencySearch) return ALL_WORLD_CURRENCIES;
    const query = currencySearch.toLowerCase();
    return ALL_WORLD_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
    );
  }, [currencySearch]);

  const handleKeyPress = (key: string) => {
    if (key === 'del') {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount((prev) => prev + '.');
    } else {
      if (amount === '0') {
        setAmount(key);
      } else {
        if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
        setAmount((prev) => prev + key);
      }
    }
  };

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
  };

  const numericAmount = parseFloat(amount || '0');
  const convertedAmount = Math.round(numericAmount * selectedCurrency.rateToRwf).toLocaleString('en-US');
  const isOverBalance = numericAmount > AVAILABLE_BALANCE;
  const isValid = numericAmount > 0 && !isOverBalance;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Send Money</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Amount Input Display */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.amountSection}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>YOU SEND</Text>
          
          <View style={styles.amountDisplayRow}>
            <Text style={[styles.currencySymbol, { color: colors.accent }]}>{selectedCurrency.symbol}</Text>
            
            {/* Direct Editable TextInput */}
            <TextInput
              value={amount}
              onChangeText={handleTextChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              style={[styles.amountInput, { color: colors.text }]}
            />
            
            {/* Currency Selector Dropdown Button */}
            <Pressable 
              onPress={() => setIsCurrencyModalVisible(true)}
              style={[styles.currencyPicker, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}
            >
              <Text style={styles.flagText}>{selectedCurrency.flag}</Text>
              <Text style={[styles.currencyText, { color: colors.text }]}>{selectedCurrency.code}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
            </Pressable>
          </View>

          {isOverBalance && (
            <View style={[styles.warningBanner, { backgroundColor: 'rgba(239, 83, 80, 0.1)' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} style={{ marginRight: 6 }} />
              <Text style={[styles.warningText, { color: colors.error }]}>
                Exceeds available balance (${AVAILABLE_BALANCE.toLocaleString()})
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Amount Presets */}
        <View style={styles.presetsRow}>
          {PRESET_AMOUNTS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setAmount(preset)}
              style={[
                styles.presetPill,
                { backgroundColor: amount === preset ? colors.accent : colors.backgroundElement, borderColor: colors.divider }
              ]}
            >
              <Text style={[styles.presetText, { color: amount === preset ? '#FFF' : colors.text }]}>
                {selectedCurrency.symbol}{preset}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Conversion Rate Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={[styles.conversionCard, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
          <View style={styles.conversionRow}>
            <View>
              <Text style={[styles.conversionLabel, { color: colors.textSecondary }]}>Recipient gets</Text>
              <Text style={[styles.conversionValue, { color: colors.text }]}>{convertedAmount} RWF</Text>
            </View>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="sparkles" size={12} color={colors.success} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: colors.success }]}>Zero Fees</Text>
              </View>
              <Text style={[styles.countdown, { color: colors.textSecondary }]}>{countdown}s locked</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <Pressable onPress={() => setShowRateBreakdown(!showRateBreakdown)} style={styles.rateDetails}>
            <Text style={[styles.rateText, { color: colors.textSecondary }]}>How this rate works</Text>
            <Ionicons name={showRateBreakdown ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
          </Pressable>

          {showRateBreakdown && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.breakdownContainer}>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Mid-market Exchange Rate</Text>
                <Text style={[styles.breakdownVal, { color: colors.text }]}>1 {selectedCurrency.code} = {selectedCurrency.rateToRwf} RWF</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Aeropay Network Fee</Text>
                <Text style={[styles.breakdownVal, { color: colors.success }]}>$0.00 (Free)</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Guaranteed Rate Window</Text>
                <Text style={[styles.breakdownVal, { color: colors.text }]}>60 Seconds</Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Custom On-Screen Keypad */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map((key) => (
            <KeypadButton key={key} item={key} onPress={handleKeyPress} colors={colors} />
          ))}
        </View>

        {/* Submit Button */}
        <Pressable 
          disabled={!isValid}
          style={[
            styles.nextButton, 
            { backgroundColor: isValid ? colors.accent : (isDark ? '#333' : '#E0E0E0') }
          ]}
          onPress={() => router.push('/(tabs)/send/recipient')}
        >
          <Text style={[styles.nextButtonText, { color: isValid ? '#FFFFFF' : colors.textSecondary }]}>Next</Text>
        </Pressable>
        
      </ScrollView>

      {/* World Currencies Dropdown Modal */}
      <Modal
        visible={isCurrencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCurrencyModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsCurrencyModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
              <Pressable onPress={() => setIsCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Currency Search Input */}
            <View style={[styles.modalSearchContainer, { backgroundColor: isDark ? '#2C2C2C' : '#F0F0F0' }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search country or currency..."
                placeholderTextColor={colors.textSecondary}
                value={currencySearch}
                onChangeText={setCurrencySearch}
                style={[styles.modalSearchInput, { color: colors.text }]}
              />
              {currencySearch !== '' && (
                <Pressable onPress={() => setCurrencySearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {filteredCurrencies.map((curr) => (
                <Pressable
                  key={curr.code}
                  style={[
                    styles.currencyRow,
                    { borderBottomColor: colors.divider },
                    selectedCurrency.code === curr.code && { backgroundColor: colors.accent + '15' }
                  ]}
                  onPress={() => {
                    setSelectedCurrency(curr);
                    setIsCurrencyModalVisible(false);
                    setCurrencySearch('');
                  }}
                >
                  <Text style={styles.currencyRowFlag}>{curr.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.currencyRowCode, { color: colors.text }]}>{curr.code} ({curr.symbol})</Text>
                    <Text style={[styles.currencyRowName, { color: colors.textSecondary }]}>{curr.name}</Text>
                  </View>
                  {selectedCurrency.code === curr.code && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  amountSection: {
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 44,
    fontWeight: '800',
    fontFamily: 'Inter',
    minWidth: 100,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  currencyPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
  },
  flagText: {
    fontSize: 16,
    marginRight: 6,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  presetPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  conversionCard: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversionLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  conversionValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
  },
  breakdownContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  keyWrapper: {
    width: (width - 64) / 3,
    padding: 6,
  },
  key: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: Spacing.two,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: Spacing.three,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  currencyRowFlag: {
    fontSize: 24,
  },
  currencyRowCode: {
    fontSize: 16,
    fontWeight: '700',
  },
  currencyRowName: {
    fontSize: 13,
  },
});
