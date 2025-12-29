import React from 'react';
import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { Typography } from '../theme/metrics';

export default function RidesScreen() {
  return (
    <Screen>
      <Text style={Typography.h2}>Rides</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 8 }]}>Your upcoming and past rides will appear here.</Text>
    </Screen>
  );
}
