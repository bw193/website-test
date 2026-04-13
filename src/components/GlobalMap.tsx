import { m } from 'motion/react';
import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const center: [number, number] = [120.75, 30.75]; // Jiaxing, China

const destinations = [
  { name: "America", coordinates: [-100, 40] as [number, number], color: "#e11d48", bg: "#ffe4e6" }, // Rose-600
  { name: "Canada", coordinates: [-106, 56] as [number, number], color: "#ea580c", bg: "#ffedd5" }, // Orange-600
  { name: "South America", coordinates: [-55, -10] as [number, number], color: "#ea580c", bg: "#ffedd5" },
  { name: "Europe", coordinates: [10, 51] as [number, number], color: "#ea580c", bg: "#ffedd5" },
  { name: "Middle East", coordinates: [45, 25] as [number, number], color: "#ea580c", bg: "#ffedd5" },
  { name: "Thailand", coordinates: [100, 15] as [number, number], color: "#ea580c", bg: "#ffedd5" },
  { name: "Australia", coordinates: [133, -25] as [number, number], color: "#ea580c", bg: "#ffedd5" },
  { name: "Russia", coordinates: [100, 60] as [number, number], color: "#ea580c", bg: "#ffedd5" },
];

export default function GlobalMap() {
  return (
    <div className="w-full h-full bg-stone-50 rounded-3xl overflow-hidden relative shadow-xl border border-stone-200">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [10, 30]
        }}
        width={1000}
        height={450}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e7e5e4"
                stroke="#ffffff"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#d6d3d1" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Lines */}
        {destinations.map((dest, i) => (
          <Line
            key={`line-${i}`}
            from={center}
            to={dest.coordinates}
            stroke={dest.color}
            strokeWidth={1.5}
            strokeLinecap="round"
            className="opacity-60"
            style={{
              strokeDasharray: "4 4",
              animation: "dash 10s linear infinite"
            }}
          />
        ))}

        {/* Markers */}
        <Marker coordinates={center}>
          <circle r={4} fill="#2563eb" />
          <circle r={12} fill="#3b82f6" className="opacity-30 animate-ping" />
          <rect x={10} y={-10} width={40} height={20} fill="#dbeafe" rx={4} />
          <text textAnchor="middle" x={30} y={4} style={{ fontFamily: "system-ui", fill: "#1e3a8a", fontSize: "10px", fontWeight: "600" }}>
            China
          </text>
        </Marker>

        {destinations.map((dest, i) => (
          <Marker key={`marker-${i}`} coordinates={dest.coordinates}>
            <m.circle
              r={4}
              fill="transparent"
              stroke={dest.color}
              strokeWidth={2}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.1 }}
            />
            <m.circle
              r={10}
              fill={dest.color}
              className="opacity-20"
              initial={{ scale: 0 }}
              whileInView={{ scale: [1, 1.5, 1] }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.1, duration: 2, repeat: Infinity }}
            />
            <m.rect
              x={dest.coordinates[0] < center[0] ? -60 : 10}
              y={-10}
              width={50}
              height={20}
              fill={dest.bg}
              rx={4}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 + i * 0.1 }}
            />
            <m.text
              textAnchor="middle"
              x={dest.coordinates[0] < center[0] ? -35 : 35}
              y={4}
              style={{ fontFamily: "system-ui", fill: "#78350f", fontSize: "10px", fontWeight: "600" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.3 + i * 0.1 }}
            >
              {dest.name}
            </m.text>
          </Marker>
        ))}
      </ComposableMap>
      
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
}
