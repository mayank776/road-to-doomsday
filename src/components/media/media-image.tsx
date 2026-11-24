import Image from "next/image";
import type { Media } from "@/lib/types";

/**
 * Site-owner artwork via next/image: responsive AVIF/WebP, blur-up placeholder,
 * and a focal point so crops keep the subject in frame.
 */
export function MediaImage({
  m,
  sizes,
  className = "",
  priority = false,
  fill = true,
}: {
  m: Media;
  sizes: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const common = {
    src: m.src,
    sizes,
    priority,
    placeholder: "blur" as const,
    blurDataURL: m.blur,
    style: { objectPosition: m.focus },
  };
  return fill ? (
    <Image {...common} alt={m.alt} fill className={`object-cover ${className}`} />
  ) : (
    <Image {...common} alt={m.alt} width={m.width} height={m.height} className={className} />
  );
}
