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
  Alert,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

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
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>{title}</Text>
            {badgeText && (
              <View style={[styles.badge, { backgroundColor: badgeColor + '20', marginLeft: 8 }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
              </View>
            )}
          </View>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
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

  // User Profile State
  const [name, setName] = useState('Shema Arafati');
  const [email, setEmail] = useState('shema.arafati@example.com');
  const [phone, setPhone] = useState('+250 788 123 456');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Settings State
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Temp Form State
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);

  const toggleTheme = (value: boolean) => {
    Appearance.setColorScheme(value ? 'dark' : 'light');
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
    }
  };

  const handleSaveProfile = () => {
    setName(editName);
    setEmail(editEmail);
    setPhone(editPhone);
    setIsEditModalOpen(false);
    Alert.alert('Profile Updated', 'Your profile details have been successfully saved.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Aeropay Network?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/(tabs)') }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Profile</Text>
        <Pressable onPress={() => Alert.alert('Share Profile', 'Your referral code is AEROPAY-2026')} style={styles.shareBtn}>
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
            <View style={[styles.kycBadge, { backgroundColor: colors.success + '18' }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={[styles.kycBadgeText, { color: colors.success }]}>KYC Tier 3 Verified</Text>
            </View>

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
                onValueChange={setIsNotificationsEnabled}
                colors={colors}
              />
              <SettingItem
                icon="cash-outline"
                title="Default Currency"
                subtitle="USD - United States Dollar"
                onPress={() => Alert.alert('Currency', 'Default currency can be managed in transfer screens.')}
                colors={colors}
              />
            </View>
          </View>

          {/* Security & Compliance */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & COMPLIANCE</Text>
            <View style={[styles.settingsGroup, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
              <SettingItem
                icon="finger-print-outline"
                title="Biometric Authentication"
                subtitle="Use Face ID / Touch ID for transfers"
                isSwitch
                value={isBiometricsEnabled}
                onValueChange={setIsBiometricsEnabled}
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
                onPress={() => Alert.alert('KYC Verified', 'Your account is fully verified for unlimited transfers.')}
                colors={colors}
              />
              <SettingItem
                icon="key-outline"
                title="Change Transfer PIN"
                subtitle="Update 4-digit security passcode"
                onPress={() => Alert.alert('PIN Security', 'Enter your current PIN to set a new security passcode.')}
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
                subtitle="24/7 Priority Customer Service"
                onPress={() => Alert.alert('Live Support', 'Connecting to Aeropay Support Agent...')}
                colors={colors}
              />
              <SettingItem
                icon="document-text-outline"
                title="Terms of Service & Privacy"
                onPress={() => Alert.alert('Legal', 'Aeropay Network v2.4.0 — Institutional Remittance Platform.')}
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

      {/* Edit Profile Modal */}
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
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
});
