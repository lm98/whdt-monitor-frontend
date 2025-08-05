"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { useMqtt } from "@/context/MqttContext";

interface LiveLineChartProps {
  dtId: string
  propertyType: string
}

export default function LiveLineChart({ dtId, propertyType }: LiveLineChartProps) {
  const { history, subscribeToDT } = useMqtt()
  const propertyHistory = history[dtId][propertyType].map(e => e.value)
  const keys: string[] = []
  switch(propertyType) {
    case "blood-pressure": {
      keys.push("systolic", "diastolic")
      break
    }
  }
  console.log("historiiii, ", history)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={propertyHistory.map(e => e.valueMap)}>
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
