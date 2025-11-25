import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../contexts/ThemeContext";

export const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="pill-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
      aria-label="Toggle theme"
    >
      {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      <span>{darkMode ? "Light" : "Dark"}</span>
    </button>
  );
};
