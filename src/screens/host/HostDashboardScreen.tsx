import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { WrButton } from '../../components/WrButton';
import { SectionHeader } from '../../components/SectionHeader';
import { StatCard } from '../../components/StatCard';
import { LineChart } from 'react-native-chart-kit';
import { Spacing, Typography, Colors, Radius } from '../../utils/theme';
import { useAuth } from '../../state/AuthContext';
import { listPendingRequests } from '../../firebase/rides';

export default function HostDashboardScreen({ navigation }: any) {
  const { user, getHostStats, fetchHostStats } = useAuth();
  const hostId = user?.id ?? 'host_1';
  const stats = getHostStats?.(hostId) ?? { avg: 0, count: 0 };
  const [history, setHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [pending, setPending] = useState<Array<{ rideId: string; pendingRequest?: any }>>([]);

  useEffect(() => {
    let mounted = true;
    let unsub: (() => void) | undefined;
    // prefer real-time subscription when available
    try {
      // import helper dynamically to avoid cycles
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { subscribeHostRatings } = require('../../firebase/ratings');
      if (subscribeHostRatings) {
        unsub = subscribeHostRatings(hostId, (items: any[]) => {
          if (!mounted) return;
          const values = items.map((it) => Number(it.rating || 0));
          setHistory(values);
          const labels = items.map((it) => {
            if (it.createdAt instanceof Date) return it.createdAt.toLocaleDateString();
            return '';
          });
          setLabels(labels);
        });
      }
    } catch (e) {
      // fallback: fetch once
      if (fetchHostStats) {
        fetchHostStats(hostId).then((res) => {
          if (!mounted) return;
          const items = res.items || [];
          setHistory(items.map((it: any) => Number(it.rating || 0)));
          setLabels(items.map((it: any) => (it.createdAt ? new Date(it.createdAt).toLocaleDateString() : '')));
        }).catch(() => {});
      }
    }
    return () => { mounted = false; if (unsub) unsub(); };
  }, [hostId, fetchHostStats]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!hostId) return setPending([]);
      const items = await listPendingRequests(hostId);
      if (!mounted) return;
      setPending(items);
    })();
    return () => { mounted = false; };
  }, [hostId]);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Host</Text>
        <Text style={Typography.h2}>Dashboard</Text>
        <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Track today's activity at a glance.</Text>

        <View style={styles.statsRow}>
          <StatCard icon="car-outline" label="Active rides" value="0" />
          <StatCard icon="time-outline" label="Pending" value="0" />
          <StatCard icon="cash-outline" label="Est. earnings" value="€0" />
          <StatCard icon="star-outline" label="Avg rating" value={`${stats.avg ? stats.avg.toFixed(1) : '—'} (${stats.count})`} />
        </View>

        {history.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={[Typography.h3, { marginBottom: 8 }]}>Rating history</Text>
            <LineChart
              data={{
                labels: labels.length ? labels : history.map((_, i) => `${i + 1}`),
                datasets: [{ data: history }],
              }}
              width={Dimensions.get('window').width - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(14,124,102, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
              }}
              style={{ borderRadius: 12 }}
            />
          </View>
        )}

        <SectionHeader title="Next ride" actionLabel="Create" onPress={() => navigation?.navigate?.('Create')} />
        <WrCard>
          <View style={styles.routeRow}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeTitle} numberOfLines={1}>
                Dublin City Centre → Tallaght
              </Text>
              <Text style={Typography.bodyMuted}>Today • 8:30 AM • 2 seats</Text>
            </View>
          </View>
          <View style={styles.ctaRow}>
            <WrButton title="View requests" variant="secondary" onPress={() => navigation?.navigate?.('Requests')} />
          </View>
          <Text style={[Typography.caption, { marginTop: Spacing.sm, color: Colors.textMuted }]}>
            Add pickup details to increase matching.
          </Text>
        </WrCard>

        {pending.length > 0 && (
          <View style={{ marginTop: Spacing.md }}>
            <SectionHeader title="Pending requests" actionLabel="Open" onPress={() => navigation?.navigate?.('Requests')} />
            <WrCard>
              {pending.map((p) => (
                <View key={p.rideId} style={{ marginBottom: Spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={Typography.h4}>Request for {p.rideId}</Text>
                      <Text style={Typography.bodyMuted}>{p.pendingRequest?.createdAt ? new Date(p.pendingRequest.createdAt.seconds * 1000).toLocaleString() : ''}</Text>
                    </View>
                    <WrButton title="View" variant="secondary" onPress={() => navigation?.navigate?.('RequestDetails', { id: p.rideId })} />
                  </View>
                </View>
              ))}
            </WrCard>
          </View>
        )}

        <SectionHeader title="Quick actions" />
        <View style={{ gap: Spacing.md }}>
          <WrCard>
            <View style={styles.actionRow}>
              <View style={styles.actionIcon} />
              <View style={{ flex: 1 }}>
                <Text style={Typography.h3}>Create a ride</Text>
                <Text style={Typography.bodyMuted}>Set route, seats, and price in under a minute.</Text>
              </View>
            </View>
            <View style={{ marginTop: Spacing.md }}>
              <WrButton title="Offer a ride" onPress={() => navigation?.navigate?.('Create')} />
            </View>
          </WrCard>

          <WrCard>
            <View style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(107,207,155,0.20)' }]} />
              <View style={{ flex: 1 }}>
                <Text style={Typography.h3}>Requests</Text>
                <Text style={Typography.bodyMuted}>Review and accept riders quickly.</Text>
              </View>
            </View>
            <View style={{ marginTop: Spacing.md }}>
              <WrButton title="Open requests" variant="secondary" onPress={() => navigation?.navigate?.('Requests')} />
            </View>
          </WrCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  ctaRow: {
    marginTop: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(14,124,102,0.12)',
  },
});
