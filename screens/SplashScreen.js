// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';

export default function SplashScreen({ onComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete && onComplete());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Driver
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
          Deliver Happiness
        </Animated.Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.circle,
          styles.c1,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          styles.c2,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EF3E62',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: { alignItems: 'center', zIndex: 10 },
  logo: { width: 180, height: 180, marginBottom: 20 },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFF',
    marginTop: 8,
    opacity: 0.9,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  c1: { width: 300, height: 300, top: -100, right: -100 },
  c2: { width: 250, height: 250, bottom: -80, left: -80 },
});
