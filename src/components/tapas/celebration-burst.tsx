"use client";

import { useEffect, useRef } from "react";

interface CelebrationBurstProps {
  tier: 1 | 2 | 3;
  onComplete: () => void;
}

const TIER_CONFIG = {
  1: { rockets: 1, streaks: 16, duration: 5000 },
  2: { rockets: 2, streaks: 21, duration: 6000 },
  3: { rockets: 3, streaks: 26, duration: 7000 },
} as const;

const COLORS = [
  "#f97316", "#facc15", "#ef4444", "#f59e0b",
  "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
  "#14b8a6", "#e879f9",
];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pickColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function hexAlpha(hex: string, alpha: number) {
  return hex + Math.floor(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface Streak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
  life: number;
  maxLife: number;
  hasSubBurst: boolean;
}

interface Rocket {
  x: number;
  startY: number;
  y: number;
  targetY: number;
  phase: "launch" | "burst" | "done";
  launchFrame: number;
  delay: number;
  elapsed: number;
  trailSparks: Sparkle[];
  streaks: Streak[];
  sparkles: Sparkle[];
}

export function CelebrationBurst({ tier, onComplete }: CelebrationBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const config = TIER_CONFIG[tier];
    const LAUNCH_FRAMES = 70;

    const rockets: Rocket[] = [];
    for (let i = 0; i < config.rockets; i++) {
      const xSpread =
        config.rockets === 1
          ? 0
          : (i / (config.rockets - 1) - 0.5) * w * 0.4;
      rockets.push({
        x: w / 2 + xSpread,
        startY: h + 10,
        y: h + 10,
        targetY: rand(h * 0.4, h * 0.5),
        phase: "launch",
        launchFrame: 0,
        delay: i * 400,
        elapsed: 0,
        trailSparks: [],
        streaks: [],
        sparkles: [],
      });
    }

    let animId: number;
    let totalElapsed = 0;

    function drawSparkle(s: Sparkle) {
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.05;
      s.vx *= 0.98;

      const progress = s.life / s.maxLife;
      const alpha = progress < 0.5 ? 1 : 1 - (progress - 0.5) / 0.5;

      // Glow
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
      ctx!.fillStyle = hexAlpha(s.color, alpha * 0.15);
      ctx!.fill();

      // Core
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx!.fillStyle = hexAlpha(s.color, alpha);
      ctx!.fill();
    }

    function tick() {
      ctx!.clearRect(0, 0, w, h);
      totalElapsed += 16.67;
      let allDone = true;

      for (const rocket of rockets) {
        rocket.elapsed += 16.67;
        if (rocket.elapsed < rocket.delay) {
          allDone = false;
          continue;
        }

        // === LAUNCH PHASE ===
        if (rocket.phase === "launch") {
          allDone = false;
          rocket.launchFrame++;
          const t = Math.min(rocket.launchFrame / LAUNCH_FRAMES, 1);
          const ease = 1 - (1 - t) * (1 - t);
          rocket.y = rocket.startY + (rocket.targetY - rocket.startY) * ease;

          // Rocket head
          ctx!.beginPath();
          ctx!.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
          ctx!.fillStyle = "#fff";
          ctx!.fill();
          const grad = ctx!.createRadialGradient(
            rocket.x, rocket.y, 0, rocket.x, rocket.y, 14,
          );
          grad.addColorStop(0, "rgba(250, 204, 21, 0.7)");
          grad.addColorStop(1, "rgba(250, 204, 21, 0)");
          ctx!.beginPath();
          ctx!.arc(rocket.x, rocket.y, 14, 0, Math.PI * 2);
          ctx!.fillStyle = grad;
          ctx!.fill();

          // Trail sparks
          for (let s = 0; s < 2; s++) {
            rocket.trailSparks.push({
              x: rocket.x + rand(-2, 2),
              y: rocket.y + rand(4, 8),
              vx: rand(-1, 1),
              vy: rand(1, 3),
              color: Math.random() > 0.5 ? "#facc15" : "#f97316",
              size: rand(1, 2.5),
              life: 0,
              maxLife: rand(12, 28),
            });
          }

          if (rocket.launchFrame >= LAUNCH_FRAMES) {
            rocket.phase = "burst";

            // Flash
            const flashGrad = ctx!.createRadialGradient(
              rocket.x, rocket.y, 0, rocket.x, rocket.y, 50,
            );
            flashGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
            flashGrad.addColorStop(0.4, "rgba(250, 204, 21, 0.3)");
            flashGrad.addColorStop(1, "rgba(250, 204, 21, 0)");
            ctx!.beginPath();
            ctx!.arc(rocket.x, rocket.y, 50, 0, Math.PI * 2);
            ctx!.fillStyle = flashGrad;
            ctx!.fill();

            // Create streaks — burst upward and sideways, only a little downward
            for (let i = 0; i < config.streaks; i++) {
              // Spread from -210deg to +30deg (mostly upward arc, slight downward)
              // -PI = left, -PI/2 = up, 0 = right
              const angle = rand(-Math.PI * 1.17, Math.PI * 0.17);
              const speed = rand(4, 8);
              rocket.streaks.push({
                x: rocket.x,
                y: rocket.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: pickColor(),
                trail: [{ x: rocket.x, y: rocket.y }],
                life: 0,
                maxLife: rand(45, 70),
                hasSubBurst: false,
              });
            }
          }
        }

        // === DRAW TRAIL SPARKS (from launch) ===
        rocket.trailSparks = rocket.trailSparks.filter((s) => {
          if (s.life >= s.maxLife) return false;
          drawSparkle(s);
          return true;
        });

        // === DRAW STREAKS ===
        const aliveStreaks: Streak[] = [];
        for (const st of rocket.streaks) {
          st.life++;
          st.x += st.vx;
          st.y += st.vy;
          st.vy += 0.03;
          st.vx *= 0.98;
          st.trail.push({ x: st.x, y: st.y });
          if (st.trail.length > 14) st.trail.shift();

          const progress = st.life / st.maxLife;
          const alpha = progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4;

          // Draw the streak trail as a line
          if (st.trail.length > 1) {
            ctx!.beginPath();
            ctx!.moveTo(st.trail[0].x, st.trail[0].y);
            for (let i = 1; i < st.trail.length; i++) {
              ctx!.lineTo(st.trail[i].x, st.trail[i].y);
            }
            ctx!.strokeStyle = hexAlpha(st.color, alpha * 0.8);
            ctx!.lineWidth = 2.5;
            ctx!.lineCap = "round";
            ctx!.stroke();
          }

          // Bright head of the streak
          ctx!.beginPath();
          ctx!.arc(st.x, st.y, 3, 0, Math.PI * 2);
          ctx!.fillStyle = hexAlpha("#ffffff", alpha);
          ctx!.fill();
          ctx!.beginPath();
          ctx!.arc(st.x, st.y, 5, 0, Math.PI * 2);
          ctx!.fillStyle = hexAlpha(st.color, alpha * 0.5);
          ctx!.fill();

          if (st.life < st.maxLife) {
            aliveStreaks.push(st);
          } else if (!st.hasSubBurst) {
            // Sub-burst: each streak tip spawns smaller falling sparkles
            st.hasSubBurst = true;
            const subCount = Math.floor(rand(8, 18));
            for (let j = 0; j < subCount; j++) {
              const subAngle = rand(0, Math.PI * 2);
              const subSpeed = rand(1, 3.5);
              rocket.sparkles.push({
                x: st.x,
                y: st.y,
                vx: Math.cos(subAngle) * subSpeed + st.vx * 0.3,
                vy: Math.sin(subAngle) * subSpeed + st.vy * 0.3,
                color: st.color,
                size: rand(1.5, 3),
                life: 0,
                maxLife: rand(60, 110),
              });
            }
          }
        }
        rocket.streaks = aliveStreaks;

        // === DRAW SUB-BURST SPARKLES ===
        rocket.sparkles = rocket.sparkles.filter((s) => {
          if (s.life >= s.maxLife) return false;
          drawSparkle(s);
          return true;
        });

        // Check if rocket is done
        const hasActivity =
          rocket.phase === "launch" ||
          rocket.streaks.length > 0 ||
          rocket.sparkles.length > 0 ||
          rocket.trailSparks.length > 0;

        if (!hasActivity && rocket.phase === "burst") {
          rocket.phase = "done";
        }
        if (rocket.phase !== "done") {
          allDone = false;
        }
      }

      if (!allDone && totalElapsed < config.duration + 2000) {
        animId = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    }

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [tier, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
