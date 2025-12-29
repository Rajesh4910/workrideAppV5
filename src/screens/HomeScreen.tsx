import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { WrButton } from '../components/WrButton';
import { WrCard } from '../components/WrCard';
import { Colors } from '../theme/colors';
import { Radius, Spacing, Typography } from '../theme/metrics';

export default function HomeScreen() {
  return (
    <Screen>
      <Text style={Typography.h2}>Where are you going?</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Find a ride or offer one in seconds.</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
        <TextInput
          placeholder="Search destination (e.g., Dublin City Centre)"
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <WrButton title="Find a Ride" onPress={() => {}} />
        </View>
        <View style={{ flex: 1 }}>
          <WrButton title="Offer a Ride" variant="secondary" onPress={() => {}} />
        </View>
      </View>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
        <WrCard>
          <Text style={Typography.h3}>Today's summary</Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            <Text style={Typography.body}>• Estimated savings: €0.00</Text>
            <Text style={Typography.body}>• CO2 reduced: 0.0 kg</Text>
            <Text style={Typography.body}>• Active requests: 0</Text>
          </View>
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Recommended rides</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>
            You'll see nearby rides once location + backend are connected.
          </Text>
        </WrCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
});
