"use client";

import { useEffect, useState } from "react";

interface HdtListProps {
  onSelect: (id: string) => void
  refreshIntervalMs?: number
}

export default function HdtList({ onSelect, refreshIntervalMs = 5000 }: HdtListProps) {
  const [hdtIds, setHdtIds] = useState<string[]>([]);

  const fetchState = async () => {
    try {
      const res = await fetch("/api/hdt");
      const data = await res.json();
      setHdtIds(data);
    } catch (err) {
      console.error("Failed to fetch DT list: ", err);
    }
  };

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, refreshIntervalMs)
    return () => clearInterval(interval)
  }, [refreshIntervalMs]);

  return (
    <div className="space-y-2">
      <h2 className="font-bold">Available HumanDigitalTwins</h2>
      {hdtIds.map((id) => (
        <button
          key={id}
          className="block text-blue-600 hover:underline"
          onClick={() => onSelect(id)}
        >
          {id}
        </button>
      ))}
    </div>
  );
}
