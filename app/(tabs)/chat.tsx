import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { type ChatMessage, useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { CHAT_REFRESH_INTERVAL } from "@/constants/config";
import { useColors } from "@/hooks/useColors";

function MessageBubble({
  msg,
  currentUser,
}: {
  msg: ChatMessage;
  currentUser: string;
}) {
  const colors = useColors();
  const isMe = msg.from === currentUser;
  const time = new Date(msg.timestamp).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.bubbleWrap,
        isMe ? styles.bubbleRight : styles.bubbleLeft,
      ]}
    >
      {!isMe && (
        <Text style={[styles.bubbleSender, { color: colors.primary }]}>
          {msg.from}
        </Text>
      )}
      <View
        style={[
          styles.bubble,
          isMe
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isMe ? "#FFFFFF" : colors.foreground },
          ]}
        >
          {msg.text}
        </Text>
      </View>
      <Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>
        {time}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const { generalMessages, loadGeneralMessages, sendGeneralMessage } = useApp();
  const { session, getAllUsers } = useAuth();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"general" | "users">("general");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const username = session?.username ?? "";

  useEffect(() => {
    loadGeneralMessages();
    loadUsers();
    const interval = setInterval(() => {
      loadGeneralMessages();
    }, CHAT_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    const all = await getAllUsers();
    setUsers(all.filter((u) => u !== username));
  };

  const handleSend = async () => {
    if (!message.trim() || session?.isGuest) return;
    await sendGeneralMessage(message.trim());
    setMessage("");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGeneralMessages();
    await loadUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={["#14142A", colors.background]}
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        <Text style={styles.title}>{t.chat}</Text>
        <View style={[styles.tabs, { backgroundColor: colors.card }]}>
          <Pressable
            onPress={() => setTab("general")}
            style={[
              styles.tabBtn,
              tab === "general" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    tab === "general" ? "#FFFFFF" : colors.mutedForeground,
                },
              ]}
            >
              {t.generalChat}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("users")}
            style={[
              styles.tabBtn,
              tab === "users" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === "users" ? "#FFFFFF" : colors.mutedForeground },
              ]}
            >
              {t.allUsers}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      {tab === "general" ? (
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.flex}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={generalMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble msg={item} currentUser={username} />
            )}
            contentContainerStyle={[
              styles.messageList,
              { paddingBottom: 16 },
            ]}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.emptyText, { color: colors.mutedForeground }]}
                >
                  {t.noMessages}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />

          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom:
                  insets.bottom + (Platform.OS === "web" ? 34 : 0) + 60,
              },
            ]}
          >
            <TextInput
              style={[
                styles.chatInput,
                {
                  backgroundColor: colors.input,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder={
                session?.isGuest ? "سجّل دخول للمشاركة" : t.typeMessage
              }
              placeholderTextColor={colors.mutedForeground}
              value={message}
              onChangeText={setMessage}
              editable={!session?.isGuest}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={!message.trim() || !!session?.isGuest}
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    message.trim() && !session?.isGuest
                      ? colors.primary
                      : colors.muted,
                },
              ]}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>
          <View
            style={[
              styles.searchWrap,
              { borderBottomColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.mutedForeground}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder={t.searchUsers}
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/chat/${item}`)}
                style={[
                  styles.userRow,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.primary + "22" },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {item[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text
                    style={[styles.userName, { color: colors.foreground }]}
                  >
                    {item}
                  </Text>
                  <Text
                    style={[
                      styles.userStatus,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {t.online}
                  </Text>
                </View>
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            )}
            contentContainerStyle={[
              styles.userList,
              {
                paddingBottom:
                  insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
              },
            ]}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.emptyText, { color: colors.mutedForeground }]}
                >
                  {t.noUsers}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: { fontSize: 13, fontWeight: "700" },
  messageList: { padding: 16, gap: 8 },
  bubbleWrap: { maxWidth: "80%", marginVertical: 4 },
  bubbleLeft: { alignSelf: "flex-start" },
  bubbleRight: { alignSelf: "flex-end" },
  bubbleSender: { fontSize: 11, fontWeight: "700", marginBottom: 3 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 15 },
  bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  emptyChat: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 15 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
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
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600" },
  userStatus: { fontSize: 12, marginTop: 2 },
  userList: { gap: 0 },
});
