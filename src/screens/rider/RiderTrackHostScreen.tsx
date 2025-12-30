import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Screen } from '../../components/Screen';
import { subscribeRide, RideDoc } from '../../firebase/rides';
import { Colors, Spacing, Typography } from '../../utils/theme';

export default function RiderTrackHostScreen({ route }: any) {
  const rideId = route?.params?.rideId ?? '1';
  const [ride, setRide] = useState<RideDoc | null>(null);
  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }> | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const fetchWithTimeout = async (input: RequestInfo, ms = 5000) => {
    return await Promise.race([
      fetch(input),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ] as any);
  };

  useEffect(() => {
    const unsub = subscribeRide(rideId, (data) => {
      setRide(data);
    });
    return () => unsub && unsub();
  }, [rideId]);

  useEffect(() => {
    let mounted = true;
    const loadRoute = async () => {
      if (!ride || !ride.hostLocation || !ride.pickup) {
        setRouteCoords(null);
        setRouteError(null);
        return;
      }
      setRouteLoading(true);
      setRouteError(null);
      try {
        const lon1 = ride.hostLocation.lng;
        const lat1 = ride.hostLocation.lat;
        const lon2 = (ride as any).pickup.lng;
        const lat2 = (ride as any).pickup.lat;
        const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
        const res = await fetchWithTimeout(url, 5000) as Response;
        if (!mounted) return;
        if (!res.ok) throw new Error('route failed');
        const json = await res.json();
        const coords: any[] = json?.routes?.[0]?.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length) {
          const mapped = coords.map((c: any) => ({ latitude: c[1], longitude: c[0] }));
          setRouteCoords(mapped);
        } else {
          setRouteCoords([{ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 }]);
          setRouteError('Unable to fetch detailed route — using simplified route.');
        }
      } catch (e: any) {
        setRouteCoords([{ latitude: ride.hostLocation.lat, longitude: ride.hostLocation.lng }, { latitude: (ride as any).pickup?.lat, longitude: (ride as any).pickup?.lng }]);
        setRouteError((e && e.message) || 'Route fetch failed — using simplified route.');
      } finally {
        if (mounted) setRouteLoading(false);
      }
    };
    void loadRoute();
    return () => {
      mounted = false;
    };
  }, [ride?.hostLocation, ride?.pickup]);

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
              {routeCoords ? <Polyline coordinates={routeCoords} strokeColor="#0ea57c" strokeWidth={4} /> : null}
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
