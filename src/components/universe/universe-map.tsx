"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Atlas, AtlasUniverse } from "@/lib/atlas";
import type { Claim, Crossing, EvidenceStatus } from "@/lib/types";
import { EvidenceBadge, STATUS_HEX, STATUS_META } from "@/components/evidence";
import { Visual } from "@/components/media/visual";
import { MediaImage } from "@/components/media/media-image";
import { Portrait } from "./portrait";

/* ---------- layout ---------- */

type Layout = {
  vb: { w: number; h: number };
  pos: Record<string, [number, number]>;
  doom: [number, number];
  bow: number;
  /** font sizes in viewBox units */
  fs: { chip: number; name: number; sub: number; periName: number; periSub: number };
};

const WIDE: Layout = {
  vb: { w: 1000, h: 690 },
  pos: {
    "earth-616": [260, 225],
    "earth-828": [740, 225],
    "earth-10005": [500, 545],
    "earth-838": [80, 62],
    "earth-1127": [915, 595],
  },
  doom: [500, 335],
  bow: 70,
  fs: { chip: 11, name: 26, sub: 11, periName: 15, periSub: 9 },
};

/** Portrait layout for phones: worlds stacked, type scaled up so it stays legible. */
const TALL: Layout = {
  vb: { w: 600, h: 1000 },
  pos: {
    "earth-616": [300, 215],
    "earth-828": [150, 655],
    "earth-10005": [450, 655],
    "earth-838": [82, 64],
    "earth-1127": [300, 900],
  },
  doom: [300, 445],
  bow: 110,
  fs: { chip: 17, name: 30, sub: 15, periName: 22, periSub: 13 },
};

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

const R = { central: 84, peripheral: 38 };
const RANK: EvidenceStatus[] = ["official", "trailer", "canon", "supported", "theory"];

/** The strongest evidence behind a crossing sets its colour. */
const strongest = (claims: Claim[]) => RANK.find((s) => claims.some((c) => c.status === s)) ?? "theory";

/** Curve between two worlds, bowed away from Doom so links never cross the centre. */
function curve(a: [number, number], b: [number, number], L: Layout) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = mx - L.doom[0];
  const dy = my - L.doom[1];
  const len = Math.hypot(dx, dy) || 1;
  const bow = L.bow;
  const cx = Math.round(mx + (dx / len) * bow);
  const cy = Math.round(my + (dy / len) * bow);
  // midpoint of the quadratic curve, for the label
  const lx = Math.round(0.25 * a[0] + 0.5 * cx + 0.25 * b[0]);
  const ly = Math.round(0.25 * a[1] + 0.5 * cy + 0.25 * b[1]);
  return { d: `M ${a[0]} ${a[1]} Q ${cx} ${cy} ${b[0]} ${b[1]}`, lx, ly };
}

type Sel = { kind: "universe"; slug: string } | { kind: "crossing"; id: string } | { kind: "doom" };

/* ---------- map ---------- */

export function UniverseMap({ atlas }: { atlas: Atlas }) {
  const [sel, setSel] = useState<Sel>({ kind: "universe", slug: "earth-616" });
  const L = useNarrow() ? TALL : WIDE;
  const { vb: VB, pos: POS, doom: DOOM } = L;
  const byId = useMemo(() => new Map(atlas.universes.map((u) => [u.slug, u])), [atlas]);
  const central = atlas.universes.filter((u) => u.role === "central");
  const isSel = (s: Sel) => JSON.stringify(s) === JSON.stringify(sel);
  const selKey = sel.kind === "universe" ? sel.slug : sel.kind === "crossing" ? sel.id : "doom";

  const keyAct = (s: Sel) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSel(s);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        {/* quick switcher: easier than tapping orbs on a phone */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Universes">
          {atlas.universes.map((u) => {
            const on = sel.kind === "universe" && sel.slug === u.slug;
            return (
              <button
                key={u.slug}
                role="tab"
                aria-selected={on}
                onClick={() => setSel({ kind: "universe", slug: u.slug })}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                  on ? "border-white/40 bg-white/10 text-white" : "border-line text-white/50 hover:text-white"
                } ${u.role === "peripheral" ? "border-dashed" : ""}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: u.color, boxShadow: `0 0 8px ${u.color}` }} />
                {u.designation}
              </button>
            );
          })}
        </div>

        <div className="relative overflow-hidden border border-line bg-[radial-gradient(ellipse_at_50%_50%,#0c1410,#040605_70%)]">
          <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="block h-auto w-full" role="group" aria-label="Map of Doomsday's universes">
            <defs>
              {atlas.universes.map((u) => (
                <radialGradient key={u.slug} id={`g-${u.slug}`} cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor={u.color} stopOpacity="0.95" />
                  <stop offset="55%" stopColor={u.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#040605" stopOpacity="0.9" />
                </radialGradient>
              ))}
              <radialGradient id="g-halo">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* faint star dust */}
            {Array.from({ length: 70 }, (_, i) => (
              <circle key={i} cx={(i * 137.5) % VB.w} cy={(i * 89.3 + 40) % VB.h} r={i % 9 === 0 ? 1.4 : 0.7} fill="#fff" opacity={0.25} />
            ))}

            {/* Doom's reach into each of the three worlds */}
            {central.map((u) => (
              <line
                key={u.slug}
                x1={DOOM[0]}
                y1={DOOM[1]}
                x2={POS[u.slug][0]}
                y2={POS[u.slug][1]}
                stroke="#3dff8f"
                strokeOpacity={sel.kind === "doom" ? 0.7 : 0.22}
                strokeWidth={1.5}
                strokeDasharray="3 9"
                className="animate-[dashflow_3s_linear_infinite]"
              />
            ))}

            {/* crossing lines sit under the worlds… */}
            {atlas.crossings.map((x) => {
              const st = strongest(x.evidence);
              const { d } = curve(POS[x.from], POS[x.to], L);
              const on = isSel({ kind: "crossing", id: x.id });
              return (
                <g key={x.id} onClick={() => setSel({ kind: "crossing", id: x.id })} className="cursor-pointer">
                  <path d={d} stroke="transparent" strokeWidth={26} fill="none" />
                  <path
                    d={d}
                    stroke={STATUS_HEX[st]}
                    strokeOpacity={on ? 1 : 0.55}
                    strokeWidth={on ? 3 : 1.8}
                    fill="none"
                    strokeDasharray={st === "supported" || st === "theory" ? "8 8" : "2 10"}
                    className="animate-[dashflow_2.4s_linear_infinite]"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* universes */}
            {atlas.universes.map((u) => (
              <World key={u.slug} u={u} L={L} on={isSel({ kind: "universe", slug: u.slug })} onSelect={() => setSel({ kind: "universe", slug: u.slug })} onKey={keyAct({ kind: "universe", slug: u.slug })} />
            ))}

            {/* …and their labels sit on top, clamped inside the frame */}
            {atlas.crossings.map((x) => {
              const st = strongest(x.evidence);
              const col = STATUS_HEX[st];
              const { lx, ly } = curve(POS[x.from], POS[x.to], L);
              const on = isSel({ kind: "crossing", id: x.id });
              const text = x.short ?? x.label;
              const f = L.fs.chip;
              const w = Math.round(text.length * f * 0.6 + f * 2);
              const h = Math.round(f * 2.2);
              const cx = Math.min(Math.max(lx, w / 2 + 6), VB.w - w / 2 - 6);
              return (
                <g
                  key={x.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${x.label}: ${STATUS_META[st].label}`}
                  onClick={() => setSel({ kind: "crossing", id: x.id })}
                  onKeyDown={keyAct({ kind: "crossing", id: x.id })}
                  className="cursor-pointer outline-none [&:focus-visible_rect]:stroke-white"
                >
                  <rect x={cx - w / 2} y={ly - h / 2} width={w} height={h} rx={h / 2} fill="#060908" stroke={col} strokeOpacity={on ? 0.95 : 0.45} />
                  <text x={cx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={f} fill={on ? "#fff" : "#c9d3cc"} fontFamily="var(--font-jbm), monospace">
                    {text}
                  </text>
                </g>
              );
            })}

            {/* Doom at the centre of it all */}
            <g
              role="button"
              tabIndex={0}
              aria-label="Doctor Doom"
              onClick={() => setSel({ kind: "doom" })}
              onKeyDown={keyAct({ kind: "doom" })}
              className="cursor-pointer outline-none"
            >
              <circle cx={DOOM[0]} cy={DOOM[1]} r={64} fill="url(#g-halo)" />
              <polygon
                points={Array.from({ length: 6 }, (_, i) => {
                  const a = (Math.PI / 3) * i + Math.PI / 6;
                  return `${Math.round(DOOM[0] + Math.cos(a) * 40)},${Math.round(DOOM[1] + Math.sin(a) * 40)}`;
                }).join(" ")}
                fill="#07140d"
                stroke="#3dff8f"
                strokeWidth={sel.kind === "doom" ? 3 : 1.6}
              />
              <text x={DOOM[0]} y={DOOM[1] + 2} textAnchor="middle" dominantBaseline="middle" fill="#7dffb0" fontSize="20" fontFamily="var(--font-anton), Impact, sans-serif" letterSpacing="2">
                DOOM
              </text>
            </g>
          </svg>

        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50 sm:text-[10px]">
            {RANK.slice(0, 4).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="h-0.5 w-4" style={{ background: STATUS_HEX[s] }} />
                {STATUS_META[s].short}
              </span>
            ))}
            <span className="text-white/30">· dashed = not confirmed</span>
        </div>
      </div>

      <div className="min-h-[420px] min-w-0" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={selKey}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {sel.kind === "universe" && <UniversePanel u={byId.get(sel.slug)!} />}
            {sel.kind === "crossing" && <CrossingPanel x={atlas.crossings.find((c) => c.id === sel.id)!} byId={byId} />}
            {sel.kind === "doom" && <DoomPanel doom={atlas.doom} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function World({ u, L, on, onSelect, onKey }: { u: AtlasUniverse; L: Layout; on: boolean; onSelect: () => void; onKey: (e: React.KeyboardEvent) => void }) {
  const [x, y] = L.pos[u.slug];
  const fs = L.fs;
  const r = R[u.role];
  const peripheral = u.role === "peripheral";
  const origin = { transformOrigin: `${x}px ${y}px`, transformBox: "view-box" as const };
  return (
    <g role="button" tabIndex={0} aria-label={`${u.designation}, ${u.name}`} aria-pressed={on} onClick={onSelect} onKeyDown={onKey} className="group cursor-pointer outline-none">
      <circle cx={x} cy={y} r={r * 1.9} fill={u.color} opacity={on ? 0.1 : 0.04} className="transition-opacity duration-500" />
      {/* slow orbit rings */}
      <g style={origin} className="animate-[spin_60s_linear_infinite]">
        <circle cx={x} cy={y} r={r * 1.35} fill="none" stroke={u.color} strokeOpacity={on ? 0.7 : 0.3} strokeDasharray={peripheral ? "3 7" : "1 6"} />
        {!peripheral && <circle cx={x + r * 1.35} cy={y} r={4} fill={u.color} />}
      </g>
      <g style={origin} className="animate-[spin_90s_linear_infinite_reverse]">
        <circle cx={x} cy={y} r={r * 1.15} fill="none" stroke={u.color} strokeOpacity={0.18} strokeDasharray="20 14" />
      </g>
      <g style={origin} className={`transition-transform duration-500 ${on ? "scale-[1.06]" : "group-hover:scale-[1.03]"}`}>
        <circle cx={x} cy={y} r={r} fill={`url(#g-${u.slug})`} stroke={u.color} strokeWidth={on ? 2.5 : 1.2} strokeDasharray={peripheral ? "4 5" : undefined} />
        {/* latitude bands give the orb volume */}
        {!peripheral &&
          [-0.45, 0, 0.45].map((k) => <ellipse key={k} cx={x} cy={y + k * r} rx={r * Math.sqrt(1 - k * k)} ry={r * 0.12} fill="none" stroke="#fff" strokeOpacity={0.08} />)}
      </g>
      <text x={x} y={y + r + (peripheral ? fs.periName + 6 : fs.name + 8)} textAnchor="middle" fill={on ? "#fff" : "#dfe6e1"} fontSize={peripheral ? fs.periName : fs.name} fontFamily="var(--font-anton), Impact, sans-serif" letterSpacing="1">
        {u.designation.toUpperCase()}
      </text>
      <text x={x} y={y + r + (peripheral ? fs.periName + fs.periSub + 12 : fs.name + fs.sub + 16)} textAnchor="middle" fill={u.color} fillOpacity={0.85} fontSize={peripheral ? fs.periSub : fs.sub} fontFamily="var(--font-jbm), monospace" letterSpacing="1.5">
        {peripheral ? "PERIPHERAL" : u.name.toUpperCase()}
      </text>
    </g>
  );
}

/* ---------- panels ---------- */

function MiniClaim({ c }: { c: Claim }) {
  return (
    <li className="border-l-2 py-1 pl-3" style={{ borderColor: STATUS_HEX[c.status] }}>
      <EvidenceBadge status={c.status} short />
      <p className="mt-1.5 text-sm leading-snug text-text/90">{c.text}</p>
      {c.citation && <p className="mt-1 font-mono text-[10px] text-faint">{c.citation}</p>}
      {c.note && <p className="mt-1 text-xs italic text-muted">{c.note}</p>}
    </li>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-faint">{children}</p>;
}

function UniversePanel({ u }: { u: AtlasUniverse }) {
  return (
    <article className="overflow-hidden border border-line bg-surface/70 p-5 sm:p-6" style={{ boxShadow: `inset 0 3px 0 ${u.color}` }}>
      {u.cover && (
        <div className="relative -mx-5 -mt-5 mb-5 h-40 sm:-mx-6 sm:-mt-6 sm:h-52">
          <MediaImage m={u.cover} sizes="(min-width: 1024px) 40vw, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: u.color }} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: u.color }}>
          {u.role === "central" ? "One of three Doomsday universes" : "Peripheral · not presented as a Doomsday universe"}
        </span>
      </div>
      <h3 className="mt-2 font-display text-6xl uppercase leading-none sm:text-7xl" style={{ color: u.color }}>
        {u.designation}
      </h3>
      <p className="mt-1 font-display text-2xl uppercase">{u.name}</p>
      <p className="mt-2 text-sm text-muted">{u.tagline}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] text-faint">
        <span>Designation:</span>
        <EvidenceBadge status={u.designationStatus} short />
        <span>{u.designationSource}</span>
      </div>

      {u.teams.length > 0 && (
        <section className="mt-6">
          <PanelLabel>Who&apos;s here · {u.castCount} in the official cast</PanelLabel>
          <div className="space-y-5">
            {u.teams.map((t) => (
              <div key={t.slug}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="font-display text-xl uppercase">{t.name}</h4>
                  {t.universeStatus && (
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
                      universe: <EvidenceBadge status={t.universeStatus} short />
                    </span>
                  )}
                </div>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {t.members.map((m) => {
                    const body = (
                      <>
                        {m.portrait ? (
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10">
                            <MediaImage m={m.portrait} sizes="40px" />
                          </span>
                        ) : (
                          <Portrait name={m.name} color={u.color} size={40} />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold leading-tight">{m.name.split("·")[0].trim()}</span>
                          <span className="block truncate font-mono text-[10px] text-faint">{m.actor}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={m.name} title={m.note ?? `${m.name}: ${m.actor}`}>
                        {m.href ? (
                          <Link href={m.href} className="flex items-center gap-2 rounded-md p-1 transition hover:bg-white/5">
                            {body}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 p-1">{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] text-faint">Cast: marvel.com official list, 5 Nov 2026</p>
        </section>
      )}

      <section className="mt-6">
        <PanelLabel>What we know</PanelLabel>
        <ul className="space-y-3">
          {u.facts.map((c) => (
            <MiniClaim key={c.text} c={c} />
          ))}
        </ul>
      </section>

      {u.projects.length > 0 && (
        <section className="mt-6">
          <PanelLabel>Watch</PanelLabel>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {u.projects.map((p) => (
              <Link key={p.slug} href={`/timeline/${p.slug}`} className="group relative h-28 w-20 shrink-0 overflow-hidden border border-line">
                <Visual media={p.cover} seed={p.slug} art={p.art} sizes="80px" className="transition duration-700 group-hover:scale-110" grain={false} />
                <span className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute inset-x-1 bottom-1 font-display text-[11px] uppercase leading-tight">{p.title}</span>
                <span className="absolute left-1 top-1 font-mono text-[9px] text-white/70">{p.year}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {u.unknowns.length > 0 && (
        <section className="mt-6">
          <PanelLabel>Still unknown</PanelLabel>
          <ul className="space-y-1.5">
            {u.unknowns.map((q) => (
              <li key={q} className="flex gap-2 text-sm text-muted">
                <span className="font-display text-doom-bright">?</span>
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function CrossingPanel({ x, byId }: { x: Crossing; byId: Map<string, AtlasUniverse> }) {
  const a = byId.get(x.from)!;
  const b = byId.get(x.to)!;
  return (
    <article className="border border-line bg-surface/70 p-5 sm:p-6">
      <PanelLabel>Crossing</PanelLabel>
      <div className="flex items-center gap-3 font-display text-3xl uppercase">
        <span style={{ color: a.color }}>{a.designation}</span>
        <span className="text-faint">⇄</span>
        <span style={{ color: b.color }}>{b.designation}</span>
      </div>
      <h3 className="mt-3 font-display text-4xl uppercase leading-none">{x.label}</h3>
      <ul className="mt-6 space-y-3">
        {x.evidence.map((c) => (
          <MiniClaim key={c.text} c={c} />
        ))}
      </ul>
    </article>
  );
}

function DoomPanel({ doom }: { doom: Atlas["doom"] }) {
  return (
    <article className="border border-doom/50 bg-surface/70 p-5 sm:p-6" style={{ boxShadow: "inset 0 3px 0 #3dff8f" }}>
      <PanelLabel>The threat to all three</PanelLabel>
      <h3 className="font-display text-6xl uppercase leading-none text-doom-bright">{doom.name}</h3>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">{doom.actor}</p>
      <ul className="mt-6 space-y-3">
        {doom.facts.map((c) => (
          <MiniClaim key={c.text} c={c} />
        ))}
      </ul>
      <p className="mt-5 flex gap-2 text-sm text-muted">
        <span className="font-display text-doom-bright">?</span>
        His home universe has not been established on screen.
      </p>
      <Link href={doom.href} className="mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
        Open the dossier →
      </Link>
    </article>
  );
}
