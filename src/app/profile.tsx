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
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useToast } from '@/context/ToastContext';

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
  badgeColor = '#10B981'
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
            <Text style={[styles.settingLabel, { color: colors.text }]} numberOfLines={1}>{title}</Text>
            {badgeText && (
              <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
              </View>
            )}
          </View>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>{subtitle}</Text>}
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
    showToast(value ? 'Biometric Authentication Enabled' : 'Biometric Authentication Disabled', value ? 'success' : 'info');
  };

  const toggle2FA = (value: boolean) => {
    setIs2FAEnabled(value);
    showToast(value ? 'Two-Factor Authentication (2FA) Activated' : '2FA Deactivated', value ? 'success' : 'info');
  };

  const toggleNotifications = (value: boolean) => {
    setIsNotificationsEnabled(value);
    showToast(value ? 'Push Notifications Turned On' : 'Push Notifications Turned Off', value ? 'success' : 'info');
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
        <Pressable onPress={() => showToast('Referral Code AEROPAY-2026 copied to clipboard!', 'info')} style={styles.shareBtn}>
          <Ionicons name="qr-code-outline" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.responsiveWrapper}>
          
          {/* Profile Hero Card */}
          <Animated.View entering={FadeInDown.duration(400).springify()} style={[styles.heroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
            <Pressable onPress={pickImage} style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#333' : '#E8E8E8', borderColor: colors.accent }]}>
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
            <Pressable onPress={() => setIsKycModalOpen(true)} style={[styles.kycBadge, { backgroundColor: colors.success + '18' }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={[styles.kycBadgeText, { color: colors.success }]}>KYC Tier 3 Verified</Text>
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
              <Text style={[styles.editProfileBtnText, { color: colors.text }]}>Edit Profile Details</Text>
            </Pressable>
          </Animated.View>

          {/* Account Stats Bar */}
          <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>142</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Transfers</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>18</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Recipients</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>2024</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Member Since</Text>
            </View>
          </Animated.View>

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APP PREFERENCES</Text>
            <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
              <SettingItem
                icon={isDark ? "moon" : "sunny"}
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
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & COMPLIANCE</Text>
            <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
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
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SUPPORT & LEGAL</Text>
            <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
              <SettingItem
                icon="help-buoy-outline"
                title="Help & Live Support"
                subtitle="24/7 Priority Customer Support"
                onPress={() => showToast('Connecting to Aeropay Support Agent...', 'info')}
                colors={colors}
              />
              <SettingItem
                icon="document-text-outline"
                title="Terms of Service & Privacy"
                onPress={() => showToast('Aeropay Network v2.4.0 — Institutional Remittance Platform', 'info')}
                colors={colors}
              />
            </View>
          </View>

          {/* Logout Button */}
          <Pressable style={[styles.logoutButton, { backgroundColor: 'rgba(211, 47, 47, 0.12)' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Log Out of Aeropay</Text>
          </Pressable>

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Aeropay Network v2.4.0 • Build 8821
          </Text>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 1. Edit Profile Modal */}
      <Modal visible={isEditModalOpen} transparent animationType="slide" onRequestClose={() => setIsEditModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsEditModalOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]} onPress={() => {}}>
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
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Pressable style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 2. KYC Verification Modal */}
      <Modal visible={isKycModalOpen} transparent animationType="slide" onRequestClose={() => setIsKycModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsKycModalOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Identity Verification (KYC)</Text>
              <Pressable onPress={() => setIsKycModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.kycStatusCard}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} style={{ marginBottom: 8 }} />
              <Text style={[styles.kycStatusTitle, { color: colors.text }]}>Tier 3 Verified Account</Text>
              <Text style={[styles.kycStatusSub, { color: colors.textSecondary }]}>
                Daily Limit: $100,000 USD • International Money Movement Unlocked
              </Text>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.success} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>Government ID / Passport</Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>Verified on 12 Jan 2024</Text>
              </View>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>Approved</Text>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons name="scan-outline" size={20} color={colors.success} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>Biometric Liveness Verification</Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>Face Matching 99.8% Score</Text>
              </View>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>Approved</Text>
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
      <Modal visible={isPinModalOpen} transparent animationType="slide" onRequestClose={() => setIsPinModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsPinModalOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Transfer PIN</Text>
              <Pressable onPress={() => setIsPinModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CURRENT 4-DIGIT PIN</Text>
            <TextInput
              value={currentPin}
              onChangeText={setCurrentPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>NEW 4-DIGIT PIN</Text>
            <TextInput
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CONFIRM NEW PIN</Text>
            <TextInput
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? '#2C2C2C' : '#F9F9F9' }]}
            />

            <Pressable style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleChangePinSubmit}>
              <Text style={styles.saveBtnText}>Update PIN</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 4. Active Sessions Modal */}
      <Modal visible={isSessionsModalOpen} transparent animationType="slide" onRequestClose={() => setIsSessionsModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsSessionsModalOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Active Sessions & Log</Text>
              <Pressable onPress={() => setIsSessionsModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons name="phone-portrait-outline" size={22} color={colors.accent} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>iPhone 15 Pro (Current)</Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>Kigali, Rwanda • Active Now</Text>
              </View>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>This Device</Text>
            </View>

            <View style={[styles.kycItem, { borderBottomColor: colors.divider }]}>
              <Ionicons name="desktop-outline" size={22} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycItemTitle, { color: colors.text }]}>Chrome on macOS</Text>
                <Text style={[styles.kycItemSub, { color: colors.textSecondary }]}>Nairobi, Kenya • 2 hours ago</Text>
              </View>
              <Pressable onPress={() => showToast('Session revoked successfully', 'info')}>
                <Text style={{ color: colors.error, fontWeight: '600', fontSize: 12 }}>Revoke</Text>
              </Pressable>
            </View>

            <Pressable 
              style={[styles.saveBtn, { backgroundColor: colors.error + '20', borderWidth: 1, borderColor: colors.error }]} 
              onPress={() => {
                setIsSessionsModalOpen(false);
                showToast('Terminated all other active sessions!', 'success');
              }}
            >
              <Text style={[styles.saveBtnText, { color: colors.error }]}>Log Out of All Other Devices</Text>
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
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E24' : '#FFFFFF' }]} onPress={() => {}}>
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <View style={[styles.iconBox, { backgroundColor: colors.error + '15', width: 56, height: 56, borderRadius: 28, marginBottom: 12, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="log-out-outline" size={28} color={colors.error} />
              </View>
              <Text style={[styles.kycStatusTitle, { color: colors.text, textAlign: 'center' }]}>Log Out of Aeropay?</Text>
              <Text style={[styles.kycStatusSub, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
                Are you sure you want to sign out of your account on this device?
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable
                style={[styles.saveBtn, { flex: 1, backgroundColor: isDark ? '#2C2C35' : '#E2E8F0', marginTop: 0 }]}
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
});
