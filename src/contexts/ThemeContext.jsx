import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();
const STORAGE_KEY = "theme";

const applyTheme = (isDark) => {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const ThemeProvider = ({ children }) => {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const stored = localStorage.getItem(STORAGE_KEY);
  const [darkMode, setDarkMode] = useState(
    stored ? stored === "dark" : prefersDark,
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, darkMode ? "dark" : "light");
    applyTheme(darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
