import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, Pressable, StyleSheet } from 'react-native';
import debounce from 'lodash.debounce';
import * as Location from 'expo-location';
import { Colors, Spacing, Typography } from '../utils/theme';

type Prediction = { description: string; place_id: string; raw?: any };

export default function LocationSearch({
  placeholder = 'Search',
  onSelect,
  countryCode,
  useDeviceLocation = false,
}: {
  placeholder?: string;
  onSelect: (loc: { lat: number; lng: number; name: string }) => void;
  countryCode?: string; // ISO 2-letter, e.g. 'au' or 'ie'
  useDeviceLocation?: boolean;
}) {
  const [q, setQ] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [viewbox, setViewbox] = useState<string | undefined>(undefined);

  const debouncedRef = useRef<any>(null);

  // Build a cancellable debounced search that always reads current countryCode/viewbox
  useEffect(() => {
    const fetchWithTimeout = async (input: RequestInfo, ms = 5000) => {
      return await Promise.race([
        fetch(input, { headers: { 'User-Agent': 'workride-app/1.0 (dev)' } }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ] as any);
    };

    const fn = debounce(async (text: string) => {
      if (!text || text.length < 2) return setPredictions([]);
      try {
        const params: string[] = [];
        params.push(`q=${encodeURIComponent(text)}`);
        params.push('format=json');
        params.push('addressdetails=1');
        params.push('limit=8');
        if (countryCode) params.push(`countrycodes=${encodeURIComponent(countryCode)}`);
        if (viewbox) {
          params.push(`viewbox=${viewbox}`);
          params.push('bounded=1');
        }
        const url = `https://nominatim.openstreetmap.org/search?${params.join('&')}`;
        const res = await fetchWithTimeout(url, 5000) as Response;
        const json = await res.json();
        const preds = (json || []).map((p: any) => ({ description: p.display_name, place_id: p.place_id || p.osm_id, raw: p } as any));
        setPredictions(preds as Prediction[]);
      } catch (e) {
        console.warn('Nominatim autocomplete failed', e);
      }
    }, 300);
    debouncedRef.current = fn;
    return () => {
      fn.cancel && fn.cancel();
    };
  }, [countryCode, viewbox]);

  useEffect(() => {
    debouncedRef.current && debouncedRef.current(q);
  }, [q]);

  useEffect(() => {
    if (!useDeviceLocation) return;
    let mounted = true;

    const getPositionWithTimeout = async (opts: any, timeoutMs = 4000) => {
      return await Promise.race([
        (Location as any).getCurrentPositionAsync(opts),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
      ]);
    };

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await getPositionWithTimeout({ accuracy: 3 }, 4000);
        if (!mounted || !pos) return;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const delta = 0.05; // ~5km
        const left = lon - delta;
        const right = lon + delta;
        const top = lat + delta;
        const bottom = lat - delta;
        setViewbox(`${left},${top},${right},${bottom}`);
      } catch (e) {
        console.warn('Device location unavailable or timed out', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [useDeviceLocation]);

  const onPick = async (item: Prediction & any) => {
    setQ(item.description);
    setPredictions([]);
    try {
      // Nominatim search already provides lat/lon in the search result
      const loc = item.raw || item;
      const lat = parseFloat(loc.lat || loc?.center?.lat);
      const lng = parseFloat(loc.lon || loc?.center?.lon);
      const name = item.description;
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) onSelect({ lat, lng, name });
    } catch (e) {
      console.warn('Nominatim details failed', e);
    }
  };
  // ensure debounced calls are cleared on unmount
  useEffect(() => {
    return () => {
      debouncedRef.current && debouncedRef.current.cancel && debouncedRef.current.cancel();
    };
  }, []);
  return (
    <View>
      <TextInput
        placeholder={placeholder}
        value={q}
        onChangeText={setQ}
        placeholderTextColor={Colors.textMuted}
        style={[{ height: 44, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: Spacing.md, backgroundColor: '#fff', color: Colors.text }, Typography.body]}
      />
      {predictions.length > 0 ? (
        <FlatList
          data={predictions}
          keyExtractor={(i) => i.place_id}
          style={{ backgroundColor: '#fff', maxHeight: 220, borderWidth: 1, borderColor: Colors.border, marginTop: 6, borderRadius: 8 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => onPick(item)} style={{ padding: Spacing.md }}>
              <Text>{item.description}</Text>
            </Pressable>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({});
