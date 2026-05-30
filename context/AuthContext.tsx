import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { MAX_ACCOUNTS, REFERRAL_BONUS } from "@/constants/config";
import { reportActivity } from "@/utils/telegram";

interface User {
  username: string;
  password: string;
  email: string;
  createdAt: string;
  referralCode: string;
}

export interface Session {
  username: string;
  isGuest: boolean;
}

interface AuthContextType {
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  register: (
    username: string,
    password: string,
    email: string,
    referralCode?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  resetPassword: (username: string, newPassword: string) => Promise<void>;
  getUserEmail: (username: string) => Promise<string | null>;
  getAllUsers: () => Promise<string[]>;
  getSavedAccounts: () => Promise<string[]>;
  addAccount: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  getCredits: (username: string) => Promise<number>;
  addCredits: (username: string, amount: number) => Promise<void>;
  spendCredits: (username: string, amount: number) => Promise<boolean>;
  getReferralCount: (username: string) => Promise<number>;
  getReferralCode: (username: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "maro_users";
const SESSION_KEY = "maro_session";
const SAVED_ACCOUNTS_KEY = "maro_saved_accounts";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((stored) => {
        if (stored) setSession(JSON.parse(stored) as Session);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function getUsers(): Promise<Record<string, User>> {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    return stored ? (JSON.parse(stored) as Record<string, User>) : {};
  }

  async function saveUsers(users: Record<string, User>): Promise<void> {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function addToSavedAccounts(username: string): Promise<void> {
    const stored = await AsyncStorage.getItem(SAVED_ACCOUNTS_KEY);
    const accounts: string[] = stored ? (JSON.parse(stored) as string[]) : [];
    if (!accounts.includes(username)) {
      const updated = [username, ...accounts].slice(0, MAX_ACCOUNTS);
      await AsyncStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    }
  }

  async function addToAllUsers(username: string): Promise<void> {
    const allStr = (await AsyncStorage.getItem("maro_all_users")) ?? "";
    const all = allStr ? allStr.split(",").filter(Boolean) : [];
    if (!all.includes(username)) {
      all.push(username);
      await AsyncStorage.setItem("maro_all_users", all.join(","));
    }
  }

  const login = async (username: string, password: string) => {
    const users = await getUsers();
    const user = users[username];
    if (!user) return { success: false, error: "usernameNotFound" };
    if (user.password !== password) return { success: false, error: "wrongPassword" };

    const s: Session = { username, isGuest: false };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    await addToSavedAccounts(username);
    reportActivity(username, "Login").catch(() => {});
    return { success: true };
  };

  const loginAsGuest = async () => {
    const s: Session = { username: "زائر", isGuest: true };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    reportActivity("Guest", "Guest Login").catch(() => {});
  };

  const register = async (
    username: string,
    password: string,
    email: string,
    referralCode?: string
  ) => {
    if (!username || !password || !email)
      return { success: false, error: "fillAllFields" };
    if (password.length < 6) return { success: false, error: "passwordShort" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { success: false, error: "emailInvalid" };

    const users = await getUsers();
    if (users[username]) return { success: false, error: "usernameExists" };

    const newUser: User = {
      username,
      password,
      email,
      createdAt: new Date().toISOString(),
      referralCode:
        username.slice(0, 3).toUpperCase() +
        Date.now().toString().slice(-5),
    };
    users[username] = newUser;
    await saveUsers(users);

    await AsyncStorage.setItem(`maro_credits_${username}`, "0");
    await addToAllUsers(username);

    if (referralCode) {
      const referrer = Object.values(users).find(
        (u) => u.referralCode === referralCode
      );
      if (referrer) {
        const cur = parseInt(
          (await AsyncStorage.getItem(`maro_credits_${referrer.username}`)) ??
            "0"
        );
        await AsyncStorage.setItem(
          `maro_credits_${referrer.username}`,
          String(cur + REFERRAL_BONUS)
        );
        const refCount = parseInt(
          (await AsyncStorage.getItem(
            `maro_referrals_${referrer.username}`
          )) ?? "0"
        );
        await AsyncStorage.setItem(
          `maro_referrals_${referrer.username}`,
          String(refCount + 1)
        );
      }
    }

    const s: Session = { username, isGuest: false };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    await addToSavedAccounts(username);
    reportActivity(username, "Register", email).catch(() => {});
    return { success: true };
  };

  const logout = async () => {
    if (session) reportActivity(session.username, "Logout").catch(() => {});
    await AsyncStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const checkUsername = async (username: string): Promise<boolean> => {
    const users = await getUsers();
    return !users[username];
  };

  const resetPassword = async (username: string, newPassword: string) => {
    const users = await getUsers();
    if (users[username]) {
      users[username].password = newPassword;
      await saveUsers(users);
    }
  };

  const getUserEmail = async (username: string): Promise<string | null> => {
    const users = await getUsers();
    return users[username]?.email ?? null;
  };

  const getAllUsers = async (): Promise<string[]> => {
    const allStr = (await AsyncStorage.getItem("maro_all_users")) ?? "";
    return allStr ? allStr.split(",").filter(Boolean) : [];
  };

  const getSavedAccounts = async (): Promise<string[]> => {
    const stored = await AsyncStorage.getItem(SAVED_ACCOUNTS_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  };

  const addAccount = async (username: string, password: string) => {
    const accounts = await getSavedAccounts();
    if (accounts.length >= MAX_ACCOUNTS)
      return { success: false, error: "maxAccounts" };
    return login(username, password);
  };

  const getCredits = async (username: string): Promise<number> => {
    const val = await AsyncStorage.getItem(`maro_credits_${username}`);
    return parseInt(val ?? "0");
  };

  const addCredits = async (username: string, amount: number) => {
    const cur = await getCredits(username);
    await AsyncStorage.setItem(`maro_credits_${username}`, String(cur + amount));
  };

  const spendCredits = async (
    username: string,
    amount: number
  ): Promise<boolean> => {
    const cur = await getCredits(username);
    if (cur < amount) return false;
    await AsyncStorage.setItem(`maro_credits_${username}`, String(cur - amount));
    return true;
  };

  const getReferralCount = async (username: string): Promise<number> => {
    const val = await AsyncStorage.getItem(`maro_referrals_${username}`);
    return parseInt(val ?? "0");
  };

  const getReferralCode = async (username: string): Promise<string> => {
    const users = await getUsers();
    return users[username]?.referralCode ?? "";
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoggedIn: !!session,
        isLoading,
        login,
        loginAsGuest,
        register,
        logout,
        checkUsername,
        resetPassword,
        getUserEmail,
        getAllUsers,
        getSavedAccounts,
        addAccount,
        getCredits,
        addCredits,
        spendCredits,
        getReferralCount,
        getReferralCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
