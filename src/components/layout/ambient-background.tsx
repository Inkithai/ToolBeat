/**
 * Decorative ambient layer: drifting aurora orbs + floating particles.
 * Pure CSS animation; pointer-events none so it never blocks UI.
 */
export default function AmbientBackground({
  variant = "page",
}: {
  variant?: "page" | "hero";
}) {
  const dense = variant === "hero";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-grid-fade" />
      {dense && <div className="absolute inset-0 bg-dot-fade opacity-60" />}

      <div
        className={`aurora-orb aurora-orb-a ${dense ? "left-[8%] top-[-8%] h-[420px] w-[420px]" : "left-[-5%] top-[10%] h-[280px] w-[280px] opacity-50"}`}
      />
      <div
        className={`aurora-orb aurora-orb-b ${dense ? "right-[-5%] top-[12%] h-[380px] w-[380px]" : "right-[-8%] top-[40%] h-[260px] w-[260px] opacity-40"}`}
      />
      <div
        className={`aurora-orb aurora-orb-c ${dense ? "bottom-[-10%] left-[30%] h-[340px] w-[340px]" : "bottom-[5%] left-[40%] h-[200px] w-[200px] opacity-35"}`}
      />

      {dense && (
        <div className="particle-field">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${4 + ((i * 17) % 92)}%`,
                bottom: `${(i * 7) % 30}%`,
                animationDuration: `${10 + (i % 8) * 1.4}s`,
                animationDelay: `${(i % 9) * 0.55}s`,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Soft vignette so content stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-950/80" />
    </div>
  );
}
