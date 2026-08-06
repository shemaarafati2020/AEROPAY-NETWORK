import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

function AnimatedTabIcon({ name, focusedName, color, focused }: { name: any; focusedName: any; color: string; focused: boolean }) {
  const scale = useSharedValue(focused ? 1.2 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.25 : 1, { damping: 12, stiffness: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={focused ? focusedName : name} size={24} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: scheme === 'dark' ? 'rgba(18, 18, 20, 0.88)' : 'rgba(255, 255, 255, 0.90)',
          borderTopColor: scheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          borderTopWidth: 1,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 10.5,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="home-outline" focusedName="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="fund"
        options={{
          title: 'Fund',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="wallet-outline" focusedName="wallet" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: 'Send',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="paper-plane-outline" focusedName="paper-plane" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipients"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="people-outline" focusedName="people" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="time-outline" focusedName="time" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
