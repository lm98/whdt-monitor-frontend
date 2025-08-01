"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface HistoryEntry {
  timestamp: number;
  value: any;
}

interface LiveLineChartProps {
  dtId: string;
  propertyType: string;
  data: HistoryEntry[];
}

export default function LiveLineChart({ dtId, propertyType, data }: LiveLineChartProps) {
  // Normalize chart data
  const chartData = useMemo(() => {
    return data.map((entry) => {
      const value = entry.value;
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();

      // Flatten known property types (customize if needed)
      if (value.systolic && value.diastolic) {
        return { timestamp, systolic: value.systolic, diastolic: value.diastolic };
      } else if (typeof value.bpm === "number") {
        return { timestamp, bpm: value.bpm };
      } else if (typeof value.value === "number") {
        return { timestamp, value: value.value };
      } else {
        return { timestamp, ...value };
      }
    });
  }, [data]);

  const keys = Object.keys(chartData[0] || {}).filter(k => k !== "timestamp");

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="timestamp" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip />
        {keys.map((k) => (
          <Line key={k} type="monotone" dataKey={k} stroke="#00bfff" strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
