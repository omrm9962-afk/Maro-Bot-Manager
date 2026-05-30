import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function UsersScreen() {
  const { session, getAllUsers } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = session?.username ?? "";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const all = await getAllUsers();
    setUsers(all);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filtered = users.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase())
  );

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
          <Text style={styles.title}>{t.allUsers}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {users.length} {t.allUsers}
        </Text>
      </LinearGradient>

      <View style={styles.flex}>
        <View style={[styles.searchWrap, { borderBottomColor: colors.border }]}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.input, borderColor: colors.border },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder={t.searchUsers}
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isMe = item === currentUser;
            return (
              <Pressable
                onPress={() => {
                  if (!isMe) router.push(`/chat/${item}`);
                }}
                style={[
                  styles.userRow,
                  { borderBottomColor: colors.border },
                ]}
                disabled={isMe}
              >
                <LinearGradient
                  colors={isMe ? ["#7C3AED", "#A855F7"] : [colors.secondary, colors.secondary]}
                  style={styles.avatar}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: isMe ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {item[0]?.toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.foreground }]}>
                    {item}
                  </Text>
                  {isMe && (
                    <Text style={[styles.meTag, { color: colors.primary }]}>
                      {t.currentAccount}
                    </Text>
                  )}
                </View>
                {!isMe && (
                  <View style={styles.rowActions}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                )}
              </Pressable>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40,
            },
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t.noUsers}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  count: { fontSize: 13, marginTop: 6 },
  searchWrap: { padding: 12, borderBottomWidth: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  list: { gap: 0 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600" },
  meTag: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  rowActions: { flexDirection: "row", gap: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
});
