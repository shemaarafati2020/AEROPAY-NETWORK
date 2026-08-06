import { StyleSheet, Text, View, Switch, Appearance, useColorScheme, Platform, Pressable, TextInput, Image, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Shema Arafati');
  const [email, setEmail] = useState('shema.arafati@example.com');
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Pressable onPress={pickImage} style={[styles.avatarCircle, { backgroundColor: isDark ? '#333' : '#E8E8E8' }]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={48} color={isDark ? '#CCC' : '#888'} />
              )}
              <View style={[styles.editIconBadge, { backgroundColor: colors.accent }]}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </Pressable>
            
            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: colors.backgroundElement }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.divider, backgroundColor: colors.backgroundElement }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textSecondary}
                />
                <Pressable style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={() => setIsEditing(false)}>
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.infoDisplay}>
                <Text style={[styles.nameText, { color: colors.text }]}>{name}</Text>
                <Text style={[styles.emailText, { color: colors.textSecondary }]}>{email}</Text>
                <Pressable style={[styles.editButton, { borderColor: colors.divider }]} onPress={() => setIsEditing(true)}>
                  <Ionicons name="pencil" size={14} color={colors.text} style={{ marginRight: 6 }} />
                  <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Settings List */}
          <View style={[styles.settingsContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APP SETTINGS</Text>
            
            <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D9D9D9', true: colors.accent }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isDark ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <Pressable style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="notifications" size={20} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>
            
            <Pressable style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Security & Privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          
          <Pressable style={[styles.logoutButton, { backgroundColor: 'rgba(211, 47, 47, 0.1)' }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.six,
    marginTop: Spacing.four,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  infoDisplay: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editForm: {
    width: '100%',
    paddingHorizontal: Spacing.two,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  saveButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: Spacing.two,
    marginBottom: Spacing.five,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
