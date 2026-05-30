import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";

import { type Bot, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

function BotCard({
  bot,
  index,
  onDelete,
}: {
  bot: Bot;
  index: number;
  onDelete: (id: string) => void;
}) {
  const colors = useColors();
  const { t } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const tokenPreview =
    bot.token.length > 20
      ? `${bot.token.slice(0, 10)}...${bot.token.slice(-6)}`
      : bot.token;

  const created = new Date(bot.createdAt).toLocaleDateString("ar-EG");

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      exiting={FadeOutUp}
    >
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={[
          styles.botCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.botCardHeader}>
          <View style={styles.botLeft}>
            <View
              style={[
                styles.botIconWrap,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Ionicons
                name="hardware-chip"
                size={22}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.botName, { color: colors.foreground }]}>
                {bot.name}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <Text
                  style={[styles.statusText, { color: colors.success }]}
                >
                  {t.botStatus}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </View>

        {expanded && (
          <View
            style={[
              styles.botDetails,
              { borderTopColor: colors.border },
            ]}
          >
            <View style={styles.detailRow}>
              <Text
                style={[styles.detailLabel, { color: colors.mutedForeground }]}
              >
                Token:
              </Text>
              <Text
                style={[styles.detailValue, { color: colors.foreground }]}
                selectable
              >
                {tokenPreview}
              </Text>
            </View>
            {bot.botUsername && (
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Username:
                </Text>
                <Text
                  style={[styles.detailValue, { color: colors.foreground }]}
                >
                  @{bot.botUsername}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text
                style={[styles.detailLabel, { color: colors.mutedForeground }]}
              >
                {t.created}:
              </Text>
              <Text
                style={[styles.detailValue, { color: colors.foreground }]}
              >
                {created}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Alert.alert(t.delete, t.deleteBotConfirm, [
                  { text: t.cancel, style: "cancel" },
                  {
                    text: t.delete,
                    style: "destructive",
                    onPress: () => onDelete(bot.id),
                  },
                ]);
              }}
              style={[
                styles.deleteBtn,
                { backgroundColor: colors.destructive + "22" },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.destructive}
              />
              <Text
                style={[styles.deleteText, { color: colors.destructive }]}
              >
                {t.delete}
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function BotsScreen() {
  const { bots, loadBots, deleteBot } = useApp();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBots();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBots();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteBot(id);
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
              insets.top + (Platform.OS === "web" ? 67 : 0),
          },
        ]}
      >
        <Text style={styles.title}>{t.myBots}</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {bots.length} {t.bots}
        </Text>
      </LinearGradient>

      <FlatList
        data={bots}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <BotCard bot={item} index={index} onDelete={handleDelete} />
        )}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="hardware-chip-outline"
              size={64}
              color={colors.mutedForeground}
            />
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              {t.noBots}
            </Text>
            <Pressable
              onPress={() => router.push("/create-bot")}
              style={[
                styles.emptyBtn,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primary }]}>
                {t.createBot}
              </Text>
            </Pressable>
          </View>
        }
        scrollEnabled={bots.length > 0}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={() => router.push("/create-bot")}
        style={[
          styles.fab,
          {
            bottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80,
          },
        ]}
      >
        <LinearGradient
          colors={["#7C3AED", "#A855F7"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    paddingTop: 16,
  },
  count: { fontSize: 14, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  botCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  botCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  botLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  botIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botName: { fontSize: 16, fontWeight: "700" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  botDetails: {
    borderTopWidth: 1,
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: { fontSize: 13, fontWeight: "600", width: 80 },
  detailValue: { fontSize: 13, flex: 1 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  deleteText: { fontSize: 14, fontWeight: "700" },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 16,
  },
  emptyText: { fontSize: 16 },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 15, fontWeight: "700" },
  fab: {
    position: "absolute",
    right: 20,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
