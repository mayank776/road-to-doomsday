import type { Basis, Claim, EvidenceStatus } from "@/lib/types";
import { formatDate } from "@/lib/format-date";

export const STATUS_META: Record<
  EvidenceStatus,
  { label: string; short: string; color: string; ring: string; dot: string; description: string }
> = {
  official: {
    label: "Official",
    short: "Official",
    color: "text-official",
    ring: "border-official/40 bg-official/10",
    dot: "bg-official",
    description: "Stated by Marvel Studios or Disney: announcements, press releases, marvel.com.",
  },
  trailer: {
    label: "Trailer-revealed",
    short: "Trailer",
    color: "text-trailer",
    ring: "border-trailer/40 bg-trailer/10",
    dot: "bg-trailer",
    description: "Shown or said in an official trailer. Context may change in the finished film.",
  },
  canon: {
    label: "Established canon",
    short: "Canon",
    color: "text-canon",
    ring: "border-canon/40 bg-canon/10",
    dot: "bg-canon",
    description: "Established on screen in a released MCU film or series.",
  },
  supported: {
    label: "Supported interpretation",
    short: "Supported",
    color: "text-supported",
    ring: "border-supported/40 bg-supported/10",
    dot: "bg-supported",
    description: "A strong reading of identifiable scenes or several clues, but not explicitly confirmed.",
  },
  theory: {
    label: "Fan theory",
    short: "Theory",
    color: "text-theory",
    ring: "border-theory/40 bg-theory/10",
    dot: "bg-theory",
    description: "Speculation that has not been established. Never presented as fact.",
  },
};

export const STATUS_HEX: Record<EvidenceStatus, string> = {
  official: "#34d399",
  trailer: "#22d3ee",
  canon: "#8fb4ff",
  supported: "#fbbf24",
  theory: "#c4a1ff",
};

/** Statuses that count as established fact (as opposed to interpretation). */
export const FACT_STATUSES: EvidenceStatus[] = ["official", "trailer", "canon"];

export function EvidenceBadge({ status, short = false }: { status: EvidenceStatus; short?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${m.ring} ${m.color}`}
      title={m.description}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} aria-hidden />
      {short ? m.short : m.label}
    </span>
  );
}

/** One glowing pip per claim, which gives the evidence mix at a glance. */
export function EvidenceDots({ statuses }: { statuses: (EvidenceStatus | "superseded")[] }) {
  const label = statuses.map((s) => (s === "superseded" ? "superseded" : STATUS_META[s].short)).join(", ");
  return (
    <span className="flex items-center gap-1.5" role="img" aria-label={`Evidence: ${label}`}>
      {statuses.map((s, i) => (
        <span
          key={i}
          title={s === "superseded" ? "Superseded" : STATUS_META[s].label}
          className={`h-2.5 w-2.5 rounded-full ${s === "superseded" ? "border border-faint" : STATUS_META[s].dot}`}
          style={s === "superseded" ? undefined : { boxShadow: `0 0 10px ${STATUS_HEX[s]}` }}
        />
      ))}
    </span>
  );
}

export function BasisTag({ basis }: { basis?: Basis }) {
  if (!basis || basis === "mcu") return null;
  if (basis === "comics")
    return (
      <span className="inline-flex shrink-0 items-center rounded border border-comics/40 bg-comics/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-comics">
        Comics, not MCU
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-line bg-raised px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
      Official announcement
    </span>
  );
}

export function SupersededNote({ s }: { s: { date: string; note: string } }) {
  return (
    <p className="mt-2 rounded border border-line bg-ink/60 px-2.5 py-1.5 text-xs text-muted">
      <span className="font-semibold uppercase tracking-wider text-faint">Superseded · {formatDate(s.date)}</span>{" "}
      {s.note}
    </p>
  );
}

export function ClaimItem({ claim }: { claim: Claim }) {
  return (
    <li className="rounded-lg border border-line bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <EvidenceBadge status={claim.status} />
        <BasisTag basis={claim.basis} />
      </div>
      <p className={claim.superseded ? "text-muted" : ""}>{claim.text}</p>
      {claim.citation && (
        <p className="mt-2 text-xs text-faint">
          <span className="font-semibold uppercase tracking-wider">Source</span> · {claim.citation}
        </p>
      )}
      {claim.note && <p className="mt-1.5 text-xs italic text-muted">Editor&apos;s note: {claim.note}</p>}
      {claim.superseded && <SupersededNote s={claim.superseded} />}
    </li>
  );
}

export function EvidenceLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
      {(Object.keys(STATUS_META) as EvidenceStatus[]).map((s) => (
        <div key={s} className="rounded-lg border border-line bg-surface p-3">
          <EvidenceBadge status={s} />
          {!compact && <p className="mt-2 text-sm text-muted">{STATUS_META[s].description}</p>}
        </div>
      ))}
    </div>
  );
}
