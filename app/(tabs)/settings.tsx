import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Linking } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { APP_VERSION, BOTFATHER_URL, CHANNEL_URL } from "@/constants/config";
import { clearAll } from "@/utils/storage";
import { useColors } from "@/hooks/useColors";
import type { Lang } from "@/constants/translations";

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({
  icon,
  label,
  iconColor,
  onPress,
  rightElement,
  danger,
}: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.rowIcon,
            {
              backgroundColor: (iconColor ?? colors.primary) + "22",
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={iconColor ?? colors.primary}
          />
        </View>
        <Text
          style={[
            styles.rowLabel,
            { color: danger ? colors.destructive : colors.foreground },
          ]}
        >
          {label}
        </Text>
      </View>
      {rightElement ?? (
        onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.mutedForeground}
          />
        )
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const { session, logout, getCredits, getReferralCount, getReferralCode } =
    useAuth();
  const {
    t,
    mode,
    setMode,
    language,
    setLanguage,
    notificationsEnabled,
    setNotificationsEnabled,
    prayerReminders,
    setPrayerReminders,
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled,
  } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [credits, setCredits] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [refCode, setRefCode] = useState("");

  const username = session?.username ?? "";

  useEffect(() => {
    if (username && !session?.isGuest) {
      getCredits(username).then(setCredits);
      getReferralCount(username).then(setReferrals);
      getReferralCode(username).then(setRefCode);
    }
  }, [username]);

  const handleLogout = () => {
    Alert.alert(t.logout, "هل تريد تسجيل الخروج؟", [
      { text: t.cancel, style: "cancel" },
      {
        text: t.logout,
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(t.clearData, "سيتم حذف جميع البيانات. هل أنت متأكد؟", [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: async () => {
          await clearAll();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `تطبيق Maro Bot Manager - إدارة بوتات تليجرام\nhttps://t.me/MaroBotManager`,
        title: "Maro Bot Manager",
      });
    } catch {}
  };

  const themeOptions: { label: string; value: "dark" | "light" | "system" }[] = [
    { label: t.darkTheme, value: "dark" },
    { label: t.lightTheme, value: "light" },
    { label: t.systemTheme, value: "system" },
  ];

  const langOptions: { label: string; value: Lang }[] = [
    { label: "العربية", value: "ar" },
    { label: "English", value: "en" },
    { label: "Français", value: "fr" },
    { label: "Español", value: "es" },
    { label: "Deutsch", value: "de" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#14142A", colors.background]}
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        <Text style={styles.title}>{t.settings}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
      >
        {!session?.isGuest && (
          <View
            style={[
              styles.userCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              style={styles.avatarLarge}
            >
              <Text style={styles.avatarLargeText}>
                {username[0]?.toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.userCardInfo}>
              <Text style={[styles.userCardName, { color: colors.foreground }]}>
                {username}
              </Text>
              <View style={styles.userCardStats}>
                <View style={styles.miniStat}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text
                    style={[styles.miniStatText, { color: colors.foreground }]}
                  >
                    {credits} {t.credits}
                  </Text>
                </View>
                <View style={styles.miniStat}>
                  <Ionicons
                    name="share-social-outline"
                    size={12}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.miniStatText, { color: colors.foreground }]}
                  >
                    {referrals} {t.referrals}
                  </Text>
                </View>
                <View style={styles.miniStat}>
                  <Ionicons
                    name="key-outline"
                    size={12}
                    color={colors.success}
                  />
                  <Text
                    style={[styles.miniStatText, { color: colors.foreground }]}
                  >
                    {refCode}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <SectionHeader title={t.accounts} />
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="people-outline"
            label={t.manageAccounts}
            onPress={() => router.push("/accounts")}
          />
          <SettingRow
            icon="person-add-outline"
            label={t.inviteFriend}
            iconColor="#F59E0B"
            onPress={() => router.push("/invite")}
          />
        </View>

        <SectionHeader title={t.theme} />
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>
              {t.theme}
            </Text>
            <View style={styles.themeOptions}>
              {themeOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setMode(opt.value)}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor:
                        mode === opt.value
                          ? colors.primary
                          : colors.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeChipText,
                      {
                        color:
                          mode === opt.value
                            ? "#FFFFFF"
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>
              {t.language}
            </Text>
            <View style={styles.themeOptions}>
              {langOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setLanguage(opt.value)}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor:
                        language === opt.value
                          ? colors.primary
                          : colors.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeChipText,
                      {
                        color:
                          language === opt.value
                            ? "#FFFFFF"
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <SectionHeader title={t.notifications} />
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="notifications-outline"
            label={t.notifications}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            icon="moon-outline"
            label={t.prayerReminders}
            iconColor="#A855F7"
            rightElement={
              <Switch
                value={prayerReminders}
                onValueChange={setPrayerReminders}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            icon="volume-high-outline"
            label={t.sound}
            iconColor="#3B82F6"
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            icon="phone-portrait-outline"
            label={t.vibration}
            iconColor="#10B981"
            rightElement={
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        <SectionHeader title="روابط سريعة" />
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="paper-plane-outline"
            label={t.botFather}
            iconColor="#2AABEE"
            onPress={() => Linking.openURL(BOTFATHER_URL)}
          />
          <SettingRow
            icon="megaphone-outline"
            label={t.channel}
            iconColor="#A855F7"
            onPress={() => Linking.openURL(CHANNEL_URL)}
          />
        </View>

        <SectionHeader title="التطبيق" />
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="share-outline"
            label={t.shareApp}
            iconColor="#F59E0B"
            onPress={handleShare}
          />
          <SettingRow
            icon="help-circle-outline"
            label={t.help}
            iconColor="#3B82F6"
            onPress={() => Alert.alert(t.help, "للمساعدة تواصل مع @MaroBotManager")}
          />
          <SettingRow
            icon="information-circle-outline"
            label={t.aboutApp}
            onPress={() =>
              Alert.alert(
                t.appName,
                `${t.developer}\n${t.version}\n\nتطبيق متكامل لإدارة بوتات تليجرام`
              )
            }
          />
          <SettingRow
            icon="shield-outline"
            label={t.privacyPolicy}
            iconColor="#10B981"
            onPress={() => Alert.alert(t.privacyPolicy, "جميع البيانات محفوظة على جهازك فقط")}
          />
        </View>

        <SectionHeader title="البيانات" />
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="cloud-upload-outline"
            label={t.backup}
            iconColor="#3B82F6"
            onPress={() => Alert.alert("", "تم حفظ النسخة الاحتياطية")}
          />
          <SettingRow
            icon="cloud-download-outline"
            label={t.restore}
            iconColor="#10B981"
            onPress={() => Alert.alert("", "تم استعادة البيانات")}
          />
          <SettingRow
            icon="trash-outline"
            label={t.clearData}
            iconColor={colors.destructive}
            danger
            onPress={handleClearData}
          />
        </View>

        <Pressable
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: colors.destructive + "22",
              borderColor: colors.destructive + "44",
            },
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.destructive}
          />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>
            {t.logout}
          </Text>
        </Pressable>

        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
          {t.appName} v{APP_VERSION}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: "900", color: "#FFFFFF", paddingTop: 16 },
  content: { padding: 16, gap: 6 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 10,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLargeText: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },
  userCardInfo: { flex: 1 },
  userCardName: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  userCardStats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  miniStatText: { fontSize: 12, fontWeight: "600" },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4,
    marginTop: 12,
    marginBottom: 4,
  },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    minHeight: 52,
    flexWrap: "wrap",
    gap: 8,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  themeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  themeChipText: { fontSize: 12, fontWeight: "600" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  logoutText: { fontSize: 16, fontWeight: "700" },
  versionText: { textAlign: "center", fontSize: 12, marginTop: 8 },
});
