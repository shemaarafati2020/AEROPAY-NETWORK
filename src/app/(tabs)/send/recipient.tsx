import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import QRScannerModal from '@/components/QRScannerModal';

interface Recipient {
  id: string;
  name: string;
  phone: string;
  provider: string;
  initials: string;
  color: string;
  isFavorite: boolean;
}

const SAVED_RECIPIENTS: Recipient[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+250 788 123 456',
    provider: 'MTN Mobile Money',
    initials: 'JD',
    color: '#D32F2F',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Mary Smith',
    phone: '+250 788 654 321',
    provider: 'Airtel Money',
    initials: 'MS',
    color: '#1976D2',
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Peter Jones',
    phone: '+250 788 999 888',
    provider: 'Equity Bank',
    initials: 'PJ',
    color: '#388E3C',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Alice Uwase',
    phone: '+250 783 112 233',
    provider: 'BK Bank',
    initials: 'AU',
    color: '#F57C00',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Dr. Eric Mugisha',
    phone: '+250 788 445 566',
    provider: 'MTN Mobile Money',
    initials: 'EM',
    color: '#7B1FA2',
    isFavorite: false,
  },
  {
    id: '6',
    name: 'Clarisse Akaliza',
    phone: '+250 789 221 334',
    provider: 'Airtel Money',
    initials: 'CA',
    color: '#0097A7',
    isFavorite: false,
  },
];

export default function SendRecipientScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Filter saved contacts based on search query
  const filteredRecipients = useMemo(() => {
    if (!searchQuery.trim()) return SAVED_RECIPIENTS;
    const query = searchQuery.toLowerCase();
    return SAVED_RECIPIENTS.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''))
    );
  }, [searchQuery]);

  // Check if input is a phone number that doesn't match existing saved contact
  const isRawPhoneNumber = useMemo(() => {
    const cleaned = searchQuery.replace(/[^0-9]/g, '');
    return cleaned.length >= 7 && filteredRecipients.length === 0;
  }, [searchQuery, filteredRecipients]);

  const handleSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
  };

  const handleSelectNewNumber = () => {
    const formattedNumber = searchQuery.startsWith('+') ? searchQuery : `+250 ${searchQuery}`;
    setSelectedRecipient({
      id: 'new',
      name: 'New Recipient',
      phone: formattedNumber,
      provider: 'MTN / Airtel Mobile Money',
      initials: 'NR',
      color: colors.accent,
      isFavorite: false,
    });
  };

  const isResolved = selectedRecipient !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select Recipient</Text>
        <Pressable onPress={() => setIsScanModalOpen(true)} style={{ padding: 4 }}>
          <Ionicons name="qr-code-outline" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          {/* Search & Direct Phone Input Bar */}
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF',
                borderColor: colors.divider,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.accent} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search saved contacts or type phone number..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (
                  selectedRecipient &&
                  text !== selectedRecipient.name &&
                  text !== selectedRecipient.phone
                ) {
                  setSelectedRecipient(null);
                }
              }}
              autoFocus
            />
            <Pressable
              onPress={() => setIsScanModalOpen(true)}
              style={{ padding: 4, marginRight: 4 }}
            >
              <Ionicons name="qr-code-outline" size={18} color={colors.accent} />
            </Pressable>
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedRecipient(null);
                }}
              >
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </Animated.View>

          {/* Selected / Resolved Recipient Card */}
          {selectedRecipient ? (
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              style={[
                styles.resolvedCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.accent },
              ]}
            >
              <View style={styles.resolvedHeader}>
                <View style={[styles.networkBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color={colors.accent}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.networkName, { color: colors.accent }]}>
                    Verified Aeropay Beneficiary
                  </Text>
                </View>
                <Pressable onPress={() => setSelectedRecipient(null)}>
                  <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <View
                  style={[styles.avatarCircleLarge, { backgroundColor: selectedRecipient.color }]}
                >
                  <Text style={styles.avatarTextLarge}>{selectedRecipient.initials}</Text>
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {selectedRecipient.name}
                  </Text>
                  <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
                    {selectedRecipient.phone}
                  </Text>
                  <Text style={[styles.providerTag, { color: colors.accent }]}>
                    {selectedRecipient.provider}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ) : null}

          {/* Create New Recipient Row if typing a new phone number */}
          {isRawPhoneNumber && !selectedRecipient && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <Pressable
                style={[
                  styles.newRecipientCard,
                  { backgroundColor: colors.accent + '15', borderColor: colors.accent },
                ]}
                onPress={handleSelectNewNumber}
              >
                <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
                  <Ionicons name="person-add" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.newRecipientTitle, { color: colors.text }]}>
                    Send to New Number
                  </Text>
                  <Text style={[styles.newRecipientSub, { color: colors.textSecondary }]}>
                    +250 {searchQuery}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.accent} />
              </Pressable>
            </Animated.View>
          )}

          {/* Quick Recent Avatars Bar */}
          {!selectedRecipient && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                RECENT RECIPIENTS
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recentScrollView}
              >
                {SAVED_RECIPIENTS.slice(0, 4).map((r) => (
                  <Pressable key={r.id} style={styles.recentItem} onPress={() => handleSelect(r)}>
                    <View style={[styles.recentAvatar, { backgroundColor: r.color }]}>
                      <Text style={styles.recentAvatarText}>{r.initials}</Text>
                    </View>
                    <Text style={[styles.recentName, { color: colors.text }]} numberOfLines={1}>
                      {r.name.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Filtered Saved Beneficiaries List */}
          {!selectedRecipient && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                SAVED BENEFICIARIES ({filteredRecipients.length})
              </Text>

              {filteredRecipients.length === 0 && !isRawPhoneNumber ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="search-outline"
                    size={44}
                    color={colors.textSecondary}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No saved recipients matching "{searchQuery}"
                  </Text>
                </View>
              ) : (
                filteredRecipients.map((r) => (
                  <Pressable
                    key={r.id}
                    style={[
                      styles.contactCard,
                      { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                    ]}
                    onPress={() => handleSelect(r)}
                  >
                    <View style={[styles.avatarCircle, { backgroundColor: r.color }]}>
                      <Text style={styles.avatarText}>{r.initials}</Text>
                    </View>

                    <View style={styles.contactInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.contactName, { color: colors.text }]}>{r.name}</Text>
                        {r.isFavorite && (
                          <Ionicons
                            name="star"
                            size={14}
                            color="#F59E0B"
                            style={{ marginLeft: 6 }}
                          />
                        )}
                      </View>
                      <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
                        {r.phone}
                      </Text>
                      <Text style={[styles.contactProvider, { color: colors.accent }]}>
                        {r.provider}
                      </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* Continue Button */}
          <Pressable
            disabled={!isResolved}
            style={[
              styles.nextButton,
              { backgroundColor: isResolved ? colors.accent : isDark ? '#333338' : '#E0E0E5' },
            ]}
            onPress={() => router.push('/(tabs)/send/confirm')}
          >
            <Text
              style={[
                styles.nextButtonText,
                { color: isResolved ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Continue to Transfer
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* QR SCANNER MODAL */}
      <QRScannerModal
        visible={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Scan Recipient QR Code"
        onScanSuccess={(scanned) => {
          setSearchQuery(scanned.name);
          setSelectedRecipient({
            id: 'scanned-' + Date.now(),
            name: scanned.name,
            phone: scanned.phone,
            provider: scanned.provider || 'MTN Mobile Money',
            initials: scanned.name.slice(0, 2).toUpperCase(),
            color: colors.accent,
            isFavorite: false,
          });
        }}
      />
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  resolvedCard: {
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: Spacing.four,
  },
  resolvedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  networkName: {
    fontSize: 12,
    fontWeight: '700',
  },
  avatarCircleLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '800',
  },
  accountNumber: {
    fontSize: 14,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  providerTag: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  newRecipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: Spacing.four,
  },
  newRecipientTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  newRecipientSub: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  recentScrollView: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
  },
  recentItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  recentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  recentName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  contactProvider: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
  },
  nextButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
