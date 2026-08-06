import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useState, useMemo, useEffect } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useToast } from '@/context/ToastContext';
import {
  subscribeOutboxQueue,
  startAutoSyncPoller,
  drainOutboxQueue,
  OutboxItem,
} from '@/services/outbox';

const ACCOUNTS = [
  {
    id: '1',
    type: 'Current acc',
    number: '010474808113',
    balance: '50,550.00 KES',
    cardHolder: 'SHEMA ARAFATI',
  },
  {
    id: '2',
    type: 'Savings acc',
    number: '010998822411',
    balance: '120,400.00 KES',
    cardHolder: 'SHEMA ARAFATI',
  },
  {
    id: '3',
    type: 'USD Wallet',
    number: '088231149200',
    balance: '$4,250.00 USD',
    cardHolder: 'SHEMA ARAFATI',
  },
];

const QUICK_ACTIONS = [
  { id: '1', title: 'Transact', icon: 'swap-horizontal', route: '/(tabs)/send' },
  { id: '2', title: 'Statement', icon: 'document-text', route: '/(tabs)/activity' },
  { id: '3', title: 'Top-Up', icon: 'close-circle', route: '/(tabs)/fund' },
  { id: '4', title: 'Cards', icon: 'card', route: '/(tabs)/fund' },
];

const CONNECTED_CARDS = [
  {
    id: 'card1',
    title: 'Aeropay Platinum Debit',
    type: 'VISA',
    number: '•••• •••• •••• 4808',
    exp: '12/28',
    isDefault: true,
    color: '#7A131A',
  },
  {
    id: 'card2',
    title: 'Aeropay Gold Credit',
    type: 'MASTERCARD',
    number: '•••• •••• •••• 9210',
    exp: '08/27',
    isDefault: false,
    color: '#1B2A4A',
  },
  {
    id: 'card3',
    title: 'KCB Direct Mobile Bank',
    type: 'BANK',
    number: '•••• •••• 1134',
    exp: 'N/A',
    isDefault: false,
    color: '#064E3B',
  },
];

const TRANSACTIONS = [
  {
    id: '1',
    title: 'Safaricom PostPay',
    date: '15 May 2023',
    amount: '-2,500.00 KES',
    type: 'debit',
    icon: 'receipt-outline',
  },
  {
    id: '2',
    title: 'Salary Deposit',
    date: '12 May 2023',
    amount: '+120,000.00 KES',
    type: 'credit',
    icon: 'arrow-down-circle-outline',
  },
  {
    id: '3',
    title: 'Netflix Subscription',
    date: '10 May 2023',
    amount: '-1,200.00 KES',
    type: 'debit',
    icon: 'tv-outline',
  },
  {
    id: '4',
    title: 'KPLC Tokens',
    date: '08 May 2023',
    amount: '-1,500.00 KES',
    type: 'debit',
    icon: 'flash-outline',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActionButton({
  action,
  colors,
  index,
  onPress,
}: {
  action: any;
  colors: any;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} className="w-[23%]">
      <AnimatedPressable
        className="w-full flex-col items-center justify-center py-3 px-1 rounded-2xl shadow-sm"
        style={[
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.divider,
            borderWidth: 1.5,
          },
          animatedStyle,
        ]}
        onPressIn={() => (scale.value = withSpring(0.93))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
      >
        <View
          className="w-11 h-11 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: colors.accent + '15' }}
        >
          <Ionicons name={action.icon as any} size={20} color={colors.accent} />
        </View>
        <Text
          className="text-[11px] font-bold text-center font-sans"
          style={{ color: colors.text }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {action.title}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const { showToast } = useToast();

  // Interactive States
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'completed' | 'in_progress'>('completed');
  const [isFilterActive, setIsFilterActive] = useState(true);

  // Modals
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: '1',
      title: 'Salary Deposit Received',
      desc: '+120,000 KES deposited into your Savings Account',
      time: '10 min ago',
      unread: true,
      type: 'credit',
    },
    {
      id: '2',
      title: 'Remittance Rate Locked',
      desc: 'USD → RWF rate guaranteed at $1 = 1,305.00 RWF',
      time: '1 hour ago',
      unread: true,
      type: 'info',
    },
    {
      id: '3',
      title: 'Security Alert',
      desc: 'New login detected from Web Browser (Nairobi, Kenya)',
      time: 'Yesterday',
      unread: false,
      type: 'warning',
    },
    {
      id: '4',
      title: 'Card Freeze Status',
      desc: 'Aeropay Gold Credit card status updated',
      time: '2 days ago',
      unread: false,
      type: 'info',
    },
  ]);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [statementRange, setStatementRange] = useState<'3' | '6' | '12' | 'custom'>('3');
  const [customFromDate, setCustomFromDate] = useState('2026-02-01');
  const [customToDate, setCustomToDate] = useState('2026-05-15');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [frozenCards, setFrozenCards] = useState<{ [key: string]: boolean }>({});
  const [outboxQueue, setOutboxQueue] = useState<OutboxItem[]>([]);
  const [isSyncingOutbox, setIsSyncingOutbox] = useState(false);

  useEffect(() => {
    startAutoSyncPoller();
    const unsubscribe = subscribeOutboxQueue((items) => setOutboxQueue(items));
    return () => unsubscribe();
  }, []);

  const pendingOutboxCount = useMemo(
    () => outboxQueue.filter((i) => i.status === 'queued' || i.status === 'failed').length,
    [outboxQueue]
  );

  const handleManualOutboxSync = async () => {
    setIsSyncingOutbox(true);
    const { processed, failed } = await drainOutboxQueue();
    setIsSyncingOutbox(false);
    if (processed > 0) {
      showToast(`Synced ${processed} offline transaction(s)!`, 'success');
    } else if (failed > 0) {
      showToast(`Outbox sync attempted (${failed} retried)`, 'info');
    }
  };

  // Animations
  const cardScale = useSharedValue(1);

  const activeAccount = ACCOUNTS[activeAccountIndex];

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return TRANSACTIONS;
    return TRANSACTIONS.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const cardBackgroundColor = isDark ? '#7A131A' : '#A51C24';
  const backgroundColor = isDark ? '#121212' : '#F8F9FA';

  const nextAccount = () => {
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    setActiveAccountIndex((prev) => (prev + 1) % ACCOUNTS.length);
  };

  const handleQuickAction = (actionId: string, route: string) => {
    if (actionId === '1') {
      router.push('/(tabs)/send');
    } else if (actionId === '2') {
      setIsStatementModalOpen(true);
    } else if (actionId === '3') {
      router.push('/(tabs)/fund');
    } else if (actionId === '4') {
      setIsCardsModalOpen(true);
    } else {
      router.push(route as any);
    }
  };

  const toggleFreezeCard = (cardId: string, title: string) => {
    const nextState = !frozenCards[cardId];
    setFrozenCards((prev) => ({ ...prev, [cardId]: nextState }));
    showToast(nextState ? `${title} frozen` : `${title} active`, nextState ? 'info' : 'success');
  };

  const generatePDFStatement = async () => {
    setIsGeneratingPDF(true);
    let rangeLabel = 'Last 3 Months';
    if (statementRange === '6') rangeLabel = 'Last 6 Months';
    else if (statementRange === '12') rangeLabel = 'Last 12 Months';
    else if (statementRange === 'custom') rangeLabel = `${customFromDate} to ${customToDate}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 32px; color: #0F172A; background: #FFFFFF; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #800020; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { font-size: 26px; font-weight: 800; color: #800020; letter-spacing: 1px; }
            .subtitle { font-size: 13px; color: #64748B; margin-top: 4px; font-weight: 500; }
            .badge { background: #80002015; color: #800020; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 11px; border: 1px solid #80002030; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 28px; }
            .info-item { display: flex; flex-direction: column; }
            .label { font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
            .val { font-size: 15px; color: #0F172A; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #F1F5F9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; padding: 12px 10px; border-bottom: 2px solid #CBD5E1; }
            td { padding: 14px 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #334155; }
            .debit { color: #DC2626; font-weight: 700; }
            .credit { color: #16A34A; font-weight: 700; }
            .footer { margin-top: 45px; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 20px; color: #94A3B8; font-size: 11px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">AEROPAY NETWORK</div>
              <div class="subtitle">Official Financial Account Statement</div>
            </div>
            <div class="badge">OFFICIAL DOCUMENT</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="label">Account Holder</span>
              <span class="val">${activeAccount.cardHolder}</span>
            </div>
            <div class="info-item">
              <span class="label">Statement Period</span>
              <span class="val">${rangeLabel}</span>
            </div>
            <div class="info-item" style="margin-top: 8px;">
              <span class="label">Account Type & Number</span>
              <span class="val">${activeAccount.type} (${activeAccount.number})</span>
            </div>
            <div class="info-item" style="margin-top: 8px;">
              <span class="label">Available Balance</span>
              <span class="val" style="color: #800020;">${activeAccount.balance}</span>
            </div>
          </div>

          <h3 style="font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">Transaction Record</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${TRANSACTIONS.map(
                (tx) => `
                <tr>
                  <td>${tx.date}</td>
                  <td style="font-weight: 600;">${tx.title}</td>
                  <td>Financial Transfer</td>
                  <td><span class="${tx.type}">${tx.type.toUpperCase()}</span></td>
                  <td style="text-align: right;" class="${tx.type}">${tx.amount}</td>
                </tr>
              `
              ).join('')}
              <tr>
                <td>01 May 2023</td>
                <td style="font-weight: 600;">M-PESA Wallet Top-Up</td>
                <td>Mobile Money</td>
                <td><span class="credit">CREDIT</span></td>
                <td style="text-align: right;" class="credit">+35,000.00 KES</td>
              </tr>
              <tr>
                <td>28 Apr 2023</td>
                <td style="font-weight: 600;">Supermarket Groceries</td>
                <td>Merchant Payment</td>
                <td><span class="debit">DEBIT</span></td>
                <td style="text-align: right;" class="debit">-4,850.00 KES</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>This statement is an official computer-generated document from Aeropay Network Inc.</p>
            <p>For support or verification, visit aeropay.network or contact compliance@aeropay.network</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      setIsGeneratingPDF(false);
      setIsStatementModalOpen(false);
      showToast(`Statement PDF generated (${rangeLabel})`, 'success');

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Aeropay Statement PDF',
        });
      } else {
        await Print.printAsync({ html: htmlContent });
      }
    } catch {
      setIsGeneratingPDF(false);
      showToast('Failed to generate PDF statement', 'error');
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          {/* Header Section */}
          <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => router.push('/profile')}>
                <View
                  style={[styles.profileCircle, { backgroundColor: isDark ? '#333' : '#E8E8E8' }]}
                >
                  <Ionicons name="person" size={22} color={isDark ? '#CCC' : '#888'} />
                </View>
              </Pressable>
            </View>
            <View style={styles.headerRight}>
              <Pressable
                onPress={() => setIsNotificationModalOpen(true)}
                style={styles.iconPadding}
              >
                <Ionicons name="notifications-outline" size={26} color={colors.text} />
                {notificationsList.some((n) => n.unread) && (
                  <View style={[styles.notificationBadge, { backgroundColor: colors.accent }]} />
                )}
              </Pressable>
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(100).duration(500)}
            style={[styles.greeting, { color: colors.text }]}
          >
            Manage your accounts and cards, all in one place
          </Animated.Text>

          {/* Account Tab Switcher */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={styles.accountsTabContainer}
          >
            <Pressable onPress={nextAccount}>
              <Text style={[styles.accountsTabText, { color: colors.textSecondary }]}>
                {activeAccount.type}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Premium Bank Card */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={cardAnimatedStyle}
          >
            <Pressable
              onPress={nextAccount}
              style={[styles.bankCard, { backgroundColor: cardBackgroundColor }]}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardHeader}>Aeropay Network</Text>
                <Ionicons name="wifi-outline" size={22} color="#FFF" style={{ opacity: 0.8 }} />
              </View>

              <View style={styles.cardMiddleRow}>
                <Ionicons name="hardware-chip-outline" size={32} color="#FFD700" />
                <Text style={styles.cardAccountType}>{activeAccount.type}</Text>
              </View>

              <View style={styles.cardBottomRow}>
                <Text style={styles.cardHolder}>{activeAccount.cardHolder}</Text>
                <Text style={styles.cardAccountNumber}>{activeAccount.number}</Text>
              </View>
            </Pressable>

            {/* Interactive Pagination Dots */}
            <View style={styles.paginationDots}>
              {ACCOUNTS.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    cardScale.value = withSequence(
                      withTiming(0.95, { duration: 100 }),
                      withSpring(1)
                    );
                    setActiveAccountIndex(i);
                  }}
                >
                  <View
                    style={[
                      styles.dot,
                      i === activeAccountIndex ? styles.dotActive : null,
                      {
                        backgroundColor:
                          i === activeAccountIndex ? colors.accent : isDark ? '#444' : '#D9D9D9',
                      },
                    ]}
                  />
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Balance Display */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.balanceContainer}
          >
            <Pressable
              onPress={() => setIsBalanceHidden(!isBalanceHidden)}
              style={{ alignItems: 'center' }}
            >
              <Text style={[styles.availableBalanceText, { color: colors.textSecondary }]}>
                Available balance
              </Text>
              <View style={styles.balanceAmountRow}>
                <Text style={[styles.balanceAmount, { color: colors.text }]}>
                  {isBalanceHidden ? '••••••••' : activeAccount.balance}
                </Text>
                <Ionicons
                  name={isBalanceHidden ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color={colors.textSecondary}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </Pressable>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {QUICK_ACTIONS.map((action, index) => (
              <ActionButton
                key={action.id}
                action={action}
                colors={colors}
                index={index}
                onPress={() => handleQuickAction(action.id, action.route)}
              />
            ))}
          </View>

          {/* Offline Outbox Pending Banner */}
          {pendingOutboxCount > 0 && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 18,
                backgroundColor: '#F59E0B15',
                borderWidth: 1.5,
                borderColor: '#F59E0B',
                marginTop: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <Ionicons name="cloud-offline" size={22} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                    {pendingOutboxCount} Pending Offline Transfer(s)
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    Queued safely with client idempotency key
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleManualOutboxSync}
                disabled={isSyncingOutbox}
                style={{
                  backgroundColor: '#F59E0B',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 14,
                }}
              >
                {isSyncingOutbox ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                    Sync Now
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          )}

          {/* Ask AeroPay AI Assistant Prominent Banner Launcher */}
          <Pressable
            onPress={() => router.push('/assistant')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderRadius: 20,
              backgroundColor: isDark ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              borderWidth: 1.5,
              borderColor: colors.accent,
              marginTop: 16,
              marginBottom: 16,
              elevation: 4,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="sparkles" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                    Ask AeroPay AI Copilot
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.accent + '20',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.accent }}>
                      ONLINE
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  Check transfers, explain FX fees, or draft a payment
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.accent} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Transaction History Section */}
          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction history</Text>

            <View style={styles.searchRow}>
              <View
                style={[
                  styles.searchInputContainer,
                  { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF', borderColor: colors.divider },
                ]}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  placeholder="Search transactions..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {searchQuery !== '' && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={() => setIsFilterActive(!isFilterActive)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF',
                    borderColor: isFilterActive ? colors.accent : colors.divider,
                  },
                ]}
              >
                <Ionicons
                  name="options-outline"
                  size={24}
                  color={isFilterActive ? colors.accent : colors.textSecondary}
                />
              </Pressable>
            </View>

            {/* Date Filter Pill */}
            {isFilterActive && (
              <View style={styles.dateTabsContainer}>
                <Pressable
                  onPress={() => setIsFilterActive(false)}
                  style={[
                    styles.dateTab,
                    styles.dateTabActive,
                    { backgroundColor: colors.backgroundElement, borderColor: colors.accent },
                  ]}
                >
                  <Text style={[styles.dateTabText, { color: colors.accent }]}>
                    15 Jun - 15 May 2023
                  </Text>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.accent}
                    style={{ marginLeft: 6 }}
                  />
                </Pressable>
              </View>
            )}

            {/* Sub-tabs */}
            <View style={[styles.subTabsContainer, { borderBottomColor: colors.divider }]}>
              <Pressable
                onPress={() => setActiveSubTab('completed')}
                style={[
                  styles.subTab,
                  activeSubTab === 'completed' && [
                    styles.subTabActive,
                    { borderBottomColor: colors.accent },
                  ],
                ]}
              >
                <Text
                  style={[
                    activeSubTab === 'completed' ? styles.subTabTextActive : styles.subTabText,
                    { color: activeSubTab === 'completed' ? colors.accent : colors.textSecondary },
                  ]}
                >
                  Completed
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveSubTab('in_progress')}
                style={[
                  styles.subTab,
                  activeSubTab === 'in_progress' && [
                    styles.subTabActive,
                    { borderBottomColor: colors.accent },
                  ],
                ]}
              >
                <Text
                  style={[
                    activeSubTab === 'in_progress' ? styles.subTabTextActive : styles.subTabText,
                    {
                      color: activeSubTab === 'in_progress' ? colors.accent : colors.textSecondary,
                    },
                  ]}
                >
                  In Progress (0)
                </Text>
              </Pressable>
            </View>

            {/* Transactions List */}
            {activeSubTab === 'in_progress' ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="time-outline"
                  size={48}
                  color={colors.textSecondary}
                  style={{ marginBottom: 12 }}
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No transactions currently in progress.
                </Text>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>15 May</Text>
                {filteredTransactions.length === 0 ? (
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary, marginVertical: 20 }]}
                  >
                    No transactions found matching "{searchQuery}".
                  </Text>
                ) : (
                  filteredTransactions.map((tx) => (
                    <View
                      key={tx.id}
                      style={[styles.transactionItem, { borderBottomColor: colors.divider }]}
                    >
                      <View
                        style={[styles.txIcon, { backgroundColor: isDark ? '#2C2C2C' : '#F0F0F0' }]}
                      >
                        <Ionicons
                          name={tx.icon as any}
                          size={18}
                          color={tx.type === 'debit' ? colors.textSecondary : colors.success}
                        />
                      </View>
                      <View style={styles.txDetails}>
                        <Text style={[styles.txTitle, { color: colors.text }]}>{tx.title}</Text>
                        <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                          {tx.date}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.txAmount,
                          { color: tx.type === 'debit' ? colors.text : colors.success },
                        ]}
                      >
                        {tx.amount}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </Animated.View>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* STATEMENT MODAL */}
      <Modal
        visible={isStatementModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsStatementModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#1E1E24' : '#FFFFFF', borderColor: colors.divider },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Export Account Statement
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Select time range for PDF statement
                </Text>
              </View>
              <Pressable
                onPress={() => setIsStatementModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
              Time Range
            </Text>
            <View style={styles.rangeOptionsRow}>
              {[
                { id: '3', label: '3 Months' },
                { id: '6', label: '6 Months' },
                { id: '12', label: '12 Months' },
                { id: 'custom', label: 'Custom' },
              ].map((range) => (
                <Pressable
                  key={range.id}
                  onPress={() => setStatementRange(range.id as any)}
                  style={[
                    styles.rangeChip,
                    {
                      backgroundColor:
                        statementRange === range.id
                          ? colors.accent
                          : isDark
                            ? '#2C2C35'
                            : '#F1F5F9',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rangeChipText,
                      { color: statementRange === range.id ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {statementRange === 'custom' && (
              <View style={styles.customDateContainer}>
                <View style={styles.dateInputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    From Date
                  </Text>
                  <TextInput
                    value={customFromDate}
                    onChangeText={setCustomFromDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.divider }]}
                  />
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>To Date</Text>
                  <TextInput
                    value={customToDate}
                    onChangeText={setCustomToDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.divider }]}
                  />
                </View>
              </View>
            )}

            <View
              style={[styles.statementMetaBox, { backgroundColor: isDark ? '#2A2A35' : '#F8FAFC' }]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.accent}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.statementMetaText, { color: colors.textSecondary }]}>
                Includes official Aeropay logo, verification stamp, balance summary, and full
                transaction history.
              </Text>
            </View>

            <Pressable
              onPress={generatePDFStatement}
              disabled={isGeneratingPDF}
              style={[styles.primaryModalBtn, { backgroundColor: colors.accent }]}
            >
              {isGeneratingPDF ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryModalBtnText}>Generate & Share PDF</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* CONNECTED CARDS MODAL */}
      <Modal
        visible={isCardsModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCardsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1E1E24' : '#FFFFFF',
                borderColor: colors.divider,
                maxHeight: '85%',
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Connected Cards & Banks
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Manage payment cards linked to Aeropay
                </Text>
              </View>
              <Pressable onPress={() => setIsCardsModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
              {CONNECTED_CARDS.map((card) => {
                const isFrozen = !!frozenCards[card.id];
                return (
                  <View
                    key={card.id}
                    style={[styles.connectedCardItem, { backgroundColor: card.color }]}
                  >
                    <View style={styles.connectedCardTop}>
                      <Text style={styles.connectedCardTitle}>{card.title}</Text>
                      <View style={styles.cardTypeBadge}>
                        <Text style={styles.cardTypeBadgeText}>{card.type}</Text>
                      </View>
                    </View>

                    <Text style={styles.connectedCardNumber}>{card.number}</Text>

                    <View style={styles.connectedCardBottom}>
                      <Text style={styles.connectedCardExp}>Exp: {card.exp}</Text>
                      <Pressable
                        onPress={() => toggleFreezeCard(card.id, card.title)}
                        style={[
                          styles.freezeBtn,
                          { backgroundColor: isFrozen ? '#DC2626' : 'rgba(255,255,255,0.2)' },
                        ]}
                      >
                        <Ionicons
                          name={isFrozen ? 'lock-closed' : 'lock-open-outline'}
                          size={14}
                          color="#FFF"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.freezeBtnText}>
                          {isFrozen ? 'Unfreeze' : 'Freeze Card'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => {
                showToast('Card linking interface opened', 'info');
              }}
              style={[styles.secondaryModalBtn, { borderColor: colors.accent }]}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={colors.accent}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.secondaryModalBtnText, { color: colors.accent }]}>
                Link New Card or Bank
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* NOTIFICATION CENTER MODAL */}
      <Modal
        visible={isNotificationModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNotificationModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1E1E24' : '#FFFFFF',
                borderColor: colors.divider,
                maxHeight: '85%',
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Notification Center</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {notificationsList.filter((n) => n.unread).length} unread alerts
                </Text>
              </View>
              <Pressable
                onPress={() => setIsNotificationModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
              {notificationsList.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.notificationItemCard,
                    {
                      backgroundColor: isDark ? '#2C2C35' : '#F8FAFC',
                      borderColor: item.unread ? colors.accent : colors.divider,
                      borderWidth: item.unread ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.notificationHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Ionicons
                        name={
                          item.type === 'credit'
                            ? 'cash-outline'
                            : item.type === 'warning'
                              ? 'warning-outline'
                              : 'information-circle-outline'
                        }
                        size={18}
                        color={
                          item.type === 'credit'
                            ? colors.success
                            : item.type === 'warning'
                              ? colors.error
                              : colors.accent
                        }
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.notificationTitle,
                          { color: colors.text, fontWeight: item.unread ? '700' : '600' },
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                      {item.time}
                    </Text>
                  </View>

                  <Text style={[styles.notificationDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => {
                  setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
                  showToast('All notifications marked as read', 'success');
                }}
                style={[styles.secondaryModalBtn, { flex: 1, borderColor: colors.divider }]}
              >
                <Text style={[styles.secondaryModalBtnText, { color: colors.text }]}>
                  Mark All Read
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsNotificationModalOpen(false)}
                style={[styles.primaryModalBtn, { flex: 1, backgroundColor: colors.accent }]}
              >
                <Text style={styles.primaryModalBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    paddingTop: Spacing.two,
    paddingBottom: 20,
  },
  responsiveWrapper: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    position: 'relative',
  },
  iconPadding: {
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: Spacing.four,
    lineHeight: 28,
  },
  accountsTabContainer: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  accountsTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bankCard: {
    borderRadius: 20,
    padding: 22,
    height: 195,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardAccountType: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBottomRow: {
    marginTop: 'auto',
  },
  cardHolder: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    opacity: 0.85,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardAccountNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: Spacing.four,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  availableBalanceText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter',
    letterSpacing: -0.5,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  actionItemWrapper: {
    width: '23%',
  },
  actionItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: Spacing.five,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: Spacing.four,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTabsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  dateTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dateTabActive: {},
  dateTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: Spacing.four,
  },
  subTab: {
    paddingVertical: 12,
    marginRight: Spacing.five,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {},
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTabTextActive: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    paddingBottom: Spacing.five,
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
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.two,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 13,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  rangeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rangeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  rangeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInputWrapper: {
    width: '48%',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  statementMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  statementMetaText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  primaryModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 10,
  },
  secondaryModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  connectedCardItem: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  connectedCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  connectedCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  connectedCardNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  connectedCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedCardExp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  freezeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  freezeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  notificationItemCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 14,
  },
  notificationTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  notificationDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 26,
  },
});
