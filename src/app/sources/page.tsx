import type { Metadata } from "next";
import { sources } from "@/lib/content";
import { STATUS_HEX, STATUS_META } from "@/components/evidence";
import { Kicker } from "@/components/site-chrome";
import { GenerativeArt } from "@/components/visual/generative-art";
import { SplitHeadline } from "@/components/visual/reveal";

export const metadata: Metadata = { title: "Sources & editorial rules" };

const RULES = [
  "Cite the exact film, episode and scene",
  "Timestamp every trailer observation",
  "Keep comics apart from MCU canon",
  "Never present leaks or theories as fact",
  "Keep superseded claims visible and dated",
  "Treat fan videos as leads, not proof",
];

export default function SourcesPage() {
  return (
    <div className="px-4 pb-20 pt-32 sm:px-8">
      <Kicker>How we know</Kicker>
      <SplitHeadline as="h1" immediate className="mt-2 font-display text-[16vw] uppercase leading-[0.82] sm:text-[10vw]">
        The rules
      </SplitHeadline>

      <ol className="mt-14 border-t border-line">
        {RULES.map((r, i) => (
          <li key={r} className="group flex items-baseline gap-6 border-b border-line py-5">
            <span className="font-mono text-xs text-doom-bright">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-display text-3xl uppercase leading-none transition group-hover:translate-x-2 sm:text-6xl">{r}</span>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-3">
        {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => (
          <div key={s} className="bg-ink p-6">
            <span className="block h-4 w-4 rounded-full" style={{ background: STATUS_HEX[s], boxShadow: `0 0 24px ${STATUS_HEX[s]}` }} />
            <p className="mt-10 font-display text-4xl uppercase" style={{ color: STATUS_HEX[s] }}>{STATUS_META[s].short}</p>
            <p className="mt-2 text-sm text-muted">{STATUS_META[s].description}</p>
          </div>
        ))}
      </div>

      <section className="mt-20">
        <Kicker>Research set · {sources.length} leads</Kicker>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sources.map((s, i) => {
            return (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="group relative block min-h-80 overflow-hidden border border-line">
                <GenerativeArt
                  seed={s.id}
                  art={s.official ? { hue: 140, motif: "eclipse" } : { hue: [285, 38, 205][i % 3], motif: (["rings", "branch", "orbit"] as const)[i % 3] }}
                  className="absolute inset-0 h-full w-full opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                  grain={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                    <span className={s.official ? "text-confirmed" : "text-supported"}>{s.official ? "● Official" : "● Unofficial · lead only"}</span>
                    <span className="text-white/50">· {s.reviewStatus === "pending" ? "Awaiting review" : s.reviewStatus}</span>
                  </div>
                  <p className="mt-2 font-display text-2xl uppercase leading-tight">{s.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">{s.channel}</p>
                  <p className="mt-2 text-sm text-muted">{s.editorNote}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
