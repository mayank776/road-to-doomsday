/**
 * Every page on the site, in reading order. The header, the mobile menu, the
 * footer, the homepage "What's inside" guide and the previous/next links at
 * the bottom of each page all read this one list, so adding a page here adds
 * it everywhere.
 *
 * Plain data only (no imports), so client components can use it too.
 */
export type SitePage = {
  href: string;
  label: string;
  /** Two-digit index shown in the navigation. */
  n: string;
  /** One line saying what you'll find there. */
  blurb: string;
  /** Media id (content/media.json) used for this page's tile. */
  image: string;
};

export const HOME: SitePage = {
  href: "/",
  label: "Home",
  n: "00",
  blurb: "The overview: the map, the incursions, Steve, the road and Doom.",
  image: "doomsday-official-poster",
};

export const PAGES: SitePage[] = [
  { href: "/universes", label: "Universes", n: "01", blurb: "The three Earths of Doomsday, who lives on each, and how they connect.", image: "incursion-sky" },
  { href: "/timeline", label: "Timeline", n: "02", blurb: "Every film and series on the road here, in release order.", image: "loki-tree" },
  { href: "/characters", label: "Characters", n: "03", blurb: "The full official cast by universe and team, with each hero's file.", image: "avengers-team-up" },
  { href: "/connections", label: "Connections", n: "04", blurb: "Pull a thread: how every film, hero and idea links to Doomsday.", image: "worlds-collide" },
  { href: "/clues", label: "Clues", n: "05", blurb: "Post-credit scenes, lines and announcements, each with its evidence.", image: "doom-still" },
  { href: "/trailer", label: "Trailer", n: "06", blurb: "Watch the trailer and browse the stills from the footage.", image: "doomsday-title" },
  { href: "/sources", label: "Sources", n: "07", blurb: "Where every fact comes from, and how the evidence labels work.", image: "starfield-mono" },
];

/** The page before and after `pathname` in reading order (home leads into the first page). */
export function neighbours(pathname: string) {
  const all = [HOME, ...PAGES];
  // detail pages (e.g. /timeline/loki-season-1) count as their section
  const i = all.findIndex((p) => p.href !== "/" && (pathname === p.href || pathname.startsWith(p.href + "/")));
  const at = pathname === "/" ? 0 : i;
  if (at < 0) return { prev: undefined, next: undefined };
  return { prev: all[at - 1], next: all[at + 1] };
}
