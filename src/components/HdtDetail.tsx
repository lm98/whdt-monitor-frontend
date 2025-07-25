"use client";

import { useEffect, useState } from "react";

interface HdtDetailProps {
  id: string;
  onClose: () => void;
  refreshIntervalMs?: number;
}

export default function HdtDetail({ id, onClose, refreshIntervalMs = 5000 }: HdtDetailProps) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const res = await fetch(`/api/hdt/${id}/state`);
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error("Failed to fetch DT state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState(); // initial fetch
    const interval = setInterval(fetchState, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [id, refreshIntervalMs]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 text-white p-4 rounded shadow max-w-lg w-full relative">
        <button className="absolute top-2 right-2" onClick={onClose}>
          ❌
        </button>
        <h2 className="font-bold text-lg mb-2">State of {id}</h2>
            {state ? (
                <table className="w-full text-sm text-left border border-gray-600 mt-2 text-white">
                    <thead className="bg-gray-800 text-gray-300">
                        <tr>
                        <th className="p-2 border border-gray-600">Key</th>
                        <th className="p-2 border border-gray-600">Type</th>
                        <th className="p-2 border border-gray-600">Value</th>
                        <th className="p-2 border border-gray-600">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.properties.map((prop: any) => {
                            const type = prop.type.split(".").pop();
                            const valueObj = prop.value;
                            const timestamp = valueObj.timestamp
                                ? new Date(valueObj.timestamp).toLocaleString()
                                : "—";

                            const valueString = Object.entries(valueObj)
                                .filter(([k]) => !["timestamp", "name", "internalName", "description", "id"].includes(k))
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ");

                            return (
                                <tr key={prop.key} className="bg-gray-900 hover:bg-gray-800">
                                <td className="p-2 border border-gray-700">{prop.key}</td>
                                <td className="p-2 border border-gray-700">{type}</td>
                                <td className="p-2 border border-gray-700">{valueString || "—"}</td>
                                <td className="p-2 border border-gray-700">{timestamp}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            ) : ("Loading...")}
      </div>
    </div>
  );
}
