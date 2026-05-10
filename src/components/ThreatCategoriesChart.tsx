import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// キーワード → カテゴリのマッピング
const CATEGORY_MAP: Record<string, string> = {
  ransomware: "Ransomware",
  malware: "Malware", trojan: "Malware", spyware: "Malware", worm: "Malware", backdoor: "Malware",
  exploit: "Exploit", log4j: "Exploit", rce: "Exploit", lfi: "Exploit",
  phishing: "Phishing", credential: "Phishing",
  botnet: "Botnet / DDoS", ddos: "Botnet / DDoS",
  apt: "APT", lazarus: "APT", "nation-state": "APT",
  vulnerability: "Vulnerability", cve: "Vulnerability",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Ransomware":       "#ef4444",
  "Malware":          "#f97316",
  "Exploit":          "#eab308",
  "Phishing":         "#3b82f6",
  "Botnet / DDoS":    "#06b6d4",
  "APT":              "#8b5cf6",
  "Vulnerability":    "#ec4899",
};

const MOCK_DATA = [
  { name: "Ransomware",    count: 23 },
  { name: "Malware",       count: 41 },
  { name: "Exploit",       count: 67 },
  { name: "Phishing",      count: 18 },
  { name: "Botnet / DDoS", count: 12 },
  { name: "APT",           count: 9  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const color = CATEGORY_COLORS[label] || "#6366f1";
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
    }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}: </span>
      <span style={{ color, fontWeight: 700 }}>{payload[0].value}</span>
    </div>
  );
};

export const ThreatCategoriesChart: React.FC<{
  onCategoryClick?: (category: string) => void;
}> = ({ onCategoryClick }) => {
  const [data, setData] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

  useEffect(() => {
    fetch(`${API_BASE}/threats?limit=500`)
      .then((r) => r.json())
      .then((json) => {
        const counts: Record<string, number> = {};
        for (const threat of json.data || []) {
          const matched = new Set<string>();
          for (const kw of (threat.keywords || []) as string[]) {
            const cat = CATEGORY_MAP[kw.toLowerCase()];
            if (cat && !matched.has(cat)) {
              matched.add(cat);
              counts[cat] = (counts[cat] || 0) + 1;
            }
          }
        }
        const result = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setData(result.length > 0 ? result : MOCK_DATA);
      })
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 108, bottom: 4 }}
          barCategoryGap="28%"
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={104}
            tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar
            dataKey="count"
            radius={[0, 10, 10, 0]}
            maxBarSize={22}
            cursor={onCategoryClick ? "pointer" : "default"}
            onClick={(data) => onCategoryClick?.(data.name)}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[entry.name] || "#6366f1"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
