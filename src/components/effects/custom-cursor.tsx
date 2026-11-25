"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * The site's cursor (mouse only; hidden on touch screens).
 *
 * - A trailing ring that grows over anything clickable.
 * - Contextual labels: put `data-cursor="Open"` on an element and the ring
 *   becomes a pill saying "Open" while you hover it.
 * - Magnetic pull: elements with `data-magnetic` lean towards the pointer.
 */
export function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const r = ring.current!;
    const d = dot.current!;
    const l = label.current!;
    r.style.display = d.style.display = "flex";
    const xr = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const yr = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    let magnet: HTMLElement | null = null;
    let text = "";

    const move = (e: PointerEvent) => {
      xr(e.clientX);
      yr(e.clientY);
      gsap.set(d, { x: e.clientX, y: e.clientY });

      const target = e.target as Element | null;
      const tagged = target?.closest?.<HTMLElement>("[data-cursor]");
      const hot = target?.closest?.("a,button,select,label,[data-cursor]");
      const next = tagged?.dataset.cursor ?? "";
      if (next !== text) {
        text = next;
        l.textContent = next;
      }
      gsap.to(r, {
        width: next ? Math.max(64, next.length * 8 + 28) : hot ? 56 : 32,
        height: next ? 32 : hot ? 56 : 32,
        backgroundColor: next ? "#7dffb0" : "rgba(125,255,176,0)",
        duration: 0.3,
        overwrite: "auto",
      });
      gsap.to(d, { opacity: next ? 0 : 1, duration: 0.2, overwrite: "auto" });

      // magnetic pull toward the pointer, released when you leave
      const m = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      magnet = m;
      if (m) {
        const b = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - (b.left + b.width / 2)) * 0.3, y: (e.clientY - (b.top + b.height / 2)) * 0.4, duration: 0.4, ease: "power3.out" });
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-doom-bright/70"
      >
        <span ref={label} className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink" />
      </div>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-[3px] -mt-[3px] hidden h-1.5 w-1.5 rounded-full bg-doom-bright"
      />
    </>
  );
}
