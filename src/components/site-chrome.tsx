"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const NAV = [
  { href: "/timeline", label: "Timeline", n: "01" },
  { href: "/characters/doctor-doom", label: "Doom", n: "02" },
  { href: "/connections", label: "Connections", n: "03" },
  { href: "/clues", label: "Clues", n: "04" },
  { href: "/trailer", label: "Trailer", n: "05" },
  { href: "/sources", label: "Sources", n: "06" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="font-display text-xl uppercase tracking-wider text-white">
            Road<span className="text-doom-bright">/</span>Doomsday
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white lg:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="group relative">
                <span className="mr-1 text-white/40">{n.n}</span>
                {n.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setOpen((o) => !o)}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Main"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-4 pb-12"
          >
            {NAV.map((n, i) => (
              <motion.div key={n.href} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6 }}>
                <Link href={n.href} onClick={() => setOpen(false)} className="flex items-baseline gap-3 border-b border-line py-3 font-display text-5xl uppercase">
                  <span className="font-mono text-xs text-doom-bright">{n.n}</span>
                  {n.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="px-4 py-16 sm:px-8">
        <p className="font-display text-[22vw] uppercase leading-[0.8] text-outline select-none" aria-hidden>
          Doomsday
        </p>
        <div className="mt-8 grid gap-4 font-mono text-[11px] uppercase tracking-[0.15em] text-faint md:grid-cols-3">
          <p>Unofficial fan-made guide. Not affiliated with Marvel or Disney.</p>
          <p>All visuals are generated in code. Seed content is pending a fact-check.</p>
          <Link href="/sources" className="text-muted hover:text-doom-bright md:text-right">
            Sources &amp; editorial rules →
          </Link>
        </div>
      </div>
    </footer>
  );
}

/** Mono label used across the site as a HUD caption. */
export function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright ${className}`}>{children}</p>
  );
}
