import React from "react";
import { useTheme } from "../ThemeContext";

export const Header: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="mb-8 flex items-center justify-between"
      style={{
        borderBottom: "1px solid var(--border-light)",
        paddingBottom: "1rem",
      }}
    >
      <div>
        <h2
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="px-4 py-2 rounded-lg font-semibold transition"
        style={{
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 2px 8px var(--shadow)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
  );
};
