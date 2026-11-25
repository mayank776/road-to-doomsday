/**
 * The small green, spaced-out capitals that sit above most headings
 * ("01 · THE MULTIVERSE MAP"). Purely presentational.
 */
export function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright ${className}`}>{children}</p>;
}
