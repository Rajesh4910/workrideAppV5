import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { WrButton } from '../components/WrButton';
import { Colors } from '../theme/colors';
import { Spacing, Typography, Radius } from '../theme/metrics';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <Screen style={styles.container}>
      <View>
        <Text style={Typography.h1}>Carpool that feels premium.</Text>
        <Text style={[Typography.bodyMuted, { marginTop: Spacing.sm, lineHeight: 22 }]}
        >
          Save money, reduce traffic, and cut CO2 with trusted rides.
        </Text>

        <View style={styles.heroCard}>
          <Text style={[Typography.caption, { textTransform: 'uppercase', letterSpacing: 1 }]}>Your impact</Text>
          <Text style={styles.metric}>0.0 kg CO2 saved</Text>
          <Text style={Typography.bodyMuted}>This updates when you start riding.</Text>
        </View>
      </View>

      <View style={{ gap: Spacing.md, paddingBottom: Spacing.xl }}>
        <WrButton title="Continue" onPress={() => navigation.replace('CountrySelection')} />
        <WrButton title="Explore as Guest" variant="secondary" onPress={() => navigation.replace('App')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  heroCard: {
    marginTop: Spacing.lg,
    backgroundColor: '#fff',
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  metric: { marginTop: 10, fontSize: 22, fontWeight: '900', color: Colors.primary },
});
