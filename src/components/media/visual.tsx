import type { Art, Media } from "@/lib/types";
import { GenerativeArt } from "@/components/visual/generative-art";
import { MediaImage } from "./media-image";

/**
 * The one way to fill an art slot: the site owner's image when there is one,
 * otherwise the procedural artwork for that seed. Fills its positioned parent.
 */
export function Visual({
  media,
  seed,
  art,
  sizes,
  className = "",
  grain,
  priority,
}: {
  media?: Media;
  seed: string;
  art: Art;
  sizes: string;
  className?: string;
  grain?: boolean;
  priority?: boolean;
}) {
  return media ? (
    <MediaImage m={media} sizes={sizes} className={className} priority={priority} />
  ) : (
    <GenerativeArt seed={seed} art={art} className={`absolute inset-0 h-full w-full ${className}`} grain={grain} />
  );
}
