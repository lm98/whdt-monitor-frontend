"use client";

import mqtt from "mqtt";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type PropertyMessage = { [propertyType: string]: any };
type TwinMessages = { [twinId: string]: PropertyMessage };

interface MqttContextType {
  messages: TwinMessages;
  subscribeToDT: (dtId: string, propertyTypes: string[]) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<TwinMessages>({});
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

        setMessages(prev => ({
          ...prev,
          [dtId]: {
            ...prev[dtId],
            [propertyType]: message,
          },
        }));
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
    <MqttContext.Provider value={{ messages, subscribeToDT }}>
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => {
  const ctx = useContext(MqttContext);
  if (!ctx) throw new Error("useMqtt must be used inside MqttProvider");
  return ctx;
};
