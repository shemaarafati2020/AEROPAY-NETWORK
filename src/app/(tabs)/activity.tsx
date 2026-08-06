import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ActivityItem {
  id: string;
  type: string;
  category: 'transfer' | 'deposit' | 'bill' | 'airtime' | 'failed';
  recipient: string;
  amount: string;
  numericAmount: number;
  status: 'Delivered' | 'Completed' | 'Reversed' | 'Failed';
  date: string;
  timestamp: number;
  reference: string;
  fee: string;
  icon: string;
}

const EXTENDED_ACTIVITY_DATA: ActivityItem[] = [
  {
    id: '1',
    type: 'Sent to Mobile',
    category: 'transfer',
    recipient: 'J. M.',
    amount: '-$100.00',
    numericAmount: -100.0,
    status: 'Delivered',
    date: 'Today, 10:42 AM',
    timestamp: Date.now() - 3600000,
    reference: 'AERO-9X12-8841',
    fee: '$0.00',
    icon: 'send',
  },
  {
    id: '2',
    type: 'Bank Deposit',
    category: 'deposit',
    recipient: 'Standard Chart.',
    amount: '+$500.00',
    numericAmount: 500.0,
    status: 'Completed',
    date: 'Yesterday',
    timestamp: Date.now() - 86400000,
    reference: 'BANK-0092-1142',
    fee: '$0.00',
    icon: 'arrow-down-circle',
  },
  {
    id: '3',
    type: 'MoMo Timeout (Reversed)',
    category: 'failed',
    recipient: 'Safaricom Merchant',
    amount: '+$150.00',
    numericAmount: 150.0,
    status: 'Reversed',
    date: 'July 30',
    timestamp: Date.now() - 600000000,
    reference: 'REV-8812-7819',
    fee: '$0.00',
    icon: 'refresh-circle',
  },
  {
    id: '4',
    type: 'Airtime Top-Up',
    category: 'airtime',
    recipient: 'MTN RW (+250788123456)',
    amount: '-$5.00',
    numericAmount: -5.0,
    status: 'Completed',
    date: 'July 28',
    timestamp: Date.now() - 800000000,
    reference: 'AIR-9912-3401',
    fee: '$0.00',
    icon: 'phone-portrait',
  },
  {
    id: '5',
    type: 'Bill Payment',
    category: 'bill',
    recipient: 'Kigali Water EUCL',
    amount: '-$12.50',
    numericAmount: -12.5,
    status: 'Completed',
    date: 'July 25',
    timestamp: Date.now() - 1000000000,
    reference: 'BILL-4412-9011',
    fee: '$0.00',
    icon: 'flash',
  },
  {
    id: '6',
    type: 'Sent to Mobile',
    category: 'transfer',
    recipient: 'Alice Uwase',
    amount: '-$250.00',
    numericAmount: -250.0,
    status: 'Delivered',
    date: 'July 20',
    timestamp: Date.now() - 1400000000,
    reference: 'AERO-7741-0091',
    fee: '$0.00',
    icon: 'send',
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'transfer', label: 'Transfers' },
  { id: 'deposit', label: 'Deposits' },
  { id: 'bill', label: 'Bills & Airtime' },
  { id: 'failed', label: 'Reversals' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'highest', label: 'Highest Amount' },
  { id: 'lowest', label: 'Lowest Amount' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TransactionCard({
  item,
  colors,
  index,
  onPress,
}: {
  item: ActivityItem;
  colors: any;
  index: number;
  onPress: (item: ActivityItem) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPositive = item.amount.startsWith('+');
  const isFailed = item.status === 'Failed' || item.status === 'Reversed';

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <AnimatedPressable
        style={[
          styles.card,
          { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
          animatedStyle,
        ]}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() => onPress(item)}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isFailed
                ? 'rgba(245, 158, 11, 0.15)'
                : isPositive
                  ? colors.success + '15'
                  : colors.accent + '15',
            },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={22}
            color={isFailed ? '#F59E0B' : isPositive ? colors.success : colors.accent}
          />
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.cardType, { color: colors.text }]}>{item.type}</Text>
          <Text style={[styles.cardRecipient, { color: colors.textSecondary }]}>
            {item.recipient} • {item.date}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={[styles.cardAmount, { color: isPositive ? colors.success : colors.text }]}>
            {item.amount}
          </Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isFailed ? 'rgba(245, 158, 11, 0.15)' : colors.success + '15' },
            ]}
          >
            <Text style={[styles.statusText, { color: isFailed ? '#F59E0B' : colors.success }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ActivityScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Modals
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<ActivityItem | null>(null);

  // Filtered and Sorted Data
  const processedData = useMemo(() => {
    let result = [...EXTENDED_ACTIVITY_DATA];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.type.toLowerCase().includes(q) ||
          item.recipient.toLowerCase().includes(q) ||
          item.reference.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'bill') {
        result = result.filter((item) => item.category === 'bill' || item.category === 'airtime');
      } else {
        result = result.filter((item) => item.category === selectedCategory);
      }
    }

    // Sorting
    switch (selectedSort) {
      case 'oldest':
        result.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'highest':
        result.sort((a, b) => Math.abs(b.numericAmount) - Math.abs(a.numericAmount));
        break;
      case 'lowest':
        result.sort((a, b) => Math.abs(a.numericAmount) - Math.abs(b.numericAmount));
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedSort]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
        <Pressable
          style={[
            styles.sortButton,
            { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
          ]}
          onPress={() => setIsSortModalVisible(true)}
        >
          <Ionicons
            name="swap-vertical"
            size={18}
            color={colors.accent}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.sortButtonText, { color: colors.text }]}>Sort</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          {/* Monthly Summary Cards */}
          <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.summaryRow}>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons
                  name="arrow-down-circle"
                  size={16}
                  color={colors.success}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Money In</Text>
              </View>
              <Text style={[styles.summaryValue, { color: colors.success }]}>+$650.00</Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons
                  name="arrow-up-circle"
                  size={16}
                  color={colors.accent}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Money Out
                </Text>
              </View>
              <Text style={[styles.summaryValue, { color: colors.text }]}>-$367.50</Text>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF', borderColor: colors.divider },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search by recipient, ref, or type..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {searchQuery !== '' && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScrollView}
          >
            {CATEGORY_FILTERS.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedCategory === cat.id ? colors.accent : colors.backgroundElement,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedCategory === cat.id ? '#FFF' : colors.text },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Transactions List */}
          <View style={styles.listSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              RECENT ACTIVITY ({processedData.length})
            </Text>

            {processedData.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={colors.textSecondary}
                  style={{ marginBottom: 12 }}
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No transactions found matching your search or filters.
                </Text>
              </View>
            ) : (
              processedData.map((item, index) => (
                <TransactionCard
                  key={item.id}
                  item={item}
                  colors={colors}
                  index={index}
                  onPress={(tx) => setSelectedTx(tx)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sort Options Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsSortModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sort Transactions By</Text>
              <Pressable onPress={() => setIsSortModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.sortRow,
                  { borderBottomColor: colors.divider },
                  selectedSort === option.id && { backgroundColor: colors.accent + '15' },
                ]}
                onPress={() => {
                  setSelectedSort(option.id);
                  setIsSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortRowText, { color: colors.text }]}>{option.label}</Text>
                {selectedSort === option.id && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Detailed Transaction Receipt Modal */}
      <Modal
        visible={selectedTx !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTx(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedTx(null)}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}>
            {selectedTx && (
              <View>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Transaction Receipt
                  </Text>
                  <Pressable onPress={() => setSelectedTx(null)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.receiptHero}>
                  <Text
                    style={[
                      styles.receiptAmount,
                      { color: selectedTx.amount.startsWith('+') ? colors.success : colors.text },
                    ]}
                  >
                    {selectedTx.amount}
                  </Text>
                  <Text style={[styles.receiptType, { color: colors.textSecondary }]}>
                    {selectedTx.type}
                  </Text>
                </View>

                <View
                  style={[
                    styles.receiptCard,
                    {
                      backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9',
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>
                      Status
                    </Text>
                    <Text style={[styles.receiptValue, { color: colors.success }]}>
                      {selectedTx.status}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>
                      Recipient / Counterparty
                    </Text>
                    <Text style={[styles.receiptValue, { color: colors.text }]}>
                      {selectedTx.recipient}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>
                      Date & Time
                    </Text>
                    <Text style={[styles.receiptValue, { color: colors.text }]}>
                      {selectedTx.date}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>
                      Transaction Reference
                    </Text>
                    <Text style={[styles.receiptValue, { color: colors.text }]}>
                      {selectedTx.reference}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>
                      Network Fee
                    </Text>
                    <Text style={[styles.receiptValue, { color: colors.success }]}>
                      {selectedTx.fee}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                  onPress={() => {
                    setSelectedTx(null);
                    router.push('/(tabs)/send');
                  }}
                >
                  <Text style={styles.actionBtnText}>Repeat Transaction</Text>
                </Pressable>
              </View>
            )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  chipsScrollView: {
    marginBottom: Spacing.four,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listSection: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardRecipient: {
    fontSize: 13,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sortRowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  receiptHero: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  receiptAmount: {
    fontSize: 36,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  receiptType: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  receiptLabel: {
    fontSize: 13,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  actionBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
