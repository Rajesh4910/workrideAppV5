import React from 'react';
import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { Typography } from '../theme/metrics';

export default function MessagesScreen() {
  return (
    <Screen>
      <Text style={Typography.h2}>Messages</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 8 }]}>Chat with hosts and riders here.</Text>
    </Screen>
  );
}
