import { Stack } from 'expo-router';

export default function SendLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="recipient" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="status" />
    </Stack>
  );
}
