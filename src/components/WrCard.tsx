import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/metrics';

export function WrCard(props: ViewProps) {
  return <View {...props} style={[styles.card, props.style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.card,
  },
});
