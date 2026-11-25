"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HOME, PAGES, neighbours } from "@/lib/site-map";
import { scrollToTop } from "@/components/effects/smooth-scroll";

/** True for the page itself and its detail pages (/timeline and /timeline/loki-season-1). */
const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

/** True once the visitor has scrolled past `px`. */
function useScrolledPast(px: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const on = () => setPast(window.scrollY > px);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [px]);
  return past;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(40);

  // clicking the name always takes you home: to the top when you're already there
  const goHome = (e: React.MouseEvent) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };

  // lock the page behind the open mobile menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl" : "border-b border-transparent bg-gradient-to-b from-ink/80 to-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-8">
          <Link href="/" onClick={goHome} className="font-display text-xl uppercase tracking-wider text-white" aria-label="The Road to Doomsday: home">
            Road<span className="text-doom-bright">/</span>Doomsday
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] lg:flex">
            {PAGES.map((p) => {
              const active = isActive(pathname, p.href);
              return (
                <Link key={p.href} href={p.href} aria-current={active ? "page" : undefined} className={`group relative transition-colors ${active ? "text-doom-bright" : "text-white/85 hover:text-white"}`}>
                  <span className="mr-1 text-white/35">{p.n}</span>
                  {p.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-current transition-all duration-500 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white lg:hidden"
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
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-4 pb-10 pt-20"
            data-lenis-prevent
          >
            {[HOME, ...PAGES].map((p, i) => {
              const active = isActive(pathname, p.href);
              return (
                <motion.div key={p.href} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.04, duration: 0.5 }}>
                  <Link
                    href={p.href}
                    onClick={p.href === "/" ? goHome : () => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="block border-b border-line py-3"
                  >
                    <span className="flex items-baseline gap-3 font-display text-4xl uppercase">
                      <span className="font-mono text-xs text-doom-bright">{p.n}</span>
                      <span className={active ? "text-doom-bright" : ""}>{p.label}</span>
                    </span>
                    <span className="mt-1 block pl-8 text-sm text-white/50">{p.blurb}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

/** Floating button that appears once you've scrolled a screen down. */
export function BackToTop() {
  const show = useScrolledPast(900);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={() => scrollToTop()}
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-ink/80 text-lg text-white shadow-lg backdrop-blur-xl transition hover:border-doom-bright hover:text-doom-bright sm:bottom-8 sm:right-8"
          aria-label="Back to top"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const { prev, next } = neighbours(pathname);

  return (
    <footer className="relative overflow-hidden border-t border-line">
      {/* previous / next page, so you can read the site in order */}
      {(prev || next) && (
        <nav aria-label="Previous and next page" className="grid border-b border-line sm:grid-cols-2">
          {prev ? (
            <Link href={prev.href} className="group border-b border-line px-4 py-8 transition hover:bg-white/[0.03] sm:border-b-0 sm:border-r sm:px-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">← Previous</span>
              <span className="mt-1 block font-display text-4xl uppercase transition group-hover:text-doom-bright">{prev.label}</span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next && (
            <Link href={next.href} className="group px-4 py-8 text-right transition hover:bg-white/[0.03] sm:px-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">Next →</span>
              <span className="mt-1 block font-display text-4xl uppercase transition group-hover:text-doom-bright">{next.label}</span>
              <span className="mt-1 block text-sm text-white/45">{next.blurb}</span>
            </Link>
          )}
        </nav>
      )}

      <div className="px-4 py-16 sm:px-8">
        {/* the whole site at a glance */}
        <nav aria-label="All pages" className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {[HOME, ...PAGES].map((p) => (
            <Link key={p.href} href={p.href} onClick={p.href === "/" && pathname === "/" ? (e) => (e.preventDefault(), scrollToTop()) : undefined} className="group">
              <span className="font-mono text-[10px] text-doom-bright">{p.n}</span>{" "}
              <span className="font-display text-2xl uppercase transition group-hover:text-doom-bright">{p.label}</span>
            </Link>
          ))}
        </nav>

        <p className="mt-16 select-none font-display text-[22vw] uppercase leading-[0.8] text-outline" aria-hidden>
          Doomsday
        </p>
        <div className="mt-8 grid gap-4 font-mono text-[11px] uppercase tracking-[0.15em] text-faint md:grid-cols-3">
          <p>Unofficial fan-made guide. Not affiliated with Marvel or Disney.</p>
          <p>Images are official stills and posters, comic art and credited fan art, used for commentary.</p>
          <Link href="/sources" className="text-muted hover:text-doom-bright md:text-right">
            Sources &amp; editorial rules →
          </Link>
        </div>
      </div>
    </footer>
  );
}
