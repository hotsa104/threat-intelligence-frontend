import React, { useEffect, useState, useMemo } from "react";
import { fetchVulnerabilities, Vulnerability } from "../api";
import { PRIORITY_COLORS } from "../theme";

const SEVERITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
};

type SortKey = "cveID" | "vulnerabilityName" | "vendorProject" | "epss_score" | "priority" | "dateAdded";
type SortOrder = "asc" | "desc";

export const VulnerabilitiesPage: React.FC<{ initialFilter?: string | null }> = ({ initialFilter }) => {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [activeSeverity, setActiveSeverity] = useState(initialFilter || "ALL");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...vulns].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "epss_score") {
        cmp = (a.epss_score || 0) - (b.epss_score || 0);
      } else if (sortKey === "priority") {
        cmp = (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
      } else if (sortKey === "dateAdded") {
        cmp = new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
      } else {
        cmp = (a[sortKey] || "").localeCompare(b[sortKey] || "");
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [vulns, sortKey, sortOrder]);

  // === Fetch vulnerabilities ===
  useEffect(() => {
    setLoading(true);
    fetchVulnerabilities({
      limit: 100,
      offset: 0,
      priority: activeSeverity === "ALL" ? undefined : activeSeverity,
    })
      .then((data) => {
        setVulns(data.data);
        setTotal(data.total);
      })
      .catch((err) => {
        console.error("Failed to fetch vulnerabilities:", err);
        setVulns([]);
      })
      .finally(() => setLoading(false));
  }, [activeSeverity]);

  return (
    <div className="w-full transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Vulnerabilities
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {total > 0
            ? `${total} total vulnerabilities`
            : "No vulnerabilities found"}
        </p>
      </div>

      {/* Severity Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SEVERITIES.map((severity) => {
          const isActive = activeSeverity === severity;
          const bgColor =
            severity === "ALL"
              ? isActive
                ? "var(--input-focus)"
                : "var(--bg-secondary)"
              : PRIORITY_COLORS[severity] || "#999";
          const textColor = isActive
            ? "#fff"
            : severity === "ALL"
              ? "var(--text-secondary)"
              : "#fff";
          const borderColor = isActive
            ? bgColor
            : severity === "ALL"
              ? "var(--border-color)"
              : "transparent";

          return (
            <button
              key={severity}
              onClick={() => setActiveSeverity(severity)}
              className="px-4 py-2 rounded-full font-medium transition text-sm"
              style={{
                backgroundColor: isActive ? bgColor : "transparent",
                color: textColor,
                border: `1px solid ${borderColor}`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "var(--bg-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
                }
              }}
            >
              {severity}
            </button>
          );
        })}
      </div>

      {/* Vulnerabilities Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        {loading ? (
          <div
            className="text-center py-8"
            style={{ color: "var(--text-tertiary)" }}
          >
            Loading...
          </div>
        ) : vulns.length === 0 ? (
          <div
            className="text-center py-8"
            style={{ color: "var(--text-tertiary)" }}
          >
            No vulnerabilities in this category
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderBottomColor: "var(--border-color)",
                }}
                className="border-b"
              >
                <tr>
                  {(
                    [
                      { key: "cveID", label: "CVE ID" },
                      { key: "vulnerabilityName", label: "Title" },
                      { key: "vendorProject", label: "Vendor / Product" },
                      { key: "epss_score", label: "EPSS" },
                      { key: "priority", label: "Priority" },
                      { key: "dateAdded", label: "Date Added" },
                    ] as { key: SortKey; label: string }[]
                  ).map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left font-semibold select-none"
                      style={{ color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap" }}
                      onClick={() => handleSort(key)}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableCellElement).style.color = "var(--input-focus)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableCellElement).style.color = "var(--text-primary)";
                      }}
                    >
                      {label}{" "}
                      <span style={{ opacity: sortKey === key ? 1 : 0.3 }}>
                        {sortKey === key ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((v) => (
                  <tr
                    key={v.cveID}
                    className="transition"
                    style={{
                      borderBottomColor: "var(--border-light)",
                      borderBottomWidth: "1px",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "var(--bg-tertiary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    <td className="px-6 py-3 font-mono">
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
                      className="px-6 py-3 max-w-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <div className="line-clamp-2">
                        {v.vulnerabilityName || v.shortDescription}
                      </div>
                    </td>
                    <td
                      className="px-6 py-3 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <div className="font-semibold">{v.vendorProject}</div>
                      <div>{v.product}</div>
                    </td>
                    <td
                      className="px-6 py-3 font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {(v.epss_score || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                        style={{
                          backgroundColor:
                            PRIORITY_COLORS[v.priority] || "#999",
                        }}
                      >
                        {v.priority}
                      </span>
                    </td>
                    <td
                      className="px-6 py-3 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {v.dateAdded
                        ? new Date(v.dateAdded).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
