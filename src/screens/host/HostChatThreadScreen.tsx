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

type Props = NativeStackScreenProps<RootStackParamList, 'HostChatThread'>;

type Msg = {
  id: string;
  from: 'HOST' | 'RIDER';
  text: string;
  ts: string;
  status?: string;
};

function seedMessages(name: string): Msg[] {
  return [
    { id: 'm1', from: 'RIDER', text: `Hi! This is ${name}. I've requested the ride.`, ts: '09:12' },
    { id: 'm2', from: 'HOST', text: 'Thanks! Please confirm your pickup point.', ts: '09:13' },
    { id: 'm3', from: 'RIDER', text: 'Pickup at Connolly Station main entrance works for me.', ts: '09:14' },
  ];
}

export default function HostChatThreadScreen({ navigation, route }: Props) {
  const { name } = route.params;
  const [composer, setComposer] = useState('');
  const [messages, setMessages] = useState<Msg[]>(() => seedMessages(name));
  const { user, role } = useAuth();
  const listRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const threadId = (route.params as any)?.id ?? name;
      const unsub = subscribeThreadMessages(threadId, (items) => {
        if (!mounted) return;
        console.log('[HostChat] subscribeThreadMessages ->', threadId, items);
        const mapped: Msg[] = items.map((it) => ({ id: it.id, from: it.from === 'HOST' ? 'HOST' : 'RIDER', text: it.text, ts: it.createdAt ? new Date(it.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', status: (it as any).status || 'sent' }));
        setMessages(mapped.length ? mapped : seedMessages(name));
        // mark delivered
        mapped.forEach((m) => {
          if (m.from !== 'HOST' && m.status !== 'delivered') {
            void import('../../firebase/messages').then((mod) => mod.updateMessageStatus(m.id, 'delivered')).catch(() => {});
          }
        });
        setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
      });
      getThreadMessages((route.params as any)?.id ?? name).then((items) => {
        if (!mounted) return;
        if (items.length) setMessages(items.map((it) => ({ id: it.id, from: it.from === 'HOST' ? 'HOST' : 'RIDER', text: it.text, ts: it.createdAt ? new Date(it.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '', status: (it as any).status || 'sent' })));
      }).catch(() => {});
      return () => { mounted = false; unsub && unsub(); };
    } catch (e) {
      return () => { mounted = false; };
    }
  }, [name, route.params]);

  const headerTitle = useMemo(() => name, [name]);

    const onSend = () => {
    const text = composer.trim();
    if (!text) return;
    const tempId = `t-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, from: 'HOST', text, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setComposer('');
    Keyboard.dismiss();
    const threadId = (route.params as any)?.id ?? name;
    console.log('[HostChat] sendMessage ->', threadId, { from: 'HOST', text });
    void sendMessage(threadId, { from: 'HOST', text }).catch((err) => { console.warn('[HostChat] sendMessage failed', err); });
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <Text style={Typography.caption}>Typically replies in minutes</Text>
        </View>

        <Pressable style={styles.headerBtn} onPress={() => {}}>
          <Ionicons name="call-outline" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isHost = item.from === 'HOST';
            return (
              <View style={[styles.msgRow, isHost ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                <View
                  style={[
                    styles.bubble,
                    isHost ? styles.bubbleHost : styles.bubbleRider,
                  ]}
                >
                    <Text style={[styles.msgText, isHost ? { color: '#fff' } : { color: Colors.text }]}>
                      {item.text}
                    </Text>
                    <Text style={[styles.msgTime, isHost ? { color: 'rgba(255,255,255,0.75)' } : null]}>
                      {item.ts}
                    </Text>
                    {isHost ? (
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                        {item.status === 'read' ? 'Read' : item.status === 'delivered' ? 'Delivered' : 'Sent'}
                      </Text>
                    ) : null}
                </View>
              </View>
            );
          }}
        />

        {/* Composer */}
        <View style={styles.composerWrap}>
          <TextInput
            value={composer}
            onChangeText={setComposer}
            placeholder="Message"
            placeholderTextColor={Colors.textMuted}
            style={styles.composerInput}
            multiline
          />
          <Pressable
            onPress={onSend}
            style={({ pressed }) => [
              styles.sendBtn,
              pressed ? { opacity: 0.9 } : null,
              composer.trim().length === 0 ? { opacity: 0.5 } : null,
            ]}
            disabled={composer.trim().length === 0}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31,41,51,0.06)',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Colors.text },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: 10,
  },
  msgRow: { flexDirection: 'row' },
  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleHost: { backgroundColor: Colors.brand, borderTopRightRadius: 6 },
  bubbleRider: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderTopLeftRadius: 6 },
  msgText: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  msgTime: { marginTop: 6, fontSize: 11, fontWeight: '700', color: Colors.textMuted, alignSelf: 'flex-end' },
  composerWrap: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.bg,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
