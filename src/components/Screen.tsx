import React from 'react';
import { SafeAreaView, View, StyleSheet, ViewProps, Platform, StatusBar } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/metrics';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewProps['style'] }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + Spacing.md : Spacing.md },
});
