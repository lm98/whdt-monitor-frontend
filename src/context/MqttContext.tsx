"use client";

import { Property } from "@/types/property";
import mqtt from "mqtt";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type HistoryEntry = {
  timestamp: number;
  value: Property;
};

type PropertyHistory = { [propertyType: string]: HistoryEntry[] };
type TwinHistory = { [twinId: string]: PropertyHistory };

interface MqttContextType {
  history: TwinHistory;
  subscribeToDT: (dtId: string, propertyTypes: string[]) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<TwinHistory>({});
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const client = mqtt.connect("ws://localhost:9001");
    clientRef.current = client;

    client.on("connect", () => {
      console.log("MQTT connected");
    });

    client.on("message", (topic, payload) => {
      try {
        const [, dtId, , propertyType] = topic.split("/");
        const message = JSON.parse(payload.toString());
        const timestamp = Date.now();
        const newEntry: HistoryEntry = { timestamp, value: message };

        setHistory(prev => {
          const dt = prev[dtId] || {};
          const prop = dt[propertyType] || [];
          const updated = [...prop, newEntry].slice(-100); // limit to 100 entries

          return {
            ...prev,
            [dtId]: {
              ...dt,
              [propertyType]: updated,
            },
          };
        });
      } catch (err) {
        console.error("MQTT message error:", err);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const subscribeToDT = (dtId: string, propertyTypes: string[]) => {
    propertyTypes.forEach((type) => {
      const topic = `${dtId}/state/${type}`;
      clientRef.current?.subscribe(topic, err => {
        if (err) console.error("Subscription error:", err);
      });
    });
  };

  return (
    <MqttContext.Provider value={{ history, subscribeToDT }}>
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => {
  const ctx = useContext(MqttContext);
  if (!ctx) throw new Error("useMqtt must be used inside MqttProvider");
  return ctx;
};
