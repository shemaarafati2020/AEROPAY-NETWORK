import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Link, router } from 'expo-router';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { id: '1', title: 'Send to\nMobile', icon: 'M', route: '/(tabs)/send' },
  { id: '2', title: 'Add\nMoney', icon: '+', route: '/(tabs)/fund' },
  { id: '3', title: 'Pay\nBills', icon: 'B', route: '/(tabs)/fund' },
  { id: '4', title: 'Buy\nAirtime', icon: 'A', route: '/(tabs)/fund' },
];

export default function HomeScreen() {
  const scheme = useColorScheme();
  // Force light theme or adapt. Equity is mostly light. Let's use standard resolution.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.profileCircle, { borderColor: colors.accent }]}>
            <Text style={[styles.profileText, { color: colors.accent }]}>JM</Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Home</Text>
          <View style={[styles.notificationCircle, { borderColor: colors.accent }]}>
            <Text style={[styles.notificationIcon, { color: colors.accent }]}>🔔</Text>
            <View style={styles.notificationBadge} />
          </View>
        </View>

        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good afternoon, J.M.Other</Text>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable 
              key={action.id} 
              style={styles.actionItem}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.actionIconText, { color: colors.accent }]}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionTitle, { color: colors.textSecondary }]}>{action.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.balanceLabel, { color: colors.text }]}>My balance</Text>
          <Pressable style={styles.showBalanceBtn}>
            <Text style={[styles.showBalanceText, { color: colors.accent }]}>Show balance 👁</Text>
          </Pressable>
        </View>

        {/* Floating Core Actions */}
        <View style={[styles.floatingCard, { backgroundColor: colors.backgroundElement, shadowColor: colors.text }]}>
          <Pressable style={styles.floatingAction} onPress={() => router.push('/(tabs)/send')}>
            <View style={[styles.floatingIconCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.floatingIconText}>💸</Text>
            </View>
            <Text style={[styles.floatingActionText, { color: colors.text }]}>Transact</Text>
          </Pressable>
          <Pressable style={styles.floatingAction} onPress={() => router.push('/(tabs)/fund')}>
            <View style={[styles.floatingIconCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.floatingIconText}>💳</Text>
            </View>
            <Text style={[styles.floatingActionText, { color: colors.text }]}>Fund</Text>
          </Pressable>
          <Pressable style={styles.floatingAction} onPress={() => router.push('/(tabs)/activity')}>
            <View style={[styles.floatingIconCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.floatingIconText}>📊</Text>
            </View>
            <Text style={[styles.floatingActionText, { color: colors.text }]}>Activity</Text>
          </Pressable>
        </View>

        {/* Accounts / Activity Section */}
        <View style={styles.accountsHeader}>
          <Text style={[styles.accountsTitle, { color: colors.text }]}>My accounts</Text>
          <Text style={[styles.viewAllText, { color: colors.accent }]}>View all</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountsScroll}>
          <View style={[styles.accountCard, { backgroundColor: colors.accent }]}>
            <View style={styles.accountCardTop}>
              <Text style={styles.accountName}>Main Wallet</Text>
              <Text style={styles.accountMore}>•••</Text>
            </View>
            <Text style={styles.accountBalance}>1,240.00 USD</Text>
            <Text style={styles.accountNumber}>1234567890 • Standard</Text>
          </View>
          <View style={[styles.accountCard, { backgroundColor: colors.accent }]}>
            <View style={styles.accountCardTop}>
              <Text style={styles.accountName}>Savings Vault</Text>
              <Text style={styles.accountMore}>•••</Text>
            </View>
            <Text style={styles.accountBalance}>33,500.00 RWF</Text>
            <Text style={styles.accountNumber}>0987654321 • Savings</Text>
          </View>
        </ScrollView>
        
        <View style={{ height: 40 }} />
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
    marginBottom: Spacing.four,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  notificationCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  greeting: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: Spacing.four,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 48) / 4,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIconText: {
    fontSize: 24,
    fontWeight: '600',
  },
  actionTitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 30,
    marginBottom: Spacing.five,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  showBalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showBalanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  floatingCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.five,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  floatingAction: {
    alignItems: 'center',
  },
  floatingIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  floatingIconText: {
    fontSize: 28,
  },
  floatingActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  accountsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountsScroll: {
    marginHorizontal: -Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  accountCard: {
    width: width * 0.7,
    height: 140,
    borderRadius: 16,
    padding: Spacing.four,
    marginRight: Spacing.three,
    justifyContent: 'space-between',
  },
  accountCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  accountMore: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -8,
  },
  accountBalance: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  accountNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
});
