import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Colors, Spacing, Typography, Radius } from '../utils/theme';
import { useAuth } from '../state/AuthContext';

// Minimal country list — extend as needed.
const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', flag: '🇮🇪' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
];

export default function CountrySelectionScreen({ navigation }: any) {
  const { setCountry } = useAuth();
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 3) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [query]);

  const select = (c: typeof COUNTRIES[0]) => {
    setCountry?.(c);
    navigation.replace('Login');
  };

  return (
    <Screen>
      <View style={{ gap: Spacing.md, flex: 1 }}>
        <View>
          <Text style={Typography.h2}>Select your country</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>We’ll apply local currency and formats.</Text>
        </View>

        <View>
          <TextInput
            placeholder="Search country (type 3+ chars)"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(i) => i.code}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
          renderItem={({ item }) => (
            <Pressable onPress={() => select(item)} style={styles.item}>
              <Text style={styles.flag}>{item.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={Typography.h3}>{item.name}</Text>
                <Text style={Typography.bodyMuted}>{item.currency}</Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#fff',
    color: Colors.text,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  flag: { fontSize: 28, width: 44, textAlign: 'center' },
});
