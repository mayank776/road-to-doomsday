import type { MediaKind } from "./types";

/** How each kind of image is labelled wherever it is shown. Kept apart from media.ts so client code can import it without the catalogue. */
export const KIND_LABEL: Record<MediaKind, string> = {
  illustration: "Illustration",
  poster: "Poster art",
  comic: "Comic art",
  photo: "Photo",
  still: "Film still",
};
