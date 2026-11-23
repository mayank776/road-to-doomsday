"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IronSigil = dynamic(() => import("./iron-sigil"), { ssr: false });

/** Full-bleed 3D backdrop whose shards split apart as the hero scrolls away. */
export function SigilStage() {
  const el = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: el.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (s) => (progress.current = 0.2 + s.progress * 0.8),
    });
  });
  return (
    <div ref={el} className="absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,#0c2417,#040605_60%)]">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[65%]">
        <IronSigil progress={progress} />
      </div>
    </div>
  );
}
