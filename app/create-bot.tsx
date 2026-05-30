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
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { BOT_CREATION_COST } from "@/constants/config";
import { testBotToken } from "@/utils/telegram";
import { useColors } from "@/hooks/useColors";

export default function CreateBotScreen() {
  const { addBot } = useApp();
  const { session, getCredits } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [testing, setTesting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [botInfo, setBotInfo] = useState<{
    botName?: string;
    username?: string;
  }>({});

  const handleTest = async () => {
    if (!token.trim()) {
      Alert.alert("", "أدخل التوكن أولاً");
      return;
    }
    setTesting(true);
    setTokenStatus("idle");
    const result = await testBotToken(token.trim());
    setTesting(false);
    if (result.valid) {
      setTokenStatus("valid");
      setBotInfo({ botName: result.botName, username: result.username });
      if (!name.trim() && result.botName) {
        setName(result.botName);
      }
    } else {
      setTokenStatus("invalid");
    }
  };

  const handleCreate = async () => {
    if (tokenStatus !== "valid") {
      Alert.alert("", t.testFirst);
      return;
    }
    if (!session?.username) return;

    const credits = await getCredits(session.username);
    if (credits < BOT_CREATION_COST) {
      Alert.alert("", `${t.insufficientCredits}\nرصيدك: ${credits} كريدت`);
      return;
    }

    Alert.alert("", t.confirmCreate, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.confirm,
        onPress: async () => {
          setCreating(true);
          const res = await addBot(
            name.trim() || botInfo.botName || "Bot",
            token.trim(),
            botInfo.username
          );
          setCreating(false);
          if (res.success) {
            Alert.alert("", t.botCreated, [
              { text: "موافق", onPress: () => router.back() },
            ]);
          } else {
            Alert.alert("", t[res.error as keyof typeof t] as string || res.error);
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={["#14142A", colors.background]}
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.title}>{t.createBot}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.costBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.costText}>{t.costCredits}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.fieldLabel, { color: colors.mutedForeground }]}
            >
              {t.botToken} *
            </Text>
            <View style={styles.tokenRow}>
              <View
                style={[
                  styles.tokenInput,
                  {
                    backgroundColor: colors.input,
                    borderColor:
                      tokenStatus === "valid"
                        ? colors.success
                        : tokenStatus === "invalid"
                        ? colors.destructive
                        : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={18}
                  color={colors.mutedForeground}
                />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="123456789:ABC..."
                  placeholderTextColor={colors.mutedForeground}
                  value={token}
                  onChangeText={(v) => {
                    setToken(v);
                    setTokenStatus("idle");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <AnimatedButton
                onPress={handleTest}
                label={t.testToken}
                loading={testing}
                variant="outline"
                size="md"
                fullWidth={false}
                style={{ width: 90 }}
              />
            </View>

            {tokenStatus !== "idle" && (
              <View style={styles.tokenStatusRow}>
                <Ionicons
                  name={
                    tokenStatus === "valid"
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={16}
                  color={
                    tokenStatus === "valid" ? colors.success : colors.destructive
                  }
                />
                <Text
                  style={[
                    styles.tokenStatusText,
                    {
                      color:
                        tokenStatus === "valid"
                          ? colors.success
                          : colors.destructive,
                    },
                  ]}
                >
                  {tokenStatus === "valid"
                    ? `${t.tokenValid}${botInfo.username ? ` — @${botInfo.username}` : ""}`
                    : t.tokenInvalid}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.fieldLabel,
                { color: colors.mutedForeground, marginTop: 8 },
              ]}
            >
              {t.botName} ({t.optional})
            </Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={18}
                color={colors.mutedForeground}
              />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={
                  botInfo.botName ?? "اسم البوت (اختياري)"
                }
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View
              style={[
                styles.infoBox,
                { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.primary}
              />
              <Text
                style={[styles.infoText, { color: colors.mutedForeground }]}
              >
                احصل على التوكن من @BotFather في تليجرام. يجب أن يحتوي التوكن على علامة ":"
              </Text>
            </View>

            <AnimatedButton
              onPress={handleCreate}
              label={t.createBot}
              loading={creating}
              disabled={tokenStatus !== "valid"}
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  costBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  costText: { color: "#F59E0B", fontSize: 13, fontWeight: "600" },
  content: { padding: 16 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  tokenRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  tokenInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 52,
    gap: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15 },
  tokenStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -6,
  },
  tokenStatusText: { fontSize: 13, fontWeight: "600" },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
