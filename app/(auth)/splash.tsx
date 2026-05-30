import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const MESSAGES_AR = [
  "جاري التحميل...",
  "جاري التجهيز...",
  "جاري التحقق...",
  "مرحباً بك في Maro!",
];

export default function SplashScreen() {
  const { isLoggedIn, isLoading } = useAuth();
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const [msgIndex, setMsgIndex] = useState(0);
  const [progressVal, setProgressVal] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3200,
      useNativeDriver: false,
    }).start();

    progressAnim.addListener(({ value }) => {
      setProgressVal(Math.round(value * 100));
    });

    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES_AR.length);
    }, 800);

    const navTimer = setTimeout(() => {
      if (!isLoading) {
        router.replace(isLoggedIn ? "/(tabs)" : "/(auth)/login");
      }
    }, 3400);

    return () => {
      clearInterval(msgTimer);
      clearTimeout(navTimer);
      progressAnim.removeAllListeners();
    };
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      const t2 = setTimeout(() => {
        router.replace(isLoggedIn ? "/(tabs)" : "/(auth)/login");
      }, 3400);
      return () => clearTimeout(t2);
    }
  }, [isLoading, isLoggedIn]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 80],
  });

  return (
    <LinearGradient
      colors={["#060615", "#0D0D2B", "#14142A"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Animated.View
        style={[
          styles.center,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowAnim,
              },
            ]}
          />
          <LinearGradient
            colors={["#7C3AED", "#A855F7"]}
            style={styles.iconGradient}
          >
            <Text style={styles.iconText}>🤖</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.appName}>MARO</Text>
        <Text style={styles.subtitle}>Bot Manager</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressBar, { width: barWidth }]}
            />
          </View>
          <Text style={styles.progressText}>{progressVal}%</Text>
        </View>

        <Text style={styles.message}>{MESSAGES_AR[msgIndex]}</Text>
      </Animated.View>

      <Animated.Text
        style={[
          styles.version,
          { opacity: fadeAnim, paddingBottom: insets.bottom + 16 },
        ]}
      >
        v1.0.0 — Maro
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#7C3AED",
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 72,
  },
  appName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 8,
    textShadowColor: "#8B5CF6",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#8888BB",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 32,
    gap: 8,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#2A2A4A",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#6868A0",
    fontVariant: ["tabular-nums"],
  },
  message: {
    fontSize: 14,
    color: "#8888BB",
    marginTop: 8,
  },
  version: {
    position: "absolute",
    bottom: 0,
    fontSize: 12,
    color: "#444466",
  },
});
