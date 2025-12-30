import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { WrButton } from '../../components/WrButton';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LocationSearch from '../../components/LocationSearch';
import { createOrUpdateRide } from '../../firebase/rides';
import { Platform, ToastAndroid, Alert } from 'react-native';
import { useAuth } from '../../state/AuthContext';

export default function HostCreateRideScreen() {
  const { country } = useAuth() || {};
  const currencyMap: Record<string, string> = {
    US: '$', GB: '£', IE: '€', AU: '$', IN: '₹', CA: '$', NZ: '$', DE: '€', FR: '€', ES: '€', IT: '€', NL: '€'
  };
  const [tripType, setTripType] = useState<'ONE_TIME' | 'REPEAT'>('ONE_TIME');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [carModel, setCarModel] = useState('');
  const palette = ['#1f2937', '#0ea57c', '#ef4444', '#f97316', '#f59e0b', '#60a5fa', '#a78bfa', '#ffffff', '#000000'];
  const [carColor, setCarColor] = useState(palette[0]);
  const [carReg, setCarReg] = useState('');
  const [seats, setSeats] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [pickup, setPickup] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [drop, setDrop] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [publishing, setPublishing] = useState(false);
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
    let mounted = true;
    const loadRoute = async () => {
      if (!pickup || !drop) {
        setRouteCoords(null);
        setRouteError(null);
        return;
      }
      setRouteLoading(true);
      setRouteError(null);
      try {
        const lon1 = pickup.lng;
        const lat1 = pickup.lat;
        const lon2 = drop.lng;
        const lat2 = drop.lat;
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
          // fallback to straight line
          setRouteCoords([{ latitude: pickup.lat, longitude: pickup.lng }, { latitude: drop.lat, longitude: drop.lng }]);
          setRouteError('Unable to fetch detailed route — using simplified route.');
        }
      } catch (e: any) {
        setRouteCoords([{ latitude: pickup.lat, longitude: pickup.lng }, { latitude: drop.lat, longitude: drop.lng }]);
        setRouteError((e && e.message) || 'Route fetch failed — using simplified route.');
      } finally {
        if (mounted) setRouteLoading(false);
      }
    };
    void loadRoute();
    return () => {
      mounted = false;
    };
  }, [pickup, drop]);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
      <Text style={Typography.h2}>Create a ride</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Set route, timing, seats, and pricing.</Text>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
        <WrCard>
          <Text style={Typography.h3}>Route</Text>
          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            <LocationSearch
              placeholder="Pickup location"
              onSelect={(loc) => setPickup(loc)}
              countryCode={country?.code?.toLowerCase?.()}
              useDeviceLocation={true}
            />
            <LocationSearch
              placeholder="Drop location"
              onSelect={(loc) => setDrop(loc)}
              countryCode={country?.code?.toLowerCase?.()}
              useDeviceLocation={true}
            />
          </View>
          {pickup || drop ? (
              <View style={{ marginTop: Spacing.sm }}>
                <Text style={Typography.bodyMuted}>{pickup ? `Pickup: ${pickup.name}` : ''}</Text>
                <Text style={Typography.bodyMuted}>{drop ? `Drop: ${drop.name}` : ''}</Text>
                {pickup && drop ? (
                  <View style={{ marginTop: 10, height: 200, borderRadius: 12, overflow: 'hidden' }}>
                    <MapView
                      style={{ flex: 1 }}
                      initialRegion={{
                        latitude: (pickup.lat + drop.lat) / 2,
                        longitude: (pickup.lng + drop.lng) / 2,
                        latitudeDelta: Math.max(Math.abs(pickup.lat - drop.lat) * 2, 0.01),
                        longitudeDelta: Math.max(Math.abs(pickup.lng - drop.lng) * 2, 0.01),
                      }}
                    >
                      <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} title="Pickup" />
                      <Marker coordinate={{ latitude: drop.lat, longitude: drop.lng }} title="Drop" />
                      {routeCoords ? <Polyline coordinates={routeCoords} strokeColor="#0ea57c" strokeWidth={4} /> : null}
                    </MapView>
                    {routeLoading ? <Text style={[Typography.caption, { padding: 8, backgroundColor: '#fff' }]}>Loading route…</Text> : null}
                    {routeError ? <Text style={[Typography.caption, { padding: 8, color: '#b91c1c' }]}>{routeError}</Text> : null}
                  </View>
                ) : null}
              </View>
          ) : null}
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Trip type</Text>
          <View style={styles.segment}>
            <Pressable
              onPress={() => setTripType('ONE_TIME')}
              style={[styles.segItem, tripType === 'ONE_TIME' ? styles.segActive : null]}
            >
              <Text style={[styles.segText, tripType === 'ONE_TIME' ? styles.segTextActive : null]}>One-time</Text>
            </Pressable>
            <Pressable
              onPress={() => setTripType('REPEAT')}
              style={[styles.segItem, tripType === 'REPEAT' ? styles.segActive : null]}
            >
              <Text style={[styles.segText, tripType === 'REPEAT' ? styles.segTextActive : null]}>Repeat</Text>
            </Pressable>
          </View>

          <Text style={[Typography.h3, { marginTop: Spacing.md }]}>Schedule</Text>
          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            <Pressable onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center' }]}> 
              <Text style={{ color: date ? Colors.text : Colors.textMuted }}>
                {date ? date.toLocaleDateString() : 'Select date'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setShowTimePicker(true)} style={[styles.input, { justifyContent: 'center' }]}> 
              <Text style={{ color: time ? Colors.text : Colors.textMuted }}>
                {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select time'}
              </Text>
            </Pressable>
          </View>
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Seats & price</Text>
          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            <TextInput
              placeholder="Seats (e.g., 2)"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              keyboardType="number-pad"
              value={seats}
              onChangeText={(t) => setSeats(t.replace(/[^0-9]/g, ''))}
            />
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginRight: 8 }}>{currencyMap[country?.code ?? ''] ?? '€'}</Text>
              <TextInput
                placeholder="Price per seat (e.g., 5)"
                placeholderTextColor={Colors.textMuted}
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={price}
                onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ''))}
              />
            </View>
          </View>
          <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>You can also offer free rides.</Text>
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Pickup details</Text>
          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            <TextInput placeholder="Pickup note (optional)" placeholderTextColor={Colors.textMuted} style={styles.input} />
          </View>
          <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Clear pickup notes improve acceptance rates.</Text>
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Car details</Text>
          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            <TextInput
              placeholder="Car model (e.g., Toyota Corolla)"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              value={carModel}
              onChangeText={setCarModel}
            />
            <View style={{ marginTop: 6 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {palette.map((c) => (
                  <Pressable
                    key={c}
                    accessibilityLabel={`Select color ${c}`}
                    onPress={() => setCarColor(c)}
                    style={[
                      { width: 40, height: 40, borderRadius: 20, backgroundColor: c, alignItems: 'center', justifyContent: 'center' },
                      carColor === c ? { borderWidth: 3, borderColor: Colors.brand } : { borderWidth: 1, borderColor: Colors.border },
                    ]}
                  >
                    {carColor === c ? <Ionicons name="checkmark" size={18} color={c === '#ffffff' ? '#000' : '#fff'} /> : null}
                  </Pressable>
                ))}
              </View>
              <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 64, height: 40, borderRadius: 8, backgroundColor: carColor, borderWidth: 1, borderColor: Colors.border }} />
                <Text style={[Typography.body, { color: Colors.text }]}>Selected color: {carColor}</Text>
              </View>
            </View>
            <TextInput
              placeholder="Registration (e.g., ABC-123)"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              value={carReg}
              onChangeText={setCarReg}
            />
          </View>
          <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Providing car details helps riders identify you.</Text>
        </WrCard>

        <View style={{ marginTop: Spacing.sm }}>
          <WrButton
            title="Publish ride"
            loading={publishing}
            onPress={async () => {
              if (!pickup || !drop) {
                Alert.alert('Missing route', 'Please select both pickup and drop locations.');
                return;
              }
              try {
                setPublishing(true);
                const rideId = `ride_${Date.now()}`;
                const payload: any = {
                  id: rideId,
                  status: 'PUBLISHED',
                  pickup,
                  drop,
                  date: date ? date.toISOString() : null,
                  time: time ? time.toISOString() : null,
                  car: { model: carModel, color: carColor, reg: carReg },
                  seats: seats ? parseInt(seats, 10) : null,
                  price: price ? Number(price) : null,
                  currency: currencyMap[country?.code ?? ''] ?? '€',
                  createdAt: new Date(),
                };
                await createOrUpdateRide(rideId, payload);
                const msg = 'Ride published.';
                if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
                else Alert.alert('Published', msg);
              } catch (e) {
                console.warn('Publish failed', e);
                Alert.alert('Error', 'Unable to publish ride.');
              } finally {
                setPublishing(false);
              }
            }}
          />
        </View>
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={(d) => { setShowDatePicker(false); setDate(d); }}
          onCancel={() => setShowDatePicker(false)}
        />
        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          onConfirm={(t) => { setShowTimePicker(false); setTime(t); }}
          onCancel={() => setShowTimePicker(false)}
        />
      </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#fff',
    fontSize: 15,
    color: Colors.text,
  },
  segment: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 4,
  },
  segItem: {
    flex: 1,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segActive: {
    backgroundColor: 'rgba(14,124,102,0.12)',
  },
  segText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  segTextActive: {
    color: Colors.brand,
  },
});
