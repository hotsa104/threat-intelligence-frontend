import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface TrendPoint {
  date: string;
  count: number;
}

interface CVETrendChartProps {
  trend: TrendPoint[];
  days?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ color: "var(--text-tertiary)", margin: "0 0 4px 0", fontSize: 11 }}>{label}</p>
      <p style={{ color: "#60a5fa", margin: 0, fontWeight: 700 }}>
        {payload[0].value} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>CVEs</span>
      </p>
    </div>
  );
};

export const CVETrendChart: React.FC<CVETrendChartProps> = ({ trend, days = 30 }) => {
  // スパース補完: 全日付を生成してゼロ埋め
  const chartData = useMemo(() => {
    const map = new Map(trend.map((p) => [p.date, p.count]));
    const result: { date: string; count: number; label: string }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        count: map.get(dateStr) ?? 0,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
      });
    }
    return result;
  }, [trend, days]);

  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-light)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(days / 6)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxVal + 1]}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-color)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#cveGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#60a5fa", stroke: "var(--bg-primary)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
