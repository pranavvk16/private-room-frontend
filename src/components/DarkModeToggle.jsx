import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeContext";

export const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-lg transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/30 dark:hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      <span>{darkMode ? "Light" : "Dark"}</span>
    </button>
  );
};
