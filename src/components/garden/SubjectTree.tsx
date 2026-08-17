import { cn } from "@/lib/utils";

type Props = {
  mastery: number;
  size?: number;
  className?: string;
  seed?: string;
};

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

/** A tree whose shape is derived from real mastery — no static artwork. */
export function SubjectTree({ mastery, size = 160, className, seed = "garden" }: Props) {
  const m = Math.max(0, Math.min(100, mastery));
  const rnd = hash(seed);
  const trunkHeight = 26 + (m / 100) * 46;
  const canopy = 12 + (m / 100) * 30;
  const leafCount = Math.max(3, Math.round((m / 100) * 16) + 3);
  const flowers = m >= 55 ? Math.round(((m - 55) / 45) * 6) + 1 : 0;
  const glow = m >= 95;

  const leaves = Array.from({ length: leafCount }, (_, i) => {
    const angle = ((i * 137 + rnd) % 360) * (Math.PI / 180);
    const radius = canopy * (0.35 + ((i * 29 + rnd) % 60) / 100);
    return {
      cx: 60 + Math.cos(angle) * radius,
      cy: 100 - trunkHeight - Math.sin(angle) * radius * 0.75,
      r: 5 + ((i * 17 + rnd) % 4),
      delay: (i % 5) * 0.4,
    };
  });

  return (
    <svg
      viewBox="0 0 120 110"
      width={size}
      height={size}
      className={cn("overflow-visible", glow && "animate-glow-pulse", className)}
      role="img"
      aria-label={`Learning tree at ${Math.round(m)}% mastery`}
    >
      <ellipse cx="60" cy="102" rx={16 + canopy * 0.5} ry="6" fill="var(--leaf)" opacity="0.18" />
      <g className="animate-sway" style={{ transformOrigin: "60px 102px" }}>
        <path
          d={`M58 102 Q56 ${102 - trunkHeight / 2} 60 ${100 - trunkHeight} Q64 ${102 - trunkHeight / 2} 62 102 Z`}
          fill="var(--bark)"
        />
        {m >= 30 && (
          <>
            <path
              d={`M60 ${100 - trunkHeight * 0.6} L${60 - canopy * 0.5} ${100 - trunkHeight * 0.85}`}
              stroke="var(--bark)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d={`M60 ${100 - trunkHeight * 0.7} L${60 + canopy * 0.55} ${100 - trunkHeight * 0.95}`}
              stroke="var(--bark)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </>
        )}
        {leaves.map((l, i) => (
          <circle
            key={i}
            cx={l.cx}
            cy={l.cy}
            r={l.r}
            fill="var(--leaf)"
            opacity={0.75 + (i % 3) * 0.08}
          />
        ))}
        {Array.from({ length: flowers }, (_, i) => {
          const angle = ((i * 71 + rnd) % 360) * (Math.PI / 180);
          const radius = canopy * 0.8;
          return (
            <circle
              key={`f${i}`}
              cx={60 + Math.cos(angle) * radius}
              cy={100 - trunkHeight - Math.sin(angle) * radius * 0.7}
              r="3"
              fill="var(--bloom)"
            />
          );
        })}
        {m < 10 && (
          <>
            <path
              d="M60 102 Q52 96 54 90 Q60 92 60 100"
              fill="var(--leaf)"
              opacity="0.85"
            />
            <path d="M60 102 Q68 96 66 90 Q60 92 60 100" fill="var(--leaf)" opacity="0.6" />
          </>
        )}
      </g>
      {m >= 70 &&
        Array.from({ length: 2 }, (_, i) => (
          <g key={`b${i}`} className="animate-float-up" style={{ animationDelay: `${i * 1.6}s` }}>
            <circle cx={30 + i * 62} cy={100 - trunkHeight} r="2.4" fill="var(--sun)" />
          </g>
        ))}
    </svg>
  );
}
