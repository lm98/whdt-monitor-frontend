"use client";

import { useMqtt } from "@/context/MqttContext";
import { Property } from "@/types/property";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HdtStatusResponse {
  actions: Array<any>
  events: Array<any>
  properties: Array<PropertyResponse>
  relationships: Array<any>
}

const emptyStatusResponse: () => HdtStatusResponse = () => {
  return {
    actions: [],
    events: [],
    properties: [],
    relationships: [],
  }
}

/**
 * This interface encapsulates a response to a Status request from the WLDT HTTP adapter.
 */
interface PropertyResponse {
  exposed: boolean
  key: string
  readable: boolean
  type: string
  value: Property
  writable: boolean
}

interface HdtDetailProps {
  id: string;
}

export default function HdtDetail({ id }: HdtDetailProps) {
  const [state, setState] = useState<HdtStatusResponse>(emptyStatusResponse());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { history, subscribeToDT } = useMqtt()

  const fetchState = async () => {
    try {
      const res = await fetch(`/api/hdt/${id}/state`);
      const data: HdtStatusResponse = await res.json();
      setState(data);
      console.log("Fetched state: ", data)
      const propertyNames = data.properties.map((p) => p.value).map((p) => p.internalName);
      subscribeToDT(id, propertyNames);
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
            {state?.properties.map((prop: PropertyResponse) => {
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
