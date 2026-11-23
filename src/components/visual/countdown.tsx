"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return [
    ["Days", Math.floor(ms / 864e5)],
    ["Hrs", Math.floor(ms / 36e5) % 24],
    ["Min", Math.floor(ms / 6e4) % 60],
    ["Sec", Math.floor(ms / 1e3) % 60],
  ] as const;
}

/** Live countdown to release. Renders dashes on the server to avoid a hydration mismatch. */
export function Countdown({ target }: { target: string }) {
  const t = new Date(target + "T00:00:00").getTime();
  const [parts, setParts] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const tick = () => setParts(diff(t));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [t]);

  return (
    <div className="flex gap-4 sm:gap-6" aria-label="Time until Avengers: Doomsday opens" role="timer">
      {(parts ?? diff(0).map(([l]) => [l, null] as const)).map(([label, v]) => (
        <div key={label} className="hud border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-sm sm:px-4">
          <div className="font-display text-4xl tabular-nums leading-none sm:text-6xl">
            {v === null ? "--" : String(v).padStart(2, "0")}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{label}</div>
        </div>
      ))}
    </div>
  );
}
