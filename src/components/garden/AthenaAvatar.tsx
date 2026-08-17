import { cn } from "@/lib/utils";

export function AthenaAvatar({
  size = 64,
  className,
  animate = true,
}: {
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn(animate && "animate-glow-pulse", className)}
      role="img"
      aria-label="Athena"
    >
      <defs>
        <radialGradient id="athena-core" cx="50%" cy="40%">
          <stop offset="0%" stopColor="oklch(0.95 0.06 120)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="30" fill="url(#athena-core)" />
      <path
        d="M50 22 Q40 8 26 12 Q34 26 50 28 Q66 26 74 12 Q60 8 50 22 Z"
        fill="var(--leaf)"
        opacity="0.9"
      />
      <circle cx="41" cy="50" r="4" fill="oklch(0.25 0.04 150)" />
      <circle cx="59" cy="50" r="4" fill="oklch(0.25 0.04 150)" />
      <path
        d="M42 62 Q50 70 58 62"
        stroke="oklch(0.28 0.04 150)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="26" cy="72" r="3" fill="var(--bloom)" opacity="0.8" />
      <circle cx="76" cy="66" r="2.5" fill="var(--sun)" opacity="0.9" />
    </svg>
  );
}
