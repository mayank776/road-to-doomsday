import Link from "next/link";
import type { Art, Media } from "@/lib/types";
import { isWide } from "@/lib/media";
import { MediaImage } from "@/components/media/media-image";
import { ImageOrArt } from "@/components/media/image-or-art";
import { SplitHeadline } from "@/components/effects/scroll-reveal";

export function PageHero({
  seed,
  art,
  media,
  back,
  kicker,
  title,
  subtitle,
  children,
}: {
  seed: string;
  art: Art;
  /** The site owner's image; the procedural art is the fallback. */
  media?: Media;
  back: { href: string; label: string };
  kicker: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const tall = !!media && !isWide(media);
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      {tall ? (
        // a tall poster: full-bleed on phones; on desktop a soft wash behind the framed poster
        <MediaImage m={media!} sizes="(min-width: 1024px) 30vw, 100vw" priority className="lg:scale-110 lg:opacity-40 lg:blur-2xl lg:saturate-150" />
      ) : (
        <ImageOrArt media={media} seed={seed} art={art} sizes="100vw" priority />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-black/50" />
      {tall && (
        <div className="absolute bottom-[8svh] right-8 top-28 hidden aspect-[var(--ar)] border border-white/15 shadow-2xl shadow-black lg:block" style={{ "--ar": `${media!.width} / ${media!.height}` } as React.CSSProperties}>
          <MediaImage m={media!} sizes="30vw" />
        </div>
      )}
      <div className={`relative px-4 pb-12 pt-32 sm:px-8 sm:pb-16 ${tall ? "lg:max-w-[62%]" : ""}`}>
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
