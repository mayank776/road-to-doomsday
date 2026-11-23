import type { Claim } from "@/lib/types";
import { BasisTag, EvidenceBadge, STATUS_HEX, SupersededNote } from "./evidence";

/** Large numbered claim rows. The left rule glows in the evidence colour. */
export function ClaimStack({ claims, accent }: { claims: Claim[]; accent?: string }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {claims.map((c, i) => {
        const col = accent ?? STATUS_HEX[c.status];
        return (
          <li key={c.text} className="grid grid-cols-[auto_1fr] gap-4 py-6 sm:gap-8">
            <span className="font-display text-5xl leading-none text-outline sm:text-7xl">{String(i + 1).padStart(2, "0")}</span>
            <div className="border-l-2 pl-4 sm:pl-6" style={{ borderColor: col, boxShadow: `-8px 0 20px -12px ${col}` }}>
              <div className="flex flex-wrap items-center gap-2">
                <EvidenceBadge status={c.status} />
                <BasisTag basis={c.basis} />
              </div>
              <p className={`mt-3 text-lg leading-snug sm:text-2xl ${c.superseded ? "text-white/50" : ""}`}>{c.text}</p>
              {c.citation && <p className="mt-2 font-mono text-[11px] text-faint">{c.citation}</p>}
              {c.note && <p className="mt-2 text-sm italic text-muted">{c.note}</p>}
              {c.superseded && <SupersededNote s={c.superseded} />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
