// app/hdt/[id]/property-live/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useMqtt } from "@/context/MqttContext";
import LiveLineChart from "@/components/LiveLineChart";

interface PropertyListItemProps {
  propertyType: string;
  selected: boolean;
  onClick: () => void;
}

function PropertyListItem({ propertyType, selected, onClick }: PropertyListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-2 border-b ${
        selected ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300"
      } hover:bg-blue-600`}
    >
      {propertyType}
    </div>
  );
}

export default function PropertyLiveUpdatePage({ params }: { params: { id: string } }) {
  const dtId = params.id;
  const { history, subscribeToDT } = useMqtt();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  // Get available property types from MQTT data
  const propertyTypes = Object.keys(history[dtId] || {});

  // Select first one as default
  useEffect(() => {
    if (propertyTypes.length && !selectedProperty) {
      setSelectedProperty(propertyTypes[0]);
    }
  }, [propertyTypes, selectedProperty]);

  // Sub to all property topics (only once)
  useEffect(() => {
    if (propertyTypes.length) {
      subscribeToDT(dtId, propertyTypes);
    }
  }, [dtId, propertyTypes.join(",")]); // stringify join to trigger effect if propertyTypes changes

  return (
    <div className="flex w-full h-full p-4 gap-4">
      {/* Left - Property list */}
      <div className="w-1/4 bg-gray-900 rounded p-2 overflow-auto max-h-screen">
        <h2 className="font-bold text-white mb-2">Properties</h2>
        {propertyTypes.map((type) => (
          <PropertyListItem
            key={type}
            propertyType={type}
            selected={type === selectedProperty}
            onClick={() => setSelectedProperty(type)}
          />
        ))}
      </div>

      {/* Right - Chart view */}
      <div className="flex-1 bg-gray-800 rounded p-4">
        <h2 className="text-white text-lg font-semibold mb-4">
          Live Chart for <span className="text-blue-300">{selectedProperty}</span>
        </h2>

        {selectedProperty ? (
          <LiveLineChart
            dtId={dtId}
            propertyType={selectedProperty}
            data={history[dtId]?.[selectedProperty] || []}
          />
        ) : (
          <p className="text-white">Select a property to view its live chart.</p>
        )}
      </div>
    </div>
  );
}
