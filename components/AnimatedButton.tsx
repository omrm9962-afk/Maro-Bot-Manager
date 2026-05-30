import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Pressable } from "react-native";

import { useColors } from "@/hooks/useColors";

interface AnimatedButtonProps {
  onPress: () => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  style?: object;
}

export function AnimatedButton({
  onPress,
  label,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = true,
  style,
}: AnimatedButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  const heights = { sm: 40, md: 52, lg: 60 };
  const fontSizes = { sm: 14, md: 16, lg: 18 };

  const getColors = (): [string, string] => {
    if (disabled)
      return [colors.muted, colors.muted];
    switch (variant) {
      case "primary":
        return ["#7C3AED", "#A855F7"];
      case "secondary":
        return [colors.secondary, colors.secondary];
      case "danger":
        return [colors.destructive, "#FF6B6B"];
      default:
        return ["transparent", "transparent"];
    }
  };

  const [c1, c2] = getColors();

  if (variant === "outline") {
    return (
      <Animated.View
        style={[
          animStyle,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[
            styles.outline,
            {
              height: heights[size],
              borderColor: colors.primary,
              borderRadius: colors.radius,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text
              style={[
                styles.label,
                { color: colors.primary, fontSize: fontSizes[size] },
              ]}
            >
              {label}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[animStyle, fullWidth && styles.fullWidth, style]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.wrapper,
          {
            height: heights[size],
            borderRadius: colors.radius,
            opacity: disabled ? 0.6 : 1,
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={[c1, c2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text
            style={[
              styles.label,
              {
                color:
                  variant === "secondary"
                    ? colors.secondaryForeground
                    : "#fff",
                fontSize: fontSizes[size],
              },
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: "100%" },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  outline: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  label: {
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
