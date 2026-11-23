"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { GEdge, GNode } from "@/lib/graph";
import type { EvidenceStatus } from "@/lib/types";
import { BasisTag, EvidenceBadge, STATUS_HEX, STATUS_META } from "@/components/evidence";

const Constellation = dynamic(() => import("@/components/three/constellation"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle,#0c2417,#040605_60%)]" />,
});

export function ConstellationExplorer({
  nodes,
  edges,
  initialFocus,
  full = false,
}: {
  nodes: GNode[];
  edges: GEdge[];
  initialFocus?: string | null;
  full?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(initialFocus && nodes.some((n) => n.id === initialFocus) ? initialFocus : null);
  const [visible, setVisible] = useState<Record<EvidenceStatus, boolean>>({ confirmed: true, supported: true, theory: true });
  const shown = useMemo(() => edges.filter((e) => visible[e.status]), [edges, visible]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const sel = selected ? byId.get(selected) : null;
  const selEdges = selected ? shown.filter((e) => e.from === selected || e.to === selected) : [];

  return (
    <div className="absolute inset-0">
      <Constellation nodes={nodes} edges={shown} selected={selected} onSelect={setSelected} zoom={full} />

      {/* filter chips */}
      <div className="absolute left-4 top-20 z-10 flex flex-wrap gap-2 sm:left-8 sm:top-24">
        {(Object.keys(visible) as EvidenceStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setVisible((v) => ({ ...v, [s]: !v[s] }))}
            aria-pressed={visible[s]}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur transition ${
              visible[s] ? "border-white/20 bg-black/50 text-white" : "border-white/10 bg-black/20 text-white/30 line-through"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_HEX[s], boxShadow: visible[s] ? `0 0 10px ${STATUS_HEX[s]}` : undefined }} />
            {STATUS_META[s].short}
          </button>
        ))}
      </div>

      {!sel && (
        <p className="pointer-events-none absolute bottom-6 left-4 z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 sm:left-8">
          Drag to orbit · {full ? "Scroll to zoom · " : ""}Tap a star to see its evidence
        </p>
      )}

      <AnimatePresence>
        {sel && (
          <motion.aside
            key={sel.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 bottom-3 z-20 max-h-[55%] overflow-y-auto border border-white/10 bg-black/75 p-4 backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-24 sm:max-h-none sm:w-[360px]"
            data-lenis-prevent
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-doom-bright">{sel.kind}</p>
                <h3 className="font-display text-3xl uppercase leading-none">{sel.label}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white">
                Close
              </button>
            </div>
            {sel.href && (
              <Link href={sel.href} className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-doom-bright hover:text-white">
                Open file →
              </Link>
            )}
            <ul className="mt-4 space-y-2">
              {selEdges.map((e) => {
                const other = byId.get(e.from === sel.id ? e.to : e.from)!;
                return (
                  <li key={e.id} className="border-l-2 bg-white/[0.03] p-3" style={{ borderColor: STATUS_HEX[e.status] }}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EvidenceBadge status={e.status} short />
                      <BasisTag basis={e.basis} />
                      {e.superseded && <span className="font-mono text-[10px] uppercase text-faint">Superseded</span>}
                    </div>
                    <button onClick={() => setSelected(other.id)} className="mt-2 block text-left text-sm font-semibold hover:text-doom-bright">
                      {e.from === sel.id ? "→" : "←"} {other.label}
                    </button>
                    <p className="mt-1 text-xs text-muted">{e.reason}</p>
                    {e.citation && <p className="mt-1 font-mono text-[10px] text-faint">{e.citation}</p>}
                  </li>
                );
              })}
            </ul>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
