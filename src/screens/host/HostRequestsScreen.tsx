import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { WrButton } from '../../components/WrButton';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';

type Status = 'PENDING' | 'ACCEPTED' | 'DECLINED';

type RideRequest = {
  id: string;
  name: string;
  rating: number;
  seats: number;
  note?: string;
  status: Status;
};

const SAMPLE: RideRequest[] = [
  { id: '1', name: 'Aisha', rating: 4.8, seats: 1, note: 'Can meet at Luas stop', status: 'PENDING' },
  { id: '2', name: 'John', rating: 4.6, seats: 1, note: 'On time, thanks!', status: 'ACCEPTED' },
];

export default function HostRequestsScreen({ navigation }: any) {
  const [tab, setTab] = useState<Status>('PENDING');

  const data = useMemo(() => SAMPLE.filter((r) => r.status === tab), [tab]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={Typography.h2}>Requests</Text>
        <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Review, accept, or decline riders quickly.</Text>

        <View style={styles.segment}>
          {(['PENDING', 'ACCEPTED', 'DECLINED'] as Status[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.segItem, tab === t ? styles.segActive : null]}
            >
              <Text style={[styles.segText, tab === t ? styles.segTextActive : null]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeader
          title={tab === 'PENDING' ? 'Pending requests' : tab === 'ACCEPTED' ? 'Accepted requests' : 'Declined requests'}
          actionLabel="Create"
          onPress={() => navigation?.navigate?.('Create')}
        />

        {data.length === 0 ? (
          <WrCard style={{ marginTop: Spacing.md }}>
            <Text style={Typography.h3}>Nothing here yet</Text>
            <Text style={[Typography.bodyMuted, { marginTop: 6, lineHeight: 22 }]}>
                When riders request your ride, you'll see them in this list.
            </Text>
            <View style={{ marginTop: Spacing.md }}>
              <WrButton title="Create a ride" onPress={() => navigation?.navigate?.('Create')} />
            </View>
          </WrCard>
        ) : (
          <View style={{ marginTop: Spacing.md, gap: Spacing.md }}>
            {data.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => navigation?.navigate?.('HostRequestDetails', { id: r.id })}
                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
              >
                <WrCard>
                  <View style={styles.rowTop}>
                    <View style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{r.name}</Text>
                      <Text style={Typography.bodyMuted}>⭐ {r.rating.toFixed(1)} • Seats: {r.seats}</Text>
                    </View>
                  </View>

                  {r.note ? (
                    <Text style={[Typography.body, { marginTop: Spacing.sm, lineHeight: 22 }]} numberOfLines={2}>
                      {r.note}
                    </Text>
                  ) : null}

                  {tab === 'PENDING' ? (
                    <View style={styles.actions}>
                      <View style={{ flex: 1 }}>
                        <WrButton title="Accept" onPress={() => {}} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <WrButton title="Decline" variant="secondary" onPress={() => {}} />
                      </View>
                    </View>
                  ) : (
                    <View style={{ marginTop: Spacing.md }}>
                      <WrButton title="View details" variant="secondary" onPress={() => navigation?.navigate?.('HostRequestDetails', { id: r.id })} />
                    </View>
                  )}
                </WrCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segItem: {
    flex: 1,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segActive: { backgroundColor: 'rgba(14,124,102,0.12)' },
  segText: { fontSize: 12, fontWeight: '800', color: Colors.textMuted },
  segTextActive: { color: Colors.brand },

  rowTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(31,41,51,0.08)' },
  name: { fontSize: 16, fontWeight: '800', color: Colors.text },

  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});
