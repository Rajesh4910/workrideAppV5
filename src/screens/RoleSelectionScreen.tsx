import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { WrButton } from '../components/WrButton';
import { WrCard } from '../components/WrCard';
import { useAuth } from '../state/AuthContext';
import { Spacing, Typography } from '../theme/metrics';
import type { UserRole } from '../state/AuthContext';

export default function RoleSelectionScreen({ navigation }: any) {
  const { setRole } = useAuth();

  const pick = async (role: UserRole) => {
    await setRole(role);
    // RootNavigator will automatically switch to the correct tab stack.
  };

  return (
    <Screen>
      <Text style={Typography.h2}>Choose how you want to use WorkRide</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>You can change this later in Profile.</Text>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
        <WrCard>
          <Text style={Typography.h3}>Offer a Ride</Text>
             <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Share your commute, earn or split costs, and reduce CO2.</Text>
          <View style={{ marginTop: Spacing.md }}>
            <WrButton title="I'm a Host" onPress={() => pick('HOST')} />
          </View>
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Find a Ride</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Request a ride and chat with hosts securely.</Text>
          <View style={{ marginTop: Spacing.md }}>
               <WrButton title="I'm a Rider" variant="secondary" onPress={() => pick('RIDER')} />
          </View>
        </WrCard>
      </View>
    </Screen>
  );
}
