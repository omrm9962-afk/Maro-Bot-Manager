import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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
      <View
        style={[
          styles.bubble,
          isMe
            ? { backgroundColor: colors.primary }
            : {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
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

export default function PrivateChatScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { session } = useAuth();
  const { getPrivateMessages, sendPrivateMessage } = useApp();
  const { t } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const currentUser = session?.username ?? "";
  const otherUser = userId ?? "";

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, CHAT_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [userId]);

  const loadMessages = async () => {
    const msgs = await getPrivateMessages(otherUser);
    setMessages(msgs);
  };

  const handleSend = async () => {
    if (!text.trim() || session?.isGuest) return;
    await sendPrivateMessage(otherUser, text.trim());
    setText("");
    await loadMessages();
    setTimeout(
      () => flatListRef.current?.scrollToEnd({ animated: true }),
      100
    );
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
          <View style={styles.headerCenter}>
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              style={styles.headerAvatar}
            >
              <Text style={styles.headerAvatarText}>
                {otherUser[0]?.toUpperCase()}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerName}>{otherUser}</Text>
              <Text style={[styles.headerStatus, { color: colors.success }]}>
                {t.online}
              </Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble msg={item} currentUser={currentUser} />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
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
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
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
            placeholder={session?.isGuest ? "سجّل دخول للمشاركة" : t.typeMessage}
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            editable={!session?.isGuest}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || !!session?.isGuest}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  text.trim() && !session?.isGuest
                    ? colors.primary
                    : colors.muted,
              },
            ]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  headerName: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  headerStatus: { fontSize: 12, fontWeight: "500" },
  messageList: { padding: 16, gap: 10 },
  bubbleWrap: { maxWidth: "80%" },
  bubbleLeft: { alignSelf: "flex-start" },
  bubbleRight: { alignSelf: "flex-end" },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 15 },
  bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
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
});
