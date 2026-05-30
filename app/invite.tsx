import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function InviteScreen() {
  const { session, getReferralCode, getReferralCount } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState("");
  const [referrals, setReferrals] = useState(0);

  const username = session?.username ?? "";

  useEffect(() => {
    if (username && !session?.isGuest) {
      getReferralCode(username).then(setCode);
      getReferralCount(username).then(setReferrals);
    }
  }, [username]);

  const inviteLink = `https://t.me/MaroBotManager?start=${code}`;

  const handleCopy = () => {
    Clipboard.setString(inviteLink);
    Alert.alert("", t.copied);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `انضم إلى Maro Bot Manager واحصل على مكافآت!\n${inviteLink}`,
        title: "دعوة صديق",
      });
    } catch {}
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
          <Text style={styles.title}>{t.inviteFriend}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <LinearGradient
          colors={["#7C3AED22", "#A855F722"]}
          style={[
            styles.heroCard,
            { borderColor: colors.primary + "44" },
          ]}
        >
          <LinearGradient
            colors={["#7C3AED", "#A855F7"]}
            style={styles.heroIcon}
          >
            <Ionicons name="gift" size={40} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            ادعُ أصدقاءك واربح!
          </Text>
          <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
            لكل صديق ينضم برابطك تحصل على{"\n"}
            <Text style={[styles.bold, { color: colors.primary }]}>
              +5 كريدت
            </Text>
          </Text>
        </LinearGradient>

        <View
          style={[
            styles.statsRow,
          ]}
        >
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="share-social" size={24} color="#F59E0B" />
            <Text style={[styles.statNum, { color: colors.foreground }]}>
              {referrals}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
              {t.referrals}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={[styles.statNum, { color: colors.foreground }]}>
              {referrals * 5}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
              كريدت مكتسب
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.codeBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[styles.codeLabel, { color: colors.mutedForeground }]}
          >
            رمز الدعوة الخاص بك
          </Text>
          <Text style={[styles.codeText, { color: colors.primary }]}>
            {code}
          </Text>
        </View>

        <View
          style={[
            styles.linkBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[styles.linkLabel, { color: colors.mutedForeground }]}
          >
            {t.inviteLink}
          </Text>
          <Text
            style={[styles.linkText, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {inviteLink}
          </Text>
        </View>

        <View style={styles.btnRow}>
          <Pressable
            onPress={handleCopy}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Ionicons name="copy-outline" size={20} color={colors.foreground} />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
              {t.copyLink}
            </Text>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              style={styles.shareBtnGradient}
            >
              <Ionicons name="share-social" size={20} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>{t.shareLink}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
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
  content: { flex: 1, padding: 16, gap: 16 },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 22, fontWeight: "800" },
  heroDesc: { fontSize: 15, textAlign: "center", lineHeight: 24 },
  bold: { fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  statNum: { fontSize: 28, fontWeight: "900" },
  statLbl: { fontSize: 12 },
  codeBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  codeLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  codeText: { fontSize: 26, fontWeight: "900", letterSpacing: 3 },
  linkBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  linkLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  linkText: { fontSize: 13 },
  btnRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 15, fontWeight: "600" },
  shareBtn: { flex: 1 },
  shareBtnGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  shareBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
