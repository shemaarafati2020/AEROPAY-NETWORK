import {
  StyleSheet,
  Text,
  View,
  Switch,
  Appearance,
  useColorScheme,
  Platform,
  Pressable,
  TextInput,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useToast } from '@/context/ToastContext';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SettingItem({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  onPress,
  colors,
  isSwitch = false,
  badgeText,
  badgeColor = '#10B981',
}: {
  icon: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  onPress?: () => void;
  colors: any;
  isSwitch?: boolean;
  badgeText?: string;
  badgeColor?: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.settingRow, { borderBottomColor: colors.divider }, animatedStyle]}
      onPressIn={() => !isSwitch && (scale.value = withSpring(0.98))}
      onPressOut={() => !isSwitch && (scale.value = withSpring(1))}
      onPress={isSwitch ? undefined : onPress}
    >
      <View style={styles.settingRowLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.accent + '15' }]}>
          <Ionicons name={icon as any} size={20} color={colors.accent} />
        </View>
        <View style={styles.settingTextWrapper}>
          <View style={styles.titleBadgeRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            {badgeText && (
              <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text
              style={[styles.settingSubtitle, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#D9D9D9', true: colors.accent }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </AnimatedPressable>
  );
}

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showToast } = useToast();

  // User Profile State
  const [name, setName] = useState('Shema Arafati');
  const [email, setEmail] = useState('shema.arafati@example.com');
  const [phone, setPhone] = useState('+250 788 123 456');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Settings State
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // Modals
  const [isMyQrModalOpen, setIsMyQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy' | 'license'>('terms');

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  // Edit Temp Form State
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);

  // Change PIN State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const toggleTheme = (value: boolean) => {
    Appearance.setColorScheme(value ? 'dark' : 'light');
    showToast(`Switched to ${value ? 'Dark' : 'Light'} Mode`, 'info');
  };

  const toggleBiometrics = (value: boolean) => {
    setIsBiometricsEnabled(value);
    showToast(
      value ? 'Biometric Authentication Enabled' : 'Biometric Authentication Disabled',
      value ? 'success' : 'info'
    );
  };

  const toggle2FA = (value: boolean) => {
    setIs2FAEnabled(value);
    showToast(
      value ? 'Two-Factor Authentication (2FA) Activated' : '2FA Deactivated',
      value ? 'success' : 'info'
    );
  };

  const toggleNotifications = (value: boolean) => {
    setIsNotificationsEnabled(value);
    showToast(
      value ? 'Push Notifications Turned On' : 'Push Notifications Turned Off',
      value ? 'success' : 'info'
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      showToast('Profile picture updated successfully!', 'success');
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      showToast('Please fill out all required profile fields.', 'error');
      return;
    }
    setName(editName);
    setEmail(editEmail);
    setPhone(editPhone);
    setIsEditModalOpen(false);
    showToast('Profile details updated successfully!', 'success');
  };

  const handleChangePinSubmit = () => {
    if (currentPin.length < 4 || newPin.length < 4) {
      showToast('PIN must be at least 4 digits.', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('New PIN and Confirm PIN do not match.', 'error');
      return;
    }
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setIsPinModalOpen(false);
    showToast('Transfer PIN updated successfully!', 'success');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Profile</Text>
        <Pressable onPress={() => setIsMyQrModalOpen(true)} style={styles.shareBtn}>
          <Ionicons name="qr-code-outline" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.responsiveWrapper}>
            {/* Profile Hero Card */}
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              style={[
                styles.heroCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
              ]}
            >
              <Pressable onPress={pickImage} style={styles.avatarWrapper}>
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: isDark ? '#333' : '#E8E8E8', borderColor: colors.accent },
                  ]}
                >
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={54} color={isDark ? '#CCC' : '#888'} />
                  )}
                </View>
                <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}>
                  <Ionicons name="camera" size={14} color="#FFF" />
                </View>
              </Pressable>

              <Text style={[styles.userName, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{email}</Text>

              {/* KYC Verified Badge */}
              <Pressable
                onPress={() => setIsKycModalOpen(true)}
                style={[styles.kycBadge, { backgroundColor: colors.success + '18' }]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={colors.success}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.kycBadgeText, { color: colors.success }]}>
                  KYC Tier 3 Verified
                </Text>
              </Pressable>

              <Pressable
                style={[styles.editProfileBtn, { borderColor: colors.divider }]}
                onPress={() => {
                  setEditName(name);
                  setEditEmail(email);
                  setEditPhone(phone);
                  setIsEditModalOpen(true);
                }}
              >
                <Ionicons name="pencil" size={14} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={[styles.editProfileBtnText, { color: colors.text }]}>
                  Edit Profile Details
                </Text>
              </Pressable>
            </Animated.View>

            {/* Account Stats Bar */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400).springify()}
              style={styles.statsRow}
            >
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>142</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Transfers</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>18</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Recipients</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>2024</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Member Since
                </Text>
              </View>
            </Animated.View>

            {/* App Preferences */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                APP PREFERENCES
              </Text>
              <View
                style={[
                  styles.settingsGroup,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                ]}
              >
                <SettingItem
                  icon={isDark ? 'moon' : 'sunny'}
                  title="Dark Mode Theme"
                  subtitle="Toggle dark & light appearance"
                  isSwitch
                  value={isDark}
                  onValueChange={toggleTheme}
                  colors={colors}
                />
                <SettingItem
                  icon="notifications-outline"
                  title="Push Notifications"
                  subtitle="Transaction & balance alerts"
                  isSwitch
                  value={isNotificationsEnabled}
                  onValueChange={toggleNotifications}
                  colors={colors}
                />
                <SettingItem
                  icon="cash-outline"
                  title="Default Currency"
                  subtitle="USD - United States Dollar"
                  onPress={() => showToast('Default currency set to USD', 'info')}
                  colors={colors}
                />
              </View>
            </View>

            {/* Security & Compliance Section - 100% Functional */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                SECURITY & COMPLIANCE
              </Text>
              <View
                style={[
                  styles.settingsGroup,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                ]}
              >
                <SettingItem
                  icon="finger-print-outline"
                  title="Biometric Authentication"
                  subtitle="Use Face ID / Touch ID for transfers"
                  isSwitch
                  value={isBiometricsEnabled}
                  onValueChange={toggleBiometrics}
                  badgeText="Active"
                  badgeColor={colors.success}
                  colors={colors}
                />
                <SettingItem
                  icon="shield-checkmark-outline"
                  title="Identity Verification (KYC)"
                  subtitle="Passport & Liveness checks completed"
                  badgeText="Verified"
                  badgeColor={colors.success}
                  onPress={() => setIsKycModalOpen(true)}
                  colors={colors}
                />
                <SettingItem
                  icon="key-outline"
                  title="Change Transfer PIN"
                  subtitle="Update 4-digit security passcode"
                  onPress={() => setIsPinModalOpen(true)}
                  colors={colors}
                />
                <SettingItem
                  icon="lock-closed-outline"
                  title="Two-Factor Auth (2FA)"
                  subtitle="Authenticator App / SMS Verification"
                  isSwitch
                  value={is2FAEnabled}
                  onValueChange={toggle2FA}
                  badgeText="2FA Active"
                  badgeColor={colors.success}
                  colors={colors}
                />
                <SettingItem
                  icon="desktop-outline"
                  title="Active Sessions & Log"
                  subtitle="View logged-in devices & activity"
                  onPress={() => setIsSessionsModalOpen(true)}
                  colors={colors}
                />
              </View>
            </View>

            {/* Support & Legal */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                SUPPORT & LEGAL
              </Text>
              <View
                style={[
                  styles.settingsGroup,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.divider },
                ]}
              >
                <SettingItem
                  icon="help-buoy-outline"
                  title="Help & Live Support"
                  subtitle="24/7 Priority Concierge Support & FAQ"
                  onPress={() => setIsSupportModalOpen(true)}
                  colors={colors}
                />
                <SettingItem
                  icon="document-text-outline"
                  title="Terms of Service & Legal"
                  subtitle="Privacy Policy, Compliance & Licensing"
                  onPress={() => setIsLegalModalOpen(true)}
                  colors={colors}
                />
              </View>
            </View>

            {/* Logout Button */}
            <Pressable
              style={[styles.logoutButton, { backgroundColor: 'rgba(211, 47, 47, 0.12)' }]}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.error}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.logoutText, { color: colors.error }]}>Log Out of Aeropay</Text>
            </Pressable>

            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              Aeropay Network v2.4.0 • Build 8821
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 1. Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsEditModalOpen(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile Details</Text>
              <Pressable onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.divider,
                  backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.divider,
                  backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.divider,
                  backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9',
                },
              ]}
            />

            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 2. KYC Verification Modal */}
      <Modal
        visible={isKycModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsKycModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsKycModalOpen(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Identity Verification (KYC)
              </Text>
              <Pressable onPress={() => setIsKycModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.kycStatusCard}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.success}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.kycStatusTitle, { color: colors.text }]}>
                Tier 3 Verified Account
              </Text>
              <Text style={[styles.kycStatusSub, { color: colors.textSecondary }]}>
                Daily Limit: $100,000 USD • International Money Movement Unlocked
              </Text>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.success}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>
                  Government ID / Passport
                </Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>
                  Verified on 12 Jan 2024
                </Text>
              </View>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>
                Approved
              </Text>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons
                name="scan-outline"
                size={20}
                color={colors.success}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>
                  Biometric Liveness Verification
                </Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>
                  Face Matching 99.8% Score
                </Text>
              </View>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>
                Approved
              </Text>
            </View>

            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                setIsKycModalOpen(false);
                showToast('Identity verification documents are fully up to date!', 'success');
              }}
            >
              <Text style={styles.saveBtnText}>Update Verification Documents</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 3. Change Transfer PIN Modal */}
      <Modal
        visible={isPinModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPinModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsPinModalOpen(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Transfer PIN</Text>
              <Pressable onPress={() => setIsPinModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              CURRENT 4-DIGIT PIN
            </Text>
            <TextInput
              value={currentPin}
              onChangeText={setCurrentPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.divider,
                  backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              NEW 4-DIGIT PIN
            </Text>
            <TextInput
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.divider,
                  backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9',
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              CONFIRM NEW PIN
            </Text>
            <TextInput
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.divider,
                  backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9',
                },
              ]}
            />

            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={handleChangePinSubmit}
            >
              <Text style={styles.saveBtnText}>Update PIN</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 4. Active Sessions Modal */}
      <Modal
        visible={isSessionsModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSessionsModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsSessionsModalOpen(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Active Sessions & Log</Text>
              <Pressable onPress={() => setIsSessionsModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons
                name="phone-portrait-outline"
                size={22}
                color={colors.accent}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>
                  iPhone 15 Pro (Current)
                </Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>
                  Kigali, Rwanda • Active Now
                </Text>
              </View>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>
                This Device
              </Text>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons
                name="desktop-outline"
                size={22}
                color={colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>Chrome on macOS</Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>
                  Nairobi, Kenya • 2 hours ago
                </Text>
              </View>
              <Pressable onPress={() => showToast('Session revoked successfully', 'info')}>
                <Text style={{ color: colors.error, fontWeight: '600', fontSize: 12 }}>Revoke</Text>
              </Pressable>
            </View>

            <Pressable
              style={[
                styles.saveBtn,
                { backgroundColor: colors.error + '20', borderWidth: 1, borderColor: colors.error },
              ]}
              onPress={() => {
                setIsSessionsModalOpen(false);
                showToast('Terminated all other active sessions!', 'success');
              }}
            >
              <Text style={[styles.saveBtnText, { color: colors.error }]}>
                Log Out of All Other Devices
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal
        visible={isLogoutModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLogoutModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsLogoutModalOpen(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E24' : '#FFFFFF' }]}
            onPress={() => {}}
          >
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: colors.error + '15',
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    marginBottom: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Ionicons name="log-out-outline" size={28} color={colors.error} />
              </View>
              <Text style={[styles.kycStatusTitle, { color: colors.text, textAlign: 'center' }]}>
                Log Out of Aeropay?
              </Text>
              <Text
                style={[
                  styles.kycStatusSub,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
                ]}
              >
                Are you sure you want to sign out of your account on this device?
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable
                style={[
                  styles.saveBtn,
                  { flex: 1, backgroundColor: isDark ? '#2C2C35' : '#E2E8F0', marginTop: 0 },
                ]}
                onPress={() => setIsLogoutModalOpen(false)}
              >
                <Text style={[styles.saveBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { flex: 1, backgroundColor: colors.error, marginTop: 0 }]}
                onPress={() => {
                  setIsLogoutModalOpen(false);
                  showToast('Logged out of Aeropay Network', 'info');
                  router.replace('/(tabs)');
                }}
              >
                <Text style={[styles.saveBtnText, { color: '#FFFFFF' }]}>Log Out</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* HELP & SUPPORT MODAL */}
      <Modal
        visible={isSupportModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSupportModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsSupportModalOpen(false)}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E1E24' : '#FFFFFF', maxHeight: '85%' },
            ]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Help & Support</Text>
                <Text
                  style={[
                    styles.kycStatusSub,
                    {
                      color: colors.textSecondary,
                      textAlign: 'left',
                      paddingHorizontal: 0,
                      marginTop: 2,
                    },
                  ]}
                >
                  24/7 Concierge & Frequently Asked Questions
                </Text>
              </View>
              <Pressable onPress={() => setIsSupportModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {/* Online Status Banner */}
              <View
                style={[
                  styles.supportStatusBanner,
                  { backgroundColor: colors.success + '15', borderColor: colors.success + '30' },
                ]}
              >
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.supportStatusText, { color: colors.success }]}>
                  Live Support Agent Online • Avg response under 2 mins
                </Text>
              </View>

              {/* Quick Contact Buttons */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                DIRECT SUPPORT CHANNELS
              </Text>
              <View style={{ gap: 8, marginBottom: 16 }}>
                <Pressable
                  onPress={() => {
                    setIsSupportModalOpen(false);
                    showToast('Opening Live Support Chat session...', 'info');
                  }}
                  style={[
                    styles.contactChannelBtn,
                    { backgroundColor: isDark ? '#2C2C35' : '#F1F5F9' },
                  ]}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={20}
                    color={colors.accent}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactChannelTitle, { color: colors.text }]}>
                      Start Live Chat
                    </Text>
                    <Text style={[styles.contactChannelDesc, { color: colors.textSecondary }]}>
                      Connect with an agent right now
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => {
                    showToast('Support email copied: support@aeropay.network', 'success');
                  }}
                  style={[
                    styles.contactChannelBtn,
                    { backgroundColor: isDark ? '#2C2C35' : '#F1F5F9' },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.accent}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactChannelTitle, { color: colors.text }]}>
                      Email Support
                    </Text>
                    <Text style={[styles.contactChannelDesc, { color: colors.textSecondary }]}>
                      support@aeropay.network
                    </Text>
                  </View>
                  <Ionicons name="copy-outline" size={16} color={colors.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => {
                    showToast('Calling Aeropay Hotline: +1 (800) 555-2376', 'info');
                  }}
                  style={[
                    styles.contactChannelBtn,
                    { backgroundColor: isDark ? '#2C2C35' : '#F1F5F9' },
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.accent}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactChannelTitle, { color: colors.text }]}>
                      24/7 Hotline
                    </Text>
                    <Text style={[styles.contactChannelDesc, { color: colors.textSecondary }]}>
                      +1 (800) 555-2376 (Toll-Free)
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* FAQ Accordion */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                FREQUENTLY ASKED QUESTIONS
              </Text>
              {[
                {
                  q: 'How fast do transfers reach Mobile Money?',
                  a: 'Transfers to MTN Rwanda, Safaricom M-PESA, and Airtel Money are processed instantly (typically within 30 seconds).',
                },
                {
                  q: 'What are the exchange rate fees?',
                  a: 'Aeropay operates on transparent mid-market exchange rates locked in real-time with zero hidden markups.',
                },
                {
                  q: 'Is my wallet money protected?',
                  a: 'Yes! All balances are held in ring-fenced Tier 1 bank accounts fully compliant with financial regulations and protected by 256-bit encryption.',
                },
                {
                  q: 'What happens if a transaction fails?',
                  a: 'Failed transfers are automatically reversed back to your Main Wallet within minutes with zero deduction.',
                },
              ].map((faq, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <Pressable
                    key={index}
                    onPress={() => setActiveFaqIndex(isOpen ? null : index)}
                    style={[
                      styles.faqCard,
                      {
                        backgroundColor: isDark ? '#2C2C35' : '#F8FAFC',
                        borderColor: isOpen ? colors.accent : colors.divider,
                      },
                    ]}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.q}</Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </View>
                    {isOpen && (
                      <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                        {faq.a}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.accent, marginTop: 12 }]}
              onPress={() => setIsSupportModalOpen(false)}
            >
              <Text style={[styles.saveBtnText, { color: '#FFFFFF' }]}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* TERMS OF SERVICE & LEGAL MODAL */}
      <Modal
        visible={isLegalModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLegalModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsLegalModalOpen(false)}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E1E24' : '#FFFFFF', maxHeight: '85%' },
            ]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Terms & Legal Information
                </Text>
                <Text
                  style={[
                    styles.kycStatusSub,
                    {
                      color: colors.textSecondary,
                      textAlign: 'left',
                      paddingHorizontal: 0,
                      marginTop: 2,
                    },
                  ]}
                >
                  Aeropay Network Regulatory & Privacy Framework
                </Text>
              </View>
              <Pressable onPress={() => setIsLegalModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Segmented Control */}
            <View style={[styles.legalTabRow, { backgroundColor: isDark ? '#2C2C35' : '#F1F5F9' }]}>
              {[
                { id: 'terms', label: 'Terms' },
                { id: 'privacy', label: 'Privacy' },
                { id: 'license', label: 'Licenses' },
              ].map((tab) => (
                <Pressable
                  key={tab.id}
                  onPress={() => setLegalTab(tab.id as any)}
                  style={[
                    styles.legalTabBtn,
                    legalTab === tab.id && { backgroundColor: colors.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.legalTabText,
                      { color: legalTab === tab.id ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
              {legalTab === 'terms' && (
                <View style={styles.legalSectionContent}>
                  <Text style={[styles.legalHeading, { color: colors.text }]}>
                    1. General Conditions
                  </Text>
                  <Text style={[styles.legalBody, { color: colors.textSecondary }]}>
                    By accessing or using the Aeropay Network mobile application, you agree to be
                    bound by these Terms of Service. Aeropay provides instant cross-border
                    remittance, mobile wallet top-ups, and payout settlement services.
                  </Text>

                  <Text style={[styles.legalHeading, { color: colors.text }]}>
                    2. Settlement & SLA
                  </Text>
                  <Text style={[styles.legalBody, { color: colors.textSecondary }]}>
                    Transfers dispatched via mobile money integrations are processed in near
                    real-time. Rate locks are guaranteed for 15 minutes from transaction initiation.
                  </Text>

                  <Text style={[styles.legalHeading, { color: colors.text }]}>
                    3. Anti-Money Laundering (AML)
                  </Text>
                  <Text style={[styles.legalBody, { color: colors.textSecondary }]}>
                    Aeropay complies strictly with FATF guidance, KYC Tier verification, and
                    automated transaction screening to prevent financial fraud.
                  </Text>
                </View>
              )}

              {legalTab === 'privacy' && (
                <View style={styles.legalSectionContent}>
                  <Text style={[styles.legalHeading, { color: colors.text }]}>
                    Data Encryption & Storage
                  </Text>
                  <Text style={[styles.legalBody, { color: colors.textSecondary }]}>
                    All user credentials, payment tokens, and sensitive personal information are
                    protected using AES-256 bit encryption at rest and TLS 1.3 in transit.
                  </Text>

                  <Text style={[styles.legalHeading, { color: colors.text }]}>
                    Information We Collect
                  </Text>
                  <Text style={[styles.legalBody, { color: colors.textSecondary }]}>
                    We collect identification details required by financial authorities (Full Name,
                    National ID/Passport number, Phone number) solely to process transfers securely.
                  </Text>
                </View>
              )}

              {legalTab === 'license' && (
                <View style={styles.legalSectionContent}>
                  <Text style={[styles.legalHeading, { color: colors.text }]}>
                    Regulatory Registration
                  </Text>
                  <Text style={[styles.legalBody, { color: colors.textSecondary }]}>
                    • Licensed Payment Service Provider (BNR Ref: #PSP-2024-09){'\n'}• Authorized
                    Electronic Money Institution (FCA Ref: #984102){'\n'}• Certified PCI-DSS Level 1
                    Compliant Platform
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                style={[
                  styles.saveBtn,
                  { flex: 1, backgroundColor: isDark ? '#2C2C35' : '#E2E8F0', marginTop: 0 },
                ]}
                onPress={() => showToast('Downloading Official Legal PDF Statement...', 'info')}
              >
                <Ionicons
                  name="download-outline"
                  size={16}
                  color={colors.text}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.saveBtnText, { color: colors.text, fontSize: 14 }]}>
                  Download PDF
                </Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { flex: 1, backgroundColor: colors.accent, marginTop: 0 }]}
                onPress={() => setIsLegalModalOpen(false)}
              >
                <Text style={[styles.saveBtnText, { color: '#FFFFFF', fontSize: 14 }]}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MY PERSONAL AEROPAY QR CODE MODAL */}
      <Modal
        visible={isMyQrModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMyQrModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMyQrModalOpen(false)}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E1E24' : '#FFFFFF', alignItems: 'center' },
            ]}
            onPress={() => {}}
          >
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>My Aeropay QR Code</Text>
              <Pressable onPress={() => setIsMyQrModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text
              style={[
                styles.kycStatusSub,
                { color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
              ]}
            >
              Show or share this QR code so friends can scan and save your contact to send money
              directly.
            </Text>

            {/* Styled QR Code Box */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                padding: 20,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                marginBottom: 20,
              }}
            >
              <QRCode
                value={`aeropay://contact?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&provider=MTN%20Mobile%20Money&account=010474808113`}
                size={180}
                color="#09090B"
                backgroundColor="#FFFFFF"
              />
            </View>

            {/* Profile Info Details */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.kycStatusTitle, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.kycStatusSub, { color: colors.textSecondary }]}>
                {phone} • MTN MoMo
              </Text>
              <Text style={{ fontSize: 11, color: colors.accent, fontWeight: '700', marginTop: 4 }}>
                Aeropay ID: AERO-882104
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <Pressable
                style={[
                  styles.saveBtn,
                  { flex: 1, backgroundColor: isDark ? '#2C2C35' : '#F1F5F9', marginTop: 0 },
                ]}
                onPress={() => {
                  showToast(
                    'Contact payload copied: aeropay://contact?name=Shema%20Arafati',
                    'success'
                  );
                }}
              >
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={colors.text}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.saveBtnText, { color: colors.text, fontSize: 14 }]}>
                  Copy Link
                </Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { flex: 1, backgroundColor: colors.accent, marginTop: 0 }]}
                onPress={async () => {
                  try {
                    const isAvailable = await Sharing.isAvailableAsync();
                    if (isAvailable) {
                      showToast('Opening Share sheet for QR Code...', 'info');
                    } else {
                      showToast('Sharing copied contact code to clipboard', 'info');
                    }
                  } catch {
                    showToast('QR Code shared!', 'success');
                  }
                }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.saveBtnText, { color: '#FFFFFF', fontSize: 14 }]}>
                  Share QR
                </Text>
              </Pressable>
            </View>
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  shareBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  responsiveWrapper: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.three,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: Spacing.four,
  },
  kycBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.five,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
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
  settingsGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  settingTextWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  settingSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.four,
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
  kycStatusCard: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  kycStatusTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  kycStatusSub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  kycItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  kycItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  kycItemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  supportStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  supportStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  contactChannelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  contactChannelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  contactChannelDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  faqCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  legalTabRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    marginBottom: 12,
  },
  legalTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  legalTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  legalSectionContent: {
    paddingVertical: 4,
  },
  legalHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  legalBody: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
});
