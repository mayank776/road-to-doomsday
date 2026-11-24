import mediaJson from "../../content/media.json";
import generated from "../../content/media.generated.json";
import type { Media, MediaKind } from "./types";

export { KIND_LABEL } from "./media-kind";

type Source = { id: string; file: string; kind: MediaKind; alt: string; subjects: string[]; focus?: string };
type Built = { src: string; width: number; height: number; blur: string; color: string };

const built = generated as Record<string, Built>;

export const media: Media[] = (mediaJson as Source[])
  .filter((m) => built[m.id])
  .map((m) => ({ id: m.id, kind: m.kind, alt: m.alt, subjects: m.subjects, focus: m.focus ?? "50% 50%", ...built[m.id] }));

const byId = new Map(media.map((m) => [m.id, m]));

/** Wider than tall, so it can fill a backdrop or banner without heavy cropping. */
export const isWide = (m: Media) => m.width / m.height > 1.3;

export const getMedia = (id?: string) => (id ? byId.get(id) : undefined);
export const mediaFor = (ids?: string[]) => (ids ?? []).map((id) => byId.get(id)).filter((m): m is Media => !!m);
export const mediaIds = new Set(byId.keys());

/** Every image tagged with this subject (any content slug), in catalogue order. */
export const mediaAbout = (slug: string, kind?: MediaKind) => media.filter((m) => m.subjects.includes(slug) && (!kind || m.kind === kind));

/** A wide image for this subject if one exists (for banner-shaped slots), else its first image. */
export const bannerFor = (slug: string) => mediaAbout(slug).find((m) => isWide(m)) ?? mediaAbout(slug)[0];

/** The first image for the first slug that has one: e.g. coverFor(clue.slug, clue.project). */
export function coverFor(...slugs: (string | undefined)[]) {
  for (const s of slugs) {
    const m = s ? mediaAbout(s)[0] : undefined;
    if (m) return m;
  }
  return undefined;
}


