import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../utils/theme';

export function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={Typography.h3}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onPress} hitSlop={10}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  action: {
    ...Typography.caption,
    color: Colors.brand,
    fontWeight: '700',
  },
});
