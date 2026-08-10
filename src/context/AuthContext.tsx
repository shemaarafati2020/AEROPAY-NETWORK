import React, { createContext, useContext, useState } from 'react';
import {
  AppUser,
  UserRole,
  UserStatus,
  KycTier,
  AdminAuditLog,
  SystemSettings,
  AdminBroadcast,
  AdminProfileInfo,
  NotificationTarget,
  NotificationCategory,
} from '@/types/auth';

interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  usersList: AppUser[];
  auditLogs: AdminAuditLog[];
  systemSettings: SystemSettings;
  broadcastsList: AdminBroadcast[];
  adminProfile: AdminProfileInfo;
  isLoading: boolean;
  login: (
    email: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string; user?: AppUser }>;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string; user?: AppUser }>;
  logout: () => Promise<void>;
  quickLoginDemo: (role: 'user' | 'admin') => Promise<AppUser>;
  updateUserStatus: (userId: string, status: UserStatus, reason?: string) => void;
  updateUserKyc: (userId: string, kycTier: KycTier) => void;
  adjustUserBalance: (userId: string, deltaAmount: number, reason: string) => void;
  resetUserPin: (userId: string) => void;
  toggleUserVirtualCard: (userId: string) => void;
  updateSystemSettings: (partialSettings: Partial<SystemSettings>) => void;
  addAuditLog: (action: string, details: string, targetUserEmail?: string) => void;
  sendBroadcastNotification: (data: {
    title: string;
    message: string;
    target: NotificationTarget;
    category: NotificationCategory;
  }) => AdminBroadcast;
  updateAdminProfile: (partial: Partial<AdminProfileInfo>) => void;
  topUpGasRelayer: (amountXlm: number) => void;
}

const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    name: 'Shema Arafati',
    email: 'shema@aeropay.network',
    phone: '+250 788 123 456',
    role: 'user',
    status: 'active',
    kycTier: 'Tier 2 (Verified)',
    balanceUsd: 1450.75,
    joinedDate: 'Jan 12, 2026',
    avatarColor: '#A51C24',
    lastLogin: 'Just now',
    totalTransferredUsd: 4820.0,
    virtualCardActive: true,
  },
  {
    id: 'usr-admin',
    name: 'Admin Supervisor',
    email: 'admin@aeropay.network',
    phone: '+250 788 000 001',
    role: 'admin',
    status: 'active',
    kycTier: 'Tier 3 (Institutional)',
    balanceUsd: 50000.0,
    joinedDate: 'Nov 01, 2025',
    avatarColor: '#6366F1',
    lastLogin: 'Just now',
    totalTransferredUsd: 184500.0,
    virtualCardActive: true,
  },
  {
    id: 'usr-2',
    name: 'Mary Smith',
    email: 'mary@gmail.com',
    phone: '+250 788 654 321',
    role: 'user',
    status: 'active',
    kycTier: 'Tier 1 (Basic)',
    balanceUsd: 320.0,
    joinedDate: 'Feb 03, 2026',
    avatarColor: '#10B981',
    lastLogin: '2 hours ago',
    totalTransferredUsd: 890.0,
    virtualCardActive: true,
  },
  {
    id: 'usr-3',
    name: 'Peter Jones',
    email: 'peter@equity.rw',
    phone: '+250 788 999 888',
    role: 'user',
    status: 'suspended',
    kycTier: 'Tier 2 (Verified)',
    balanceUsd: 80.5,
    joinedDate: 'Jan 28, 2026',
    avatarColor: '#EF4444',
    lastLogin: '3 days ago',
    totalTransferredUsd: 340.0,
    virtualCardActive: false,
  },
  {
    id: 'usr-4',
    name: 'Alice Uwase',
    email: 'alice@bk.rw',
    phone: '+250 783 112 233',
    role: 'user',
    status: 'active',
    kycTier: 'Tier 3 (Institutional)',
    balanceUsd: 12450.0,
    joinedDate: 'Dec 15, 2025',
    avatarColor: '#F59E0B',
    lastLogin: '1 hour ago',
    totalTransferredUsd: 42000.0,
    virtualCardActive: true,
  },
  {
    id: 'usr-5',
    name: 'Dr. Eric Mugisha',
    email: 'eric@kigalihealth.rw',
    phone: '+250 788 445 566',
    role: 'user',
    status: 'active',
    kycTier: 'Tier 2 (Verified)',
    balanceUsd: 650.0,
    joinedDate: 'Jan 05, 2026',
    avatarColor: '#8B5CF6',
    lastLogin: 'Yesterday',
    totalTransferredUsd: 2100.0,
    virtualCardActive: true,
  },
  {
    id: 'usr-6',
    name: 'Clarisse Akaliza',
    email: 'clarisse@airtel.rw',
    phone: '+250 789 221 334',
    role: 'user',
    status: 'flagged',
    kycTier: 'Tier 1 (Basic)',
    balanceUsd: 15.0,
    joinedDate: 'Feb 08, 2026',
    avatarColor: '#06B6D4',
    lastLogin: '5 days ago',
    totalTransferredUsd: 150.0,
    virtualCardActive: false,
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    timestamp: Date.now() - 1000 * 60 * 15,
    adminEmail: 'admin@aeropay.network',
    action: 'KYC_UPGRADE',
    targetUserEmail: 'alice@bk.rw',
    details:
      'Upgraded Alice Uwase to Tier 3 (Institutional) after passport & corporate verification',
    ipAddress: '197.243.22.18',
  },
  {
    id: 'log-2',
    timestamp: Date.now() - 1000 * 60 * 65,
    adminEmail: 'admin@aeropay.network',
    action: 'USER_SUSPEND',
    targetUserEmail: 'peter@equity.rw',
    details: 'Suspended user account pending velocity review on high-frequency transactions',
    ipAddress: '197.243.22.18',
  },
  {
    id: 'log-3',
    timestamp: Date.now() - 1000 * 60 * 180,
    adminEmail: 'admin@aeropay.network',
    action: 'FX_SPREAD_UPDATE',
    details: 'Adjusted RWF baseline exchange rate to 1,420.00 RWF per USDC',
    ipAddress: '197.243.22.18',
  },
];

const INITIAL_BROADCASTS: AdminBroadcast[] = [
  {
    id: 'bc-1',
    title: 'Weekend FX Spread Promo Active',
    message:
      'Zero platform fee spread on all USD to RWF and KES mobile remittances until Sunday 23:59 GMT.',
    target: 'all',
    category: 'promo',
    sentAt: Date.now() - 1000 * 60 * 60 * 8,
    deliveredCount: 7,
    adminEmail: 'admin@aeropay.network',
  },
  {
    id: 'bc-2',
    title: 'Scheduled Stellar Horizon Node Maintenance',
    message:
      'Routine Soroban smart contract anchor upgrade completed smoothly. 100% paymaster uptime verified.',
    target: 'active',
    category: 'critical',
    sentAt: Date.now() - 1000 * 60 * 60 * 26,
    deliveredCount: 5,
    adminEmail: 'admin@aeropay.network',
  },
];

const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  rwfRate: 1420.0,
  kesRate: 129.5,
  feeSpreadPercent: 0.15,
  flatFeeUsd: 0.5,
  maintenanceMode: false,
  autoRoundupSweepActive: true,
  paymasterGasCoverage: true,
  liquidityPoolReserveUsdc: 2450000.0,
  rwandaMoMoActive: true,
  kenyaMpesaActive: true,
  ugandaAirtelActive: true,
  maxSingleTxLimitUsd: 10000,
  amlVelocityThresholdUsd: 25000,
  virtualCardsMasterActive: true,
  gasRelayerBalanceXlm: 14850,
};

const INITIAL_ADMIN_PROFILE: AdminProfileInfo = {
  name: 'Root Supervisor Console',
  email: 'admin@aeropay.network',
  title: 'Chief Security Officer & Core Paymaster',
  department: 'Financial Infrastructure & Settlement',
  clearanceLevel: 'LEVEL 4 • FULL ROOT CONTROL',
  twoFactorEnabled: true,
  hardwareKeyEnabled: true,
  ipWhitelist: '197.243.22.0/24 (Kigali Anchor NOC)',
  sessionTimeoutMins: 30,
  lastSecurityAudit: 'Verified (2026-08-09 22:00 UTC)',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(INITIAL_USERS[0]);
  const [usersList, setUsersList] = useState<AppUser[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [broadcastsList, setBroadcastsList] = useState<AdminBroadcast[]>(INITIAL_BROADCASTS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SYSTEM_SETTINGS);
  const [adminProfile, setAdminProfile] = useState<AdminProfileInfo>(INITIAL_ADMIN_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAuthenticated = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';

  const addAuditLog = (action: string, details: string, targetUserEmail?: string) => {
    const newLog: AdminAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: Date.now(),
      adminEmail: currentUser?.email || 'admin@aeropay.network',
      action,
      targetUserEmail,
      details,
      ipAddress: '197.243.22.18',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string; user?: AppUser }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const normalizedEmail = email.trim().toLowerCase();

    // Check Admin credentials
    if (normalizedEmail === 'admin@aeropay.network' || normalizedEmail === 'admin') {
      if (password && password !== 'Admin@123' && password !== 'admin') {
        setIsLoading(false);
        return { success: false, error: 'Invalid admin credentials. Demo password is Admin@123' };
      }
      const adminUser = usersList.find((u) => u.role === 'admin') || INITIAL_USERS[1];
      setCurrentUser(adminUser);
      addAuditLog('ADMIN_LOGIN', 'Administrator logged into the AeroPay Operations Hub');
      setIsLoading(false);
      return { success: true, user: adminUser };
    }

    // Check matching user from list
    const foundUser = usersList.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail ||
        (normalizedEmail === 'user@aeropay.network' && u.email === 'shema@aeropay.network') ||
        (normalizedEmail === 'user' && u.email === 'shema@aeropay.network')
    );

    if (foundUser) {
      if (foundUser.status === 'suspended') {
        setIsLoading(false);
        return {
          success: false,
          error:
            'This account has been suspended by system administrators. Please contact support.',
        };
      }

      if (password && password !== 'User@123' && password !== 'user' && password !== 'password') {
        setIsLoading(false);
        return { success: false, error: 'Incorrect password. Demo password is User@123' };
      }

      const updatedUser = { ...foundUser, lastLogin: 'Just now' };
      setCurrentUser(updatedUser);
      setIsLoading(false);
      return { success: true, user: updatedUser };
    }

    // Auto-create new consumer profile if logging in with new valid email
    if (normalizedEmail.includes('@')) {
      const newUser: AppUser = {
        id: 'usr-' + Date.now(),
        name: normalizedEmail.split('@')[0].toUpperCase(),
        email: normalizedEmail,
        phone: '+250 788 ' + Math.floor(100000 + Math.random() * 900000),
        role: 'user',
        status: 'active',
        kycTier: 'Tier 1 (Basic)',
        balanceUsd: 100.0,
        joinedDate: 'Today',
        avatarColor: '#A51C24',
        lastLogin: 'Just now',
        totalTransferredUsd: 0,
        virtualCardActive: true,
      };
      setUsersList((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      setIsLoading(false);
      return { success: true, user: newUser };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'User not found. Try shema@aeropay.network or admin@aeropay.network',
    };
  };

  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string; user?: AppUser }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = usersList.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existing) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: AppUser = {
      id: 'usr-' + Date.now(),
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim() || '+250 788 000 000',
      role: data.role || 'user',
      status: 'active',
      kycTier: 'Tier 1 (Basic)',
      balanceUsd: 50.0, // Welcome bonus
      joinedDate: 'Today',
      avatarColor: data.role === 'admin' ? '#6366F1' : '#A51C24',
      lastLogin: 'Just now',
      totalTransferredUsd: 0,
      virtualCardActive: true,
    };

    setUsersList((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    if (newUser.role === 'admin') {
      addAuditLog('NEW_ADMIN_REGISTERED', `New admin account registered: ${newUser.email}`);
    }
    setIsLoading(false);
    return { success: true, user: newUser };
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setCurrentUser(null);
    setIsLoading(false);
  };

  const quickLoginDemo = async (role: 'user' | 'admin'): Promise<AppUser> => {
    if (role === 'admin') {
      const adminUser = usersList.find((u) => u.role === 'admin') || INITIAL_USERS[1];
      setCurrentUser(adminUser);
      addAuditLog('QUICK_DEMO_LOGIN', 'Logged in using 1-Tap Admin Demo credentials');
      return adminUser;
    } else {
      const normalUser =
        usersList.find((u) => u.email === 'shema@aeropay.network') || INITIAL_USERS[0];
      setCurrentUser(normalUser);
      return normalUser;
    }
  };

  const updateUserStatus = (userId: string, status: UserStatus, reason?: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addAuditLog(
            `STATUS_CHANGED_${status.toUpperCase()}`,
            `User ${u.email} status changed to "${status}". Reason: ${reason || 'Administrative action'}`,
            u.email
          );
          return { ...u, status };
        }
        return u;
      })
    );
  };

  const updateUserKyc = (userId: string, kycTier: KycTier) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addAuditLog('KYC_TIER_UPDATED', `User ${u.email} KYC upgraded to "${kycTier}"`, u.email);
          return { ...u, kycTier };
        }
        return u;
      })
    );
  };

  const adjustUserBalance = (userId: string, deltaAmount: number, reason: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newBalance = Math.max(0, u.balanceUsd + deltaAmount);
          addAuditLog(
            'BALANCE_ADJUSTMENT',
            `Adjusted ${u.email} balance by ${deltaAmount >= 0 ? '+' : ''}$${deltaAmount.toFixed(2)} USDC. Reason: ${reason}. New Balance: $${newBalance.toFixed(2)} USDC`,
            u.email
          );
          if (currentUser?.id === userId) {
            setCurrentUser((curr) => (curr ? { ...curr, balanceUsd: newBalance } : null));
          }
          return { ...u, balanceUsd: newBalance };
        }
        return u;
      })
    );
  };

  const resetUserPin = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addAuditLog(
            'PIN_SECURITY_RESET',
            `Dispatched temporary PIN reset token to ${u.email}`,
            u.email
          );
          return { ...u, pinResetRequested: true };
        }
        return u;
      })
    );
  };

  const toggleUserVirtualCard = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextCard = !u.virtualCardActive;
          addAuditLog(
            'CARD_STATUS_TOGGLE',
            `Virtual debit card for ${u.email} set to ${nextCard ? 'ACTIVE' : 'FROZEN'}`,
            u.email
          );
          return { ...u, virtualCardActive: nextCard };
        }
        return u;
      })
    );
  };

  const updateSystemSettings = (partialSettings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => {
      const updated = { ...prev, ...partialSettings };
      addAuditLog(
        'SYSTEM_SETTINGS_UPDATED',
        `System settings modified: ${JSON.stringify(partialSettings)}`
      );
      return updated;
    });
  };

  const sendBroadcastNotification = (data: {
    title: string;
    message: string;
    target: NotificationTarget;
    category: NotificationCategory;
  }): AdminBroadcast => {
    const targetCount =
      data.target === 'all'
        ? usersList.length
        : data.target === 'active'
          ? usersList.filter((u) => u.status === 'active').length
          : data.target === 'flagged'
            ? usersList.filter((u) => u.status === 'flagged').length
            : usersList.filter((u) => u.kycTier === 'Tier 3 (Institutional)').length;

    const newBroadcast: AdminBroadcast = {
      id: 'bc-' + Date.now(),
      title: data.title,
      message: data.message,
      target: data.target,
      category: data.category,
      sentAt: Date.now(),
      deliveredCount: targetCount,
      adminEmail: currentUser?.email || 'admin@aeropay.network',
    };

    setBroadcastsList((prev) => [newBroadcast, ...prev]);
    addAuditLog(
      'NOTIFICATION_BROADCAST',
      `Sent push announcement "${data.title}" to target group [${data.target.toUpperCase()}] (${targetCount} users)`
    );
    return newBroadcast;
  };

  const updateAdminProfile = (partial: Partial<AdminProfileInfo>) => {
    setAdminProfile((prev) => {
      const updated = { ...prev, ...partial };
      addAuditLog('ADMIN_PROFILE_UPDATED', `Supervisor security profile modified`);
      return updated;
    });
  };

  const topUpGasRelayer = (amountXlm: number) => {
    setSystemSettings((prev) => {
      const nextGas = prev.gasRelayerBalanceXlm + amountXlm;
      addAuditLog(
        'GAS_RELAYER_TOPUP',
        `Injected +${amountXlm.toLocaleString()} XLM into Soroban gas sponsorship relayer pool`
      );
      return { ...prev, gasRelayerBalanceXlm: nextGas };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        usersList,
        auditLogs,
        systemSettings,
        broadcastsList,
        adminProfile,
        isLoading,
        login,
        signup,
        logout,
        quickLoginDemo,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
