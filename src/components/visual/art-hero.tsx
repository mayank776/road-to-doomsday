import Link from "next/link";
import type { Art } from "@/lib/types";
import { GenerativeArt } from "./generative-art";
import { SplitHeadline } from "./reveal";

export function ArtHero({
  seed,
  art,
  back,
  kicker,
  title,
  subtitle,
  children,
}: {
  seed: string;
  art: Art;
  back: { href: string; label: string };
  kicker: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      <GenerativeArt seed={seed} art={art} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-black/50" />
      <div className="relative px-4 pb-12 pt-32 sm:px-8 sm:pb-16">
        <Link href={back.href} className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 hover:text-doom-bright">
          ← {back.label}
        </Link>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright">{kicker}</p>
        <SplitHeadline as="h1" immediate className="mt-2 max-w-6xl font-display text-[15vw] uppercase leading-[0.82] sm:text-[9vw]">
          {title}
        </SplitHeadline>
        {subtitle && <p className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-white/70">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
