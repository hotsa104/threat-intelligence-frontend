import React, { createContext, useContext, useEffect, useState } from "react";
import type { Theme } from "./theme";
import { applyTheme } from "./theme";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 初期値を light にしておく（useEffect で復元される）
  const [theme, setTheme] = useState<Theme>("light");

  // マウント時に localStorage から復元・適用
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const initialTheme = saved || "light";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []); // 初回マウント時のみ実行

  // theme が変わった時に localStorage と DOM に反映
  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
