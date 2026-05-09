/**
 * Theme colors and constants
 */

export type Theme = "light" | "dark";

// === CSS Variable Definitions ===
export const THEME_VARS = {
  light: {
    "--bg-primary": "#ffffff",
    "--bg-secondary": "#f3f4f6",
    "--bg-tertiary": "#e5e7eb",
    "--text-primary": "#111827",
    "--text-secondary": "#374151",
    "--text-tertiary": "#6b7280",
    "--border-color": "#d1d5db",
    "--border-light": "#e5e7eb",
    "--shadow": "rgba(0, 0, 0, 0.1)",
    "--input-bg": "#ffffff",
    "--input-border": "#e5e7eb",
    "--input-focus": "#5469d4",
  },
  dark: {
    "--bg-primary": "#0f172a",
    "--bg-secondary": "#1e293b",
    "--bg-tertiary": "#334155",
    "--text-primary": "#f1f5f9",
    "--text-secondary": "#cbd5e1",
    "--text-tertiary": "#94a3b8",
    "--border-color": "#475569",
    "--border-light": "#334155",
    "--shadow": "rgba(0, 0, 0, 0.3)",
    "--input-bg": "#1e293b",
    "--input-border": "#475569",
    "--input-focus": "#60a5fa",
  },
};

// キーワード カラーマップ（テーマ依存）
const LIGHT_KW_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // cyber threats
  ransomware: { bg: "#fee2e2", text: "#991b1b", border: "#dc2626" },
  malware: { bg: "#fecaca", text: "#7f1d1d", border: "#ef4444" },
  botnet: { bg: "#fed7aa", text: "#7c2d12", border: "#f97316" },
  exploit: { bg: "#fef3c7", text: "#78350f", border: "#eab308" },
  phishing: { bg: "#dbeafe", text: "#0c4a6e", border: "#0284c7" },
  spyware: { bg: "#c7d2fe", text: "#312e81", border: "#6366f1" },
  vulnerability: { bg: "#d8b4fe", text: "#581c87", border: "#d946ef" },

  // operations
  attack: { bg: "#fee2e2", text: "#991b1b", border: "#dc2626" },
  campaign: { bg: "#fecdd3", text: "#831843", border: "#f43f5e" },
  incident: { bg: "#fef08a", text: "#713f12", border: "#ca8a04" },
  threat: { bg: "#e0e7ff", text: "#3f0f12", border: "#818cf8" },

  // severity
  critical: { bg: "#fee2e2", text: "#991b1b", border: "#dc2626" },
  high: { bg: "#fed7aa", text: "#7c2d12", border: "#f97316" },
  medium: { bg: "#fef3c7", text: "#78350f", border: "#eab308" },
  low: { bg: "#dbeafe", text: "#0c4a6e", border: "#0284c7" },

  // fallback
  default: { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};

const DARK_KW_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // cyber threats
  ransomware: { bg: "#7f1d1d", text: "#fee2e2", border: "#ef4444" },
  malware: { bg: "#7f1d1d", text: "#fecaca", border: "#f87171" },
  botnet: { bg: "#7c2d12", text: "#fed7aa", border: "#fb923c" },
  exploit: { bg: "#78350f", text: "#fef3c7", border: "#facc15" },
  phishing: { bg: "#0c4a6e", text: "#bfdbfe", border: "#0ea5e9" },
  spyware: { bg: "#312e81", text: "#c7d2fe", border: "#818cf8" },
  vulnerability: { bg: "#581c87", text: "#e9d5ff", border: "#d946ef" },

  // operations
  attack: { bg: "#7f1d1d", text: "#fee2e2", border: "#ef4444" },
  campaign: { bg: "#831843", text: "#fbcfe8", border: "#f43f5e" },
  incident: { bg: "#713f12", text: "#fef08a", border: "#eab308" },
  threat: { bg: "#3f0f12", text: "#e0e7ff", border: "#818cf8" },

  // severity
  critical: { bg: "#7f1d1d", text: "#fee2e2", border: "#ef4444" },
  high: { bg: "#7c2d12", text: "#fed7aa", border: "#fb923c" },
  medium: { bg: "#78350f", text: "#fef3c7", border: "#facc15" },
  low: { bg: "#0c4a6e", text: "#bfdbfe", border: "#0ea5e9" },

  // fallback
  default: { bg: "#1e293b", text: "#cbd5e1", border: "#475569" },
};

export const getKeywordColor = (keyword: string, theme: Theme = "light") => {
  const lower = keyword.toLowerCase();
  const colors = theme === "dark" ? DARK_KW_COLORS : LIGHT_KW_COLORS;
  return colors[lower] || colors.default;
};

// Priority colors
export const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#0284c7",
};

// Apply theme to document root
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const vars = THEME_VARS[theme];
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
