import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

export default function FundScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const methods = [
    { id: '1', title: 'Bank Transfer', subtitle: 'Takes 1-2 business days', icon: '🏦' },
    { id: '2', title: 'Credit or Debit Card', subtitle: 'Instant, 2% fee', icon: '💳' },
    { id: '3', title: 'Connect Wallet', subtitle: 'USDC/USDT on Polygon', icon: '🦊' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Money</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Select Funding Method</Text>

        {methods.map((method) => (
          <Pressable 
            key={method.id}
            style={[styles.methodCard, { backgroundColor: colors.backgroundElement }]}
            onPress={() => router.back()}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Text style={styles.icon}>{method.icon}</Text>
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodTitle, { color: colors.text }]}>{method.title}</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>{method.subtitle}</Text>
            </View>
            <Text style={{ color: colors.textSecondary }}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
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
  content: {
    padding: Spacing.four,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: Spacing.four,
    fontWeight: '500',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  icon: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 13,
  },
});
