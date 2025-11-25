import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();
const STORAGE_KEY = "theme";

const applyTheme = (isDark) => {
  const root = document.documentElement;
  if (!root.classList.contains("dark")) root.classList.add("dark");
  if (isDark === false) root.classList.add("dark"); // guard to always enforce dark
};

export const ThemeProvider = ({ children }) => {
  const [darkMode] = useState(true);

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => undefined; // no-op, dark only

  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
