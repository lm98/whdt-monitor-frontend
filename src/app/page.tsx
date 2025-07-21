"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import mqtt, { MqttClient } from "mqtt";
import type { HdtCreateResponse } from "@/types/hdt";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const mqttBrokerUrl = process.env.MQTT_BROKER || "ws://localhost:9001"
  const mqttClientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
      const client = mqtt.connect(mqttBrokerUrl);

      client.on("connect", () => {
        console.log("MQTT connected");
      });

      client.on("message", (topic, payload) => {
        console.log(`Received on topic ${topic}:\n ${payload}`)
      });

      client.on("error", (err) => {
        console.error("MQTT Error:", err);
      });

      mqttClientRef.current = client;

      return () => {
        client.end(); // Clean up on unmount
      };
    }, []
  );

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value);
  };

  const handleSubmit = async () => {
    let jsonObject: object;
    try {
      jsonObject = JSON.parse(jsonInput);
    } catch {
      alert("Invalid JSON input.");
      return;
    }
    try {
      // Typed response from your backend
      const response = await axios.post<HdtCreateResponse>(
        "http://localhost:8080/api/hdt/new",
        jsonObject
      );

      if ([200, 201].includes(response.status)) {
        const responseData = response.data;
        console.log("DigitalTwin created:", responseData);
        responseData.models.forEach((m) => {
          m.properties.forEach(p => {
            subscribeToMQTT(`${responseData.id}/state/${p.type}`)
          });
        })        
      } else {
        alert("Failed to create DigitalTwin.");
      }
    } catch (error) {
      console.error("Error creating DigitalTwin:", error);
      alert("Failed to connect to backend.");
    }
  };

  const subscribeToMQTT = (topic: string) => {
    const client = mqttClientRef.current;

    if (!client || !client.connected) {
      console.error("MQTT client not connected");
      return;
    }

    client.subscribe(topic, (err) => {
      if (err) {
        console.error("Subscription error:", err);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  };

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Digital Twin Client (Typed)</h1>

      <textarea
        className="w-full h-64 p-4 border rounded shadow"
        placeholder="Enter your JSON here"
        value={jsonInput}
        onChange={handleJsonChange}
      />

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleSubmit}
      >
        Create DigitalTwin
      </button>
    </main>
  );
}
