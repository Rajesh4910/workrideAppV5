import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { SectionHeader } from '../../components/SectionHeader';
import { StatCard } from '../../components/StatCard';
import { Colors, Spacing, Typography } from '../../utils/theme';

export default function HostEarningsScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={Typography.h2}>Earnings</Text>
        <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Track your earnings, payouts, and activity.</Text>

        <View style={styles.statsRow}>
          <StatCard icon="cash-outline" label="This month" value="€0" />
          <StatCard icon="swap-horizontal-outline" label="Pending" value="€0" />
          <StatCard icon="car-outline" label="Rides" value="0" />
        </View>

        <SectionHeader title="Payout" />
        <WrCard>
          <Text style={styles.amount}>€0.00</Text>
          <Text style={Typography.bodyMuted}>Next payout • Not scheduled</Text>
          <View style={styles.payoutRow}>
            <View style={styles.pill}><Text style={styles.pillText}>Bank account: Not linked</Text></View>
            <View style={styles.pillAlt}><Text style={styles.pillTextAlt}>Weekly payouts</Text></View>
          </View>
          <Text style={[Typography.caption, { marginTop: Spacing.sm, color: Colors.textMuted }]}>
            Connect payout details in Account to receive earnings.
          </Text>
        </WrCard>

        <SectionHeader title="Recent transactions" />
        <View style={{ gap: Spacing.md }}>
          <WrCard>
            <Text style={Typography.h3}>No transactions yet</Text>
            <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Completed rides will show up here with amounts.</Text>
          </WrCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  amount: { fontSize: 28, fontWeight: '900', color: Colors.text },
  payoutRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  pill: {
    backgroundColor: 'rgba(31,41,51,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillAlt: {
    backgroundColor: 'rgba(14,124,102,0.10)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, fontWeight: '800', color: Colors.textMuted },
  pillTextAlt: { fontSize: 12, fontWeight: '800', color: Colors.brand },
});
