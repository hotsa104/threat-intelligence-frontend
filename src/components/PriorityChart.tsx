import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { PRIORITY_COLORS } from "../theme";

interface PriorityChartProps {
  stats: {
    priority_counts: Record<string, number>;
    total: number;
  };
}

export const PriorityChart: React.FC<PriorityChartProps> = ({ stats }) => {
  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const chartData = priorities.map((priority) => ({
    name: priority,
    value: stats.priority_counts[priority] || 0,
    color: PRIORITY_COLORS[priority] || "#999",
  }));

  // Filter out zero values
  const filteredData = chartData.filter((item) => item.value > 0);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value, percent }) =>
              `${name} ${value} (${(percent * 100).toFixed(1)}%)`
            }
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, "Count"]}
            contentStyle={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
