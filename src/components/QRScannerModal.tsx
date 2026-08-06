import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, Pressable, TextInput, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useToast } from '@/context/ToastContext';

interface ScannedContact {
  name: string;
  phone: string;
  provider?: string;
  account?: string;
}

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (contact: ScannedContact) => void;
  title?: string;
}

export default function QRScannerModal({ 
  visible, 
  onClose, 
  onScanSuccess, 
  title = "Scan Contact QR Code" 
}: QRScannerModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { showToast } = useToast();

  const [manualPayload, setManualPayload] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);

  // Animated Scan Beam
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withRepeat(
        withTiming(200, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  const scanBeamStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const parseQRPayload = (payloadStr: string): ScannedContact | null => {
    try {
      if (payloadStr.startsWith('aeropay://') || payloadStr.includes('?')) {
        const queryStr = payloadStr.split('?')[1] || '';
        const params = new URLSearchParams(queryStr);
        const name = params.get('name') || 'Scanned Contact';
        const phone = params.get('phone') || '+250 788 123 456';
        const provider = params.get('provider') || 'MTN Mobile Money';
        const account = params.get('account') || '';
        return { name, phone, provider, account };
      }

      // Check if raw JSON string
      if (payloadStr.trim().startsWith('{')) {
        const obj = JSON.parse(payloadStr);
        return {
          name: obj.name || 'Scanned Contact',
          phone: obj.phone || '+250 788 123 456',
          provider: obj.provider || 'MTN Mobile Money',
          account: obj.account || '',
        };
      }

      // Check if simple phone number or name
      const cleanedPhone = payloadStr.replace(/[^0-9+]/g, '');
      if (cleanedPhone.length >= 7) {
        return {
          name: 'QR Recipient',
          phone: payloadStr.startsWith('+') ? payloadStr : `+250 ${payloadStr}`,
          provider: 'MTN / Airtel Money',
        };
      }
    } catch {
      // Ignore parse failure
    }

    return null;
  };

  const handleSimulatedScan = (samplePayload?: string) => {
    const payload = samplePayload || 'aeropay://contact?name=Eric%20Mugisha&phone=%2B250788445566&provider=MTN%20Mobile%20Money';
    const contact = parseQRPayload(payload);
    if (contact) {
      showToast(`QR Code Scanned: ${contact.name} (${contact.phone})`, 'success');
      onScanSuccess(contact);
      onClose();
    } else {
      showToast('Invalid QR Code format', 'error');
    }
  };

  const handleManualSubmit = () => {
    if (!manualPayload.trim()) {
      showToast('Please enter QR code payload or phone number', 'error');
      return;
    }
    const contact = parseQRPayload(manualPayload);
    if (contact) {
      showToast(`Contact parsed: ${contact.name}`, 'success');
      onScanSuccess(contact);
      onClose();
    } else {
      showToast('Unrecognized payload string', 'error');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: colors.divider }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Align QR code inside camera frame</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Viewfinder Camera Simulation */}
          {!isManualInput ? (
            <View style={styles.scannerWrapper}>
              <View style={styles.viewfinder}>
                {/* Corner Brackets */}
                <View style={[styles.corner, styles.topLeft, { borderColor: colors.accent }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: colors.accent }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.accent }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: colors.accent }]} />

                {/* Animated Laser Beam */}
                <Animated.View style={[styles.scanBeam, { backgroundColor: colors.accent }, scanBeamStyle]} />

                <Ionicons name="qr-code-outline" size={80} color="rgba(255,255,255,0.25)" />
              </View>

              <Text style={styles.viewfinderText}>Scanning automatically...</Text>
            </View>
          ) : (
            <View style={styles.manualWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASTE QR PAYLOAD OR PHONE NUMBER</Text>
              <TextInput
                value={manualPayload}
                onChangeText={setManualPayload}
                placeholder="e.g. aeropay://contact?name=Jane&phone=+250788111222"
                placeholderTextColor={colors.textSecondary}
                multiline
                style={[styles.textInput, { color: colors.text, borderColor: colors.divider }]}
              />
              <Pressable style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={handleManualSubmit}>
                <Text style={styles.actionBtnText}>Parse & Import Contact</Text>
              </Pressable>
            </View>
          )}

          {/* Quick Action Simulator Controls */}
          <View style={styles.footerRow}>
            <Pressable 
              style={[styles.simBtn, { backgroundColor: colors.accent }]} 
              onPress={() => handleSimulatedScan()}
            >
              <Ionicons name="camera" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.simBtnText}>Scan Demo QR</Text>
            </Pressable>

            <Pressable 
              style={[styles.simBtnOutline, { borderColor: colors.divider }]} 
              onPress={() => setIsManualInput(!isManualInput)}
            >
              <Ionicons name={isManualInput ? "camera-outline" : "code-working-outline"} size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.simBtnOutlineText, { color: colors.text }]}>
                {isManualInput ? 'Camera Scanner' : 'Paste Code'}
              </Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  viewfinder: {
    width: 230,
    height: 230,
    backgroundColor: '#09090B',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 4,
  },
  topLeft: {
    top: 12,
    left: 12,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 12,
    right: 12,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 12,
    left: 12,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 12,
    right: 12,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanBeam: {
    position: 'absolute',
    top: 10,
    left: 15,
    right: 15,
    height: 3,
    borderRadius: 2,
    boxShadow: '0px 0px 8px #DC2626',
  },
  viewfinderText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 14,
  },
  manualWrapper: {
    marginVertical: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    height: 90,
    textAlignVertical: 'top',
    fontSize: 13,
    marginBottom: 14,
  },
  actionBtn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  simBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  simBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBtnOutlineText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
