import { useMemo, type CSSProperties } from "react";

/** A light, deterministic frost field: CSS transforms keep the scene inexpensive. */
export function IceParticles() {
  const particles = useMemo(() => Array.from({ length: 30 }, (_, index) => {
    const seed = index + 1;
    return {
      id: index,
      left: (seed * 37) % 100,
      size: 2 + (seed * 13) % 7,
      duration: 18 + (seed * 7) % 20,
      delay: -((seed * 11) % 36),
      drift: ((seed * 19) % 80) - 40,
      opacity: 0.24 + ((seed * 17) % 40) / 100,
      crystal: seed % 4 === 0,
    };
  }), []);

  return (
    <div className="ice-field" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={`ice-particle${particle.crystal ? " ice-particle--crystal" : ""}`}
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            "--ice-duration": `${particle.duration}s`,
            "--ice-delay": `${particle.delay}s`,
            "--ice-drift": `${particle.drift}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
