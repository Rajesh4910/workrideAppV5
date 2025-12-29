import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius } from '../theme/metrics';

type Variant = 'primary' | 'secondary';

export function WrButton({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !isDisabled ? { opacity: 0.92 } : null,
        isDisabled ? { opacity: 0.6 } : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.primary} />
      ) : (
        <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textSecondary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  text: { fontSize: 16, fontWeight: '700' },
  textPrimary: { color: '#fff' },
  textSecondary: { color: Colors.text },
});
