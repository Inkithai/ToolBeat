"use client";

import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";

/**
 * ToolBeat Visual Motif - Phase 4
 * 
 * Creates a recognizable visual signature for ToolBeat.
 * Uses a modular pulse concept that represents tools connecting together.
 */

// Modular block configuration
const MOTIF_BLOCKS = [
  { id: 1, x: 0, y: 0, size: 20, color: "indigo", delay: 0 },
  { id: 2, x: 25, y: 0, size: 15, color: "indigo", delay: 0.1 },
  { id: 3, x: 45, y: 0, size: 18, color: "indigo", delay: 0.2 },
  { id: 4, x: 0, y: 22, size: 16, color: "indigo", delay: 0.3 },
  { id: 5, x: 20, y: 22, size: 22, color: "indigo", delay: 0.4 },
  { id: 6, x: 42, y: 22, size: 14, color: "indigo", delay: 0.5 },
];

// Pulse line configuration
const PULSE_LINES = [
  { id: 1, x1: 12.5, y1: 10, x2: 32.5, y2: 10, delay: 0.5 },
  { id: 2, x1: 52, y1: 10, x2: 52, y2: 30, delay: 0.7 },
  { id: 3, x1: 12.5, y1: 33, x2: 49, y2: 33, delay: 0.9 },
];

// Main motif component
interface ToolbeatMotifProps {
  variant?: "large" | "medium" | "small";
  animate?: boolean;
  className?: string;
}

export default function ToolbeatMotif({
  variant = "medium",
  animate = true,
  className = "",
}: ToolbeatMotifProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Scale based on variant
  const scaleMap = {
    large: 2,
    medium: 1,
    small: 0.5,
  };
  const scale = scaleMap[variant];

  // Check if in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".toolbeat-motif-block, .toolbeat-motif-line");
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);



  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ transform: `scale(${scale})` }}>
      <svg
        className="absolute inset-0"
        viewBox="0 0 65 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Modular blocks */}
        {MOTIF_BLOCKS.map((block) => (
          <rect
            key={block.id}
            x={block.x}
            y={block.y}
            width={block.size}
            height={block.size}
            rx={2}
            fill={`url(#block-gradient-${block.id})`}
            className={`toolbeat-motif-block transition-opacity duration-500 ${animate ? 'opacity-0' : 'opacity-100'}`}
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${block.delay}s`,
            }}
          />
        ))}

        {/* Pulse lines */}
        {PULSE_LINES.map((line) => (
          <path
            key={line.id}
            d={`M${line.x1} ${line.y1} L${line.x2} ${line.y2}`}
            stroke="url(#pulse-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            className={`toolbeat-motif-line transition-opacity duration-500 ${animate ? 'opacity-0' : 'opacity-100'}`}
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${line.delay}s`,
            }}
          >
            {animate && isVisible && (
              <animate
                attributeName="stroke-dashoffset"
                from="200"
                to="0"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </path>
        ))}

        {/* Gradients */}
        <defs>
          {MOTIF_BLOCKS.map((block) => (
            <linearGradient
              key={`grad-${block.id}`}
              id={`block-gradient-${block.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
            </linearGradient>
          ))}
          <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Optional logo overlay for large variant */}
      {variant === "large" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Wrench className="h-8 w-8 text-indigo-400/50" />
        </div>
      )}
    </div>
  );
}

// Loading state component using motif
export function ToolbeatMotifLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative">
        <ToolbeatMotif variant="medium" animate />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
        </div>
      </div>
    </div>
  );
}

// Empty state component using motif
export function ToolbeatMotifEmpty({ message = "No items found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <ToolbeatMotif variant="medium" />
      </div>
      <p className="text-sm text-ink-400">{message}</p>
    </div>
  );
}

// Decorative background pattern
export function ToolbeatMotifBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 gap-16 h-full w-full">
          {[...Array(24)].map((_, i) => (
            <ToolbeatMotif key={i} variant="small" animate={false} className="opacity-30" />
          ))}
        </div>
      </div>
    </div>
  );
}
