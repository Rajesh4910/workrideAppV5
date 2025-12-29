import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { Spacing, Typography } from '../../utils/theme';

export default function RiderAccountScreen() {
  return (
    <Screen>
      <Text style={Typography.h2}>Account</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Profile, payments, and preferences.</Text>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
        <WrCard>
          <Text style={Typography.h3}>Profile</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Add photo, phone, and verification later.</Text>
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Payments</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Add card or bank details later for paid rides.</Text>
        </WrCard>
      </View>
    </Screen>
  );
}
