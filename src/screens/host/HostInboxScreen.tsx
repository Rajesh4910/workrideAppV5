import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { WrCard } from '../../components/WrCard';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'HostApp'>;

const SAMPLE = [
  { id: '1', name: 'Aisha', last: "Thanks! I'll be there in 5 mins.", unread: 2 },
  { id: '2', name: 'John', last: 'Can we change pickup to the station?', unread: 0 },
];

export default function HostInboxScreen({ navigation }: any) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={Typography.h2}>Inbox</Text>
        <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Chat with riders to confirm pickup and details.</Text>

        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Search messages"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <View style={{ marginTop: Spacing.md, gap: Spacing.md }}>
          {SAMPLE.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => navigation.getParent()?.navigate('HostChatThread', { id: c.id, name: c.name })}
            >
              <WrCard>
              <View style={styles.row}>
                <View style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.name} numberOfLines={1}>
                      {c.name}
                    </Text>
                    {c.unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{c.unread}</Text></View> : null}
                  </View>
                  <Text style={Typography.bodyMuted} numberOfLines={1}>
                    {c.last}
                  </Text>
                </View>
              </View>
              </WrCard>
            </Pressable>
          ))}

          {SAMPLE.length === 0 ? (
            <WrCard>
              <Text style={Typography.h3}>No messages yet</Text>
              <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Once a rider requests your ride, you can chat here.</Text>
            </WrCard>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  searchWrap: {
    marginTop: Spacing.lg,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    height: 52,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  searchInput: { fontSize: 15, color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(31,41,51,0.08)' },
  name: { fontSize: 16, fontWeight: '800', color: Colors.text },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 12 },
});
