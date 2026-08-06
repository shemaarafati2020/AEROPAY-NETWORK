import React, { createContext, useContext, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3200);
  }, []);

  const hideToast = () => setToast(null);

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: '#064E3B', border: '#10B981', icon: 'checkmark-circle', text: '#ECFDF5' };
      case 'error':
        return { bg: '#7F1D1D', border: '#EF4444', icon: 'alert-circle', text: '#FEF2F2' };
      case 'info':
      default:
        return { bg: '#1E293B', border: '#3B82F6', icon: 'information-circle', text: '#F0F9FF' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <SafeAreaView pointerEvents="box-none" style={styles.toastContainer}>
          <Animated.View
            entering={FadeInUp.springify().damping(15)}
            exiting={FadeOutUp.duration(200)}
            style={styles.responsiveWrapper}
          >
            {(() => {
              const colors = getToastColors(toast.type);
              return (
                <View style={[styles.toastCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Ionicons name={colors.icon as any} size={22} color={colors.border} style={styles.toastIcon} />
                  <Text style={[styles.toastText, { color: colors.text }]}>{toast.message}</Text>
                  <Pressable onPress={hideToast} style={styles.closeBtn}>
                    <Ionicons name="close" size={18} color={colors.text} />
                  </Pressable>
                </View>
              );
            })()}
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  responsiveWrapper: {
    maxWidth: 540,
    width: '100%',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  toastIcon: {
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
