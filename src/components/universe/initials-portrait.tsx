/**
 * Procedural character portrait: a deterministic emblem from the name and the
 * universe colour. No likenesses, no image assets.
 */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function initials(name: string) {
  const base = name.split("·")[0].trim().replace(/[^A-Za-z' ]/g, "");
  const parts = base.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

export function InitialsPortrait({ name, color, size = 56, dim = false }: { name: string; color: string; size?: number; dim?: boolean }) {
  const h = hash(name);
  const id = `pt${h.toString(36)}`;
  const spokes = 3 + (h % 5);
  const rot = h % 360;
  const ring = 0.62 + ((h >> 4) % 20) / 100;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className={dim ? "opacity-40" : ""}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#050706" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id})`} stroke={color} strokeOpacity="0.6" strokeWidth="1.5" />
      <g transform={`rotate(${rot} 50 50)`} stroke={color} strokeOpacity="0.35" strokeWidth="1">
        {Array.from({ length: spokes }, (_, i) => {
          const a = (i / spokes) * Math.PI * 2;
          return <line key={i} x1="50" y1="50" x2={Math.round(50 + Math.cos(a) * 48)} y2={Math.round(50 + Math.sin(a) * 48)} />;
        })}
      </g>
      <circle cx="50" cy="50" r={Math.round(48 * ring)} fill="none" stroke={color} strokeOpacity="0.5" strokeDasharray="2 4" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#eef3ef" fontFamily="var(--font-anton), Impact, sans-serif" fontSize="34">
        {initials(name)}
      </text>
    </svg>
  );
}
