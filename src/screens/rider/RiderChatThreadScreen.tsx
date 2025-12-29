import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { useAuth } from '../../state/AuthContext';
import { subscribeThreadMessages, sendMessage, getThreadMessages } from '../../firebase/messages';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RiderChatThread'>;

type Msg = {
  id: string;
  from: 'RIDER' | 'HOST';
  text: string;
  ts: string;
  status?: string;
};

function seedMessages(name: string): Msg[] {
  return [
    { id: 'm1', from: 'RIDER', text: `Hi ${name}! I've requested your ride.`, ts: '09:12' },
    { id: 'm2', from: 'HOST', text: "Thanks - I'll confirm in a minute.", ts: '09:13' },
    { id: 'm3', from: 'HOST', text: 'Pickup at the main gate works?', ts: '09:14' },
    { id: 'm4', from: 'RIDER', text: 'Yes, perfect. See you there!', ts: '09:15' },
  ];
}

export default function RiderChatThreadScreen({ navigation, route }: Props) {
  const { id, name } = route.params;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>(() => seedMessages(name));
  const { user, role } = useAuth();
  const listRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    // subscribe to real-time messages for this thread
    try {
      const unsub = subscribeThreadMessages(id, (items) => {
        if (!mounted) return;
        console.log('[RiderChat] subscribeThreadMessages ->', id, items);
        const mapped: Msg[] = items.map((it) => ({
          id: it.id,
          from: (it.from === 'HOST' ? 'HOST' : 'RIDER'),
          text: it.text,
          ts: it.createdAt ? new Date(it.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          status: (it as any).status || 'sent',
        }));
        setMessages(mapped.length ? mapped : seedMessages(name));
        // mark messages delivered when they arrive and are from the other party
        mapped.forEach((m) => {
          if (m.from !== (role === 'HOST' ? 'HOST' : 'RIDER') && (m as any).status !== 'delivered') {
            void import('../../firebase/messages').then((mod) => mod.updateMessageStatus(m.id, 'delivered')).catch(() => {});
          }
        });
        // scroll to bottom after update
        setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
      });
      // initial load fallback
      getThreadMessages(id).then((items) => {
        if (!mounted) return;
        if (items.length) {
          const mapped: Msg[] = items.map((it) => ({
            id: it.id,
            from: (it.from === 'HOST' ? 'HOST' : 'RIDER'),
            text: it.text,
            ts: it.createdAt ? new Date(it.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            status: (it as any).status || 'sent',
          }));
          setMessages(mapped);
        }
      }).catch(() => {});
      return () => { mounted = false; unsub && unsub(); };
    } catch (e) {
      return () => { mounted = false; };
    }
  }, [id]);

  const title = useMemo(() => name || `Chat ${id}`, [name, id]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    // optimistic UI
    const tempId = `t-${Date.now()}`;
    setMessages((m) => [
      ...m,
      { id: tempId, from: 'RIDER', text, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInput('');
    Keyboard.dismiss();
    // send to Firestore
    console.log('[RiderChat] sendMessage ->', id, { from: 'RIDER', text });
    void sendMessage(id, { from: 'RIDER', text }).catch((err) => {
      console.warn('[RiderChat] sendMessage failed', err);
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub}>Host</Text>
        </View>

        <Pressable onPress={() => {}} style={styles.headerBtn} hitSlop={10}>
          <Ionicons name="call-outline" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xl }}
        ref={listRef}
        renderItem={({ item }) => {
          const mine = item.from === 'RIDER';
          return (
            <View style={[styles.row, mine ? styles.rowRight : styles.rowLeft]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.msgText, mine ? styles.msgMine : styles.msgTheirs]}>{item.text}</Text>
                <Text style={[styles.ts, mine ? styles.tsMine : styles.tsTheirs]}>{item.ts}</Text>
                {mine ? (
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                    {item.status === 'read' ? 'Read' : item.status === 'delivered' ? 'Delivered' : 'Sent'}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      <View style={styles.composer}>
        <View style={styles.inputWrap}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message host..."
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
          />
        </View>
        <Pressable onPress={send} style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.9 }]} hitSlop={10}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginTop: 2 },

  row: { width: '100%', marginBottom: Spacing.sm },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },

  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
  },
  bubbleMine: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  bubbleTheirs: { backgroundColor: '#fff', borderColor: Colors.border },

  msgText: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  msgMine: { color: '#fff' },
  msgTheirs: { color: Colors.text },

  ts: { marginTop: 6, fontSize: 11, fontWeight: '700' },
  tsMine: { color: 'rgba(255,255,255,0.85)' },
  tsTheirs: { color: Colors.textMuted },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    height: 46,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: { fontSize: 15, color: Colors.text },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
