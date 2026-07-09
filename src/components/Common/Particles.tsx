"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particle positions once mounted on client
    const generated: Particle[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // left %
      y: Math.random() * 100, // top %
      size: Math.random() * 2.5 + 1.2, // size in px
      duration: Math.random() * 25 + 25, // slow speed: 25s - 50s
      delay: Math.random() * -30, // pre-delay so particles are scattered immediately
    }));
    Promise.resolve().then(() => setParticles(generated));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#D4AF37]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0.12,
            boxShadow: "0 0 6px rgba(212, 175, 55, 0.4)",
          }}
          animate={{
            y: ["0vh", "-110vh"],
            x: ["0vw", `${Math.sin(p.id) * 4}vw`, "0vw"],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
