"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** A trailing ring cursor that grows over links. Hidden on touch devices. */
export function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const r = ring.current!;
    const d = dot.current!;
    r.style.display = d.style.display = "block";
    const xr = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const yr = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => {
      xr(e.clientX);
      yr(e.clientY);
      gsap.set(d, { x: e.clientX, y: e.clientY });
      const hot = (e.target as Element)?.closest?.("a,button,select,label,[data-cursor]");
      gsap.to(r, { scale: hot ? 2.2 : 1, duration: 0.3, overwrite: "auto" });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-4 -mt-4 hidden h-8 w-8 rounded-full border border-doom-bright/70 mix-blend-difference"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-[3px] -mt-[3px] hidden h-1.5 w-1.5 rounded-full bg-doom-bright"
      />
    </>
  );
}
