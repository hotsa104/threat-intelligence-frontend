import React from "react";
import { useApi } from "../hooks/useApi";
import { fetchHoneypotStats } from "../api";

export const HoneypotPanel: React.FC = () => {
  const { data, loading, error } = useApi(fetchHoneypotStats, []);

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-secondary)",
    borderColor: "var(--border-color)",
  };

  if (loading) {
    return (
      <div className="rounded-lg border p-6" style={cardStyle}>
        <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Honeypot Activity
        </h3>
        <div className="text-center py-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Unavailable / offline state
  if (error || !data || !data.available) {
    return (
      <div className="rounded-lg border p-6" style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Honeypot Activity
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            Offline
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          {data?.message ?? "SSH tunnel not connected. T-pot data unavailable."}
        </p>
        <p className="text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>
          Phase 6 で T-pot / SSH トンネル連携を実装予定
        </p>
      </div>
    );
  }

  // Live state (Phase 6 以降)
  return (
    <div className="rounded-lg border p-6" style={cardStyle}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Honeypot Activity
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: "#10b981" }}
        >
          Live
        </span>
      </div>

      <p className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        {data.total.toLocaleString()}
        <span className="text-sm font-normal ml-2" style={{ color: "var(--text-secondary)" }}>
          attacks (24h)
        </span>
      </p>

      {data.top_ports.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
            Top Target Ports
          </p>
          <div className="space-y-1">
            {data.top_ports.map((p) => (
              <div key={p.port} className="flex justify-between text-sm">
                <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                  :{p.port}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {p.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
