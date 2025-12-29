import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/metrics';

export default function SplashScreen({ navigation }: any) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start(() => {
      // hold briefly then navigate
      setTimeout(() => navigation.replace('Welcome'), 500);
    });
  }, [navigation, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Image source={require('../../assets/icon.png')} style={styles.icon} accessible accessibilityLabel="WorkRide logo" />
      </Animated.View>
      <Animated.Text style={[Typography.h1, { marginTop: 16, opacity } as any]}>WorkRide</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity }]}>Carpool smarter. Drive greener.</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  icon: { width: 120, height: 120, resizeMode: 'contain' },
  tagline: { marginTop: 10, fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
});
