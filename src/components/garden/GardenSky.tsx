import { useEffect, useState, type ReactNode } from "react";
import { dayPart, type DayPart } from "@/lib/athena";
import { cn } from "@/lib/utils";

const SKIES: Record<DayPart, { gradient: string; label: string }> = {
  morning: {
    gradient:
      "linear-gradient(180deg, oklch(0.93 0.07 75) 0%, oklch(0.95 0.05 120) 55%, oklch(0.9 0.08 140) 100%)",
    label: "Sunrise • flowers opening",
  },
  afternoon: {
    gradient:
      "linear-gradient(180deg, oklch(0.9 0.08 230) 0%, oklch(0.95 0.05 180) 50%, oklch(0.92 0.08 140) 100%)",
    label: "Bright sky • butterflies",
  },
  evening: {
    gradient:
      "linear-gradient(180deg, oklch(0.82 0.13 55) 0%, oklch(0.86 0.1 80) 50%, oklch(0.83 0.09 120) 100%)",
    label: "Golden sunset",
  },
  night: {
    gradient:
      "linear-gradient(180deg, oklch(0.28 0.06 265) 0%, oklch(0.33 0.06 230) 55%, oklch(0.34 0.05 160) 100%)",
    label: "Moonlight • fireflies",
  },
};

export function useDayPart() {
  const [part, setPart] = useState<DayPart>("morning");
  useEffect(() => {
    setPart(dayPart());
    const id = setInterval(() => setPart(dayPart()), 60000);
    return () => clearInterval(id);
  }, []);
  return part;
}

export function GardenSky({
  children,
  className,
  part,
}: {
  children?: ReactNode;
  className?: string;
  part?: DayPart;
}) {
  const detected = useDayPart();
  const active = part ?? detected;
  const sky = SKIES[active];
  const night = active === "night";

  return (
    <div
      className={cn("relative overflow-hidden rounded-b-[2.5rem]", className)}
      style={{ background: sky.gradient }}
    >
      {/* sun / moon */}
      <div
        className="absolute right-8 top-6 h-14 w-14 rounded-full blur-[1px]"
        style={{
          background: night
            ? "radial-gradient(circle, oklch(0.98 0.02 250) 0%, oklch(0.9 0.03 250 / 0.2) 70%)"
            : "radial-gradient(circle, oklch(0.97 0.13 90) 0%, oklch(0.9 0.15 80 / 0.25) 70%)",
        }}
      />
      {/* stars / fireflies / butterflies */}
      {Array.from({ length: night ? 16 : 8 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "absolute rounded-full",
            night ? "animate-glow-pulse" : "animate-float-up",
          )}
          style={{
            left: `${(i * 37) % 95}%`,
            top: `${10 + ((i * 23) % 65)}%`,
            width: night ? 3 : 5,
            height: night ? 3 : 5,
            background: night ? "oklch(0.95 0.12 100)" : "oklch(0.85 0.12 20 / 0.85)",
            animationDelay: `${(i % 6) * 0.7}s`,
          }}
        />
      ))}
      {/* hills */}
      <svg
        viewBox="0 0 400 80"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 Q80 20 160 55 Q240 85 320 45 Q370 25 400 50 L400 80 L0 80 Z"
          fill="var(--leaf)"
          opacity="0.35"
        />
        <path
          d="M0 70 Q100 45 200 68 Q300 88 400 62 L400 80 L0 80 Z"
          fill="var(--leaf)"
          opacity="0.55"
        />
      </svg>
      <div className="relative">{children}</div>
      <span className="absolute bottom-2 right-4 text-[10px] uppercase tracking-widest text-foreground/50">
        {sky.label}
      </span>
    </div>
  );
}
