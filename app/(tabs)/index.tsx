import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

interface ActionBtn {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: ActionBtn) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <Animated.View
      style={[styles.actionBtnWrap, { transform: [{ scale }] }]}
    >
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={handlePress}
        style={[
          styles.actionBtn,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.actionIconBg,
            { backgroundColor: color + "22" },
          ]}
        >
          <Ionicons name={icon} size={26} color={color} />
        </View>
        <Text style={[styles.actionLabel, { color: colors.foreground }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { session, getAllUsers, getReferralCount } = useAuth();
  const { bots, credits, refreshCredits, loadBots } = useApp();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [usersCount, setUsersCount] = useState(0);
  const [referrals, setReferrals] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const load = async () => {
      await Promise.all([refreshCredits(), loadBots()]);
      const users = await getAllUsers();
      setUsersCount(users.length);
      if (session?.username) {
        const r = await getReferralCount(session.username);
        setReferrals(r);
      }
    };
    load();
  }, []);

  const username = session?.username ?? "مجهول";

  const actionButtons: ActionBtn[] = [
    {
      icon: "hardware-chip-outline",
      label: t.myBots,
      color: colors.primary,
      onPress: () => router.push("/(tabs)/bots"),
    },
    {
      icon: "add-circle-outline",
      label: t.createBot,
      color: colors.success,
      onPress: () => router.push("/create-bot"),
    },
    {
      icon: "person-add-outline",
      label: t.inviteFriend,
      color: "#F59E0B",
      onPress: () => router.push("/invite"),
    },
    {
      icon: "chatbubbles-outline",
      label: t.chat,
      color: "#3B82F6",
      onPress: () => router.push("/(tabs)/chat"),
    },
    {
      icon: "people-outline",
      label: t.allUsers,
      color: "#EC4899",
      onPress: () => router.push("/users"),
    },
    {
      icon: "settings-outline",
      label: t.settings,
      color: colors.mutedForeground,
      onPress: () => router.push("/(tabs)/settings"),
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={["#14142A", colors.background]}
        style={[
          styles.headerGradient,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {t.welcome}
            </Text>
            <Text style={[styles.username, { color: colors.foreground }]}>
              {username}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              Alert.alert(
                t.credits,
                `رصيدك: ${credits} كريدت\nلكل دعوة تحصل على +5 كريدت\nلإنشاء بوت تحتاج 5 كريدت`
              );
            }}
          >
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              style={styles.creditsBadge}
            >
              <Ionicons name="star" size={14} color="#FFFFFF" />
              <Text style={styles.creditsText}>
                {credits} {t.credits}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.statsRow,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <StatCard
            icon="hardware-chip-outline"
            value={bots.length}
            label={t.totalBots}
          />
          <StatCard
            icon="people-outline"
            value={usersCount}
            label={t.totalUsers}
          />
          <StatCard
            icon="share-social-outline"
            value={referrals}
            label={t.totalReferrals}
          />
        </Animated.View>

        <Text
          style={[styles.sectionTitle, { color: colors.mutedForeground }]}
        >
          الإجراءات السريعة
        </Text>

        <View style={styles.actionsGrid}>
          {actionButtons.map((btn, i) => (
            <ActionButton key={i} {...btn} />
          ))}
        </View>

        <Pressable
          onPress={async () => {
            Alert.alert("", "تم مسح الكاش بنجاح");
          }}
          style={[
            styles.clearCacheBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={colors.destructive}
          />
          <Text
            style={[styles.clearCacheText, { color: colors.destructive }]}
          >
            {t.clearCache}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingBottom: 20, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  greeting: { fontSize: 13, marginBottom: 2 },
  username: { fontSize: 22, fontWeight: "800" },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  creditsText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  scrollContent: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionBtnWrap: { width: "47.5%" },
  actionBtn: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  clearCacheBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  clearCacheText: { fontSize: 14, fontWeight: "600" },
});
