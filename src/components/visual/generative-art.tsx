import type { Art } from "@/lib/types";

/**
 * Deterministic procedural poster art. The same slug, hue and motif always render
 * the same image, so it can be server-rendered and needs no image assets.
 */

function hash(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 800;
const H = 1000;
const r2 = (n: number) => Math.round(n * 10) / 10;

type Ctx = { R: () => number; c: string; c2: string; c3: string; id: string };

function branch({ R, c, c2, id }: Ctx) {
  const out: React.ReactNode[] = [];
  let k = 0;
  const grow = (x: number, y: number, ang: number, len: number, depth: number, w: number) => {
    if (depth === 0 || len < 8) {
      out.push(<circle key={k++} cx={r2(x)} cy={r2(y)} r={2 + R() * 3} fill={c2} filter={`url(#${id}-glow)`} />);
      return;
    }
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    out.push(
      <line key={k++} x1={r2(x)} y1={r2(y)} x2={r2(x2)} y2={r2(y2)} stroke={depth > 5 ? c : c2} strokeWidth={w} strokeLinecap="round" opacity={0.5 + depth / 16} />,
    );
    const n = depth > 5 ? 1 : 2 + (R() > 0.7 ? 1 : 0);
    for (let i = 0; i < n; i++) grow(x2, y2, ang + (R() - 0.5) * 1.1, len * (0.7 + R() * 0.15), depth - 1, w * 0.7);
  };
  grow(W / 2, H * 0.98, -Math.PI / 2, 210, 9, 7);
  grow(W * 0.3, H * 0.98, -Math.PI / 2 - 0.25, 120, 7, 4);
  grow(W * 0.72, H * 0.98, -Math.PI / 2 + 0.3, 120, 7, 4);
  return <g filter={`url(#${id}-soft)`}>{out}</g>;
}

function web({ R, c, c2 }: Ctx) {
  const cx = W * (0.35 + R() * 0.3);
  const cy = H * (0.35 + R() * 0.2);
  const spokes = 18;
  const angles = Array.from({ length: spokes }, (_, i) => (i / spokes) * Math.PI * 2 + R() * 0.12);
  const rings = Array.from({ length: 11 }, (_, i) => 40 + i * i * 9 + R() * 10);
  return (
    <g>
      {angles.map((a, i) => (
        <line key={`s${i}`} x1={cx} y1={cy} x2={r2(cx + Math.cos(a) * 1200)} y2={r2(cy + Math.sin(a) * 1200)} stroke={c} strokeWidth={1.2} opacity={0.55} />
      ))}
      {rings.map((rad, j) => (
        <polygon
          key={`r${j}`}
          points={angles.map((a) => `${r2(cx + Math.cos(a) * rad * (0.92 + R() * 0.16))},${r2(cy + Math.sin(a) * rad * (0.92 + R() * 0.16))}`).join(" ")}
          fill="none"
          stroke={j % 3 === 0 ? c2 : c}
          strokeWidth={j % 3 === 0 ? 1.6 : 0.8}
          opacity={0.75 - j * 0.04}
        />
      ))}
      {/* the tear between worlds */}
      <path
        d={`M ${W * 0.1} ${H * 0.9} ${Array.from({ length: 9 }, (_, i) => `L ${r2(W * 0.1 + (i + 1) * W * 0.09 + (R() - 0.5) * 40)} ${r2(H * 0.9 - (i + 1) * H * 0.09 + (R() - 0.5) * 60)}`).join(" ")}`}
        stroke="#fff"
        strokeWidth={3}
        fill="none"
        opacity={0.85}
      />
    </g>
  );
}

function rings({ R, c, c2, id }: Ctx) {
  const items = Array.from({ length: 26 }, () => ({ x: R() * W, y: R() * H, r: 20 + R() * 120 }));
  return (
    <g>
      {items.map((b, i) => (
        <circle key={i} cx={r2(b.x)} cy={r2(b.y)} r={r2(b.r)} fill="none" stroke={i % 4 === 0 ? c2 : c} strokeWidth={i % 4 === 0 ? 1.6 : 0.8} opacity={0.35 + R() * 0.4} />
      ))}
      <circle cx={W * 0.4} cy={H * 0.48} r={230} fill="none" stroke={c} strokeWidth={3} filter={`url(#${id}-glow)`} />
      <circle cx={W * 0.64} cy={H * 0.52} r={210} fill="none" stroke={c2} strokeWidth={3} filter={`url(#${id}-glow)`} />
      <clipPath id={`${id}-clip`}>
        <circle cx={W * 0.4} cy={H * 0.48} r={230} />
      </clipPath>
      <circle cx={W * 0.64} cy={H * 0.52} r={210} fill="#fff" opacity={0.16} clipPath={`url(#${id}-clip)`} />
    </g>
  );
}

function quantum({ R, c, c2, id }: Ctx) {
  const s = 46;
  const hexes: React.ReactNode[] = [];
  let k = 0;
  for (let row = -1; row < H / (s * 1.5) + 1; row++) {
    for (let col = -1; col < W / (s * Math.sqrt(3)) + 1; col++) {
      const x = col * s * Math.sqrt(3) + (row % 2 ? (s * Math.sqrt(3)) / 2 : 0);
      const y = row * s * 1.5;
      const d = Math.hypot(x - W / 2, y - H * 0.55) / 520;
      const hot = R() > 0.9;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        return `${r2(x + Math.cos(a) * s * 0.9)},${r2(y + Math.sin(a) * s * 0.9)}`;
      }).join(" ");
      hexes.push(
        <polygon key={k++} points={pts} fill={hot ? c2 : "none"} fillOpacity={hot ? 0.35 : 0} stroke={hot ? c2 : c} strokeWidth={hot ? 1.8 : 0.8} opacity={Math.max(0.06, 1 - d)} filter={hot ? `url(#${id}-glow)` : undefined} />,
      );
    }
  }
  return <g>{hexes}</g>;
}

function tree({ R, c, c2, id }: Ctx) {
  const paths: React.ReactNode[] = [];
  const cx = W / 2;
  for (let i = 0; i < 44; i++) {
    const side = i % 2 ? 1 : -1;
    const spread = (0.15 + R() * 0.85) * side;
    const top = H * (0.06 + R() * 0.5);
    const ex = cx + spread * W * 0.55;
    paths.push(
      <path key={`u${i}`} d={`M ${cx} ${H * 0.62} C ${cx} ${r2(H * 0.45)}, ${r2(ex)} ${r2(top + 160)}, ${r2(ex)} ${r2(top)}`} stroke={i % 5 === 0 ? c2 : c} strokeWidth={0.8 + R() * 1.6} fill="none" opacity={0.45 + R() * 0.5} />,
      <circle key={`n${i}`} cx={r2(ex)} cy={r2(top)} r={2 + R() * 3} fill={c2} filter={`url(#${id}-glow)`} />,
    );
  }
  for (let i = 0; i < 12; i++) {
    const ex = cx + (R() - 0.5) * W * 0.8;
    paths.push(<path key={`r${i}`} d={`M ${cx} ${H * 0.62} C ${cx} ${H * 0.75}, ${r2(ex)} ${H * 0.8}, ${r2(ex)} ${H}`} stroke={c} strokeWidth={1} fill="none" opacity={0.35} />);
  }
  paths.push(<circle key="seat" cx={cx} cy={H * 0.62} r={16} fill="#fff" filter={`url(#${id}-glow)`} />);
  return <g>{paths}</g>;
}

function voidM({ R, c, c2, id }: Ctx) {
  const cx = W / 2;
  const cy = H * 0.45;
  const dust = Array.from({ length: 420 }, (_, i) => {
    const t = i / 420;
    const a = t * Math.PI * 9 + R() * 0.5;
    const rad = 210 + t * 420 + R() * 30;
    return <circle key={i} cx={r2(cx + Math.cos(a) * rad)} cy={r2(cy + Math.sin(a) * rad * 0.62)} r={r2(0.6 + R() * 2.2)} fill={i % 7 ? c : c2} opacity={r2(0.9 - t * 0.6)} />;
  });
  return (
    <g>
      {dust}
      <ellipse cx={cx} cy={cy} rx={215} ry={215} fill="none" stroke={c2} strokeWidth={6} filter={`url(#${id}-glow)`} />
      <circle cx={cx} cy={cy} r={205} fill="#000" />
    </g>
  );
}

function shield({ c, c2, id }: Ctx) {
  const cx = W / 2;
  const cy = H * 0.48;
  const star = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? 62 : 150;
    return `${r2(cx + Math.cos(a) * rad)},${r2(cy + Math.sin(a) * rad)}`;
  }).join(" ");
  return (
    <g>
      {[330, 300, 250, 200].map((rad, i) => (
        <circle key={rad} cx={cx} cy={cy} r={rad} fill="none" stroke={i % 2 ? c2 : c} strokeWidth={i === 0 ? 2 : 14 - i * 2} opacity={0.75 - i * 0.1} />
      ))}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        return <line key={i} x1={r2(cx + Math.cos(a) * 345)} y1={r2(cy + Math.sin(a) * 345)} x2={r2(cx + Math.cos(a) * (i % 5 ? 365 : 400))} y2={r2(cy + Math.sin(a) * (i % 5 ? 365 : 400))} stroke={c} strokeWidth={1.4} opacity={0.6} />;
      })}
      <polygon points={star} fill="none" stroke="#fff" strokeWidth={3} filter={`url(#${id}-glow)`} />
    </g>
  );
}

function ship({ R, c, c2, id }: Ctx) {
  const sx = W * 0.62;
  const sy = H * 0.36;
  return (
    <g>
      <path d={`M -100 ${H * 0.82} Q ${W / 2} ${H * 0.62} ${W + 100} ${H * 0.82}`} stroke={c} strokeWidth={2} fill="none" opacity={0.8} filter={`url(#${id}-glow)`} />
      <path d={`M -100 ${H * 0.86} Q ${W / 2} ${H * 0.66} ${W + 100} ${H * 0.86}`} stroke={c} strokeWidth={1} fill="none" opacity={0.35} />
      {Array.from({ length: 34 }, (_, i) => {
        const off = (R() - 0.5) * 70;
        const len = 200 + R() * 500;
        return <line key={i} x1={r2(sx - 20 + off)} y1={r2(sy - 10 + off * 0.5)} x2={r2(sx - len)} y2={r2(sy - len * 0.85 + off)} stroke={i % 4 ? c : c2} strokeWidth={r2(0.5 + R() * 2)} opacity={r2(0.2 + R() * 0.6)} />;
      })}
      <ellipse cx={sx} cy={sy} rx={64} ry={20} fill="#fff" filter={`url(#${id}-glow)`} transform={`rotate(40 ${sx} ${sy})`} />
      <circle cx={sx} cy={sy} r={120} fill="none" stroke={c2} strokeWidth={1} opacity={0.5} strokeDasharray="4 10" />
    </g>
  );
}

function orbit({ R, c, c2, id }: Ctx) {
  const cx = W * 0.5;
  const cy = H * 0.5;
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => {
        const rx = 120 + i * 58;
        const ry = rx * (0.3 + R() * 0.1);
        const rot = -18 + i * 4;
        const a = R() * Math.PI * 2;
        const px = cx + Math.cos(a) * rx;
        const py = cy + Math.sin(a) * ry;
        return (
          <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={r2(ry)} fill="none" stroke={i % 3 ? c : c2} strokeWidth={i % 3 ? 1 : 2} opacity={0.75} />
            <circle cx={r2(px)} cy={r2(py)} r={3 + R() * 7} fill={i % 2 ? c2 : "#fff"} filter={`url(#${id}-glow)`} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={86} fill={`url(#${id}-planet)`} />
      <circle cx={cx} cy={cy} r={86} fill="none" stroke={c2} strokeWidth={2} filter={`url(#${id}-glow)`} />
    </g>
  );
}

function eclipse({ R, c, c2, id }: Ctx) {
  const cx = W / 2;
  const cy = H * 0.46;
  return (
    <g>
      {Array.from({ length: 220 }, (_, i) => {
        const a = (i / 220) * Math.PI * 2 + R() * 0.02;
        const len = 260 + Math.pow(R(), 3) * 420;
        return <line key={i} x1={r2(cx + Math.cos(a) * 225)} y1={r2(cy + Math.sin(a) * 225)} x2={r2(cx + Math.cos(a) * len)} y2={r2(cy + Math.sin(a) * len)} stroke={i % 6 ? c : c2} strokeWidth={r2(0.4 + R() * 1.4)} opacity={r2(0.25 + R() * 0.6)} />;
      })}
      <circle cx={cx} cy={cy} r={232} fill="none" stroke="#fff" strokeWidth={5} filter={`url(#${id}-glow)`} />
      <circle cx={cx} cy={cy} r={224} fill="#020403" />
      <circle cx={cx} cy={cy} r={300} fill="none" stroke={c2} strokeWidth={1} opacity={0.4} strokeDasharray="2 12" />
    </g>
  );
}

const MOTIFS = { branch, web, rings, quantum, tree, void: voidM, shield, ship, orbit, eclipse };

export function GenerativeArt({
  seed,
  art,
  className = "",
  grain = true,
}: {
  seed: string;
  art: Art;
  className?: string;
  grain?: boolean;
}) {
  const R = rng(hash(seed));
  const id = `ga-${seed.replace(/[^a-z0-9]/gi, "")}`;
  const c = `hsl(${art.hue} 85% 58%)`;
  const c2 = `hsl(${(art.hue + 40) % 360} 95% 72%)`;
  const c3 = `hsl(${art.hue} 70% 14%)`;
  const drawMotif = MOTIFS[art.motif];
  const stars = Array.from({ length: 90 }, (_, i) => (
    <circle key={i} cx={r2(R() * W)} cy={r2(R() * H)} r={r2(R() * 1.3)} fill="#fff" opacity={r2(0.2 + R() * 0.6)} />
  ));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden role="presentation">
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor={c3} />
          <stop offset="100%" stopColor="#030504" />
        </radialGradient>
        <radialGradient id={`${id}-planet`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={c2} />
          <stop offset="100%" stopColor="#030504" />
        </radialGradient>
        <radialGradient id={`${id}-vig`} cx="50%" cy="50%" r="70%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {grain && (
          <filter id={`${id}-grain`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0" />
          </filter>
        )}
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <g>{stars}</g>
      {/* Called as a function, not <Motif/>: it must consume the RNG inside this render.
          As a child component, StrictMode double-renders it and drifts the RNG → hydration mismatch. */}
      {drawMotif({ R, c, c2, c3, id })}
      <rect width={W} height={H} fill={`url(#${id}-vig)`} />
      {grain && <rect width={W} height={H} filter={`url(#${id}-grain)`} />}
    </svg>
  );
}
