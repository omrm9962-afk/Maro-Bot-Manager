import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import translations, { type Lang, type Strings } from "@/constants/translations";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: Strings;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  prayerReminders: boolean;
  setPrayerReminders: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  setMode: () => {},
  isDark: true,
  language: "ar",
  setLanguage: () => {},
  t: translations.ar,
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
  prayerReminders: true,
  setPrayerReminders: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
  vibrationEnabled: true,
  setVibrationEnabled: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [language, setLangState] = useState<Lang>("ar");
  const [notificationsEnabled, setNotifState] = useState(true);
  const [prayerReminders, setPrayerState] = useState(true);
  const [soundEnabled, setSoundState] = useState(true);
  const [vibrationEnabled, setVibState] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([
      "maro_theme",
      "maro_lang",
      "maro_notifications",
      "maro_prayer",
      "maro_sound",
      "maro_vibration",
    ]).then((pairs) => {
      for (const [key, val] of pairs) {
        if (!val) continue;
        if (key === "maro_theme") setModeState(val as ThemeMode);
        if (key === "maro_lang") setLangState(val as Lang);
        if (key === "maro_notifications") setNotifState(val === "true");
        if (key === "maro_prayer") setPrayerState(val === "true");
        if (key === "maro_sound") setSoundState(val === "true");
        if (key === "maro_vibration") setVibState(val === "true");
      }
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem("maro_theme", m);
  };

  const setLanguage = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem("maro_lang", l);
  };

  const setNotificationsEnabled = (val: boolean) => {
    setNotifState(val);
    AsyncStorage.setItem("maro_notifications", String(val));
  };

  const setPrayerReminders = (val: boolean) => {
    setPrayerState(val);
    AsyncStorage.setItem("maro_prayer", String(val));
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundState(val);
    AsyncStorage.setItem("maro_sound", String(val));
  };

  const setVibrationEnabled = (val: boolean) => {
    setVibState(val);
    AsyncStorage.setItem("maro_vibration", String(val));
  };

  const isDark =
    mode === "system" ? systemScheme === "dark" : mode === "dark";

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        isDark,
        language,
        setLanguage,
        t: translations[language] ?? translations.ar,
        notificationsEnabled,
        setNotificationsEnabled,
        prayerReminders,
        setPrayerReminders,
        soundEnabled,
        setSoundEnabled,
        vibrationEnabled,
        setVibrationEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
