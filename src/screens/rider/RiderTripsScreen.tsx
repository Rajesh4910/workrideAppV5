import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, Modal, StyleSheet, Platform, Alert, ToastAndroid } from 'react-native';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { Spacing, Typography, Colors, Radius } from '../../utils/theme';
import { useAuth } from '../../state/AuthContext';

type Trip = {
  id: string;
  hostId: string;
  hostName: string;
  date: string;
  completed: boolean;
  rated?: boolean;
  rating?: number;
};

export default function RiderTripsScreen() {
  const { submitRating } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([
    { id: 't1', hostId: 'host_1', hostName: 'Aisha', date: 'Dec 28, 2025', completed: true },
    { id: 't2', hostId: 'host_2', hostName: 'John', date: 'Dec 20, 2025', completed: true, rated: true, rating: 5 },
  ]);
  const [ratingModal, setRatingModal] = useState<{ visible: boolean; tripId?: string; hostId?: string }>(
    { visible: false }
  );

  const openRating = (trip: Trip) => setRatingModal({ visible: true, tripId: trip.id, hostId: trip.hostId });

  const submit = async (value: number) => {
    if (!ratingModal.tripId || !ratingModal.hostId) return;
    if (submitRating) await submitRating(ratingModal.hostId, value);
    setTrips((prev) => prev.map((t) => (t.id === ratingModal.tripId ? { ...t, rated: true, rating: value } : t)));
    // try to refresh host stats (dashboard)
    if ((useAuth as any) && (useAuth as any).fetchHostStats) {
      // no-op; kept for type-safety — actual fetch via context below
    }
    const { fetchHostStats } = useAuth();
    if (fetchHostStats) void fetchHostStats(ratingModal.hostId!);
    // show confirmation
    const msg = 'Rating submitted — thank you!';
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert('Thanks', msg);
    }
    setRatingModal({ visible: false });
  };

  return (
    <Screen>
      <Text style={Typography.h2}>Trips</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Your upcoming and past trips.</Text>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
        <FlatList
          data={trips}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <WrCard>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={Typography.h3}>{item.hostName}</Text>
                  <Text style={Typography.bodyMuted}>{item.date}</Text>
                </View>
                <View>
                  {item.completed && !item.rated ? (
                    <Pressable onPress={() => openRating(item)} style={{ padding: 8 }}>
                      <Text style={{ color: Colors.brand }}>Rate</Text>
                    </Pressable>
                  ) : (
                    <Text style={Typography.caption}>⭐ {item.rating ?? '—'}</Text>
                  )}
                </View>
              </View>
            </WrCard>
          )}
        />

        <Modal visible={ratingModal.visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={Typography.h3}>Rate your host</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.md }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => submit(s)} style={{ marginHorizontal: 6 }}>
                    <Text style={{ fontSize: 28 }}>{'⭐'}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ marginTop: Spacing.md }}>
                <Pressable onPress={() => setRatingModal({ visible: false })}>
                  <Text style={{ color: Colors.textMuted, textAlign: 'center' }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
});
