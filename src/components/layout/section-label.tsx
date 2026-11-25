import { ScrambleText } from "@/components/effects/scramble-text";

/** Plain text content, if the children are only strings and numbers. */
function asText(children: React.ReactNode): string | null {
  const parts = Array.isArray(children) ? children : [children];
  return parts.every((p) => typeof p === "string" || typeof p === "number") ? parts.join("") : null;
}

/**
 * The small green, spaced-out capitals that sit above most headings
 * ("01 · THE MULTIVERSE MAP"). Plain text decodes from glyphs as it scrolls into view.
 */
export function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const text = asText(children);
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright ${className}`}>
      {text !== null ? <ScrambleText text={text} /> : children}
    </p>
  );
}
