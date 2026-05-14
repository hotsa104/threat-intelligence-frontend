import React from "react";
import { useApi } from "../hooks/useApi";
import { fetchHoneypotStats } from "../api";

const GrafanaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="none" stroke="#f97316" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" fill="#f97316"/>
    <line x1="12" y1="2" x2="12" y2="6" stroke="#f97316" strokeWidth="2"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke="#f97316" strokeWidth="2"/>
    <line x1="2" y1="12" x2="6" y2="12" stroke="#f97316" strokeWidth="2"/>
    <line x1="18" y1="12" x2="22" y2="12" stroke="#f97316" strokeWidth="2"/>
  </svg>
);

const PortBar: React.FC<{ port: number; count: number; max: number }> = ({ port, count, max }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>:{port}</span>
      <span style={{ fontSize: 11, color: "#e2e8f0", fontFamily: "monospace" }}>{count.toLocaleString()}</span>
    </div>
    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.round((count / max) * 100)}%`,
          background: "linear-gradient(90deg, #f97316, #ef4444)",
          borderRadius: 2,
        }}
      />
    </div>
  </div>
);

const IpRow: React.FC<{ ip: string; count: number; max: number; rank: number }> = ({ ip, count, rank }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
    <span style={{ fontSize: 10, color: "#4a5568", width: 14, flexShrink: 0, fontFamily: "monospace" }}>
      {rank}.
    </span>
    <span style={{ fontSize: 11, color: "#60a5fa", fontFamily: "monospace", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {ip}
    </span>
    <span style={{ fontSize: 11, color: "#e2e8f0", fontFamily: "monospace", flexShrink: 0 }}>
      {count.toLocaleString()}
    </span>
  </div>
);

export const HoneypotPanel: React.FC = () => {
  const { data, loading } = useApi(fetchHoneypotStats, []);

  // Grafana-style header bar (always shown)
  const header = (
    <div
      style={{
        background: "linear-gradient(90deg, #111928 0%, #0d1526 100%)",
        borderBottom: "1px solid #2d3a5c",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <GrafanaIcon />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>T-pot Honeypot</span>
        <span style={{ fontSize: 10, color: "#4a5568" }}>— 過去24h</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {data?.available ? (
          <span
            style={{
              fontSize: 10,
              color: "#10b981",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 4,
              padding: "2px 8px",
              fontWeight: 600,
            }}
          >
            ● LIVE
          </span>
        ) : (
          <span
            style={{
              fontSize: 10,
              color: "#6b7fa3",
              background: "rgba(107,127,163,0.1)",
              border: "1px solid rgba(107,127,163,0.2)",
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            OFFLINE
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
        {header}
        <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 12, color: "var(--text-tertiary)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!data?.available) {
    return (
      <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
        {header}
        <div style={{ padding: "16px" }}>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
            {data?.message ?? "SSH tunnel not connected. T-pot data unavailable."}
          </p>
        </div>
      </div>
    );
  }

  const maxPort = Math.max(...(data.top_ports ?? []).map((p) => p.count), 1);
  const maxIp   = Math.max(...(data.top_src_ips ?? []).map((p) => p.count), 1);
  const topPorts = (data.top_ports ?? []).slice(0, 5);
  const topIps   = (data.top_src_ips ?? []).slice(0, 5);

  return (
    <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
      {header}
      <div style={{ padding: "14px 16px" }}>

        {/* Total attacks metric */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, color: "#6b7fa3", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Total Attacks
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "monospace", color: "#ef4444", margin: 0 }}>
            {data.total.toLocaleString()}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Top Ports */}
          {topPorts.length > 0 && (
            <div>
              <p style={{ fontSize: 10, color: "#6b7fa3", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Top Ports
              </p>
              {topPorts.map((p) => (
                <PortBar key={p.port} port={p.port} count={p.count} max={maxPort} />
              ))}
            </div>
          )}

          {/* Top Source IPs */}
          {topIps.length > 0 && (
            <div>
              <p style={{ fontSize: 10, color: "#6b7fa3", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Top Source IPs
              </p>
              {topIps.map((ip, i) => (
                <IpRow key={ip.ip} ip={ip.ip} count={ip.count} max={maxIp} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
