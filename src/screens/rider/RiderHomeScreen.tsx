import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Platform, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { WrButton } from '../../components/WrButton';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import LocationSearch from '../../components/LocationSearch';
import { useAuth } from '../../state/AuthContext';
import { listAvailableRidesNearby, submitRideRequest } from '../../firebase/rides';

export default function RiderHomeScreen({ navigation }: any) {
  const { user, country } = useAuth();
  const [selectedPickup, setSelectedPickup] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [available, setAvailable] = useState<any[]>([]);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPickup) return;
    let mounted = true;
    (async () => {
      const items = await listAvailableRidesNearby(selectedPickup, 8); // 8km radius
      if (!mounted) return;
      if (!items || items.length === 0) {
        // leave empty for now; user can create sample rides using debug button
        setAvailable([]);
      } else {
        setAvailable(items);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedPickup]);

  const createSampleRides = () => {
    if (!selectedPickup) return;
    const baseLat = selectedPickup.lat;
    const baseLng = selectedPickup.lng;
    const samples = [0.003, -0.0025, 0.0045].map((off, i) => {
      const lat = baseLat + off;
      const lng = baseLng + (off * -1.2);
      return {
        id: `sample-${Date.now()}-${i}`,
        status: 'ACCEPTED',
        hostId: `host_sample_${i + 1}`,
        hostLocation: { lat, lng, updatedAt: new Date() },
        createdAt: new Date(),
      } as any;
    });
    setAvailable(samples);
  };
  return (
    <Screen>
      <Text style={Typography.h2}>Find a ride</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Search destination and request a seat.</Text>

      <View style={{ marginTop: Spacing.md }}>
        <LocationSearch
          placeholder="Search destination (e.g., Dublin City Centre)"
          countryCode={country?.code?.toLowerCase()}
          useDeviceLocation={true}
          onSelect={(loc) => setSelectedPickup(loc)}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <WrButton title="Search" onPress={() => navigation?.navigate?.('Trips')} />
        </View>
        <View style={{ flex: 1 }}>
          <WrButton title="Saved places" variant="secondary" onPress={() => {}} />
        </View>
      </View>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
        <WrCard>
          <Text style={Typography.h3}>Recommended rides</Text>
          {selectedPickup ? (
            available.length ? (
              <FlatList
                data={available}
                keyExtractor={(i: any) => i.id}
                renderItem={({ item }: any) => (
                    <Pressable
                      onPress={async () => {
                        if (!user) {
                          Alert.alert('Sign in', 'Please sign in to request a seat.');
                          return;
                        }
                        if (requestingId) return;
                        try {
                          setRequestingId(item.id);
                          await submitRideRequest(item.id, user.id, selectedPickup, user?.name);
                          const msg = 'Request submitted — host will be notified.';
                          if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
                          else Alert.alert('Requested', msg);
                          navigation?.navigate?.('Trips');
                        } catch (err) {
                          console.warn('submitRideRequest failed', err);
                          Alert.alert('Error', 'Unable to submit request.');
                        } finally {
                          setRequestingId(null);
                        }
                      }}
                      disabled={!!requestingId}
                      style={({ pressed }) => ({ padding: Spacing.md, backgroundColor: pressed ? '#f6f6f6' : '#fff', marginTop: Spacing.sm, borderRadius: 8 })}
                    >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={Typography.h4}>{item.hostId || 'Host'}</Text>
                        <Text style={Typography.bodyMuted}>{item.createdAt ? (item.createdAt.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : new Date(item.createdAt).toLocaleString()) : 'Scheduled'}</Text>
                        <Text style={[Typography.caption, { marginTop: 6, color: Colors.textMuted }]}>{item.hostLocation ? `~${item.hostLocation.lat.toFixed(3)},${item.hostLocation.lng.toFixed(3)}` : ''}</Text>
                      </View>
                      <Text style={{ color: Colors.brand }}>Request</Text>
                    </View>
                  </Pressable>
                )}
              />
            ) : (
              <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>No nearby rides found for this pickup.</Text>
            )
          ) : (
            <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Select a pickup location to see nearby rides.</Text>
          )}
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
