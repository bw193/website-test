import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
import { motion } from 'motion/react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const center: [number, number] = [120.75, 30.75]; // Jiaxing, China

const destinations = [
  { name: "America", coordinates: [-100, 40] as [number, number], color: "#fb7185", bg: "#ffe4e6" }, // Rose
  { name: "Canada", coordinates: [-106, 56] as [number, number], color: "#fbbf24", bg: "#fef3c7" }, // Amber
  { name: "South America", coordinates: [-55, -10] as [number, number], color: "#fbbf24", bg: "#fef3c7" },
  { name: "Europe", coordinates: [10, 51] as [number, number], color: "#fbbf24", bg: "#fef3c7" },
  { name: "Middle East", coordinates: [45, 25] as [number, number], color: "#fbbf24", bg: "#fef3c7" },
  { name: "Thailand", coordinates: [100, 15] as [number, number], color: "#fbbf24", bg: "#fef3c7" },
  { name: "Australia", coordinates: [133, -25] as [number, number], color: "#fbbf24", bg: "#fef3c7" },
  { name: "Russia", coordinates: [100, 60] as [number, number], color: "#fbbf24", bg: "#fef3c7" },
];

export default function GlobalMap() {
  return (
    <div className="w-full h-full bg-[#111827] rounded-3xl overflow-hidden relative shadow-2xl border border-stone-800">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 130,
          center: [20, 20]
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
                fill="#1f2937"
                stroke="#374151"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#374151" },
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
            className="opacity-80"
            style={{
              strokeDasharray: "4 4",
              animation: "dash 10s linear infinite"
            }}
          />
        ))}

        {/* Markers */}
        <Marker coordinates={center}>
          <circle r={4} fill="#60a5fa" />
          <circle r={12} fill="#60a5fa" className="opacity-30 animate-ping" />
          <rect x={10} y={-10} width={40} height={20} fill="#fef3c7" rx={4} />
          <text textAnchor="middle" x={30} y={4} style={{ fontFamily: "system-ui", fill: "#1f2937", fontSize: "10px", fontWeight: "600" }}>
            China
          </text>
        </Marker>

        {destinations.map((dest, i) => (
          <Marker key={`marker-${i}`} coordinates={dest.coordinates}>
            <motion.circle
              r={4}
              fill="transparent"
              stroke={dest.color}
              strokeWidth={2}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.1 }}
            />
            <motion.circle
              r={10}
              fill={dest.color}
              className="opacity-20"
              initial={{ scale: 0 }}
              whileInView={{ scale: [1, 1.5, 1] }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.1, duration: 2, repeat: Infinity }}
            />
            <motion.rect
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
            <motion.text
              textAnchor="middle"
              x={dest.coordinates[0] < center[0] ? -35 : 35}
              y={4}
              style={{ fontFamily: "system-ui", fill: "#1f2937", fontSize: "10px", fontWeight: "600" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.3 + i * 0.1 }}
            >
              {dest.name}
            </motion.text>
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
