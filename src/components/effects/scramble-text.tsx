"use client";

import { useEffect, useRef, useState } from "react";

// ASCII only: every glyph is the same width in the mono font, so decoding text never reflows
const GLYPHS = "<>/[]{}=+*#%&@$01ABCDEFXYZ";

/**
 * Text that "decodes": characters flicker through random glyphs and lock into
 * place left to right, like a classified file being decrypted.
 *
 * - `trigger="view"` (default) runs once when the text scrolls into view.
 * - `trigger="manual"` runs whenever `play` turns true.
 *
 * The real text is always in the page (and read by screen readers); only the
 * visible copy animates. With reduced motion it simply shows the text.
 */
export function ScrambleText({
  text,
  className = "",
  trigger = "view",
  play = false,
  duration = 900,
}: {
  text: string;
  className?: string;
  trigger?: "view" | "manual";
  play?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const locked = Math.floor(t * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          out += i < locked || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        setShown(out);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (trigger === "manual") {
      if (play) run();
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !ran.current) {
          ran.current = true;
          run();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text, trigger, play, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}
