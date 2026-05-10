import React from "react";

type Page = "overview" | "threats" | "vulnerabilities" | "detail";

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const IconZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconRadar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4"/>
    <path d="M6 12H2"/>
    <path d="M12 6V2"/>
    <path d="M12 22v-4"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M4.93 4.93l2.83 2.83"/>
    <path d="M16.24 16.24l2.83 2.83"/>
    <path d="M19.07 4.93l-2.83 2.83"/>
    <path d="M7.76 16.24l-2.83 2.83"/>
  </svg>
);

const NAV_ITEMS = [
  { id: "overview",        label: "Dashboard",       Icon: IconDashboard },
  { id: "threats",         label: "X Threats",        Icon: IconZap       },
  { id: "vulnerabilities", label: "Vulnerabilities",  Icon: IconShield    },
];

export const Sidebar: React.FC<{
  page: Page;
  setPage: (p: Page) => void;
}> = ({ page, setPage }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))",
            boxShadow: "0 0 16px var(--accent-glow)",
          }}
        >
          <IconRadar />
        </div>
        <div className="leading-tight">
          <div
            className="text-sm font-bold tracking-tight gradient-text"
          >
            TI Dashboard
          </div>
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            v0.2.0
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest px-3 pt-3 pb-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          Menu
        </p>
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id as Page)}
            className={`nav-item${page === id ? " active" : ""}`}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-4 text-xs"
        style={{
          borderTop: "1px solid var(--border-color)",
          color: "var(--text-tertiary)",
        }}
      >
        CISA KEV + NVD
      </div>
    </aside>
  );
};
