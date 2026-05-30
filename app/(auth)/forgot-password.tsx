import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

type Step = "email" | "code" | "newPassword";

export default function ForgotPasswordScreen() {
  const { getUserEmail, resetPassword } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("email");
  const [usernameInput, setUsernameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!usernameInput.trim()) {
      Alert.alert("", t.fillAllFields);
      return;
    }
    setLoading(true);
    const email = await getUserEmail(usernameInput.trim());
    setLoading(false);
    if (!email) {
      Alert.alert("", t.usernameNotFound);
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    Alert.alert(t.sendCode, `كود التحقق: ${code}\n(للبريد: ${email})`);
    setStep("code");
  };

  const handleVerify = () => {
    if (codeInput.trim() !== generatedCode) {
      Alert.alert("", t.codeError);
      return;
    }
    setStep("newPassword");
  };

  const handleReset = async () => {
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      Alert.alert("", t.passwordShort);
      return;
    }
    await resetPassword(usernameInput.trim(), newPassword.trim());
    Alert.alert("", "تم تغيير كلمة المرور بنجاح!", [
      { text: t.login, onPress: () => router.replace("/(auth)/login") },
    ]);
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
            <Text style={styles.title}>{t.forgotPassword}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.stepIndicator}>
              {(["email", "code", "newPassword"] as Step[]).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        step === s
                          ? colors.primary
                          : i < ["email", "code", "newPassword"].indexOf(step)
                          ? colors.success
                          : colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            {step === "email" && (
              <>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  {t.enterEmail}
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
                    value={usernameInput}
                    onChangeText={setUsernameInput}
                    autoCapitalize="none"
                  />
                </View>
                <AnimatedButton
                  onPress={handleSendCode}
                  label={t.sendCode}
                  loading={loading}
                  size="lg"
                />
              </>
            )}

            {step === "code" && (
              <>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  {t.enterCode}
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    { backgroundColor: colors.input, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="key-outline" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="000000"
                    placeholderTextColor={colors.mutedForeground}
                    value={codeInput}
                    onChangeText={setCodeInput}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <AnimatedButton
                  onPress={handleVerify}
                  label={t.verifyCode}
                  size="lg"
                />
              </>
            )}

            {step === "newPassword" && (
              <>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  {t.newPassword}
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    { backgroundColor: colors.input, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder={t.newPassword}
                    placeholderTextColor={colors.mutedForeground}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                <AnimatedButton
                  onPress={handleReset}
                  label={t.save}
                  size="lg"
                />
              </>
            )}
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
  title: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  card: { padding: 24, borderRadius: 20, borderWidth: 1, gap: 20 },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
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
});
