import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
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

export default function AccountsScreen() {
  const { session, getSavedAccounts, addAccount } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [accounts, setAccounts] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getSavedAccounts().then(setAccounts);
  }, []);

  const handleAdd = async () => {
    if (!addUsername.trim() || !addPassword.trim()) {
      Alert.alert("", t.fillAllFields);
      return;
    }
    setAdding(true);
    const res = await addAccount(addUsername.trim(), addPassword.trim());
    setAdding(false);
    if (res.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("", t[res.error as keyof typeof t] as string || res.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#14142A", colors.background]}
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.title}>{t.manageAccounts}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isCurrent = item === session?.username;
          return (
            <View
              style={[
                styles.accountRow,
                {
                  backgroundColor: colors.card,
                  borderColor: isCurrent ? colors.primary : colors.border,
                  borderWidth: isCurrent ? 1.5 : 1,
                },
              ]}
            >
              <LinearGradient
                colors={
                  isCurrent ? ["#7C3AED", "#A855F7"] : [colors.secondary, colors.secondary]
                }
                style={styles.avatar}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: isCurrent ? "#FFFFFF" : colors.foreground },
                  ]}
                >
                  {item[0]?.toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={styles.accountInfo}>
                <Text style={[styles.accountName, { color: colors.foreground }]}>
                  {item}
                </Text>
                {isCurrent && (
                  <Text style={[styles.currentTag, { color: colors.primary }]}>
                    {t.currentAccount}
                  </Text>
                )}
              </View>
              {!isCurrent && (
                <Pressable
                  onPress={() => {
                    Alert.prompt(
                      t.switchAccount,
                      `أدخل كلمة مرور ${item}`,
                      async (pw) => {
                        if (!pw) return;
                        const res = await addAccount(item, pw);
                        if (res.success) {
                          router.replace("/(tabs)");
                        } else {
                          Alert.alert(
                            "",
                            t[res.error as keyof typeof t] as string || res.error
                          );
                        }
                      },
                      "secure-text"
                    );
                  }}
                  style={[
                    styles.switchBtn,
                    { backgroundColor: colors.primary + "22" },
                  ]}
                >
                  <Text style={[styles.switchText, { color: colors.primary }]}>
                    {t.switchAccount}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            {!showAdd ? (
              <Pressable
                onPress={() => setShowAdd(true)}
                style={[
                  styles.addBtn,
                  { borderColor: colors.primary, backgroundColor: colors.primary + "11" },
                ]}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>
                  {t.addAccount}
                </Text>
              </Pressable>
            ) : (
              <View
                style={[
                  styles.addForm,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.formTitle, { color: colors.foreground }]}>
                  {t.addAccount}
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
                    value={addUsername}
                    onChangeText={setAddUsername}
                    autoCapitalize="none"
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
                    value={addPassword}
                    onChangeText={setAddPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                <AnimatedButton
                  onPress={handleAdd}
                  label={t.addAccount}
                  loading={adding}
                  size="md"
                />
                <Pressable onPress={() => setShowAdd(false)}>
                  <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                    {t.cancel}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  list: { padding: 16, gap: 10 },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800" },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 16, fontWeight: "700" },
  currentTag: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  switchText: { fontSize: 13, fontWeight: "700" },
  footer: { marginTop: 8 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  addBtnText: { fontSize: 15, fontWeight: "700" },
  addForm: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  formTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
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
  cancelText: { textAlign: "center", fontSize: 14, paddingVertical: 4 },
});
