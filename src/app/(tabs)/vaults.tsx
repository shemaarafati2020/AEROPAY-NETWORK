import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useToast } from '@/context/ToastContext';
import {
  Vault,
  getVaults,
  createVault,
  depositToVault,
  withdrawFromVault,
} from '@/services/vaults';
import QRScannerModal from '@/components/QRScannerModal';

const CATEGORY_ICONS: Record<Vault['category'], { icon: string; color: string }> = {
  education: { icon: 'school', color: '#3B82F6' },
  rent: { icon: 'home', color: '#10B981' },
  emergency: { icon: 'shield-checkmark', color: '#EC4899' },
  business: { icon: 'briefcase', color: '#8B5CF6' },
  general: { icon: 'wallet', color: '#F59E0B' },
};

export default function VaultsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'vaults' | 'contacts'>('vaults');
  const [vaultsList, setVaultsList] = useState<Vault[]>([]);
  const [_loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [amountInput, setAmountInput] = useState('');

  // Form state for new vault
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Vault['category']>('general');
  const [newTarget, setNewTarget] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newInitialDeposit, setNewInitialDeposit] = useState('');

  // Contact list state & QR Scanner
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [contacts, setContacts] = useState([
    { id: '1', name: 'John Doe', phone: '+250 788 123 456', provider: 'MTN Mobile Money' },
    { id: '2', name: 'Mary Njeri', phone: '+254 712 345 678', provider: 'Safaricom M-PESA' },
    { id: '3', name: 'Eric Mugisha', phone: '+250 788 999 888', provider: 'Airtel Money' },
  ]);

  useEffect(() => {
    loadVaultsData();
  }, []);

  const loadVaultsData = async () => {
    setLoading(true);
    const data = await getVaults();
    setVaultsList(data);
    setLoading(false);
  };

  const totalVaultBalance = vaultsList.reduce((acc, v) => acc + v.balance, 0);

  const handleCreateVaultSubmit = async () => {
    if (!newName.trim()) {
      showToast('Please enter a goal name', 'error');
      return;
    }

    const created = await createVault({
      name: newName.trim(),
      category: newCategory,
      targetAmount: newTarget ? parseFloat(newTarget) : undefined,
      targetDate: newTargetDate || undefined,
      initialDeposit: newInitialDeposit ? parseFloat(newInitialDeposit) : 0,
      roundUpEnabled: true,
    });

    showToast(`Vault "${created.name}" created successfully!`, 'success');
    setIsCreateModalOpen(false);
    setNewName('');
    setNewTarget('');
    setNewTargetDate('');
    setNewInitialDeposit('');
    loadVaultsData();
  };

  const handleDepositSubmit = async () => {
    if (!selectedVault || !amountInput || parseFloat(amountInput) <= 0) {
      showToast('Enter a valid deposit amount', 'error');
      return;
    }

    const amount = parseFloat(amountInput);
    const updated = await depositToVault(selectedVault.id, amount, 'Manual User Deposit');
    if (updated) {
      showToast(`Deposited $${amount.toFixed(2)} to ${updated.name}`, 'success');
      setIsDepositModalOpen(false);
      setAmountInput('');
      setSelectedVault(null);
      loadVaultsData();
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!selectedVault || !amountInput || parseFloat(amountInput) <= 0) {
      showToast('Enter a valid withdrawal amount', 'error');
      return;
    }

    const amount = parseFloat(amountInput);
    const result = await withdrawFromVault(selectedVault.id, amount);
    if (!result.success) {
      showToast(result.error || 'Withdrawal failed', 'error');
      return;
    }

    showToast(`Withdrew $${amount.toFixed(2)} from ${selectedVault.name}`, 'success');
    setIsWithdrawModalOpen(false);
    setAmountInput('');
    setSelectedVault(null);
    loadVaultsData();
  };

  const handleScannedContact = (scannedData: {
    name?: string;
    phone: string;
    provider?: string;
  }) => {
    const newContact = {
      id: 'scanned-' + Date.now(),
      name: scannedData.name || 'Scanned Contact',
      phone: scannedData.phone,
      provider: scannedData.provider || 'MTN Mobile Money',
    };
    setContacts((prev) => [newContact, ...prev]);
    showToast(`Contact "${newContact.name}" imported via QR Code!`, 'success');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header & Sub-Tab Bar */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Financial Hub</Text>
        <View style={styles.tabToggleRow}>
          <Pressable
            onPress={() => setActiveTab('vaults')}
            style={[styles.toggleBtn, activeTab === 'vaults' && { backgroundColor: colors.accent }]}
          >
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={activeTab === 'vaults' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: activeTab === 'vaults' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              USDC Vaults
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('contacts')}
            style={[
              styles.toggleBtn,
              activeTab === 'contacts' && { backgroundColor: colors.accent },
            ]}
          >
            <Ionicons
              name="people"
              size={14}
              color={activeTab === 'contacts' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: activeTab === 'contacts' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Saved Contacts
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          {activeTab === 'vaults' ? (
            <>
              {/* Vaults Total Summary Card */}
              <Animated.View
                entering={FadeInDown.duration(400).springify()}
                style={[
                  styles.totalCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                    TOTAL SAVINGS IN VAULTS
                  </Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>
                    ${totalVaultBalance.toFixed(2)}{' '}
                    <Text style={{ fontSize: 16, color: colors.textSecondary }}>USDC</Text>
                  </Text>
                  <Text style={[styles.totalSub, { color: colors.success }]}>
                    ✨ Protected against local currency inflation
                  </Text>
                </View>

                <Pressable
                  onPress={() => setIsCreateModalOpen(true)}
                  style={[styles.addVaultBtn, { backgroundColor: colors.accent }]}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addVaultBtnText}>New Goal</Text>
                </Pressable>
              </Animated.View>

              {/* Vaults List */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Savings Goals</Text>

              {vaultsList.map((vault) => {
                const categoryMeta = CATEGORY_ICONS[vault.category] || CATEGORY_ICONS.general;
                const progressPct = vault.targetAmount
                  ? Math.min(100, Math.round((vault.balance / vault.targetAmount) * 100))
                  : 100;

                return (
                  <Animated.View
                    key={vault.id}
                    entering={FadeInDown.delay(100).duration(400)}
                    style={[
                      styles.vaultCard,
                      { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                    ]}
                  >
                    <View style={styles.vaultHeader}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: categoryMeta.color + '18' },
                        ]}
                      >
                        <Ionicons
                          name={categoryMeta.icon as any}
                          size={18}
                          color={categoryMeta.color}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.vaultTitle, { color: colors.text }]}>
                          {vault.name}
                        </Text>
                        <Text style={[styles.vaultMeta, { color: colors.textSecondary }]}>
                          {vault.targetDate ? `Target Date: ${vault.targetDate}` : 'Flexible Goal'}
                        </Text>
                      </View>

                      {vault.locked ? (
                        <View style={styles.lockBadge}>
                          <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                          <Text style={styles.lockBadgeText}>Locked</Text>
                        </View>
                      ) : (
                        <View
                          style={[styles.lockBadge, { backgroundColor: colors.success + '15' }]}
                        >
                          <Ionicons name="lock-open" size={12} color={colors.success} />
                          <Text style={[styles.lockBadgeText, { color: colors.success }]}>
                            Unlocked
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Balance & Progress */}
                    <View style={styles.vaultAmountRow}>
                      <Text style={[styles.vaultBalance, { color: colors.text }]}>
                        ${vault.balance.toFixed(2)}
                      </Text>
                      {vault.targetAmount && (
                        <Text style={[styles.vaultTarget, { color: colors.textSecondary }]}>
                          Target: ${vault.targetAmount.toFixed(2)} ({progressPct}%)
                        </Text>
                      )}
                    </View>

                    {vault.targetAmount && (
                      <View
                        style={[
                          styles.progressTrack,
                          { backgroundColor: colors.backgroundSelected },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${progressPct}%`, backgroundColor: categoryMeta.color },
                          ]}
                        />
                      </View>
                    )}

                    {/* Actions */}
                    <View style={styles.vaultActionsRow}>
                      <Pressable
                        onPress={() => {
                          setSelectedVault(vault);
                          setIsDepositModalOpen(true);
                        }}
                        style={[
                          styles.actionBtnSmall,
                          { backgroundColor: colors.accent + '15', borderColor: colors.accent },
                        ]}
                      >
                        <Ionicons name="arrow-down-circle" size={16} color={colors.accent} />
                        <Text style={[styles.actionBtnSmallText, { color: colors.accent }]}>
                          Deposit
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          if (vault.locked) {
                            showToast('This vault is locked until the target date', 'error');
                            return;
                          }
                          setSelectedVault(vault);
                          setIsWithdrawModalOpen(true);
                        }}
                        style={[
                          styles.actionBtnSmall,
                          {
                            backgroundColor: colors.backgroundSelected,
                            borderColor: colors.divider,
                          },
                        ]}
                      >
                        <Ionicons name="arrow-up-circle" size={16} color={colors.textSecondary} />
                        <Text style={[styles.actionBtnSmallText, { color: colors.text }]}>
                          Withdraw
                        </Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                );
              })}
            </>
          ) : (
            /* Saved Contacts Tab */
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                  Saved Contacts
                </Text>
                <Pressable
                  onPress={() => setIsQRScannerOpen(true)}
                  style={[styles.addVaultBtn, { backgroundColor: colors.accent }]}
                >
                  <Ionicons name="qr-code" size={18} color="#FFFFFF" />
                  <Text style={styles.addVaultBtnText}>Scan QR</Text>
                </Pressable>
              </View>

              {contacts.map((contact) => (
                <View
                  key={contact.id}
                  style={[
                    styles.contactCard,
                    { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                  ]}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: colors.accent }]}>
                    <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                    <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
                      {contact.provider} • {contact.phone}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal: Create New Vault */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
            ]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
              Select Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {(['general', 'education', 'rent', 'emergency', 'business'] as const).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor:
                      newCategory === cat ? colors.accent : colors.backgroundSelected,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: newCategory === cat ? '#FFFFFF' : colors.text,
                      textTransform: 'capitalize',
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              placeholder="Goal Title (e.g., Land Purchase)"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              style={[styles.modalInput, { color: colors.text, borderColor: colors.divider }]}
            />

            <TextInput
              placeholder="Target Amount in USD (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newTarget}
              onChangeText={setNewTarget}
              keyboardType="numeric"
              style={[styles.modalInput, { color: colors.text, borderColor: colors.divider }]}
            />

            <TextInput
              placeholder="Initial Deposit in USD (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newInitialDeposit}
              onChangeText={setNewInitialDeposit}
              keyboardType="numeric"
              style={[styles.modalInput, { color: colors.text, borderColor: colors.divider }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable
                onPress={() => setIsCreateModalOpen(false)}
                style={[styles.modalBtn, { backgroundColor: colors.divider }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateVaultSubmit}
                style={[styles.modalBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Create Goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Deposit */}
      <Modal visible={isDepositModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Deposit to {selectedVault?.name}
            </Text>

            <TextInput
              placeholder="Amount in USD"
              placeholderTextColor={colors.textSecondary}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="numeric"
              style={[styles.modalInput, { color: colors.text, borderColor: colors.divider }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable
                onPress={() => setIsDepositModalOpen(false)}
                style={[styles.modalBtn, { backgroundColor: colors.divider }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDepositSubmit}
                style={[styles.modalBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm Deposit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Withdraw */}
      <Modal visible={isWithdrawModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Withdraw from {selectedVault?.name}
            </Text>

            <TextInput
              placeholder="Amount in USD"
              placeholderTextColor={colors.textSecondary}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="numeric"
              style={[styles.modalInput, { color: colors.text, borderColor: colors.divider }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable
                onPress={() => setIsWithdrawModalOpen(false)}
                style={[styles.modalBtn, { backgroundColor: colors.divider }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleWithdrawSubmit}
                style={[styles.modalBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Withdraw to Wallet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Contact Scanner */}
      <QRScannerModal
        visible={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleScannedContact}
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
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 4,
  },
  totalSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  addVaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addVaultBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  vaultCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  vaultMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  vaultAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 14,
  },
  vaultBalance: {
    fontSize: 22,
    fontWeight: '800',
  },
  vaultTarget: {
    fontSize: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  vaultActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtnSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnSmallText: {
    fontSize: 12,
    fontWeight: '700',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
