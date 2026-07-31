import { StyleSheet, Text, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

const ACTIVITY_DATA = [
  { id: '1', type: 'Sent to Mobile', recipient: 'J. M.', amount: '-$100.00', status: 'Delivered', date: 'Today, 10:42 AM' },
  { id: '2', type: 'Bank Deposit', recipient: 'Standard Chart.', amount: '+$500.00', status: 'Completed', date: 'Yesterday' },
  { id: '3', type: 'Airtime', recipient: 'MTN RW', amount: '-$5.00', status: 'Completed', date: 'July 28' },
  { id: '4', type: 'Bill Payment', recipient: 'Kigali Water', amount: '-$12.50', status: 'Completed', date: 'July 25' },
];

export default function ActivityScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
      </View>

      <FlatList
        data={ACTIVITY_DATA}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.activityCard, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.activityRow}>
              <View style={styles.activityLeft}>
                <Text style={[styles.activityType, { color: colors.text }]}>{item.type}</Text>
                <Text style={[styles.activityRecipient, { color: colors.textSecondary }]}>{item.recipient} • {item.date}</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[
                  styles.activityAmount, 
                  { color: item.amount.startsWith('+') ? colors.success : colors.text }
                ]}>
                  {item.amount}
                </Text>
                <Text style={[styles.activityStatus, { color: colors.textSecondary }]}>{item.status}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.four,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.four,
  },
  activityCard: {
    padding: Spacing.four,
    borderRadius: 12,
    marginBottom: Spacing.two,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityRecipient: {
    fontSize: 13,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 12,
  },
});
