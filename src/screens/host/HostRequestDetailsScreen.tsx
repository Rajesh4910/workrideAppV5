import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { WrButton } from '../../components/WrButton';
import * as Location from 'expo-location';
import { createOrUpdateRide, updateHostLocation, subscribeRide, acceptPendingRequest, declinePendingRequest } from '../../firebase/rides';
import { useAuth } from '../../state/AuthContext';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors, Spacing, Typography } from '../../utils/theme';

type RequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

type Request = {
  id: string;
  name: string;
  rating: number;
  seats: number;
  note?: string;
  status: RequestStatus;
};

const SAMPLE: Record<string, Request> = {
  '1': { id: '1', name: 'Aisha', rating: 4.8, seats: 1, note: 'Can meet at Luas stop', status: 'PENDING' },
  '2': { id: '2', name: 'John', rating: 4.6, seats: 1, note: 'On time, thanks!', status: 'ACCEPTED' },
};

export default function HostRequestDetailsScreen({ navigation, route }: any) {
  const id = route?.params?.id ?? '1';
  const { user } = useAuth();
  const watchRef = React.useRef<any>(null);
  const [ride, setRide] = useState<any>(null);
  const req = ride?.pendingRequest ?? null;
  const [loadingAccept, setLoadingAccept] = React.useState(false);
  const [loadingDecline, setLoadingDecline] = React.useState(false);

  useEffect(() => {
    const unsub = subscribeRide(id, (data) => {
      setRide(data);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [id]);

  const statusPill = useMemo(() => {
    const base = [styles.pill];
    const s = ride?.status ?? 'PENDING';
    if (s === 'PENDING') return [base, styles.pillPending];
    if (s === 'ACCEPTED') return [base, styles.pillAccepted];
    return [base, styles.pillDeclined];
  }, [ride?.status]);

  const onAccept = async () => {
    setLoadingAccept(true);
    try {
      const ok = await acceptPendingRequest(id);
      if (!ok) throw new Error('No pending request found');
      await createOrUpdateRide(id, { id, status: 'ACCEPTED', hostId: user?.id || 'host-1' });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location', 'Location permission is required to share your location with the rider.');
        return;
      }
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: 3, distanceInterval: 5, timeInterval: 3000 },
        (loc: any) => {
          const { latitude, longitude } = loc.coords;
          void updateHostLocation(id, latitude, longitude).catch(() => {});
        }
      );
      const msg = 'Request accepted — rider notified.';
      if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
      else Alert.alert('Accepted', msg);
      navigation.navigate('HostApp');
    } catch (e: any) {
      console.warn('Accept failed', e);
      Alert.alert('Error', e?.message || 'Unable to accept request.');
    } finally {
      setLoadingAccept(false);
    }
  };

  const onDecline = async () => {
    setLoadingDecline(true);
    try {
      const ok = await declinePendingRequest(id);
      if (!ok) throw new Error('No pending request found');
      const msg = 'Request declined.';
      if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
      else Alert.alert('Declined', msg);
      navigation.goBack();
    } catch (e: any) {
      console.warn('Decline failed', e);
      Alert.alert('Error', e?.message || 'Unable to decline request.');
    } finally {
      setLoadingDecline(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (watchRef.current && typeof watchRef.current.remove === 'function') {
        watchRef.current.remove();
      }
    };
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Request details</Text>
          <View style={{ width: 40 }} />
        </View>

        <WrCard style={{ marginTop: Spacing.md }}>
          {req ? (
            <View style={styles.row}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{req.riderName ?? req.riderId ?? 'Rider'}</Text>
                  <View style={statusPill as any}>
                    <Text style={styles.pillText}>{ride?.status ?? 'PENDING'}</Text>
                  </View>
                </View>
                <Text style={Typography.bodyMuted}>{req.pickup?.name ?? 'Pickup location'}</Text>
                <Text style={[Typography.caption, { marginTop: 6, color: Colors.textMuted }]}>
                  {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString() : ''}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={Typography.bodyMuted}>No pending request for this ride.</Text>
          )}
        </WrCard>

        <WrCard style={{ marginTop: Spacing.md }}>
          <SectionHeader title="Trip details" />
          <View style={{ marginTop: Spacing.md, gap: 10 }}>
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.infoText}>Pickup: Dublin Docklands</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="flag-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.infoText}>Drop: Sandyford</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.infoText}>Time: Tomorrow • 08:15</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.infoText}>Price: €5.00</Text>
            </View>
          </View>
        </WrCard>

        <WrCard style={{ marginTop: Spacing.md }}>
          <SectionHeader title="Decision" />
          <Text style={[Typography.bodyMuted, { marginTop: 6, lineHeight: 20 }]}>
            You can change this later (once backend is connected).
          </Text>

          <View style={{ marginTop: Spacing.md, gap: Spacing.md }}>
            <WrButton title="Accept request" loading={loadingAccept} onPress={onAccept} />
            <WrButton title="Decline request" variant="secondary" loading={loadingDecline} onPress={onDecline} />
          </View>
        </WrCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(31,41,51,0.08)' },

  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  name: { fontSize: 18, fontWeight: '900', color: Colors.text },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  pillPending: { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.25)' },
  pillAccepted: { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.25)' },
  pillDeclined: { backgroundColor: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.22)' },
  pillText: { fontSize: 11, fontWeight: '900', color: Colors.textMuted },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { ...Typography.body, color: Colors.text },
});
