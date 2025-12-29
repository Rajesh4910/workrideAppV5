import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { WrButton } from '../components/WrButton';
import { Spacing, Typography } from '../theme/metrics';
import { useAuth } from '../state/AuthContext';
import { Colors } from '../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const { country, signInWithProvider } = useAuth();

  const onGoogle = async () => {
    if (signInWithProvider) await signInWithProvider('google');
    (navigation.getParent?.() ?? navigation).navigate('RoleSelection');
  };

  const onApple = async () => {
    if (signInWithProvider) await signInWithProvider('apple');
    (navigation.getParent?.() ?? navigation).navigate('RoleSelection');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: Spacing.xl }}>
        <View style={{ marginTop: Spacing.lg }}>
          <Text style={Typography.h2}>Welcome</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 8, lineHeight: 22 }]}>Sign in to offer or find trusted rides.</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 8 }]}>Country: {country ? `${country.flag} ${country.name} • ${country.currency}` : 'Not selected'}</Text>
        </View>

        <View style={{ gap: Spacing.md }}>
          <WrButton title="Sign in with Google" onPress={onGoogle} />
          <WrButton title="Sign in with Apple" onPress={onApple} />
          <Pressable onPress={() => (navigation.getParent?.() ?? navigation).navigate('RoleSelection')} style={styles.guest}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  guest: { alignItems: 'center', padding: 12 },
  guestText: { color: Colors.textMuted, fontWeight: '700' },
});
