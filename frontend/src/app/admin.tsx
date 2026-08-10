import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  useColorScheme,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  AppUser,
  UserStatus,
  KycTier,
  NotificationTarget,
  NotificationCategory,
} from '@/types/auth';

type AdminTab = 'users' | 'profile' | 'broadcast' | 'fx' | 'ops' | 'audit';
type LogFilter = 'ALL' | 'KYC' | 'STATUS' | 'BALANCE' | 'FX' | 'LIQUIDITY' | 'NOTIFICATION';

export default function AdminScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const {
    currentUser,
    usersList,
    auditLogs,
    systemSettings,
    broadcastsList,
    adminProfile,
    logout,
    updateUserStatus,
    updateUserKyc,
    adjustUserBalance,
    resetUserPin,
    toggleUserVirtualCard,
    updateSystemSettings,
    addAuditLog,
    sendBroadcastNotification,
    updateAdminProfile,
    topUpGasRelayer,
    quickLoginDemo,
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'flagged'>(
    'all'
  );
  const [logFilter, setLogFilter] = useState<LogFilter>('ALL');

  // Selected User Modal for Admin actions
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [balanceAdjustmentAmount, setBalanceAdjustmentAmount] = useState('');
  const [balanceAdjustmentReason, setBalanceAdjustmentReason] = useState('');
  const [selectedAdjustmentType, setSelectedAdjustmentType] = useState<'credit' | 'debit'>(
    'credit'
  );

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<NotificationTarget>('all');
  const [broadcastCategory, setBroadcastCategory] = useState<NotificationCategory>('promo');

  // System FX & Corridor Inputs
  const [rwfRateInput, setRwfRateInput] = useState(systemSettings.rwfRate.toString());
  const [kesRateInput, setKesRateInput] = useState(systemSettings.kesRate.toString());
  const [spreadInput, setSpreadInput] = useState(systemSettings.feeSpreadPercent.toString());

  // FX Simulator Sandbox
  const [simUsdAmount, setSimUsdAmount] = useState('100');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [usersList, searchQuery, statusFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    if (logFilter === 'ALL') return auditLogs;
    return auditLogs.filter((l) => l.action.toUpperCase().includes(logFilter));
  }, [auditLogs, logFilter]);

  const totalUserBalance = usersList.reduce((sum, u) => sum + u.balanceUsd, 0);
  const activeCount = usersList.filter((u) => u.status === 'active').length;
  const suspendedCount = usersList.filter((u) => u.status === 'suspended').length;
  const flaggedCount = usersList.filter((u) => u.status === 'flagged').length;

  const handleToggleStatus = (user: AppUser, targetStatus?: UserStatus) => {
    const nextStatus: UserStatus =
      targetStatus || (user.status === 'active' ? 'suspended' : 'active');
    updateUserStatus(user.id, nextStatus, 'Supervisor status modification via Operations Hub');
    showToast(
      `User ${user.name} is now ${nextStatus.toUpperCase()}`,
      nextStatus === 'active' ? 'success' : 'info'
    );
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...selectedUser, status: nextStatus });
    }
  };

  const handleKycChange = (user: AppUser, tier: KycTier) => {
    updateUserKyc(user.id, tier);
    showToast(`Updated ${user.name} KYC to ${tier}`, 'success');
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...selectedUser, kycTier: tier });
    }
  };

  const handleBalanceSubmit = () => {
    if (!selectedUser) return;
    const rawVal = parseFloat(balanceAdjustmentAmount);
    if (isNaN(rawVal) || rawVal <= 0) {
      showToast('Please enter a valid positive adjustment amount', 'error');
      return;
    }
    if (!balanceAdjustmentReason.trim()) {
      showToast('Please provide an audit justification reason', 'error');
      return;
    }

    const delta = selectedAdjustmentType === 'credit' ? rawVal : -rawVal;
    adjustUserBalance(selectedUser.id, delta, balanceAdjustmentReason.trim());
    showToast(
      `${selectedAdjustmentType === 'credit' ? 'Credited' : 'Debited'} ${delta >= 0 ? '+' : ''}$${delta.toFixed(2)} USDC on ${selectedUser.name}`,
      'success'
    );
    setBalanceAdjustmentAmount('');
    setBalanceAdjustmentReason('');
    setSelectedUser((prev) =>
      prev ? { ...prev, balanceUsd: Math.max(0, prev.balanceUsd + delta) } : null
    );
  };

  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim()) {
      showToast('Please enter an announcement title', 'error');
      return;
    }
    if (!broadcastMessage.trim()) {
      showToast('Please enter the message body', 'error');
      return;
    }

    const res = sendBroadcastNotification({
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      target: broadcastTarget,
      category: broadcastCategory,
    });

    showToast(
      `Broadcast sent! Delivered to ${res.deliveredCount} users (${broadcastTarget.toUpperCase()})`,
      'success'
    );

    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleSaveFxSettings = () => {
    const newRwf = parseFloat(rwfRateInput);
    const newKes = parseFloat(kesRateInput);
    const newSpread = parseFloat(spreadInput);

    if (isNaN(newRwf) || isNaN(newKes) || isNaN(newSpread)) {
      showToast('Please enter valid numeric FX values', 'error');
      return;
    }

    updateSystemSettings({
      rwfRate: newRwf,
      kesRate: newKes,
      feeSpreadPercent: newSpread,
    });
    showToast('Wholesale FX rates & corridor limits updated across network', 'success');
  };

  const handleInjectLiquidity = (amountUsdc: number) => {
    const newPool = systemSettings.liquidityPoolReserveUsdc + amountUsdc;
    updateSystemSettings({ liquidityPoolReserveUsdc: newPool });
    addAuditLog(
      'LIQUIDITY_INJECTION',
      `Injected +$${amountUsdc.toLocaleString()} USDC into Stellar Anchor Settlement Pool`
    );
    showToast(`+$${amountUsdc.toLocaleString()} USDC injected into settlement pool!`, 'success');
  };

  const handleExportCompliance = () => {
    addAuditLog(
      'COMPLIANCE_REPORT_EXPORT',
      `Exported BNR/CBK AML & Ledger Compliance Report (Users: ${usersList.length}, Volume: $${usersList.reduce((s, u) => s + (u.totalTransferredUsd || 0), 0).toLocaleString()})`
    );
    showToast('Regulatory Compliance Export generated successfully', 'success');
  };

  const handleSwitchToClient = async () => {
    await quickLoginDemo('user');
    showToast('Switched to Consumer App (Shema Arafati)', 'info');
    router.replace('/(tabs)');
  };

  const handleLogout = async () => {
    await logout();
    showToast('Logged out of Admin Operations Hub', 'info');
    router.replace('/login');
  };

  // FX Sandbox Calculations
  const simAmountNum = parseFloat(simUsdAmount) || 0;
  const simSpreadMultiplier = (100 - parseFloat(spreadInput || '0')) / 100;
  const effectiveRwfRate = (parseFloat(rwfRateInput) || 1420) * simSpreadMultiplier;
  const effectiveKesRate = (parseFloat(kesRateInput) || 129.5) * simSpreadMultiplier;
  const simRwfPayout = simAmountNum * effectiveRwfRate;
  const simKesPayout = simAmountNum * effectiveKesRate;
  const simFeeUsd = simAmountNum * (parseFloat(spreadInput || '0') / 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* iOS-Style Frosted Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: isDark ? 'rgba(12, 16, 26, 0.95)' : '#FFFFFF',
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.adminAvatarCircle, { backgroundColor: '#6366F1' }]}>
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Console</Text>
              <View style={styles.rootPill}>
                <Text style={styles.rootPillText}>ROOT</Text>
              </View>
            </View>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {currentUser?.email || 'admin@aeropay.network'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleSwitchToClient}
            style={[
              styles.headerBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
              },
            ]}
          >
            <Ionicons name="phone-portrait-outline" size={15} color={colors.accent} />
            <Text style={[styles.headerBtnText, { color: colors.text }]}>App</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={[
              styles.headerBtn,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          {/* Executive Overview Glass Grid */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.overviewGrid}>
            {/* User Directory Metric */}
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTag, { color: colors.textSecondary }]}>
                  REGISTERED USERS
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#6366F120' }]}>
                  <Ionicons name="people" size={14} color="#6366F1" />
                </View>
              </View>
              <Text style={[styles.cardBigNumber, { color: colors.text }]}>{usersList.length}</Text>
              <View style={styles.statusChipsRow}>
                <View style={[styles.miniStatusBadge, { backgroundColor: '#10B98115' }]}>
                  <View style={[styles.miniDot, { backgroundColor: '#10B981' }]} />
                  <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '800' }}>
                    {activeCount} Active
                  </Text>
                </View>
                {suspendedCount > 0 && (
                  <View style={[styles.miniStatusBadge, { backgroundColor: '#EF444415' }]}>
                    <View style={[styles.miniDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={{ fontSize: 10, color: '#EF4444', fontWeight: '800' }}>
                      {suspendedCount} Susp.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Total Custodial Holdings Metric */}
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTag, { color: colors.textSecondary }]}>
                  CUSTODIAL VAULT
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="wallet" size={14} color="#10B981" />
                </View>
              </View>
              <Text style={[styles.cardBigNumber, { color: colors.text }]}>
                $
                {totalUserBalance >= 1000
                  ? `${(totalUserBalance / 1000).toFixed(1)}k`
                  : totalUserBalance.toFixed(2)}
              </Text>
              <View style={styles.growthRow}>
                <Ionicons name="trending-up" size={12} color="#10B981" />
                <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '700' }}>
                  +12.4% MoM growth
                </Text>
              </View>
            </View>

            {/* Liquidity Settlement Pool */}
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTag, { color: colors.textSecondary }]}>
                  ANCHOR RESERVE
                </Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="server" size={14} color="#F59E0B" />
                </View>
              </View>
              <Text style={[styles.cardBigNumber, { color: colors.text }]}>
                ${(systemSettings.liquidityPoolReserveUsdc / 1000000).toFixed(2)}M
              </Text>
              <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '700' }}>
                ✨ 100% Pre-funded
              </Text>
            </View>

            {/* Soroban Gas Paymaster Relayer */}
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTag, { color: colors.textSecondary }]}>GAS PAYMASTER</Text>
                <View style={[styles.cardIconBox, { backgroundColor: '#06B6D420' }]}>
                  <Ionicons name="flash" size={14} color="#06B6D4" />
                </View>
              </View>
              <Text style={[styles.cardBigNumber, { color: colors.text }]}>
                {(systemSettings.gasRelayerBalanceXlm / 1000).toFixed(1)}k
              </Text>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '600' }}>
                XLM Gas Relayer Tank
              </Text>
            </View>
          </Animated.View>

          {/* Navigation Tab Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navTabsContainer}
          >
            {[
              { id: 'users' as AdminTab, label: `Users (${usersList.length})`, icon: 'people' },
              { id: 'profile' as AdminTab, label: 'Admin Profile', icon: 'person-circle' },
              { id: 'broadcast' as AdminTab, label: 'Broadcast Alerts', icon: 'megaphone' },
              { id: 'fx' as AdminTab, label: 'FX Matrix', icon: 'swap-horizontal' },
              { id: 'ops' as AdminTab, label: 'Relayers & Rails', icon: 'construct' },
              {
                id: 'audit' as AdminTab,
                label: `Audit Log (${auditLogs.length})`,
                icon: 'receipt',
              },
            ].map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && {
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                  },
                  activeTab !== tab.id && {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
                  color={activeTab === tab.id ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: activeTab === tab.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* TAB 1: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Search Bar */}
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: isDark ? 'rgba(20, 25, 40, 0.8)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                  },
                ]}
              >
                <Ionicons
                  name="search"
                  size={17}
                  color={colors.textSecondary}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search by name, email or phone..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>

              {/* Status Filter Chips */}
              <View style={styles.filterRow}>
                {(['all', 'active', 'suspended', 'flagged'] as const).map((filter) => (
                  <Pressable
                    key={filter}
                    onPress={() => setStatusFilter(filter)}
                    style={[
                      styles.filterChip,
                      statusFilter === filter && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                      statusFilter !== filter && {
                        backgroundColor: isDark ? 'rgba(20, 25, 40, 0.7)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: statusFilter === filter ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {filter.toUpperCase()}
                      {filter === 'flagged' && flaggedCount > 0 ? ` (${flaggedCount})` : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* User Cards List */}
              <View style={styles.usersList}>
                {filteredUsers.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="search-outline" size={36} color={colors.textSecondary} />
                    <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
                      No users found matching "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  filteredUsers.map((user) => (
                    <Pressable
                      key={user.id}
                      style={[
                        styles.userItemCard,
                        {
                          backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                          borderColor:
                            user.status === 'suspended'
                              ? '#EF4444'
                              : user.status === 'flagged'
                                ? '#F59E0B'
                                : isDark
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : '#E2E8F0',
                        },
                      ]}
                      onPress={() => setSelectedUser(user)}
                    >
                      <View style={styles.userItemHeader}>
                        <View style={[styles.avatarBox, { backgroundColor: user.avatarColor }]}>
                          <Text style={styles.avatarText}>
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </Text>
                        </View>

                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.userItemName, { color: colors.text }]}>
                              {user.name}
                            </Text>
                            {user.role === 'admin' && (
                              <View style={styles.adminRoleBadge}>
                                <Text style={styles.adminRoleText}>ADMIN</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.userItemEmail, { color: colors.textSecondary }]}>
                            {user.email}
                          </Text>
                          <Text style={[styles.userItemPhone, { color: colors.textSecondary }]}>
                            {user.phone}
                          </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.userItemBalance, { color: colors.text }]}>
                            ${user.balanceUsd.toFixed(2)}
                          </Text>
                          <View
                            style={[
                              styles.userStatusPill,
                              {
                                backgroundColor:
                                  user.status === 'active'
                                    ? '#10B98115'
                                    : user.status === 'suspended'
                                      ? '#EF444415'
                                      : '#F59E0B15',
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.statusPillDot,
                                {
                                  backgroundColor:
                                    user.status === 'active'
                                      ? '#10B981'
                                      : user.status === 'suspended'
                                        ? '#EF4444'
                                        : '#F59E0B',
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.userStatusPillText,
                                {
                                  color:
                                    user.status === 'active'
                                      ? '#10B981'
                                      : user.status === 'suspended'
                                        ? '#EF4444'
                                        : '#F59E0B',
                                },
                              ]}
                            >
                              {user.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* User Card Actions */}
                      <View
                        style={[
                          styles.userItemFooter,
                          { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' },
                        ]}
                      >
                        <View style={styles.kycTagRow}>
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={12}
                            color={colors.accent}
                          />
                          <Text style={[styles.kycTagText, { color: colors.textSecondary }]}>
                            {user.kycTier}
                          </Text>
                        </View>

                        <View style={styles.userActionButtons}>
                          <Pressable
                            onPress={() => handleToggleStatus(user)}
                            style={[
                              styles.actionBtnSecondary,
                              {
                                backgroundColor:
                                  user.status === 'active' ? '#EF444415' : '#10B98115',
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                user.status === 'active'
                                  ? 'ban-outline'
                                  : 'checkmark-circle-outline'
                              }
                              size={12}
                              color={user.status === 'active' ? '#EF4444' : '#10B981'}
                            />
                            <Text
                              style={[
                                styles.actionBtnSecondaryText,
                                { color: user.status === 'active' ? '#EF4444' : '#10B981' },
                              ]}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => setSelectedUser(user)}
                            style={[styles.manageUserBtn, { backgroundColor: colors.accent }]}
                          >
                            <Text style={styles.manageUserBtnText}>Manage</Text>
                            <Ionicons name="chevron-forward" size={11} color="#FFFFFF" />
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            </Animated.View>
          )}

          {/* TAB 2: DEDICATED ADMIN PROFILE PAGE */}
          {activeTab === 'profile' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Profile Main Card */}
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.profileHeroRow}>
                  <View style={[styles.profileAvatarBox, { backgroundColor: '#6366F1' }]}>
                    <Ionicons name="shield" size={28} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.profileHeroName, { color: colors.text }]}>
                      {adminProfile.name}
                    </Text>
                    <Text style={[styles.profileHeroEmail, { color: colors.textSecondary }]}>
                      {adminProfile.email}
                    </Text>
                    <View style={styles.clearanceTag}>
                      <Ionicons name="lock-closed" size={10} color="#6366F1" />
                      <Text style={styles.clearanceTagText}>{adminProfile.clearanceLevel}</Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.profileDetailsGrid,
                    { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' },
                  ]}
                >
                  <View style={styles.profileDetailItem}>
                    <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
                      OFFICIAL ROLE
                    </Text>
                    <Text style={[styles.profileDetailVal, { color: colors.text }]}>
                      {adminProfile.title}
                    </Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>
                      DEPARTMENT
                    </Text>
                    <Text style={[styles.profileDetailVal, { color: colors.text }]}>
                      {adminProfile.department}
                    </Text>
                  </View>
                </View>
              </View>

              {/* NOC Security Controls */}
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="lock-closed-outline" size={16} color="#6366F1" />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    NOC Supervisor Security Controls
                  </Text>
                </View>

                {/* 2FA Hardware Key */}
                <View
                  style={[
                    styles.profileToggleRow,
                    { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>
                      Hardware Security Key (FIDO2 / YubiKey)
                    </Text>
                    <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                      Mandatory cryptographic key confirmation for all balance adjustments
                    </Text>
                  </View>
                  <Switch
                    value={adminProfile.hardwareKeyEnabled}
                    onValueChange={(val) => {
                      updateAdminProfile({ hardwareKeyEnabled: val });
                      showToast(`Hardware 2FA Key ${val ? 'Enabled' : 'Disabled'}`, 'info');
                    }}
                    trackColor={{ false: '#334155', true: '#6366F1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* IP Whitelist */}
                <View
                  style={[
                    styles.profileToggleRow,
                    { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>
                      NOC Subnet Whitelist
                    </Text>
                    <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                      {adminProfile.ipWhitelist}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>

                {/* Audit Stamp */}
                <View
                  style={[
                    styles.auditStampBox,
                    { backgroundColor: isDark ? '#121624' : '#F8FAFC' },
                  ]}
                >
                  <Ionicons name="shield-checkmark" size={15} color="#10B981" />
                  <Text style={[styles.auditStampText, { color: colors.textSecondary }]}>
                    {adminProfile.lastSecurityAudit}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* TAB 3: BROADCAST NOTIFICATION CENTER */}
          {activeTab === 'broadcast' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="megaphone-outline" size={17} color={colors.accent} />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Global Notification Dispatcher
                  </Text>
                </View>
                <Text style={[styles.sectionSubText, { color: colors.textSecondary }]}>
                  Broadcast real-time push announcements, rate notices & compliance alerts to all
                  registered devices
                </Text>

                {/* Target Audience */}
                <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 4 }]}>
                  TARGET AUDIENCE GROUP
                </Text>
                <View style={styles.targetAudienceRow}>
                  {[
                    { id: 'all' as NotificationTarget, label: `All Users (${usersList.length})` },
                    { id: 'active' as NotificationTarget, label: `Active (${activeCount})` },
                    { id: 'flagged' as NotificationTarget, label: `Flagged (${flaggedCount})` },
                    { id: 'tier3' as NotificationTarget, label: 'Tier 3 VIP' },
                  ].map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => setBroadcastTarget(t.id)}
                      style={[
                        styles.targetChip,
                        broadcastTarget === t.id && {
                          backgroundColor: colors.accent,
                          borderColor: colors.accent,
                        },
                        broadcastTarget !== t.id && {
                          backgroundColor: isDark ? '#192033' : '#F1F5F9',
                          borderColor: colors.divider,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.targetChipText,
                          { color: broadcastTarget === t.id ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Notification Category */}
                <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                  ANNOUNCEMENT CATEGORY
                </Text>
                <View style={styles.targetAudienceRow}>
                  {[
                    {
                      id: 'promo' as NotificationCategory,
                      label: '🎁 Promo & Rebate',
                      color: '#10B981',
                    },
                    {
                      id: 'fx_update' as NotificationCategory,
                      label: '💱 FX Rate Notice',
                      color: '#6366F1',
                    },
                    {
                      id: 'critical' as NotificationCategory,
                      label: '🚨 System Alert',
                      color: '#EF4444',
                    },
                    {
                      id: 'security' as NotificationCategory,
                      label: '🔒 KYC Warning',
                      color: '#F59E0B',
                    },
                  ].map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setBroadcastCategory(c.id)}
                      style={[
                        styles.targetChip,
                        broadcastCategory === c.id && {
                          backgroundColor: c.color,
                          borderColor: c.color,
                        },
                        broadcastCategory !== c.id && {
                          backgroundColor: isDark ? '#192033' : '#F1F5F9',
                          borderColor: colors.divider,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.targetChipText,
                          { color: broadcastCategory === c.id ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Inputs */}
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                    ANNOUNCEMENT TITLE
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: isDark ? '#141828' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                        color: colors.text,
                      },
                    ]}
                    placeholder="e.g. Weekend Free Remittance Promotion"
                    placeholderTextColor={colors.textSecondary}
                    value={broadcastTitle}
                    onChangeText={setBroadcastTitle}
                  />
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                    MESSAGE BODY
                  </Text>
                  <TextInput
                    style={[
                      styles.formTextArea,
                      {
                        backgroundColor: isDark ? '#141828' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                        color: colors.text,
                      },
                    ]}
                    placeholder="Enter detailed message body for recipient notification centers..."
                    placeholderTextColor={colors.textSecondary}
                    value={broadcastMessage}
                    onChangeText={setBroadcastMessage}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <Pressable
                  onPress={handleSendBroadcast}
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: colors.accent, marginTop: 12 },
                  ]}
                >
                  <Ionicons name="send" size={15} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>Dispatch Push Notification Now</Text>
                </Pressable>
              </View>

              {/* Past Broadcast History */}
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="time-outline" size={16} color="#10B981" />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Broadcast Dispatch History ({broadcastsList.length})
                  </Text>
                </View>

                {broadcastsList.map((bc) => (
                  <View
                    key={bc.id}
                    style={[
                      styles.broadcastItem,
                      { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' },
                    ]}
                  >
                    <View style={styles.broadcastItemTop}>
                      <View
                        style={[
                          styles.catBadge,
                          {
                            backgroundColor:
                              bc.category === 'critical'
                                ? '#EF444420'
                                : bc.category === 'promo'
                                  ? '#10B98120'
                                  : '#6366F120',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.catBadgeText,
                            {
                              color:
                                bc.category === 'critical'
                                  ? '#EF4444'
                                  : bc.category === 'promo'
                                    ? '#10B981'
                                    : '#6366F1',
                            },
                          ]}
                        >
                          {bc.category.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.broadcastDate, { color: colors.textSecondary }]}>
                        Delivered to {bc.deliveredCount} users •{' '}
                        {new Date(bc.sentAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>

                    <Text style={[styles.broadcastItemTitle, { color: colors.text }]}>
                      {bc.title}
                    </Text>
                    <Text style={[styles.broadcastItemBody, { color: colors.textSecondary }]}>
                      {bc.message}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* TAB 4: FX MATRIX & SIMULATOR */}
          {activeTab === 'fx' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="swap-horizontal-outline" size={17} color={colors.accent} />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Wholesale Corridor FX Rates
                  </Text>
                </View>
                <Text style={[styles.sectionSubText, { color: colors.textSecondary }]}>
                  Broadcast live exchange rates for cross-border corridor settlement
                </Text>

                <View style={styles.fxInputsRow}>
                  <View style={styles.fxCol}>
                    <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                      USD → RWF (RWANDA)
                    </Text>
                    <View
                      style={[
                        styles.fxInputBox,
                        {
                          backgroundColor: isDark ? '#141828' : '#F8FAFC',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                        },
                      ]}
                    >
                      <Text style={{ fontWeight: '700', color: colors.text, marginRight: 4 }}>
                        $1 =
                      </Text>
                      <TextInput
                        style={[styles.fxInputField, { color: colors.text }]}
                        value={rwfRateInput}
                        onChangeText={setRwfRateInput}
                        keyboardType="decimal-pad"
                      />
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>RWF</Text>
                    </View>
                  </View>

                  <View style={styles.fxCol}>
                    <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                      USD → KES (KENYA)
                    </Text>
                    <View
                      style={[
                        styles.fxInputBox,
                        {
                          backgroundColor: isDark ? '#141828' : '#F8FAFC',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                        },
                      ]}
                    >
                      <Text style={{ fontWeight: '700', color: colors.text, marginRight: 4 }}>
                        $1 =
                      </Text>
                      <TextInput
                        style={[styles.fxInputField, { color: colors.text }]}
                        value={kesRateInput}
                        onChangeText={setKesRateInput}
                        keyboardType="decimal-pad"
                      />
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>KES</Text>
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                    PLATFORM FX SPREAD (%)
                  </Text>
                  <View
                    style={[
                      styles.fxInputBox,
                      {
                        backgroundColor: isDark ? '#141828' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.fxInputField, { color: colors.text }]}
                      value={spreadInput}
                      onChangeText={setSpreadInput}
                      keyboardType="decimal-pad"
                    />
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      % spread markup
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleSaveFxSettings}
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: colors.accent, marginTop: 12 },
                  ]}
                >
                  <Ionicons name="save-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>
                    Broadcast Rates to Settlement Anchors
                  </Text>
                </Pressable>
              </View>

              {/* LIVE FX SIMULATOR SANDBOX */}
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="calculator-outline" size={17} color="#10B981" />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Live Payout & Fee Simulator
                  </Text>
                </View>
                <Text style={[styles.sectionSubText, { color: colors.textSecondary }]}>
                  Test recipient settlement values based on active wholesale rates & spread
                </Text>

                <View style={{ marginVertical: 8 }}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                    TEST SEND AMOUNT (USD)
                  </Text>
                  <View
                    style={[
                      styles.fxInputBox,
                      {
                        backgroundColor: isDark ? '#141828' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1',
                      },
                    ]}
                  >
                    <Text style={{ fontWeight: '700', color: colors.text, marginRight: 6 }}>$</Text>
                    <TextInput
                      style={[styles.fxInputField, { color: colors.text }]}
                      value={simUsdAmount}
                      onChangeText={setSimUsdAmount}
                      keyboardType="decimal-pad"
                    />
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>USDC</Text>
                  </View>
                </View>

                <View style={styles.simCardsRow}>
                  <View
                    style={[styles.simCardBox, { backgroundColor: isDark ? '#141828' : '#F1F5F9' }]}
                  >
                    <Text style={[styles.simCardTitle, { color: colors.textSecondary }]}>
                      🇷🇼 RWANDA MTN/AIRTEL
                    </Text>
                    <Text style={[styles.simCardVal, { color: colors.text }]}>
                      {simRwfPayout.toLocaleString('en-US', { maximumFractionDigits: 0 })} RWF
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                      Rate: 1 USD = {effectiveRwfRate.toFixed(2)} RWF
                    </Text>
                  </View>

                  <View
                    style={[styles.simCardBox, { backgroundColor: isDark ? '#141828' : '#F1F5F9' }]}
                  >
                    <Text style={[styles.simCardTitle, { color: colors.textSecondary }]}>
                      🇰🇪 KENYA M-PESA
                    </Text>
                    <Text style={[styles.simCardVal, { color: colors.text }]}>
                      {simKesPayout.toLocaleString('en-US', { maximumFractionDigits: 1 })} KES
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                      Rate: 1 USD = {effectiveKesRate.toFixed(2)} KES
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.feePreviewBox,
                    { backgroundColor: isDark ? '#111522' : '#FAFAFA' },
                  ]}
                >
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    Platform Revenue Fee:{' '}
                    <Text style={{ fontWeight: '700', color: colors.text }}>
                      ${simFeeUsd.toFixed(3)} USDC ({spreadInput}% spread)
                    </Text>
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* TAB 5: RISK, RELAYERS & RAILS */}
          {activeTab === 'ops' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Paymaster Gas Relayer */}
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="flash" size={17} color="#06B6D4" />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Soroban Paymaster Gas Relayer
                  </Text>
                </View>
                <Text style={[styles.sectionSubText, { color: colors.textSecondary }]}>
                  Subsidizes 100% of user blockchain gas transactions on Stellar Mainnet
                </Text>

                <View style={styles.gasTankBox}>
                  <Text style={[styles.gasTankLabel, { color: colors.textSecondary }]}>
                    ACTIVE GAS RELAYER TANK
                  </Text>
                  <Text style={[styles.gasTankVal, { color: colors.text }]}>
                    {systemSettings.gasRelayerBalanceXlm.toLocaleString()} XLM
                  </Text>
                  <Text style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>
                    🟢 Zero-gas sponsored transaction relay operational
                  </Text>
                </View>

                <View style={styles.topUpRow}>
                  <Pressable
                    onPress={() => {
                      topUpGasRelayer(1000);
                      showToast('+1,000 XLM added to Gas Relayer', 'success');
                    }}
                    style={[styles.topUpBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                  >
                    <Text style={[styles.topUpBtnText, { color: colors.text }]}>+1k XLM</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      topUpGasRelayer(5000);
                      showToast('+5,000 XLM added to Gas Relayer', 'success');
                    }}
                    style={[styles.topUpBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                  >
                    <Text style={[styles.topUpBtnText, { color: colors.text }]}>+5k XLM</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      topUpGasRelayer(10000);
                      showToast('+10,000 XLM added to Gas Relayer', 'success');
                    }}
                    style={[styles.topUpBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                  >
                    <Text style={[styles.topUpBtnText, { color: colors.text }]}>+10k XLM</Text>
                  </Pressable>
                </View>
              </View>

              {/* Corridor Rails */}
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="git-network-outline" size={17} color="#F59E0B" />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Payment Corridor Rails
                  </Text>
                </View>

                {[
                  {
                    name: 'Rwanda MTN MoMo & Airtel Money',
                    active: systemSettings.rwandaMoMoActive,
                    toggle: () =>
                      updateSystemSettings({ rwandaMoMoActive: !systemSettings.rwandaMoMoActive }),
                  },
                  {
                    name: 'Kenya M-Pesa Safaricom',
                    active: systemSettings.kenyaMpesaActive,
                    toggle: () =>
                      updateSystemSettings({ kenyaMpesaActive: !systemSettings.kenyaMpesaActive }),
                  },
                  {
                    name: 'Uganda Airtel & MTN Money',
                    active: systemSettings.ugandaAirtelActive,
                    toggle: () =>
                      updateSystemSettings({
                        ugandaAirtelActive: !systemSettings.ugandaAirtelActive,
                      }),
                  },
                ].map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.corridorToggleRow,
                      { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.corridorTitle, { color: colors.text }]}>{c.name}</Text>
                      <Text style={{ fontSize: 10, color: c.active ? '#10B981' : '#EF4444' }}>
                        {c.active ? '● Sub-second settlement live' : '○ Corridor paused'}
                      </Text>
                    </View>
                    <Switch
                      value={c.active}
                      onValueChange={c.toggle}
                      trackColor={{ false: '#334155', true: colors.accent }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                ))}
              </View>

              {/* Settlement Pool Liquidity Injection */}
              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="server-outline" size={17} color="#10B981" />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Settlement Anchor Liquidity
                  </Text>
                </View>

                <View style={styles.topUpRow}>
                  <Pressable
                    onPress={() => handleInjectLiquidity(10000)}
                    style={[styles.topUpBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                  >
                    <Text style={[styles.topUpBtnText, { color: colors.text }]}>+$10k USDC</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleInjectLiquidity(50000)}
                    style={[styles.topUpBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                  >
                    <Text style={[styles.topUpBtnText, { color: colors.text }]}>+$50k USDC</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleInjectLiquidity(100000)}
                    style={[styles.topUpBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                  >
                    <Text style={[styles.topUpBtnText, { color: colors.text }]}>+$100k USDC</Text>
                  </Pressable>
                </View>

                {/* Emergency Maintenance Mode */}
                <View
                  style={[
                    styles.killSwitchBox,
                    {
                      backgroundColor: systemSettings.maintenanceMode
                        ? '#EF444415'
                        : 'rgba(0,0,0,0.03)',
                      borderColor: systemSettings.maintenanceMode ? '#EF4444' : colors.divider,
                      marginTop: 12,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.killSwitchTitle, { color: colors.text }]}>
                      Emergency Maintenance Mode
                    </Text>
                    <Text style={[styles.killSwitchSub, { color: colors.textSecondary }]}>
                      Freeze all outbound remittances across all payment corridors
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => {
                      const next = !systemSettings.maintenanceMode;
                      updateSystemSettings({ maintenanceMode: next });
                      showToast(
                        next
                          ? 'EMERGENCY: Maintenance Mode Activated'
                          : 'System Restored to Normal',
                        next ? 'error' : 'success'
                      );
                    }}
                    style={[
                      styles.killSwitchActionBtn,
                      { backgroundColor: systemSettings.maintenanceMode ? '#EF4444' : '#10B981' },
                    ]}
                  >
                    <Text style={styles.killSwitchActionText}>
                      {systemSettings.maintenanceMode ? 'FREEZE ACTIVE' : 'ONLINE'}
                    </Text>
                  </Pressable>
                </View>

                {/* Export Compliance Audit Log */}
                <Pressable
                  onPress={handleExportCompliance}
                  style={[
                    styles.exportReportBtn,
                    { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', marginTop: 12 },
                  ]}
                >
                  <Ionicons name="document-text-outline" size={15} color={colors.text} />
                  <Text style={[styles.exportReportBtnText, { color: colors.text }]}>
                    Export BNR / CBK Regulatory Compliance Audit Log
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* TAB 6: AUDIT TRAIL LOGS */}
          {activeTab === 'audit' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.logFiltersRow}
              >
                {(
                  [
                    'ALL',
                    'KYC',
                    'STATUS',
                    'BALANCE',
                    'FX',
                    'LIQUIDITY',
                    'NOTIFICATION',
                  ] as LogFilter[]
                ).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setLogFilter(f)}
                    style={[
                      styles.filterChip,
                      logFilter === f && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                      logFilter !== f && {
                        backgroundColor: isDark ? 'rgba(20, 25, 40, 0.7)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: logFilter === f ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View
                style={[
                  styles.sectionGlassCard,
                  {
                    backgroundColor: isDark ? 'rgba(18, 22, 34, 0.85)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="receipt-outline" size={17} color="#06B6D4" />
                  <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                    Immutable Audit Trail Stream
                  </Text>
                </View>

                {filteredLogs.map((log) => (
                  <View
                    key={log.id}
                    style={[
                      styles.auditLogItem,
                      { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' },
                    ]}
                  >
                    <View style={styles.auditLogItemTop}>
                      <View
                        style={[
                          styles.auditLogActionBadge,
                          {
                            backgroundColor: log.action.includes('KYC')
                              ? '#6366F120'
                              : log.action.includes('SUSPEND')
                                ? '#EF444420'
                                : log.action.includes('BALANCE')
                                  ? '#10B98120'
                                  : log.action.includes('NOTIFICATION')
                                    ? '#8B5CF620'
                                    : '#F59E0B20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.auditLogActionText,
                            {
                              color: log.action.includes('KYC')
                                ? '#6366F1'
                                : log.action.includes('SUSPEND')
                                  ? '#EF4444'
                                  : log.action.includes('BALANCE')
                                    ? '#10B981'
                                    : log.action.includes('NOTIFICATION')
                                      ? '#8B5CF6'
                                      : '#F59E0B',
                            },
                          ]}
                        >
                          {log.action}
                        </Text>
                      </View>
                      <Text style={[styles.auditLogTime, { color: colors.textSecondary }]}>
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    <Text style={[styles.auditLogDetails, { color: colors.text }]}>
                      {log.details}
                    </Text>
                    <View style={styles.auditLogMetaRow}>
                      <Text style={[styles.auditLogMetaText, { color: colors.textSecondary }]}>
                        Operator: {log.adminEmail}
                      </Text>
                      <Text style={[styles.auditLogMetaText, { color: colors.textSecondary }]}>
                        IP: {log.ipAddress || '197.243.22.18'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* DETAILED USER MANAGEMENT DRAWER MODAL */}
      <Modal
        visible={selectedUser !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedUser(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedUser(null)}>
          <Pressable
            style={[
              styles.modalSheet,
              {
                backgroundColor: isDark ? '#121624' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <View style={styles.sheetHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View
                      style={[styles.sheetAvatar, { backgroundColor: selectedUser.avatarColor }]}
                    >
                      <Text style={styles.sheetAvatarText}>
                        {selectedUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.sheetTitle, { color: colors.text }]}>
                        {selectedUser.name}
                      </Text>
                      <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>
                        {selectedUser.email}
                      </Text>
                    </View>
                  </View>

                  <Pressable onPress={() => setSelectedUser(null)} style={styles.sheetCloseBtn}>
                    <Ionicons name="close" size={20} color={colors.text} />
                  </Pressable>
                </View>

                {/* Metrics */}
                <View style={styles.sheetStatsRow}>
                  <View
                    style={[
                      styles.sheetStatCard,
                      { backgroundColor: isDark ? '#181D30' : '#F8FAFC' },
                    ]}
                  >
                    <Text style={[styles.sheetStatLabel, { color: colors.textSecondary }]}>
                      AVAILABLE BALANCE
                    </Text>
                    <Text style={[styles.sheetStatVal, { color: '#10B981' }]}>
                      ${selectedUser.balanceUsd.toFixed(2)} USDC
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.sheetStatCard,
                      { backgroundColor: isDark ? '#181D30' : '#F8FAFC' },
                    ]}
                  >
                    <Text style={[styles.sheetStatLabel, { color: colors.textSecondary }]}>
                      TOTAL VOLUME
                    </Text>
                    <Text style={[styles.sheetStatVal, { color: colors.text }]}>
                      ${(selectedUser.totalTransferredUsd || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* PIN Reset & Virtual Card Controls */}
                <View style={styles.quickOpsRow}>
                  <Pressable
                    onPress={() => {
                      resetUserPin(selectedUser.id);
                      showToast(
                        `Dispatched temporary PIN reset token to ${selectedUser.email}`,
                        'info'
                      );
                    }}
                    style={[styles.quickOpBtn, { backgroundColor: isDark ? '#1E2538' : '#F1F5F9' }]}
                  >
                    <Ionicons name="key-outline" size={13} color={colors.accent} />
                    <Text style={[styles.quickOpText, { color: colors.text }]}>Reset PIN</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      toggleUserVirtualCard(selectedUser.id);
                      const next = !selectedUser.virtualCardActive;
                      setSelectedUser({ ...selectedUser, virtualCardActive: next });
                      showToast(
                        `Virtual Card for ${selectedUser.name} is now ${next ? 'ACTIVE' : 'FROZEN'}`,
                        'info'
                      );
                    }}
                    style={[
                      styles.quickOpBtn,
                      {
                        backgroundColor: selectedUser.virtualCardActive ? '#10B98115' : '#EF444415',
                      },
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={13}
                      color={selectedUser.virtualCardActive ? '#10B981' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.quickOpText,
                        { color: selectedUser.virtualCardActive ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {selectedUser.virtualCardActive ? 'Card Active' : 'Card Frozen'}
                    </Text>
                  </Pressable>
                </View>

                {/* Account Status Switcher */}
                <Text style={[styles.sheetSectionLabel, { color: colors.textSecondary }]}>
                  ACCOUNT OPERATIONAL STATUS
                </Text>
                <View style={styles.statusOptionsRow}>
                  {(['active', 'suspended', 'flagged'] as UserStatus[]).map((st) => (
                    <Pressable
                      key={st}
                      onPress={() => handleToggleStatus(selectedUser, st)}
                      style={[
                        styles.statusOptionBtn,
                        selectedUser.status === st && {
                          backgroundColor:
                            st === 'active'
                              ? '#10B981'
                              : st === 'suspended'
                                ? '#EF4444'
                                : '#F59E0B',
                        },
                        selectedUser.status !== st && {
                          backgroundColor: isDark ? '#1E2538' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          {
                            color: selectedUser.status === st ? '#FFFFFF' : colors.textSecondary,
                          },
                        ]}
                      >
                        {st.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* KYC Tier Selector */}
                <Text style={[styles.sheetSectionLabel, { color: colors.textSecondary }]}>
                  KYC VERIFICATION TIER
                </Text>
                <View style={styles.kycOptionsCol}>
                  {[
                    { tier: 'Tier 1 (Basic)' as KycTier, limit: '$500/day daily limit' },
                    { tier: 'Tier 2 (Verified)' as KycTier, limit: '$10,000/day daily limit' },
                    { tier: 'Tier 3 (Institutional)' as KycTier, limit: 'Unlimited liquidity' },
                  ].map((item) => (
                    <Pressable
                      key={item.tier}
                      onPress={() => handleKycChange(selectedUser, item.tier)}
                      style={[
                        styles.kycOptionCard,
                        selectedUser.kycTier === item.tier && {
                          borderColor: colors.accent,
                          backgroundColor: isDark ? '#261F28' : '#FFF1F2',
                        },
                        selectedUser.kycTier !== item.tier && {
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                          backgroundColor: isDark ? '#181D30' : '#FFFFFF',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          selectedUser.kycTier === item.tier
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        size={16}
                        color={
                          selectedUser.kycTier === item.tier ? colors.accent : colors.textSecondary
                        }
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.kycCardTitle, { color: colors.text }]}>
                          {item.tier}
                        </Text>
                        <Text style={[styles.kycCardSub, { color: colors.textSecondary }]}>
                          {item.limit}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                {/* Ledger Balance Adjustment Tool */}
                <Text style={[styles.sheetSectionLabel, { color: colors.textSecondary }]}>
                  MANUAL LEDGER BALANCE ADJUSTMENT
                </Text>
                <View
                  style={[
                    styles.balanceCard,
                    {
                      backgroundColor: isDark ? '#181D30' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                    },
                  ]}
                >
                  <View style={styles.adjTypeRow}>
                    <Pressable
                      onPress={() => setSelectedAdjustmentType('credit')}
                      style={[
                        styles.adjTypeBtn,
                        selectedAdjustmentType === 'credit' && { backgroundColor: '#10B981' },
                        selectedAdjustmentType !== 'credit' && {
                          backgroundColor: isDark ? '#121624' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.adjTypeText,
                          {
                            color:
                              selectedAdjustmentType === 'credit'
                                ? '#FFFFFF'
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        + Credit (Add Funds)
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setSelectedAdjustmentType('debit')}
                      style={[
                        styles.adjTypeBtn,
                        selectedAdjustmentType === 'debit' && { backgroundColor: '#EF4444' },
                        selectedAdjustmentType !== 'debit' && {
                          backgroundColor: isDark ? '#121624' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.adjTypeText,
                          {
                            color:
                              selectedAdjustmentType === 'debit' ? '#FFFFFF' : colors.textSecondary,
                          },
                        ]}
                      >
                        - Debit (Deduct Funds)
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.adjInputBox}>
                    <Text style={{ fontWeight: '700', color: colors.text, marginRight: 4 }}>$</Text>
                    <TextInput
                      style={[styles.adjInputField, { color: colors.text }]}
                      placeholder="Amount in USDC (e.g. 50.00)"
                      placeholderTextColor={colors.textSecondary}
                      value={balanceAdjustmentAmount}
                      onChangeText={setBalanceAdjustmentAmount}
                      keyboardType="decimal-pad"
                    />
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>USDC</Text>
                  </View>

                  <TextInput
                    style={[
                      styles.adjReasonField,
                      {
                        backgroundColor: isDark ? '#121624' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#CBD5E1',
                        color: colors.text,
                      },
                    ]}
                    placeholder="Audit reason (e.g. KYC verification bonus, dispute refund)"
                    placeholderTextColor={colors.textSecondary}
                    value={balanceAdjustmentReason}
                    onChangeText={setBalanceAdjustmentReason}
                  />

                  <Pressable
                    onPress={handleBalanceSubmit}
                    style={[
                      styles.submitAdjBtn,
                      {
                        backgroundColor:
                          selectedAdjustmentType === 'credit' ? '#10B981' : '#EF4444',
                      },
                    ]}
                  >
                    <Text style={styles.submitAdjBtnText}>
                      Execute {selectedAdjustmentType.toUpperCase()} Balance Adjustment
                    </Text>
                  </Pressable>
                </View>

                {/* Close Button */}
                <Pressable
                  onPress={() => setSelectedUser(null)}
                  style={[
                    styles.sheetCloseButton,
                    { backgroundColor: isDark ? '#22283C' : '#E2E8F0' },
                  ]}
                >
                  <Text style={[styles.sheetCloseButtonText, { color: colors.text }]}>
                    Close User Details
                  </Text>
                </Pressable>
              </ScrollView>
            )}
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
  responsiveWrapper: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rootPill: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rootPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  headerBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cardIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBigNumber: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  statusChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  navTabsContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  usersList: {
    gap: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 26,
  },
  emptyCardText: {
    fontSize: 12,
    marginTop: 6,
  },
  userItemCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  userItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userItemName: {
    fontSize: 13,
    fontWeight: '800',
  },
  adminRoleBadge: {
    backgroundColor: '#6366F125',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  adminRoleText: {
    color: '#6366F1',
    fontSize: 8,
    fontWeight: '900',
  },
  userItemEmail: {
    fontSize: 11,
  },
  userItemPhone: {
    fontSize: 10,
  },
  userItemBalance: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  userStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  userStatusPillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  userItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  kycTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kycTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  userActionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBtnSecondaryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  manageUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  manageUserBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionGlassCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSubText: {
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 15,
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeroName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileHeroEmail: {
    fontSize: 12,
  },
  clearanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366F115',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  clearanceTagText: {
    color: '#6366F1',
    fontSize: 9,
    fontWeight: '800',
  },
  profileDetailsGrid: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  profileDetailItem: {
    flex: 1,
  },
  profileDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  profileDetailVal: {
    fontSize: 11,
    fontWeight: '600',
  },
  profileToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 10,
    marginTop: 1,
  },
  auditStampBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 9,
    borderRadius: 8,
    marginTop: 10,
  },
  auditStampText: {
    fontSize: 10,
    fontWeight: '500',
  },
  formLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  targetAudienceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  targetChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  targetChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  formInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  formTextArea: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 20,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  broadcastItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  broadcastItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  catBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  broadcastDate: {
    fontSize: 9,
  },
  broadcastItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 1,
  },
  broadcastItemBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  fxInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fxCol: {
    flex: 1,
  },
  fxInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  fxInputField: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    height: '100%',
  },
  simCardsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  simCardBox: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
  },
  simCardTitle: {
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 1,
  },
  simCardVal: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 1,
  },
  feePreviewBox: {
    padding: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  gasTankBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 8,
  },
  gasTankLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  gasTankVal: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 1,
  },
  topUpRow: {
    flexDirection: 'row',
    gap: 6,
  },
  topUpBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  topUpBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  corridorToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  corridorTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  killSwitchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  killSwitchTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  killSwitchSub: {
    fontSize: 9,
    marginTop: 1,
  },
  killSwitchActionBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  killSwitchActionText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  exportReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
  },
  exportReportBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logFiltersRow: {
    gap: 5,
    marginBottom: 8,
  },
  auditLogItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  auditLogItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  auditLogActionBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  auditLogActionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  auditLogTime: {
    fontSize: 9,
  },
  auditLogDetails: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginBottom: 3,
  },
  auditLogMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  auditLogMetaText: {
    fontSize: 9,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '90%',
    borderWidth: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sheetSub: {
    fontSize: 11,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetStatsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  sheetStatCard: {
    flex: 1,
    padding: 9,
    borderRadius: 10,
  },
  sheetStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sheetStatVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  quickOpsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  quickOpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
  },
  quickOpText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sheetSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 5,
    marginTop: 4,
  },
  statusOptionsRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  statusOptionBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 7,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 10,
    fontWeight: '800',
  },
  kycOptionsCol: {
    gap: 5,
    marginBottom: 10,
  },
  kycOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  kycCardTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  kycCardSub: {
    fontSize: 9,
    marginTop: 1,
  },
  balanceCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  adjTypeRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 6,
  },
  adjTypeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  adjTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  adjInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  adjInputField: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    height: '100%',
  },
  adjReasonField: {
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    fontSize: 11,
    marginBottom: 6,
  },
  submitAdjBtn: {
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitAdjBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  sheetCloseButton: {
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sheetCloseButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
