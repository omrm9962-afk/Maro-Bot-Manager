import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { BOT_CREATION_COST } from "@/constants/config";
import { useAuth } from "@/context/AuthContext";
import { reportActivity } from "@/utils/telegram";

export interface Bot {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  botUsername?: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: string;
}

interface AppContextType {
  bots: Bot[];
  loadBots: () => Promise<void>;
  addBot: (
    name: string,
    token: string,
    botUsername?: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteBot: (id: string) => Promise<void>;
  generalMessages: ChatMessage[];
  loadGeneralMessages: () => Promise<void>;
  sendGeneralMessage: (text: string) => Promise<void>;
  getPrivateMessages: (userId: string) => Promise<ChatMessage[]>;
  sendPrivateMessage: (to: string, text: string) => Promise<void>;
  credits: number;
  refreshCredits: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session, getCredits, spendCredits } = useAuth();
  const username = session?.username ?? "";

  const [bots, setBots] = useState<Bot[]>([]);
  const [generalMessages, setGeneralMessages] = useState<ChatMessage[]>([]);
  const [credits, setCredits] = useState(0);

  const refreshCredits = useCallback(async () => {
    if (!username || session?.isGuest) return;
    const c = await getCredits(username);
    setCredits(c);
  }, [username, session?.isGuest, getCredits]);

  const loadBots = useCallback(async () => {
    if (!username || session?.isGuest) return;
    const stored = await AsyncStorage.getItem(`maro_bots_${username}`);
    setBots(stored ? (JSON.parse(stored) as Bot[]) : []);
  }, [username, session?.isGuest]);

  const loadGeneralMessages = useCallback(async () => {
    const stored = await AsyncStorage.getItem("maro_chat_general");
    setGeneralMessages(
      stored ? (JSON.parse(stored) as ChatMessage[]) : []
    );
  }, []);

  useEffect(() => {
    if (username) {
      loadBots();
      loadGeneralMessages();
      refreshCredits();
    }
  }, [username, loadBots, loadGeneralMessages, refreshCredits]);

  const saveBots = async (updated: Bot[]) => {
    await AsyncStorage.setItem(`maro_bots_${username}`, JSON.stringify(updated));
    setBots(updated);
  };

  const addBot = async (
    name: string,
    token: string,
    botUsername?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const ok = await spendCredits(username, BOT_CREATION_COST);
    if (!ok) return { success: false, error: "insufficientCredits" };

    const bot: Bot = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      name: name || `Bot ${bots.length + 1}`,
      token,
      createdAt: new Date().toISOString(),
      botUsername,
    };

    const updated = [...bots, bot];
    await saveBots(updated);
    await refreshCredits();
    reportActivity(username, "Bot Created", `@${botUsername ?? name}`).catch(
      () => {}
    );
    return { success: true };
  };

  const deleteBot = async (id: string) => {
    const updated = bots.filter((b) => b.id !== id);
    await saveBots(updated);
    reportActivity(username, "Bot Deleted").catch(() => {});
  };

  const sendGeneralMessage = async (text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      from: username,
      text,
      timestamp: new Date().toISOString(),
    };
    const stored = await AsyncStorage.getItem("maro_chat_general");
    const msgs: ChatMessage[] = stored
      ? (JSON.parse(stored) as ChatMessage[])
      : [];
    const updated = [...msgs, msg];
    await AsyncStorage.setItem("maro_chat_general", JSON.stringify(updated));
    setGeneralMessages(updated);
    reportActivity(username, "General Message Sent").catch(() => {});
  };

  const getPrivateMessages = async (
    userId: string
  ): Promise<ChatMessage[]> => {
    const key = `maro_chat_${[username, userId].sort().join("_")}`;
    const stored = await AsyncStorage.getItem(key);
    return stored ? (JSON.parse(stored) as ChatMessage[]) : [];
  };

  const sendPrivateMessage = async (to: string, text: string) => {
    const key = `maro_chat_${[username, to].sort().join("_")}`;
    const stored = await AsyncStorage.getItem(key);
    const msgs: ChatMessage[] = stored
      ? (JSON.parse(stored) as ChatMessage[])
      : [];
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      from: username,
      text,
      timestamp: new Date().toISOString(),
    };
    msgs.push(msg);
    await AsyncStorage.setItem(key, JSON.stringify(msgs));
    reportActivity(username, "Private Message Sent", `to: ${to}`).catch(
      () => {}
    );
  };

  return (
    <AppContext.Provider
      value={{
        bots,
        loadBots,
        addBot,
        deleteBot,
        generalMessages,
        loadGeneralMessages,
        sendGeneralMessage,
        getPrivateMessages,
        sendPrivateMessage,
        credits,
        refreshCredits,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
