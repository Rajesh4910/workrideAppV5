import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Screen } from '../../components/Screen';
import { subscribeRide, RideDoc } from '../../firebase/rides';
import { Colors, Spacing, Typography } from '../../utils/theme';

export default function RiderTrackHostScreen({ route }: any) {
  const rideId = route?.params?.rideId ?? '1';
  const [ride, setRide] = useState<RideDoc | null>(null);

  useEffect(() => {
    const unsub = subscribeRide(rideId, (data) => {
      setRide(data);
    });
    return () => unsub && unsub();
  }, [rideId]);

  const openMaps = () => {
    if (!ride?.hostLocation) return;
    const { lat, lng } = ride.hostLocation;
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}`,
    }) as string;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        {ride?.hostLocation ? (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: ride.hostLocation.lat,
              longitude: ride.hostLocation.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: ride.hostLocation.lat, longitude: ride.hostLocation.lng }} title="Host" />
          </MapView>
        ) : (
          <View style={{ padding: Spacing.lg }}>
            <Text style={Typography.h3}>Waiting for host location…</Text>
            <Text style={[Typography.bodyMuted, { marginTop: Spacing.md }]}>You'll see the host appear here once they start sharing location.</Text>
          </View>
        )}

        <View style={{ padding: Spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.border }}>
          <Pressable onPress={openMaps} style={{ backgroundColor: Colors.brand, padding: 12, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Open in Maps</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
