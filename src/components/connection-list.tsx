import Link from "next/link";
import type { NodeRef } from "@/lib/types";
import { connectionsFor, resolveRef } from "@/lib/content";
import { BasisTag, EvidenceBadge, STATUS_HEX } from "./evidence-labels";

/** Connections rendered as glowing link rows: the line colour is the evidence level. */
export function ConnectionList({ refId }: { refId: NodeRef }) {
  const edges = connectionsFor(refId);
  if (!edges.length) return null;
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {edges.map((e) => {
        const outgoing = e.from === refId;
        const other = resolveRef(outgoing ? e.to : e.from);
        const c = STATUS_HEX[e.status];
        return (
          <li key={e.id}>
            <Link href={other.href} className="group block border border-line bg-surface p-5 transition hover:border-white/30" style={{ opacity: e.superseded ? 0.55 : 1 }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{outgoing ? "Leads to" : "Comes from"}</span>
                <span
                  className="h-px flex-1"
                  style={{
                    background: e.status === "theory" || e.superseded ? `repeating-linear-gradient(90deg, ${c} 0 6px, transparent 6px 11px)` : c,
                    boxShadow: `0 0 10px ${c}`,
                  }}
                />
                <span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
              </div>
              <p className="mt-3 font-display text-3xl uppercase leading-none transition group-hover:text-doom-bright">{other.label}</p>
              <p className="mt-2 text-sm text-muted">{e.reason}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <EvidenceBadge status={e.status} short />
                <BasisTag basis={e.basis} />
                {e.superseded && <span className="font-mono text-[10px] uppercase tracking-wider text-faint">Superseded</span>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
