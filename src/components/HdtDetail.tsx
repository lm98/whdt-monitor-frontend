"use client";

import { useMqtt } from "@/context/MqttContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HdtDetailProps {
  id: string;
}

export default function HdtDetail({ id }: HdtDetailProps) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { history, subscribeToDT } = useMqtt()

  const fetchState = async () => {
    try {
      const res = await fetch(`/api/hdt/${id}/state`);
      const data = await res.json();
      setState(data);
      const properties = data.properties.map((p: any) =>
        p.key.split(".").pop()
      );
      subscribeToDT(id, properties);
    } catch (err) {
      console.error("Failed to fetch DT state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();

    const interval = setInterval(() => {
      fetchState();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow w-full">
      <h2 className="font-bold text-lg mb-2">State of {id}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
            {state?.properties.map((prop: any) => {
              const type = prop.type.split(".").pop();
              const valueObj = prop.value;

              const timestamp = valueObj?.timestamp
                ? new Date(valueObj.timestamp).toLocaleString()
                : "—";

              const valueString = Object.entries(valueObj)
                .filter(([k]) =>
                  !["timestamp", "name", "internalName", "description", "id"].includes(k)
                )
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");

              return (
                <tr 
                  key={prop.key} 
                  className="bg-gray-900 hover:bg-gray-800"
                  onClick={() => router.push(`/hdt/${id}/property-live`)}
                >
                  <td className="p-2 border border-gray-700">{prop.key}</td>
                  <td className="p-2 border border-gray-700">{type}</td>
                  <td className="p-2 border border-gray-700">{valueString || "—"}</td>
                  <td className="p-2 border border-gray-700">{timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
