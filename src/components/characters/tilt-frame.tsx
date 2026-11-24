"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/** Wraps a poster in a gentle pointer-driven 3D tilt with a moving sheen. */
export function TiltFrame({ children, accent, className = "" }: { children: React.ReactNode; accent: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 140, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 140, damping: 16 });
  const sheen = useTransform([mx, my], ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.16), transparent 50%)`);

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={`relative ${className}`}
    >
      <div className="absolute -inset-6 -z-10 rounded-full opacity-60 blur-3xl" style={{ background: accent }} aria-hidden />
      <div className="relative h-full overflow-hidden border border-white/15" style={{ boxShadow: `0 40px 90px -30px ${accent}99` }}>
        {children}
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} aria-hidden />
      </div>
    </motion.div>
  );
}
