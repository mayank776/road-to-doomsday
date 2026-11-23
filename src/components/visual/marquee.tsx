/** Infinite text band used as a section divider. Pure CSS. */
export function Marquee({ items, reverse = false, className = "" }: { items: { text: string; color?: string }[]; reverse?: boolean; className?: string }) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={`overflow-hidden border-y border-line py-4 ${className}`} aria-hidden>
      <div className={`flex w-max animate-marquee gap-10 whitespace-nowrap ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {[...row, ...row].map((it, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-5xl uppercase sm:text-7xl" style={{ color: it.color }}>
            {it.text}
            <span className="text-2xl text-faint">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
