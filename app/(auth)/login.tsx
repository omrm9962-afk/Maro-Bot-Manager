import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AnimatedButton } from "@/components/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const { login, loginAsGuest } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("", t.fillAllFields);
      return;
    }
    setLoading(true);
    const res = await login(username.trim(), password.trim());
    setLoading(false);
    if (!res.success) {
      Alert.alert("", t[res.error as keyof typeof t] as string || res.error);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleGuest = async () => {
    await loginAsGuest();
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient
      colors={["#060615", "#0D0D2B", "#14142A"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              style={styles.logoBox}
            >
              <Text style={styles.logoText}>🤖</Text>
            </LinearGradient>
            <Text style={styles.title}>MARO</Text>
            <Text style={styles.subtitle}>Bot Manager</Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {t.login}
            </Text>

            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={t.username}
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={t.password}
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPass(!showPass)}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgotLink}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>
                  {t.forgotPassword}
                </Text>
              </Pressable>
            </Link>

            <AnimatedButton
              onPress={handleLogin}
              label={t.login}
              loading={loading}
              size="lg"
            />

            <AnimatedButton
              onPress={handleGuest}
              label={t.guestMode}
              variant="outline"
              size="md"
              style={{ marginTop: 8 }}
            />

            <View style={styles.registerRow}>
              <Text style={[styles.mutedText, { color: colors.mutedForeground }]}>
                {t.noAccount}{" "}
              </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={[styles.linkText, { color: colors.primary }]}>
                    {t.register}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 24 },
  header: { alignItems: "center", gap: 10 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 40 },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 6,
  },
  subtitle: { fontSize: 13, color: "#8888BB", letterSpacing: 3 },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16 },
  forgotLink: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: "600" },
  registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 4 },
  mutedText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: "700" },
});
