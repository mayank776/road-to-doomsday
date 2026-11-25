"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { HOME, PAGES } from "@/lib/site-map";

/**
 * Next.js re-mounts a `template.tsx` on every navigation (unlike layout.tsx),
 * which makes it the place for page transitions.
 *
 * Each new page arrives under a curtain carrying the section's name, which
 * then wipes upward. The very first page load skips it: the landing hero
 * has its own opening.
 */
let firstLoad = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const section = [HOME, ...PAGES].find((p) => (p.href === "/" ? pathname === "/" : pathname.startsWith(p.href)));
  // read once per mount: true only for the very first page, on the server and in the browser alike
  const [skip] = useState(() => firstLoad);
  useEffect(() => {
    firstLoad = false;
  }, []);

  return (
    <>
      {!skip && (
        <motion.div
          key={pathname}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] flex flex-col justify-end overflow-hidden bg-ink px-4 pb-10 sm:px-8"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          animate={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.85, delay: 0.25, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="absolute inset-x-0 bottom-0 h-px bg-doom-bright shadow-[0_0_24px_#7dffb0]" />
          <motion.p
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {section ? `${section.n} · ` : ""}Loading file
          </motion.p>
          <motion.p
            className="font-display text-[18vw] uppercase leading-[0.85] sm:text-[12vw]"
            initial={{ y: "40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {section?.label ?? "Doomsday"}
          </motion.p>
        </motion.div>
      )}
      {children}
    </>
  );
}
