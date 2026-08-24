import { useMemo } from "react";
import { motion } from "motion/react";

interface ParticleType {
  id: number;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  driftX1: number;
  driftX2: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotateStart: number;
  rotateSpeed: number;
  isSnowflake: boolean;
}

export function IceParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      // Create interesting deterministic random properties for realistic physical drifting
      const startX = (i * 11) % 100; // Start percentage horizontally (distributed 0% to 99%)
      const size = 3 + (i * 7) % 10; // Shards are 3px to 13px
      const duration = 14 + (i * 13) % 22; // Drift speeds vary (14s to 36s)
      const delay = -(i * 1.5); // Pre-fill screen immediately on load
      const opacity = 0.1 + ((i * 3) % 5) * 0.06; // Subtle elegant alpha overlay
      
      const rotateStart = (i * 45) % 360;
      const rotateSpeed = 90 + (i * 60) % 360; // Total rotation over lifespan

      const driftX1 = -25 - (i * 4) % 35; // pixel-based horizontal sway (negative)
      const driftX2 = 25 + (i * 4) % 35; // pixel-based horizontal sway (positive)

      return {
        id: i,
        startX,
        driftX1,
        driftX2,
        size,
        duration,
        delay,
        opacity,
        rotateStart,
        rotateSpeed,
        isSnowflake: i % 3 === 0, // Mix snowflakes with standard crystal shards
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((pt) => {
        // Stagger sway directions
        const swaySequence = pt.id % 2 === 0 
          ? [0, pt.driftX1, pt.driftX2, pt.driftX1, 0] 
          : [0, pt.driftX2, pt.driftX1, pt.driftX2, 0];

        return (
          <motion.div
            key={pt.id}
            initial={{
              y: "105vh",
              x: 0,
              rotate: pt.rotateStart,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              y: "-5vh",
              x: swaySequence,
              rotate: pt.rotateStart + pt.rotateSpeed,
              opacity: [0, pt.opacity, pt.opacity, 0],
              scale: [0.8, 1.1, 0.9, 0.8],
            }}
            transition={{
              y: {
                duration: pt.duration,
                repeat: Infinity,
                ease: "linear",
                delay: pt.delay,
              },
              x: {
                duration: pt.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: pt.delay,
              },
              rotate: {
                duration: pt.duration,
                repeat: Infinity,
                ease: "linear",
                delay: pt.delay,
              },
              opacity: {
                duration: pt.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: pt.delay,
              },
              scale: {
                duration: pt.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: pt.delay,
              },
            }}
            style={{
              position: "absolute",
              left: `${pt.startX}%`,
              width: `${pt.size}px`,
              height: `${pt.size}px`,
              filter: "blur(0.5px)",
            }}
            className="flex items-center justify-center selection:bg-transparent pointer-events-none text-cyan-200/90"
          >
            {pt.isSnowflake ? (
              <span style={{ fontSize: `${pt.size}px` }}>❄</span>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full text-cyan-300/30 filter drop-shadow-[0_0_4px_rgba(103,232,249,0.4)]"
              >
                {/* Sharp geometric ice crystal shard path */}
                <polygon points="12,2 20,9 12,22 4,9" />
              </svg>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
