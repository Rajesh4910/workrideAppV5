import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { rootNavigate } from '../../navigation/RootNavigation';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';

const SAMPLE = [
  { id: 'h1', name: 'Raj (Host)', last: "I've accepted your request ✅", unread: 1 },
  { id: 'h2', name: 'Aisha (Host)', last: 'Pickup is at 8:30 AM.', unread: 0 },
];

export default function RiderInboxScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={Typography.h2}>Inbox</Text>
        <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Messages with hosts will show here.</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput placeholder="Search chats" placeholderTextColor={Colors.textMuted} style={styles.searchInput} />
        </View>

        <View style={{ marginTop: Spacing.md, gap: Spacing.md }}>
          {SAMPLE.map((c) => (
            <Pressable
              key={c.id}
                onPress={() => {
                  try {
                    // Use the root navigation helper to ensure the RiderChatThread
                    // screen is opened on the top-level navigator regardless of nesting.
                    rootNavigate('RiderChatThread', { id: c.id, name: c.name });
                  } catch (err) {
                    console.warn('Navigation error', err);
                  }
                }}
              style={({ pressed }) => [pressed && { opacity: 0.96 }]}
            >
              <WrCard>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{c.name[0]}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.topRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {c.name}
                      </Text>
                      {c.unread > 0 ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{c.unread > 99 ? '99+' : c.unread}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.last} numberOfLines={1}>
                      {c.last}
                    </Text>
                  </View>

                  {c.last && c.last.toLowerCase().includes('accept') ? (
                    <Pressable onPress={() => rootNavigate('RiderTrackHost', { rideId: c.id })} style={{ marginRight: 10, padding: 6, backgroundColor: 'rgba(14,124,102,0.08)', borderRadius: 6 }}>
                      <Text style={{ color: Colors.brand, fontWeight: '700' }}>Track</Text>
                    </Pressable>
                  ) : null}
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </View>
              </WrCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14,124,102,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.brand, fontWeight: '900', fontSize: 16 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '800', color: Colors.text, flex: 1, paddingRight: Spacing.sm },
  last: { marginTop: 6, fontSize: 13, fontWeight: '600', color: Colors.textMuted },

  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
