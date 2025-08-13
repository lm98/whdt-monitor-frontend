"use client";

import { useEffect, useState } from "react";
import HdtDetail from "@/components/HdtDetail"; // adjust path based on your structure
import { HdtCreateResponse } from "@/types/hdt";
import { useMqtt } from "@/context/MqttContext";

export default function HdtManager() {
  const [hdtList, setHdtList] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const { history, subscribeToDT } = useMqtt();

  const fetchHdts = async () => {
    try {
      const res = await fetch("/api/hdt");
      const data = await res.json();
      setHdtList(data);
      if (!highlightedId && data.length > 0) {
        setHighlightedId(data[0]);
      }
    } catch (e) {
      console.error("Failed to fetch HDTs", e);
    }
  };

  const createHdt = async () => {
    try {
      const json = JSON.parse(jsonInput);
      const res = await fetch("/api/hdt/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });
      if (res.ok) {
        await fetchHdts();
        const createResponse: HdtCreateResponse = await res.json();
        createResponse.models.forEach(model => {
          const propertyNames = model.properties.map(p => p.id);
          subscribeToDT(createResponse.id, propertyNames);
        })
      } else {
        alert("Failed to create Digital Twin");
      }
    } catch (err) {
      alert("Invalid JSON");
    }
  };

  useEffect(() => {
    fetchHdts();
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* JSON Input at Top */}
      <div className="w-full">
        <textarea
          className="w-full p-2 text-sm bg-gray-900 text-white border border-gray-600 rounded"
          rows={8}
          placeholder="Enter your JSON here"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        ></textarea>
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={createHdt}
        >
          Create DigitalTwin
        </button>
      </div>

      {/* Bottom Split View */}
      <div className="flex flex-row gap-4">
        {/* HDT List */}
        <div className="w-1/3 bg-gray-800 text-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Available HumanDigitalTwins</h2>
          <ul className="space-y-1">
            {hdtList.map((id) => (
              <li
                key={id}
                onClick={() => setHighlightedId(id)}
                className={`cursor-pointer hover:underline ${highlightedId === id ? "text-blue-400 font-bold" : "text-white"}`}
              >
                {id}
              </li>
            ))}
          </ul>
        </div>

        {/* HDT Details */}
        <div className="flex-1">
          {highlightedId && <HdtDetail id={highlightedId} />}
        </div>
      </div>
    </div>
  );
}
