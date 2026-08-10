import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  return (
    <View style={styles.tabBarWrapper}>
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: isDark ? 'rgba(14, 18, 28, 0.78)' : 'rgba(255, 255, 255, 0.84)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.8)',
            shadowColor: isDark ? '#000000' : '#64748B',
          },
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'ellipse-outline';
          if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
          else if (route.name === 'fund') iconName = isFocused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'send')
            iconName = isFocused ? 'paper-plane' : 'paper-plane-outline';
          else if (route.name === 'vaults')
            iconName = isFocused ? 'shield-checkmark' : 'shield-checkmark-outline';
          else if (route.name === 'activity') iconName = isFocused ? 'time' : 'time-outline';

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && {
                  backgroundColor: isDark ? 'rgba(197, 34, 43, 0.22)' : 'rgba(165, 28, 36, 0.12)',
                  borderColor: isDark ? 'rgba(225, 29, 72, 0.4)' : 'rgba(165, 28, 36, 0.3)',
                  borderWidth: 1,
                },
              ]}
            >
              <Ionicons
                name={iconName as any}
                size={20}
                color={isFocused ? colors.accent : colors.textSecondary}
              />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.accent : colors.textSecondary },
                  isFocused && { fontWeight: '700' },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="fund" options={{ title: 'Fund' }} />
      <Tabs.Screen name="send" options={{ title: 'Send' }} />
      <Tabs.Screen name="vaults" options={{ title: 'Vaults' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 32,
    borderWidth: 1.5,
    maxWidth: 540,
    width: '100%',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 14,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
});
