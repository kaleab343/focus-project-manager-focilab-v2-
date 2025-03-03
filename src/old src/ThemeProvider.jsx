import React, { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return (
      storedTheme ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cssVars = {
    light: {
      "--bg-color": "#ffffff",
      "--text-color": "#000000",
      "--box-color": "rgb(18 65 98)",
    },
    dark: {
      "--bg-color": "#1a1a1a",
      "--text-color": "rgb(228, 228, 228)",
      "--box-color": "rgb(228, 228, 228)",
    },
  };

  useEffect(() => {
    const root = document.documentElement;
    const themeVars = cssVars[theme];
    for (const [key, value] of Object.entries(themeVars)) {
      root.style.setProperty(key, value);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
