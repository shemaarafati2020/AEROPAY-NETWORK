import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

export default function SendRecipientScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const isResolved = phoneNumber.length >= 8; // Mock resolution logic

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: colors.textSecondary, fontSize: 24 }}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>To Who?</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile Number</Text>
        <View style={[styles.inputWrapper, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.prefix, { color: colors.text }]}>+250</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            keyboardType="phone-pad"
            placeholder="788 123 456"
            placeholderTextColor={colors.textSecondary}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoFocus
          />
        </View>
      </View>

      {isResolved ? (
        <View style={[styles.resolvedCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.resolvedHeader}>
            <View style={[styles.networkIcon, { backgroundColor: '#FFCC00' }]} />
            <Text style={[styles.networkName, { color: colors.textSecondary }]}>MTN Mobile Money — Rwanda</Text>
          </View>
          <Text style={[styles.accountName, { color: colors.text }]}>J•••• M••••</Text>
          <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>+250 {phoneNumber}</Text>
        </View>
      ) : (
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentList}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.recentAvatar, { backgroundColor: colors.backgroundElement }]}>
                <Text style={{ color: colors.text }}>JM</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Pressable 
        style={[
          styles.nextButton, 
          { backgroundColor: isResolved ? colors.accent : colors.divider }
        ]}
        disabled={!isResolved}
        onPress={() => router.push('/(tabs)/send/confirm')}
      >
        <Text style={[
          styles.nextButtonText,
          { color: isResolved ? '#FFFFFF' : colors.textSecondary }
        ]}>Continue</Text>
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
  inputContainer: {
    marginTop: Spacing.five,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: Spacing.two,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: Spacing.two,
  },
  prefix: {
    fontSize: 32,
    fontWeight: '600',
    marginRight: Spacing.two,
    fontVariant: ['tabular-nums'],
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  resolvedCard: {
    marginTop: Spacing.five,
    padding: Spacing.four,
    borderRadius: 16,
  },
  resolvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
    gap: 8,
  },
  networkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  networkName: {
    fontSize: 14,
  },
  accountName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  recentSection: {
    marginTop: Spacing.five,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: Spacing.three,
  },
  recentList: {
    flexDirection: 'row',
  },
  recentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: Spacing.four,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
