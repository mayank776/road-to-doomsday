"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ThreadEdge, ThreadNode } from "@/lib/threads";
import type { EvidenceStatus, NodeRef } from "@/lib/types";
import { BasisTag, EvidenceBadge, STATUS_HEX, STATUS_META } from "@/components/evidence";
import { Visual } from "@/components/media/visual";
import { MediaImage } from "@/components/media/media-image";

const KIND = { project: "Film / series", character: "Character", concept: "Concept" } as const;
const EASE = [0.16, 1, 0.3, 1] as const;
const ALL: Record<EvidenceStatus, boolean> = { official: true, trailer: true, canon: true, supported: true, theory: true };

type Link_ = { e: ThreadEdge; other: ThreadNode; dir: "in" | "out" };
type Path = { id: string; d: string; color: string; superseded: boolean };

/** Position of `el` inside `box`, ignoring CSS transforms (so entrance animations don't skew the threads). */
function offsetIn(el: HTMLElement, box: HTMLElement) {
  let x = 0, y = 0, n: HTMLElement | null = el;
  while (n && n !== box) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * One node at a time: its image framed on the left, every documented link
 * fanned out on the right, joined by glowing threads coloured by evidence.
 * Click any linked card to follow the thread.
 */
export function ThreadExplorer({ nodes, edges, initialFocus }: { nodes: ThreadNode[]; edges: ThreadEdge[]; initialFocus: NodeRef }) {
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const [focus, setFocus] = useState<NodeRef>(byId.has(initialFocus) ? initialFocus : nodes[0].id);
  const [trail, setTrail] = useState<NodeRef[]>([]);
  const [visible, setVisible] = useState(ALL);
  const [hover, setHover] = useState<string | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);

  const box = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const strip = useRef<HTMLDivElement>(null);

  const node = byId.get(focus)!;
  const links: Link_[] = useMemo(
    () =>
      edges
        .filter((e) => visible[e.status] && (e.from === focus || e.to === focus))
        .map((e) => ({ e, dir: e.to === focus ? ("in" as const) : ("out" as const), other: byId.get(e.to === focus ? e.from : e.to)! })),
    [edges, visible, focus, byId],
  );
  const groups = [
    { key: "in", title: "Leads here", items: links.filter((l) => l.dir === "in") },
    { key: "out", title: "Leads on to", items: links.filter((l) => l.dir === "out") },
  ].filter((g) => g.items.length);

  const go = useCallback(
    (id: NodeRef) => {
      if (id === focus) return;
      setTrail((t) => [...t.filter((x) => x !== id), focus].slice(-4));
      setFocus(id);
      setHover(null);
    },
    [focus],
  );

  // keep the URL shareable, and the filmstrip on the current node
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("focus", focus);
    window.history.replaceState(null, "", url);
    strip.current?.querySelector<HTMLElement>(`[data-id="${focus}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [focus]);

  // draw the threads from the focus frame to each linked card
  const measure = useCallback(() => {
    const b = box.current, a = anchor.current;
    if (!b || !a || window.innerWidth < 1024) return setPaths([]);
    const A = offsetIn(a, b);
    const x0 = A.x + A.w, y0 = A.y + A.h / 2;
    setPaths(
      links.flatMap(({ e }) => {
        const el = cards.current.get(e.id);
        if (!el) return [];
        const C = offsetIn(el, b);
        const x1 = C.x - 6, y1 = C.y + C.h / 2, mx = (x0 + x1) / 2;
        return [{ id: e.id, d: `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`, color: STATUS_HEX[e.status], superseded: !!e.superseded }];
      }),
    );
  }, [links]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="relative isolate [overflow-x:clip]">
      {/* wash of the focused image */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[90svh] overflow-hidden" aria-hidden>
        <AnimatePresence>
          {node.image && (
            <motion.div key={node.id} className="absolute inset-0 scale-110 blur-3xl saturate-150" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <MediaImage m={node.image} sizes="50vw" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/60 to-ink" />
      </div>

      {/* controls: evidence filter + jump strip */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(ALL) as EvidenceStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setVisible((v) => ({ ...v, [s]: !v[s] }))}
            aria-pressed={visible[s]}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
              visible[s] ? "border-white/20 bg-black/50 text-white" : "border-white/10 text-white/30 line-through"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_HEX[s], boxShadow: visible[s] ? `0 0 10px ${STATUS_HEX[s]}` : undefined }} />
            {STATUS_META[s].short}
          </button>
        ))}
      </div>

      <div ref={strip} className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-3 sm:-mx-8 sm:px-8" data-lenis-prevent aria-label="Jump to">
        {nodes.map((n) => (
          <button
            key={n.id}
            data-id={n.id}
            onClick={() => go(n.id)}
            title={n.label}
            aria-current={n.id === focus}
            className={`group relative h-20 w-14 shrink-0 overflow-hidden border transition sm:h-24 sm:w-[68px] ${
              n.id === focus ? "border-doom-bright shadow-[0_0_20px_-4px_#7dffb0]" : "border-white/10 opacity-60 hover:opacity-100"
            }`}
          >
            <Visual media={n.image} seed={n.id} art={n.art} sizes="68px" grain={false} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent px-1 pb-1 pt-4 text-left font-mono text-[8px] uppercase leading-tight text-white/80">
              {n.label}
            </span>
          </button>
        ))}
      </div>

      {trail.length > 0 && (
        <nav className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40" aria-label="Your path">
          <span>Path</span>
          {trail.map((id) => (
            <button key={id} onClick={() => go(id)} className="hover:text-white">
              {byId.get(id)?.label} →
            </button>
          ))}
          <span className="text-doom-bright">{node.label}</span>
        </nav>
      )}

      {/* the board */}
      <div ref={box} className="relative mt-10 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-28">
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block" aria-hidden>
          <defs>
            <filter id="thread-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {paths.map((p, i) => {
            const dim = hover && hover !== p.id;
            return (
              <g key={`${focus}-${p.id}`} opacity={dim ? 0.15 : p.superseded ? 0.4 : 1} style={{ transition: "opacity .3s" }}>
                <motion.path
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={hover === p.id ? 2.5 : 1.5}
                  filter="url(#thread-glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.06, ease: EASE }}
                />
                <path d={p.d} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="2 14" className="animate-[dashflow_1.6s_linear_infinite]" />
              </g>
            );
          })}
        </svg>

        {/* focus */}
        <div className="lg:self-start">
          <AnimatePresence mode="wait">
            <motion.div key={node.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5, ease: EASE }} onAnimationComplete={measure}>
              <div className="flex gap-5 lg:block">
                <div ref={anchor} className="relative aspect-[3/4] w-32 shrink-0 overflow-hidden border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:w-44 lg:w-full lg:max-w-[420px]">
                  <Visual media={node.image} seed={node.id} art={node.art} sizes="(min-width: 1024px) 30vw, 176px" priority />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                </div>
                <div className="min-w-0 lg:mt-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-doom-bright">{KIND[node.kind]}</p>
                  <h2 className="mt-1 font-display text-4xl uppercase leading-[0.9] sm:text-6xl">{node.label}</h2>
                  {node.sub && <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{node.sub}</p>}
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                    {links.length} of {node.degree} thread{node.degree === 1 ? "" : "s"} shown
                  </p>
                  {node.href && (
                    <Link href={node.href} className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
                      Open the file →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* links */}
        <div className="min-w-0 space-y-10">
          {groups.length === 0 && <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">No threads at the selected evidence levels.</p>}
          {groups.map((g) => (
            <section key={g.key}>
              <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                {g.title} · {g.items.length}
              </h3>
              <ul className="space-y-3">
                {g.items.map(({ e, other }, i) => (
                  <motion.li
                    key={`${focus}-${e.id}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: EASE }}
                  >
                    <button
                      ref={(el) => {
                        if (el) cards.current.set(e.id, el);
                        else cards.current.delete(e.id);
                      }}
                      onClick={() => go(other.id)}
                      onMouseEnter={() => setHover(e.id)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(e.id)}
                      onBlur={() => setHover(null)}
                      className="group flex w-full gap-4 border border-l-2 border-white/10 bg-black/40 p-3 text-left backdrop-blur transition hover:border-white/25 hover:bg-white/[0.04]"
                      style={{ borderLeftColor: STATUS_HEX[e.status] }}
                    >
                      <span className="relative h-24 w-[72px] shrink-0 overflow-hidden border border-white/10">
                        <Visual media={other.image} seed={other.id} art={other.art} sizes="72px" grain={false} className="transition duration-700 group-hover:scale-110" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <EvidenceBadge status={e.status} short />
                          <BasisTag basis={e.basis} />
                          {e.superseded && <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Superseded</span>}
                        </span>
                        <span className={`mt-1.5 block font-display text-2xl uppercase leading-none group-hover:text-doom-bright ${e.superseded ? "text-white/50 line-through decoration-1" : ""}`}>
                          {other.label}
                        </span>
                        <span className="mt-1.5 block text-sm leading-snug text-white/70">{e.reason}</span>
                        {e.citation && <span className="mt-1 block font-mono text-[10px] text-white/35">{e.citation}</span>}
                        {e.superseded && <span className="mt-1 block font-mono text-[10px] text-white/45">{e.superseded.note}</span>}
                      </span>
                      <span className="self-center font-mono text-white/30 transition group-hover:translate-x-1 group-hover:text-doom-bright" aria-hidden>
                        →
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
