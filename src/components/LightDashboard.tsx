import React, { useEffect, useState, useMemo } from "react";
import { fetchVulnStats, fetchCriticalEnriched } from "../api";
import type { Vulnerability } from "../api";
import { PRIORITY_COLORS } from "../theme";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { XThreatsPage } from "./XThreatsPage";
import { VulnerabilitiesPage } from "./VulnerabilitiesPage";
import { VulnerabilityDetail } from "./VulnerabilityDetail";
import { HoneypotPanel } from "./HoneypotPanel";
import { PriorityChart } from "./PriorityChart";
import { ThreatCategoriesChart } from "./ThreatCategoriesChart";

// === Reference icons ===
const IconGithub = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const IconArticle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconAdvisory = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
  </svg>
);

type Page = "overview" | "threats" | "vulnerabilities" | "detail";

// === MetricCard ===
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  priority?: string;
  onClick?: () => void;
}> = ({ title, value, subtitle, priority, onClick }) => {
  const accentColor = priority ? PRIORITY_COLORS[priority] || "var(--accent-primary)" : "var(--accent-primary)";
  const glowColor = priority
    ? `${PRIORITY_COLORS[priority]}33`
    : "var(--accent-glow)";

  return (
    <div
      className="metric-card"
      style={{ "--card-glow": glowColor } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "1.5rem",
          right: "1.5rem",
          height: "2px",
          borderRadius: "0 0 4px 4px",
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          opacity: 0.7,
        }}
      />

      <div className="flex items-center gap-2 mb-3">
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            backgroundColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
            flexShrink: 0,
          }}
        />
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          {title}
        </span>
      </div>

      <p
        className="num text-3xl font-bold mb-1"
        style={{
          color: "var(--text-primary)",
          textShadow: `0 0 20px ${accentColor}40`,
        }}
      >
        {value}
      </p>

      {subtitle && (
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

// === VulnTable ===
const VulnTable: React.FC<{
  vulns: Vulnerability[];
  onSelectCve?: (cveId: string) => void;
}> = ({ vulns, onSelectCve }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [references, setReferences] = useState<
    Record<string, {
      has_github: boolean;
      has_article: boolean;
      has_advisory: boolean;
      github_url?: string;
      article_url?: string;
      advisory_url?: string;
    }>
  >({});

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
    const loadReferences = async () => {
      const refMap: typeof references = {};
      for (const cveId of vulns.map((v) => v.cveID)) {
        try {
          const res = await fetch(`${API_BASE}/vulnerabilities/${cveId}/references`);
          const data = await res.json();
          const refs = data.references || [];
          const github   = refs.find((r: any) => r.type === "github");
          const article  = refs.find((r: any) => r.type === "article");
          const advisory = refs.find((r: any) => r.type === "advisory");
          refMap[cveId] = {
            has_github:   !!github,
            has_article:  !!article,
            has_advisory: !!advisory,
            github_url:   github?.url,
            article_url:  article?.url,
            advisory_url: advisory?.url,
          };
        } catch {
          refMap[cveId] = { has_github: false, has_article: false, has_advisory: false };
        }
      }
      setReferences(refMap);
    };
    if (vulns.length > 0) loadReferences();
  }, [vulns]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return vulns;
    const q = debouncedQuery.toLowerCase();
    return vulns.filter(
      (v) =>
        v.cveID.toLowerCase().includes(q) ||
        v.vulnerabilityName.toLowerCase().includes(q) ||
        v.shortDescription.toLowerCase().includes(q)
    );
  }, [vulns, debouncedQuery]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search CVE-ID or keyword..."
          className="w-full px-4 py-2.5 text-sm border"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: debouncedQuery ? "var(--input-focus)" : "var(--input-border)",
            color: "var(--text-primary)",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--text-tertiary)", cursor: "pointer" }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              {["CVE ID", "Description", "EPSS", "Priority"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const refs = references[v.cveID] || {};
              return (
                <tr
                  key={v.cveID}
                  onClick={() => onSelectCve?.(v.cveID)}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "var(--bg-glass)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${v.cveID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "none")}
                    >
                      {v.cveID}
                    </a>
                  </td>
                  <td className="px-4 py-3 max-w-xs" style={{ color: "var(--text-secondary)" }}>
                    <span className="line-clamp-2 text-xs">
                      {v.vulnerabilityName || v.shortDescription}
                    </span>
                  </td>
                  <td className="px-4 py-3 num text-xs" style={{ color: "var(--text-secondary)" }}>
                    {(v.epss_score || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="badge"
                        style={{ backgroundColor: `${PRIORITY_COLORS[v.priority] || "#999"}22`, color: PRIORITY_COLORS[v.priority] || "#999", border: `1px solid ${PRIORITY_COLORS[v.priority] || "#999"}44` }}
                      >
                        {v.priority}
                      </span>
                      <div className="flex items-center gap-1">
                        {refs.has_github && refs.github_url && (
                          <a
                            href={refs.github_url} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="PoC on GitHub"
                            style={{ color: "#60a5fa", display: "flex", alignItems: "center", padding: "3px 5px", borderRadius: 6, border: "1px solid rgba(96,165,250,0.25)", backgroundColor: "rgba(96,165,250,0.08)", textDecoration: "none", transition: "all 0.15s" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(96,165,250,0.18)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(96,165,250,0.08)")}
                          >
                            <IconGithub />
                          </a>
                        )}
                        {refs.has_article && refs.article_url && (
                          <a
                            href={refs.article_url} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Related article"
                            style={{ color: "#34d399", display: "flex", alignItems: "center", padding: "3px 5px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.25)", backgroundColor: "rgba(52,211,153,0.08)", textDecoration: "none", transition: "all 0.15s" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(52,211,153,0.18)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(52,211,153,0.08)")}
                          >
                            <IconArticle />
                          </a>
                        )}
                        {refs.has_advisory && refs.advisory_url && (
                          <a
                            href={refs.advisory_url} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Security advisory"
                            style={{ color: "#fbbf24", display: "flex", alignItems: "center", padding: "3px 5px", borderRadius: 6, border: "1px solid rgba(251,191,36,0.25)", backgroundColor: "rgba(251,191,36,0.08)", textDecoration: "none", transition: "all 0.15s" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(251,191,36,0.18)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(251,191,36,0.08)")}
                          >
                            <IconAdvisory />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: "var(--text-tertiary)" }}>
            No matches found
          </div>
        )}
      </div>
    </div>
  );
};

// === Main Dashboard ===
export const LightDashboard: React.FC = () => {
  const [page, setPage] = useState<Page>("overview");
  const [stats, setStats] = useState<{
    total: number;
    priority_counts: Record<string, number>;
    threat_categories?: Record<string, number>;
  } | null>(null);
  const [criticalVulns, setCriticalVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [selectedCveId, setSelectedCveId] = useState<string | null>(null);
  const [threatKeyword, setThreatKeyword] = useState<string | null>(null);

  // カテゴリ名 → X キーワードのマッピング
  const CATEGORY_TO_KEYWORD: Record<string, string> = {
    "Ransomware":    "ransomware",
    "Malware":       "malware",
    "Exploit":       "exploit",
    "Phishing":      "phishing",
    "Botnet / DDoS": "botnet",
    "APT":           "apt",
    "Vulnerability": "vulnerability",
  };

  useEffect(() => {
    if (page !== "overview") return;
    setLoading(true);
    Promise.all([fetchVulnStats(), fetchCriticalEnriched()])
      .then(([statsData, criticalData]) => {
        setStats(statsData);
        setCriticalVulns(criticalData.data);
      })
      .catch(() => {
        // バックエンド未起動時はモックデータで表示
        setStats({
          total: 1590,
          priority_counts: { CRITICAL: 557, HIGH: 315, MEDIUM: 240, LOW: 478 },
          threat_categories: { ransomware: 0, exploit_ready: 715, critical_high: 872 },
        });
        setCriticalVulns([
          { cveID: "CVE-2024-21887", vulnerabilityName: "Ivanti Connect Secure Command Injection", shortDescription: "Command injection in Ivanti Connect Secure", epss_score: 0.97, priority: "CRITICAL" } as any,
          { cveID: "CVE-2024-3400", vulnerabilityName: "PAN-OS GlobalProtect RCE", shortDescription: "Remote code execution in PAN-OS", epss_score: 0.95, priority: "CRITICAL" } as any,
          { cveID: "CVE-2023-46805", vulnerabilityName: "Ivanti ICS Auth Bypass", shortDescription: "Authentication bypass in Ivanti ICS", epss_score: 0.92, priority: "CRITICAL" } as any,
          { cveID: "CVE-2024-1709", vulnerabilityName: "ConnectWise ScreenConnect Auth Bypass", shortDescription: "Authentication bypass vulnerability", epss_score: 0.89, priority: "CRITICAL" } as any,
          { cveID: "CVE-2024-20353", vulnerabilityName: "Cisco ASA DoS", shortDescription: "Denial of service in Cisco ASA", epss_score: 0.78, priority: "HIGH" } as any,
        ]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const pageTitle =
    page === "overview"       ? "Dashboard"
    : page === "threats"      ? "X Threats"
    : page === "detail"       ? "CVE Detail"
    : "Vulnerabilities";

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <Sidebar page={page === "detail" ? "vulnerabilities" : page} setPage={setPage} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={pageTitle}
          subtitle={page === "overview" ? "Threat Intelligence Overview" : undefined}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {page === "detail" && selectedCveId && (
            <VulnerabilityDetail
              cveId={selectedCveId}
              onBack={() => setPage("vulnerabilities")}
            />
          )}

          {page === "threats" && (
            <XThreatsPage
              initialKeyword={threatKeyword}
              onKeywordConsumed={() => setThreatKeyword(null)}
            />
          )}

          {page === "vulnerabilities" && (
            <VulnerabilitiesPage
              initialFilter={filterSeverity}
              onSelectCve={(cveId) => {
                setSelectedCveId(cveId);
                setPage("detail");
              }}
            />
          )}

          {page === "overview" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    Loading...
                  </div>
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  {/* Metric cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <MetricCard
                      title="Total CVEs"
                      value={stats.total.toLocaleString()}
                      onClick={() => { setFilterSeverity(null); setPage("vulnerabilities"); }}
                    />
                    <MetricCard
                      title="Critical"
                      value={stats.priority_counts.CRITICAL || 0}
                      priority="CRITICAL"
                      subtitle={`${(((stats.priority_counts.CRITICAL || 0) / stats.total) * 100).toFixed(1)}% of total`}
                      onClick={() => { setFilterSeverity("CRITICAL"); setPage("vulnerabilities"); }}
                    />
                    <MetricCard
                      title="High"
                      value={stats.priority_counts.HIGH || 0}
                      priority="HIGH"
                      subtitle={`${(((stats.priority_counts.HIGH || 0) / stats.total) * 100).toFixed(1)}% of total`}
                      onClick={() => { setFilterSeverity("HIGH"); setPage("vulnerabilities"); }}
                    />
                    <MetricCard
                      title="Medium"
                      value={stats.priority_counts.MEDIUM || 0}
                      priority="MEDIUM"
                      onClick={() => { setFilterSeverity("MEDIUM"); setPage("vulnerabilities"); }}
                    />
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="section-card">
                      <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}>
                        Priority Distribution
                      </h3>
                      <PriorityChart stats={stats} />
                    </div>
                    <div className="section-card">
                      <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}>
                        Threat Categories
                      </h3>
                      <ThreatCategoriesChart
                      onCategoryClick={(cat) => {
                        const kw = CATEGORY_TO_KEYWORD[cat];
                        if (kw) { setThreatKeyword(kw); setPage("threats"); }
                      }}
                    />
                    </div>
                  </div>

                  {/* Table + Honeypot */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="section-card lg:col-span-2">
                      <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}>
                        Recent Critical Vulnerabilities
                      </h3>
                      <VulnTable
                        vulns={criticalVulns}
                        onSelectCve={(cveId) => { setSelectedCveId(cveId); setPage("detail"); }}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <HoneypotPanel />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-sm"
                  style={{ color: "var(--text-tertiary)" }}>
                  No data available
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
