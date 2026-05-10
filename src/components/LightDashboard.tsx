import React, { useEffect, useState, useMemo } from "react";
import {
  fetchVulnStats,
  fetchCriticalEnriched,
  Vulnerability,
} from "../api";
import { PRIORITY_COLORS } from "../theme";
import { Header } from "./Header";
import { XThreatsPage } from "./XThreatsPage";
import { VulnerabilitiesPage } from "./VulnerabilitiesPage";
import { VulnerabilityDetail } from "./VulnerabilityDetail";
import { HoneypotPanel } from "./HoneypotPanel";

// === MetricCard with Hover Animation ===
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  onClick?: () => void;
}> = ({ title, value, subtitle, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg cursor-pointer transition"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 4px 12px var(--shadow)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
      }}
    >
      <p
        className="text-xs mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          className="text-xs mt-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

// === VulnTable with Search ===
const VulnTable: React.FC<{ vulns: Vulnerability[]; onSelectCve?: (cveId: string) => void }> = ({ vulns, onSelectCve }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [references, setReferences] = useState<Record<string, {has_github: boolean, has_article: boolean, has_advisory: boolean, github_url?: string, article_url?: string, advisory_url?: string}>>({});

  const API_BASE = "/api";

  // Load references for all vulnerabilities
  useEffect(() => {
    const loadReferences = async () => {
      const refMap: Record<string, {has_github: boolean, has_article: boolean, has_advisory: boolean, github_url?: string, article_url?: string, advisory_url?: string}> = {};
      const cveIds = vulns.map(v => v.cveID);

      for (const cveId of cveIds) {
        try {
          const res = await fetch(`${API_BASE}/vulnerabilities/${cveId}/references`);
          const data = await res.json();
          const refs = data.references || [];
          const github = refs.find((r: any) => r.type === 'github');
          const article = refs.find((r: any) => r.type === 'article');
          const advisory = refs.find((r: any) => r.type === 'advisory');
          refMap[cveId] = {
            has_github: !!github,
            has_article: !!article,
            has_advisory: !!advisory,
            github_url: github?.url,
            article_url: article?.url,
            advisory_url: advisory?.url,
          };
        } catch (err) {
          refMap[cveId] = { has_github: false, has_article: false, has_advisory: false };
        }
      }
      setReferences(refMap);
    };

    if (vulns.length > 0) loadReferences();
  }, [vulns]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return vulns;
    const q = debouncedQuery.toLowerCase();
    return vulns.filter(
      (v: Vulnerability) =>
        v.cveID.toLowerCase().includes(q) ||
        v.vulnerabilityName.toLowerCase().includes(q) ||
        v.shortDescription.toLowerCase().includes(q)
    );
  }, [vulns, debouncedQuery]);

  return (
    <div>
      <div className="mb-4 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="CVE-ID / keyword..."
          className="w-full px-4 py-2 border transition-colors rounded-lg focus:outline-none"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: debouncedQuery ? "var(--input-focus)" : "var(--input-border)",
            borderWidth: "1px",
            color: "var(--text-primary)",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition"
            style={{
              color: "var(--text-tertiary)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-tertiary)";
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "var(--bg-secondary)", borderBottomColor: "var(--border-color)" }} className="border-b">
            <tr>
              <th
                className="px-4 py-2 text-left font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                CVE ID
              </th>
              <th
                className="px-4 py-2 text-left font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Description
              </th>
              <th
                className="px-4 py-2 text-left font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                EPSS
              </th>
              <th
                className="px-4 py-2 text-left font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const refs = references[v.cveID] || { has_github: false, has_article: false, has_advisory: false };
              return (
              <tr
                key={v.cveID}
                className="transition cursor-pointer"
                style={{
                  borderBottomColor: "var(--border-light)",
                  borderBottomWidth: "1px",
                }}
                onClick={() => onSelectCve?.(v.cveID)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <td className="px-4 py-2 font-mono">
                  <a
                    href={`https://nvd.nist.gov/vuln/detail/${v.cveID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0ea5e9", textDecoration: "none" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                        "underline";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                        "none";
                    }}
                  >
                    {v.cveID}
                  </a>
                </td>
                <td
                  className="px-4 py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {v.vulnerabilityName || v.shortDescription}
                </td>
                <td
                  className="px-4 py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {(v.epss_score || 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 flex gap-2 items-center">
                  <span
                    className="px-2 py-1 rounded text-white text-xs font-semibold"
                    style={{
                      backgroundColor: PRIORITY_COLORS[v.priority] || "#999",
                    }}
                  >
                    {v.priority}
                  </span>
                  {refs.has_github && refs.github_url && (
                    <a
                      href={refs.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 rounded text-xs font-semibold inline-block transition hover:opacity-80"
                      style={{ backgroundColor: "#1f2937", color: "#60a5fa", textDecoration: "none" }}
                    >
                      🔧 PoC
                    </a>
                  )}
                  {refs.has_article && refs.article_url && (
                    <a
                      href={refs.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 rounded text-xs font-semibold inline-block transition hover:opacity-80"
                      style={{ backgroundColor: "#1f2937", color: "#34d399", textDecoration: "none" }}
                    >
                      📰 Article
                    </a>
                  )}
                  {refs.has_advisory && refs.advisory_url && (
                    <a
                      href={refs.advisory_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 rounded text-xs font-semibold inline-block transition hover:opacity-80"
                      style={{ backgroundColor: "#1f2937", color: "#fbbf24", textDecoration: "none" }}
                    >
                      ⚠️ Advisory
                    </a>
                  )}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div
            className="text-center py-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            No matches
          </div>
        )}
      </div>
    </div>
  );
};

export const LightDashboard: React.FC = () => {
  const [page, setPage] = useState<"overview" | "threats" | "vulnerabilities" | "detail">(
    "overview"
  );
  const [stats, setStats] = useState<{
    total: number;
    priority_counts: Record<string, number>;
  } | null>(null);
  const [criticalVulns, setCriticalVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [selectedCveId, setSelectedCveId] = useState<string | null>(null);

  useEffect(() => {
    if (page !== "overview") return;

    setLoading(true);
    Promise.all([fetchVulnStats(), fetchCriticalEnriched()])
      .then(([statsData, criticalData]) => {
        setStats(statsData);
        setCriticalVulns(criticalData.data);
      })
      .catch((err) => console.error("Failed to fetch dashboard data:", err))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Header
        title={
          page === "overview"
            ? "Dashboard"
            : page === "threats"
              ? "X Threats"
              : "Vulnerabilities"
        }
        subtitle={
          page === "overview"
            ? "Threat Intelligence Overview & Statistics"
            : undefined
        }
      />

      <div
        className="border-b px-6 py-3 flex gap-6 transition-colors duration-200"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderBottomColor: "var(--border-color)",
        }}
      >
        {[
          { id: "overview", label: "Dashboard" },
          { id: "threats", label: "X Threats" },
          { id: "vulnerabilities", label: "Vulnerabilities" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id as typeof page)}
            className="pb-3 transition font-medium"
            style={{
              color:
                page === item.id
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              borderBottomWidth: page === item.id ? "2px" : "0",
              borderBottomColor:
                page === item.id ? "var(--input-focus)" : "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (page !== item.id) {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (page !== item.id) {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-secondary)";
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {page === "detail" && selectedCveId && (
          <VulnerabilityDetail
            cveId={selectedCveId}
            onBack={() => setPage("vulnerabilities")}
          />
        )}
        {page === "threats" && <XThreatsPage />}
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
              <div
                className="text-center py-8"
                style={{ color: "var(--text-tertiary)" }}
              >
                Loading...
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <MetricCard
                    title="Total Vulnerabilities"
                    value={stats.total}
                    onClick={() => {
                      setFilterSeverity(null);
                      setPage("vulnerabilities");
                    }}
                  />
                  <MetricCard
                    title="Critical"
                    value={stats.priority_counts.CRITICAL || 0}
                    subtitle={`${(
                      ((stats.priority_counts.CRITICAL || 0) / stats.total) *
                      100
                    ).toFixed(1)}%`}
                    onClick={() => {
                      setFilterSeverity("CRITICAL");
                      setPage("vulnerabilities");
                    }}
                  />
                  <MetricCard
                    title="High"
                    value={stats.priority_counts.HIGH || 0}
                    onClick={() => {
                      setFilterSeverity("HIGH");
                      setPage("vulnerabilities");
                    }}
                  />
                  <MetricCard
                    title="Medium"
                    value={stats.priority_counts.MEDIUM || 0}
                    onClick={() => {
                      setFilterSeverity("MEDIUM");
                      setPage("vulnerabilities");
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div
                    className="lg:col-span-2 rounded-lg border p-6"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <h3
                      className="text-lg font-bold mb-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Recent Critical Vulnerabilities
                    </h3>
                    <VulnTable
                      vulns={criticalVulns}
                      onSelectCve={(cveId) => {
                        setSelectedCveId(cveId);
                        setPage("detail");
                      }}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <HoneypotPanel />
                  </div>
                </div>
              </>
            ) : (
              <div
                className="text-center py-8"
                style={{ color: "var(--text-tertiary)" }}
              >
                No data available
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
