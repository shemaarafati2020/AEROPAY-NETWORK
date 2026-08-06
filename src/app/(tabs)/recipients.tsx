import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Recipient {
  id: string;
  name: string;
  phone: string;
  provider: string;
  initials: string;
  color: string;
  isFavorite: boolean;
}

const INITIAL_RECIPIENTS: Recipient[] = [
  { id: '1', name: 'John Doe', phone: '+250 788 123 456', provider: 'MTN Mobile Money', initials: 'JD', color: '#D32F2F', isFavorite: true },
  { id: '2', name: 'Mary Smith', phone: '+250 788 654 321', provider: 'Airtel Money', initials: 'MS', color: '#1976D2', isFavorite: true },
  { id: '3', name: 'Peter Jones', phone: '+250 788 999 888', provider: 'Equity Bank', initials: 'PJ', color: '#388E3C', isFavorite: false },
  { id: '4', name: 'Alice Uwase', phone: '+250 783 112 233', provider: 'BK Bank', initials: 'AU', color: '#F57C00', isFavorite: false },
];

const LOCAL_PHONE_CONTACTS = [
  { name: 'Dr. Eric Mugisha', phone: '+250 788 445 566', provider: 'MTN Mobile Money' },
  { name: 'Clarisse Akaliza', phone: '+250 789 221 334', provider: 'Airtel Money' },
  { name: 'David Rukundo', phone: '+250 785 889 900', provider: 'Equity Bank' },
];

const PROVIDERS = ['MTN Mobile Money', 'Airtel Money', 'Equity Bank', 'BK Bank'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RecipientCard({ recipient, colors, onSend, onDelete, onToggleFav }: { 
  recipient: Recipient; 
  colors: any; 
  onSend: (r: Recipient) => void;
  onDelete: (id: string) => void;
  onToggleFav: (id: string) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <AnimatedPressable 
        style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }, animatedStyle]}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() => onSend(recipient)}
      >
        <View style={[styles.avatarCircle, { backgroundColor: recipient.color }]}>
          <Text style={styles.avatarText}>{recipient.initials}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.nameText, { color: colors.text }]}>{recipient.name}</Text>
            <Pressable onPress={() => onToggleFav(recipient.id)} style={{ padding: 4, marginLeft: 4 }}>
              <Ionicons 
                name={recipient.isFavorite ? "star" : "star-outline"} 
                size={16} 
                color={recipient.isFavorite ? "#F59E0B" : colors.textSecondary} 
              />
            </Pressable>
          </View>
          <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{recipient.phone}</Text>
          <Text style={[styles.providerTag, { color: colors.accent }]}>{recipient.provider}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.sendBtn, { backgroundColor: colors.accent }]} onPress={() => onSend(recipient)}>
            <Ionicons name="send" size={14} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
          
          <Pressable onPress={() => onDelete(recipient.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </Pressable>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function RecipientsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // New Recipient Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProvider, setNewProvider] = useState(PROVIDERS[0]);
  const [newIsFav, setNewIsFav] = useState(false);

  const filteredRecipients = useMemo(() => {
    if (!searchQuery) return recipients;
    const q = searchQuery.toLowerCase();
    return recipients.filter(r => r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.provider.toLowerCase().includes(q));
  }, [recipients, searchQuery]);

  const favorites = useMemo(() => filteredRecipients.filter(r => r.isFavorite), [filteredRecipients]);
  const others = useMemo(() => filteredRecipients.filter(r => !r.isFavorite), [filteredRecipients]);

  const handleAddRecipient = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter a name and phone number.');
      return;
    }

    const nameParts = newName.trim().split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
      : nameParts[0].slice(0, 2).toUpperCase();

    const colorsList = ['#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#0097A7'];
    const randomColor = colorsList[Math.floor(Math.random() * colorsList.length)];

    const created: Recipient = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      provider: newProvider,
      initials,
      color: randomColor,
      isFavorite: newIsFav,
    };

    setRecipients([created, ...recipients]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewIsFav(false);
  };

  const handleImportContact = (contact: any) => {
    const nameParts = contact.name.split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
      : nameParts[0].slice(0, 2).toUpperCase();

    const colorsList = ['#D32F2F', '#1976D2', '#388E3C', '#F57C00'];
    const randomColor = colorsList[Math.floor(Math.random() * colorsList.length)];

    const imported: Recipient = {
      id: Date.now().toString(),
      name: contact.name,
      phone: contact.phone,
      provider: contact.provider,
      initials,
      color: randomColor,
      isFavorite: false,
    };

    setRecipients([imported, ...recipients]);
    Alert.alert('Imported!', `${contact.name} added to your beneficiaries.`);
  };

  const toggleFavorite = (id: string) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const deleteRecipient = (id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const handleSendTo = (recipient: Recipient) => {
    router.push(`/(tabs)/send?recipient=${encodeURIComponent(recipient.name)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Beneficiaries</Text>
        <View style={styles.headerActions}>
          <Pressable 
            style={[styles.iconActionBtn, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]} 
            onPress={() => setIsSyncModalOpen(true)}
          >
            <Ionicons name="sync-outline" size={18} color={colors.accent} />
          </Pressable>
          <Pressable 
            style={[styles.addBtn, { backgroundColor: colors.accent }]} 
            onPress={() => setIsAddModalOpen(true)}
          >
            <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF', borderColor: colors.divider }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search name, phone, or provider..."
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

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FAVORITES</Text>
            {favorites.map((r) => (
              <RecipientCard 
                key={r.id} 
                recipient={r} 
                colors={colors} 
                onSend={handleSendTo} 
                onDelete={deleteRecipient} 
                onToggleFav={toggleFavorite} 
              />
            ))}
          </View>
        )}

        {/* All Beneficiaries Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {favorites.length > 0 ? 'ALL BENEFICIARIES' : 'BENEFICIARIES'} ({filteredRecipients.length})
          </Text>
          
          {filteredRecipients.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No beneficiaries found matching "{searchQuery}".</Text>
            </View>
          ) : (
            others.map((r) => (
              <RecipientCard 
                key={r.id} 
                recipient={r} 
                colors={colors} 
                onSend={handleSendTo} 
                onDelete={deleteRecipient} 
                onToggleFav={toggleFavorite} 
              />
            ))
          )}
        </View>

      </ScrollView>

      {/* Add New Recipient Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsAddModalOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Beneficiary</Text>
              <Pressable onPress={() => setIsAddModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
            <TextInput
              placeholder="e.g. Jean Paul"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
            <TextInput
              placeholder="e.g. +250 788 111 222"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PROVIDER</Text>
            <View style={styles.providersRow}>
              {PROVIDERS.map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.providerChip,
                    { backgroundColor: newProvider === p ? colors.accent : (isDark ? '#2C2C2C' : '#F0F0F0') }
                  ]}
                  onPress={() => setNewProvider(p)}
                >
                  <Text style={[styles.providerChipText, { color: newProvider === p ? '#FFF' : colors.text }]}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={() => setNewIsFav(!newIsFav)} style={styles.favCheckRow}>
              <Ionicons name={newIsFav ? "checkbox" : "square-outline"} size={22} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.favCheckText, { color: colors.text }]}>Add to Favorites</Text>
            </Pressable>

            <Pressable style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleAddRecipient}>
              <Text style={styles.saveBtnText}>Save Beneficiary</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sync Local Contacts Modal */}
      <Modal visible={isSyncModalOpen} transparent animationType="slide" onRequestClose={() => setIsSyncModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsSyncModalOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="phone-portrait-outline" size={22} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Import Phone Contacts</Text>
              </View>
              <Pressable onPress={() => setIsSyncModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.syncSubtitle, { color: colors.textSecondary }]}>
              Select contacts from your device address book to add to Aeropay beneficiaries:
            </Text>

            {LOCAL_PHONE_CONTACTS.map((c, idx) => (
              <View key={idx} style={[styles.syncRow, { borderBottomColor: colors.divider }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.syncName, { color: colors.text }]}>{c.name}</Text>
                  <Text style={[styles.syncPhone, { color: colors.textSecondary }]}>{c.phone} • {c.provider}</Text>
                </View>
                <Pressable style={[styles.importBtn, { backgroundColor: colors.accent + '20' }]} onPress={() => handleImportContact(c)}>
                  <Ionicons name="add-circle" size={18} color={colors.accent} style={{ marginRight: 4 }} />
                  <Text style={[styles.importBtnText, { color: colors.accent }]}>Import</Text>
                </Pressable>
              </View>
            ))}

            <Pressable style={[styles.doneBtn, { backgroundColor: colors.backgroundSelected }]} onPress={() => setIsSyncModalOpen(false)}>
              <Text style={[styles.doneBtnText, { color: colors.text }]}>Done</Text>
            </Pressable>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  phoneText: {
    fontSize: 13,
    marginTop: 2,
  },
  providerTag: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsRow: {
    alignItems: 'flex-end',
    gap: 8,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
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
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  providersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  providerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  providerChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  favCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  favCheckText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  syncSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  syncName: {
    fontSize: 15,
    fontWeight: '700',
  },
  syncPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  importBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  doneBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
