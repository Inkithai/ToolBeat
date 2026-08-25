/**
 * Simplified ambient background for Phase 2.
 * Removed excessive decoration (orbs, particles) for cleaner look.
 * Keeps subtle grid for depth.
 */
export default function AmbientBackground({
  variant = "page",
}: {
  variant?: "page" | "hero";
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Subtle grid background - keeps depth without distraction */}
      <div className={`absolute inset-0 bg-grid-fade ${variant === "hero" ? "opacity-100" : "opacity-80"}`} />
      
      {/* Removed: aurora orbs (aurora-orb-a, aurora-orb-b, aurora-orb-c) */}
      {/* Removed: particle-field */}

      {/* Soft vignette so content stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-950/80" />
    </div>
  );
}
