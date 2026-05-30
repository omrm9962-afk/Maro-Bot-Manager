import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function RegisterScreen() {
  const { register, checkUsername } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "available" | "taken"
  >("idle");

  const handleCheckUsername = async () => {
    if (!username.trim()) return;
    setCheckingUser(true);
    const available = await checkUsername(username.trim());
    setUsernameStatus(available ? "available" : "taken");
    setCheckingUser(false);
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("", t.fillAllFields);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("", t.passwordMismatch);
      return;
    }
    setLoading(true);
    const res = await register(
      username.trim(),
      password.trim(),
      email.trim(),
      referralCode.trim() || undefined
    );
    setLoading(false);
    if (!res.success) {
      Alert.alert("", t[res.error as keyof typeof t] as string || res.error);
    } else {
      router.replace("/(tabs)");
    }
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
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.title}>{t.createAccount}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View>
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
                  onChangeText={(v) => {
                    setUsername(v);
                    setUsernameStatus("idle");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={handleCheckUsername}
                  disabled={checkingUser}
                  style={[
                    styles.checkBtn,
                    { backgroundColor: colors.primary + "22" },
                  ]}
                >
                  <Text style={[styles.checkText, { color: colors.primary }]}>
                    {t.checkAvailability}
                  </Text>
                </Pressable>
              </View>
              {usernameStatus !== "idle" && (
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        usernameStatus === "available"
                          ? colors.success
                          : colors.destructive,
                    },
                  ]}
                >
                  {usernameStatus === "available" ? t.usernameAvailable : t.usernameExists}
                </Text>
              )}
            </View>

            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={t.email}
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
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

            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={t.confirmPassword}
                placeholderTextColor={colors.mutedForeground}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
            </View>

            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              <Ionicons name="gift-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={`${t.referralCode} (${t.optional})`}
                placeholderTextColor={colors.mutedForeground}
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
              />
            </View>

            <AnimatedButton
              onPress={handleRegister}
              label={t.createAccount}
              loading={loading}
              size="lg"
            />

            <View style={styles.loginRow}>
              <Text style={[styles.mutedText, { color: colors.mutedForeground }]}>
                {t.alreadyHaveAccount}{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={[styles.linkText, { color: colors.primary }]}>
                    {t.login}
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
  content: { flexGrow: 1, padding: 24, gap: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  card: { padding: 24, borderRadius: 20, borderWidth: 1, gap: 14 },
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
  checkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  checkText: { fontSize: 13, fontWeight: "700" },
  statusText: { fontSize: 12, marginTop: 4, paddingLeft: 4 },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  mutedText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: "700" },
});
