import React, { useState } from "react";
import { useTheme } from "../../ThemeProvider";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const ThemeMode = () => {
  const { theme, toggleTheme } = useTheme(); // Ensure this hook is correctly providing the theme object
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  const setThemeLocalStorage = (theme) => {
    localStorage.setItem("theme", theme);
  };

  const handleToggleMode = () => {
    toggleTheme();
    setIsDarkMode((prevMode) => !prevMode);
    setThemeLocalStorage(isDarkMode ? "light" : "dark");
  };

  return (
    <div
      className="theme-button"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <div onClick={handleToggleMode}>
        {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
      </div>
    </div>
  );
};

export default ThemeMode;
