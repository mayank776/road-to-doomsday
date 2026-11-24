"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { GEdge, GNode } from "@/lib/graph";
import { STATUS_HEX } from "@/components/evidence";

const KIND_HEX = { project: "#eef3ef", character: "#7dffb0", concept: "#7dd3fc" } as const;

type Props = {
  nodes: GNode[];
  edges: GEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  zoom?: boolean;
};

type GraphProps = Props & { hover: string | null; setHover: (id: string | null) => void; graphRef: React.RefObject<THREE.Group | null> };

const radiusOf = (n: GNode) => (n.focal ? 0.42 : 0.14 + Math.min(n.degree, 8) * 0.025);

/** The ids lit by the current focus: the node itself plus its direct neighbours. */
function useLit(focus: string | null, edges: GEdge[]) {
  return useMemo(() => {
    if (!focus) return null;
    const s = new Set([focus]);
    edges.forEach((e) => {
      if (e.from === focus) s.add(e.to);
      if (e.to === focus) s.add(e.from);
    });
    return s;
  }, [focus, edges]);
}

function Pulse({ a, b, color, offset }: { a: THREE.Vector3; b: THREE.Vector3; color: string; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = (s.clock.elapsedTime * 0.25 + offset) % 1;
    ref.current?.position.lerpVectors(a, b, t);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Graph({ nodes, edges, selected, onSelect, hover, setHover, graphRef }: GraphProps) {
  const focus = hover ?? selected;
  const pos = useMemo(() => new Map(nodes.map((n) => [n.id, new THREE.Vector3(...n.pos)])), [nodes]);
  const lit = useLit(focus, edges);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover]);

  return (
    <group ref={graphRef}>
      {edges.map((e, i) => {
        const a = pos.get(e.from)!;
        const b = pos.get(e.to)!;
        const on = !focus || e.from === focus || e.to === focus;
        const color = STATUS_HEX[e.status];
        return (
          <group key={e.id}>
            <Line
              points={[a, b]}
              color={color}
              lineWidth={on && focus ? 2.4 : 1.2}
              dashed={e.status === "theory" || !!e.superseded}
              dashSize={0.18}
              gapSize={e.superseded ? 0.25 : 0.12}
              transparent
              opacity={on ? (e.superseded ? 0.35 : 0.85) : 0.05}
            />
            {on && e.status !== "supported" && e.status !== "theory" && !e.superseded && <Pulse a={a} b={b} color={color} offset={i * 0.137} />}
          </group>
        );
      })}

      {nodes.map((n) => {
        const on = !lit || lit.has(n.id);
        const r = radiusOf(n);
        const color = n.focal ? "#7dffb0" : KIND_HEX[n.kind];
        return (
          <group key={n.id} position={n.pos}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHover(n.id);
              }}
              onPointerOut={() => setHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(selected === n.id ? null : n.id);
              }}
            >
              <sphereGeometry args={[r, 24, 24]} />
              <meshBasicMaterial color={color} toneMapped={false} transparent opacity={on ? 1 : 0.12} />
            </mesh>
            {n.focal && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r * 1.9, 0.01, 8, 64]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={on ? 0.8 : 0.1} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Projects each node's world position to screen space every frame and moves the matching
 * label element. Labels live in a React-owned overlay, avoiding drei <Html>'s per-label React roots.
 */
function LabelProjector({ nodes, graphRef, labels }: { nodes: GNode[]; graphRef: React.RefObject<THREE.Group | null>; labels: React.RefObject<Map<string, HTMLDivElement>> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const g = graphRef.current;
    if (!g) return;
    for (const n of nodes) {
      const el = labels.current.get(n.id);
      if (!el) continue;
      v.set(n.pos[0], n.pos[1] + radiusOf(n) + 0.32, n.pos[2]);
      g.localToWorld(v);
      v.project(camera);
      const behind = v.z > 1;
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      el.style.visibility = behind ? "hidden" : "visible";
    }
  });
  return null;
}

function AmbientDust() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(1500 * 3);
    for (let i = 0; i < p.length; i++) p[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1 * 30;
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.03} color="#7dffb0" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

function AutoSpin({ children, paused }: { children: React.ReactNode; paused: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current && !paused) g.current.rotation.y += dt * 0.08;
  });
  return <group ref={g}>{children}</group>;
}

export default function Constellation(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const graphRef = useRef<THREE.Group>(null);
  const labels = useRef(new Map<string, HTMLDivElement>());
  const [hover, setHover] = useState<string | null>(null);
  const focus = hover ?? props.selected;
  const lit = useLit(focus, props.edges);
  const [visible, setVisible] = useState(false);
  // On touch screens outside the full-page explorer, orbit controls would swallow page scrolling.
  const [canOrbit] = useState(() => !!props.zoom || (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches));
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" data-cursor>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 1, 17], fov: 50 }}
        onPointerMissed={() => props.onSelect(null)}
      >
        <color attach="background" args={["#040605"]} />
        <fog attach="fog" args={["#040605", 14, 34]} />
        <AmbientDust />
        <LabelProjector nodes={props.nodes} graphRef={graphRef} labels={labels} />
        {canOrbit ? (
          <>
            <Graph {...props} hover={hover} setHover={setHover} graphRef={graphRef} />
            <OrbitControls autoRotate={!props.selected} autoRotateSpeed={0.5} enablePan={false} enableZoom={!!props.zoom} minDistance={6} maxDistance={26} enableDamping />
          </>
        ) : (
          <AutoSpin paused={!!props.selected}>
            <Graph {...props} hover={hover} setHover={setHover} graphRef={graphRef} />
          </AutoSpin>
        )}
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.2} mipmapBlur />
        </EffectComposer>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {props.nodes.map((n) => {
          const on = !lit || lit.has(n.id);
          return (
            <div
              key={n.id}
              ref={(el) => {
                if (el) labels.current.set(n.id, el);
                else labels.current.delete(n.id);
              }}
              className={`absolute left-0 top-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] transition-opacity duration-300 ${
                n.focal ? "text-doom-bright" : "text-white"
              }`}
              style={{ opacity: on ? (focus ? 1 : n.focal || n.degree >= 4 ? 0.85 : 0.45) : 0.08, visibility: "hidden" }}
            >
              {n.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
