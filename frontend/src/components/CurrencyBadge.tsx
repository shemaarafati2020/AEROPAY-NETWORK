import React from 'react';
import { View, Text } from 'react-native';
export const CurrencyBadge = ({ symbol }: { symbol: string }) => (
  <View>
    <Text>{symbol}</Text>
  </View>
);
