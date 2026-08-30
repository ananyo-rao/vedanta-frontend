"use client";

import { useEffect, useRef } from "react";

interface CelebrationBurstProps {
  tier: 1 | 2 | 3;
  onComplete: () => void;
}

const TIER_CONFIG = {
  1: { count: 25, duration: 3000, spread: 200 },
  2: { count: 45, duration: 4000, spread: 400 },
  3: { count: 80, duration: 5000, spread: 9999 },
} as const;

const COLORS = [
  "bg-orange-400",
  "bg-yellow-400",
  "bg-red-400",
  "bg-amber-400",
];

export function CelebrationBurst({ tier, onComplete }: CelebrationBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const config = TIER_CONFIG[tier];
    const isFullScreen = tier === 3;

    for (let i = 0; i < config.count; i++) {
      const particle = document.createElement("span");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = 4 + Math.random() * 6;
      const startX = isFullScreen
        ? Math.random() * window.innerWidth
        : window.innerWidth / 2 + (Math.random() - 0.5) * config.spread;
      const startY = isFullScreen
        ? Math.random() * window.innerHeight * 0.5
        : window.innerHeight / 2;
      const dx = (Math.random() - 0.5) * config.spread;
      const dy = -(100 + Math.random() * 350);
      const rotation = Math.random() * 720 - 360;

      particle.className = `absolute rounded-full ${color}`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.pointerEvents = "none";

      const keyframes: Keyframe[] = [
        { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) scale(0) rotate(${rotation}deg)`,
          opacity: 0,
        },
      ];

      particle.animate(keyframes, {
        duration: config.duration * (0.7 + Math.random() * 0.6),
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        delay: Math.random() * 800,
        fill: "forwards",
      });

      container.appendChild(particle);
    }

    const timeout = setTimeout(() => {
      onComplete();
    }, config.duration + 1000);

    return () => clearTimeout(timeout);
  }, [tier, onComplete]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    />
  );
}
