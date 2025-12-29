import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { WrCard } from '../components/WrCard';
import { WrButton } from '../components/WrButton';
import { useAuth } from '../state/AuthContext';
import { Spacing, Typography } from '../theme/metrics';

export default function ProfileScreen({ navigation }: any) {
  const { signOut, role } = useAuth();
  const { profile, setProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [bank, setBank] = useState(profile?.bankAccount || '');

  return (
    <Screen>
      <Text style={Typography.h2}>Profile</Text>
      <Text style={[Typography.bodyMuted, { marginTop: 8 }]}>Role: {role ?? 'Not set'}</Text>

      <View style={{ marginTop: Spacing.lg, gap: Spacing.md, flex: 1 }}>
        <WrCard>
          <Text style={Typography.h3}>Account</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Name, phone, payment, preferences.</Text>
          {role === 'HOST' ? (
            <View style={{ marginTop: 12, gap: 8 }}>
              <TextInput placeholder="Full name" style={styles.input} value={name} onChangeText={setName} />
              <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
              <TextInput placeholder="Bank account" style={styles.input} value={bank} onChangeText={setBank} />
              <WrButton title="Save profile" onPress={() => {
                setProfile && setProfile({ name: name || undefined, email: email || undefined, bankAccount: bank || undefined });
                Alert.alert('Saved', 'Profile saved locally.');
              }} />
            </View>
          ) : null}
        </WrCard>

        <WrCard>
          <Text style={Typography.h3}>Safety</Text>
          <Text style={[Typography.bodyMuted, { marginTop: 6 }]}>Trusted profiles and ride verification.</Text>
        </WrCard>

        <View style={{ marginTop: 'auto', paddingBottom: Spacing.xl }}>
          <WrButton
            title="Sign out"
            variant="secondary"
            onPress={async () => {
              await signOut();
              navigation.replace('Welcome');
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
});
