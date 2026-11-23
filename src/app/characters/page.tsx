import Link from "next/link";
import type { Metadata } from "next";
import { characters } from "@/lib/content";
import { GenerativeArt } from "@/components/visual/generative-art";
import { Kicker } from "@/components/site-chrome";
import { SplitHeadline } from "@/components/visual/reveal";

export const metadata: Metadata = { title: "Characters" };

export default function CharactersPage() {
  return (
    <div className="px-4 pb-20 pt-32 sm:px-8">
      <Kicker>Who&apos;s involved</Kicker>
      <SplitHeadline as="h1" immediate className="mt-2 font-display text-[16vw] uppercase leading-[0.82] sm:text-[10vw]">
        The players
      </SplitHeadline>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {characters.map((c, i) => {
          const doom = c.slug === "doctor-doom";
          return (
            <Link
              key={c.slug}
              href={`/characters/${c.slug}`}
              className={`group relative overflow-hidden border ${doom ? "border-doom-bright/70 sm:col-span-2 sm:row-span-2 h-[70svh] sm:h-auto" : "border-line h-[44svh]"}`}
            >
              <GenerativeArt seed={c.slug} art={c.art} className="absolute inset-0 h-full w-full transition duration-[1.2s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <span className="absolute right-4 top-4 font-mono text-[10px] text-white/60">{String(i + 1).padStart(2, "0")}</span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                {(doom || c.alias) && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-doom-bright">{doom ? "The central threat" : c.alias}</p>
                )}
                <h2 className={`mt-1 font-display uppercase leading-[0.85] ${doom ? "text-7xl sm:text-9xl" : "text-4xl"}`}>
                  {doom ? c.alias : c.name}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
