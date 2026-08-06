import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, TextInput, Alert, Appearance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useState, useMemo } from 'react';

const { width } = Dimensions.get('window');

const ACCOUNTS = [
  { id: '1', type: 'Current acc', number: '010474808113', balance: '50,550.00 KES' },
  { id: '2', type: 'Savings acc', number: '010998822411', balance: '120,400.00 KES' },
  { id: '3', type: 'USD Wallet', number: '088231149200', balance: '$4,250.00 USD' },
];

const QUICK_ACTIONS = [
  { id: '1', title: 'Transact', icon: 'swap-horizontal', route: '/(tabs)/send' },
  { id: '2', title: 'Account\ninformation', icon: 'document-text', route: '/(tabs)/activity' },
  { id: '3', title: 'Stop\npayment', icon: 'close-circle', route: '/(tabs)/fund' },
  { id: '4', title: 'Manage\ncards', icon: 'card', route: '/(tabs)/fund' },
];

const TRANSACTIONS = [
  { id: '1', title: 'Safaricom PostPay', date: '15 May 2023', amount: '-2,500.00', type: 'debit' },
  { id: '2', title: 'Salary Deposit', date: '12 May 2023', amount: '+120,000.00', type: 'credit' },
  { id: '3', title: 'Netflix Subscription', date: '10 May 2023', amount: '-1,200.00', type: 'debit' },
  { id: '4', title: 'KPLC Tokens', date: '08 May 2023', amount: '-1,500.00', type: 'debit' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActionButton({ action, colors, index }: { action: any; colors: any; index: number }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <AnimatedPressable 
        style={[styles.actionItem, animatedStyle]}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() => router.push(action.route)}
      >
        <View style={[
          styles.actionIconCircle, 
          { 
            backgroundColor: colors.backgroundElement, 
            borderColor: colors.accent,
            borderWidth: 1.5,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }
        ]}>
          <Ionicons name={action.icon as any} size={22} color={colors.accent} />
        </View>
        <Text style={[styles.actionTitle, { color: colors.textSecondary }]} numberOfLines={2}>{action.title}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  // Interactive States
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'completed' | 'in_progress'>('completed');
  const [isFilterActive, setIsFilterActive] = useState(true);

  const activeAccount = ACCOUNTS[activeAccountIndex];

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return TRANSACTIONS;
    return TRANSACTIONS.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const cardBackgroundColor = isDark ? '#7A131A' : '#A51C24';
  const backgroundColor = isDark ? '#121212' : '#F8F9FA';

  const nextAccount = () => {
    setActiveAccountIndex((prev) => (prev + 1) % ACCOUNTS.length);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.push('/profile')}>
              <View style={[styles.profileCircle, { backgroundColor: isDark ? '#333' : '#E8E8E8' }]}>
                <Ionicons name="person" size={24} color={isDark ? '#CCC' : '#888'} />
              </View>
            </Pressable>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => Alert.alert('Notifications', 'You have no new unread notifications.')} style={styles.iconPadding}>
              <Ionicons name="notifications-outline" size={26} color={colors.text} />
              <View style={[styles.notificationBadge, { backgroundColor: colors.accent }]} />
            </Pressable>
          </View>
        </Animated.View>
        
        <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={[styles.greeting, { color: colors.text }]}>
          Manage your accounts and cards, all in one place
        </Animated.Text>

        {/* Swipeable Accounts Label */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.accountsTabContainer}>
          <Pressable onPress={nextAccount}>
            <Text style={[styles.accountsTabText, { color: colors.textSecondary }]}>
              {activeAccount.type} (Tap to switch)
            </Text>
          </Pressable>
        </Animated.View>

        {/* Bank Card (Click to Switch Account) */}
        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()}>
          <Pressable onPress={nextAccount} style={[styles.bankCard, { backgroundColor: cardBackgroundColor }]}>
            <Text style={styles.cardHeader}>My account</Text>
            
            <View style={styles.cardCenter}>
              <Text style={styles.cardAccountType}>{activeAccount.type}</Text>
              <Text style={styles.cardAccountNumber}>{activeAccount.number}</Text>
            </View>
          </Pressable>
          
          {/* Interactive Pagination Dots */}
          <View style={styles.paginationDots}>
            {ACCOUNTS.map((_, i) => (
              <Pressable key={i} onPress={() => setActiveAccountIndex(i)}>
                <View style={[
                  styles.dot, 
                  i === activeAccountIndex ? styles.dotActive : null,
                  { backgroundColor: i === activeAccountIndex ? colors.accent : (isDark ? '#444' : '#D9D9D9') }
                ]} />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Balance Display (Clickable to Hide/Show) */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.balanceContainer}>
          <Pressable onPress={() => setIsBalanceHidden(!isBalanceHidden)} style={{ alignItems: 'center' }}>
            <Text style={[styles.availableBalanceText, { color: colors.textSecondary }]}>Available balance</Text>
            <View style={styles.balanceAmountRow}>
              <Text style={[styles.balanceAmount, { color: colors.text }]}>
                {isBalanceHidden ? '••••••••' : activeAccount.balance}
              </Text>
              <Ionicons 
                name={isBalanceHidden ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={colors.textSecondary} 
                style={{ marginLeft: 8 }} 
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Quick Actions (Circular Icons) */}
        <View style={styles.quickActionsContainer}>
          {QUICK_ACTIONS.map((action, index) => (
            <ActionButton key={action.id} action={action} colors={colors} index={index} />
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        {/* Transaction History Section */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction history</Text>
          
          <View style={styles.searchRow}>
            <View style={[styles.searchInputContainer, { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF', borderColor: colors.divider }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
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
              style={[styles.filterButton, { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF', borderColor: isFilterActive ? colors.accent : colors.divider }]}
            >
              <Ionicons name="options-outline" size={24} color={isFilterActive ? colors.accent : colors.textSecondary} />
            </Pressable>
          </View>
          
          {/* Date Filter Pill */}
          {isFilterActive && (
            <View style={styles.dateTabsContainer}>
              <Pressable onPress={() => setIsFilterActive(false)} style={[styles.dateTab, styles.dateTabActive, { backgroundColor: colors.backgroundElement, borderColor: colors.accent }]}>
                <Text style={[styles.dateTabText, { color: colors.accent }]}>15 Jun - 15 May 2023</Text>
                <Ionicons name="close-circle" size={16} color={colors.accent} style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          )}

          {/* Sub-tabs */}
          <View style={[styles.subTabsContainer, { borderBottomColor: colors.divider }]}>
            <Pressable 
              onPress={() => setActiveSubTab('completed')}
              style={[styles.subTab, activeSubTab === 'completed' && [styles.subTabActive, { borderBottomColor: colors.accent }]]}
            >
              <Text style={[activeSubTab === 'completed' ? styles.subTabTextActive : styles.subTabText, { color: activeSubTab === 'completed' ? colors.accent : colors.textSecondary }]}>
                Completed
              </Text>
            </Pressable>
            
            <Pressable 
              onPress={() => setActiveSubTab('in_progress')}
              style={[styles.subTab, activeSubTab === 'in_progress' && [styles.subTabActive, { borderBottomColor: colors.accent }]]}
            >
              <Text style={[activeSubTab === 'in_progress' ? styles.subTabTextActive : styles.subTabText, { color: activeSubTab === 'in_progress' ? colors.accent : colors.textSecondary }]}>
                In progress (0)
              </Text>
            </Pressable>
          </View>

          {/* Transactions List / Empty State */}
          {activeSubTab === 'in_progress' ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions currently in progress.</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>15 May</Text>
              {filteredTransactions.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary, marginVertical: 20 }]}>No transactions found matching "{searchQuery}".</Text>
              ) : (
                filteredTransactions.map((tx) => (
                  <View key={tx.id} style={[styles.transactionItem, { borderBottomColor: colors.divider }]}>
                    <View style={[styles.txIcon, { backgroundColor: isDark ? '#2C2C2C' : '#F0F0F0' }]}>
                      <Ionicons 
                        name={tx.type === 'debit' ? 'arrow-up-outline' : 'arrow-down-outline'} 
                        size={16} 
                        color={tx.type === 'debit' ? colors.textSecondary : colors.success} 
                      />
                    </View>
                    <View style={styles.txDetails}>
                      <Text style={[styles.txTitle, { color: colors.text }]}>{tx.title}</Text>
                      <Text style={[styles.txDate, { color: colors.textSecondary }]}>{tx.date}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: tx.type === 'debit' ? colors.text : colors.success }]}>
                      {tx.amount}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </Animated.View>
        
        <View style={{ height: 80 }} />
      </ScrollView>
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
    padding: 24,
    minHeight: 180,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#A51C24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cardCenter: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
  },
  cardAccountType: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardAccountNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
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
    marginBottom: 8,
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.half,
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 64) / 4,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
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
});
