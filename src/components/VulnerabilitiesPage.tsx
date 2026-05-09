import React, { useEffect, useState } from "react";
import { fetchVulnerabilities, Vulnerability } from "../api";
import { PRIORITY_COLORS } from "../theme";

const SEVERITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const VulnerabilitiesPage: React.FC = () => {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [activeSeverity, setActiveSeverity] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

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
                  <th
                    className="px-6 py-3 text-left font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    CVE ID
                  </th>
                  <th
                    className="px-6 py-3 text-left font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Title
                  </th>
                  <th
                    className="px-6 py-3 text-left font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Vendor / Product
                  </th>
                  <th
                    className="px-6 py-3 text-left font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    EPSS
                  </th>
                  <th
                    className="px-6 py-3 text-left font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Priority
                  </th>
                  <th
                    className="px-6 py-3 text-left font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Date Added
                  </th>
                </tr>
              </thead>
              <tbody>
                {vulns.map((v) => (
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
                    <td
                      className="px-6 py-3 font-mono"
                      style={{ color: "#0ea5e9" }}
                    >
                      {v.cveID}
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
