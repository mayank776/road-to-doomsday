"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type EarthSpec = { designation: string; name: string; color: string };

/* Procedural planet: banded noise surface, terminator shading and a fresnel atmosphere rim. */
const planetVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vPos = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;
const planetFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uSeed;
  uniform float uHeat;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    vec3 p = vPos * 1.6 + vec3(uSeed, uTime * 0.03, 0.0);
    float n = fbm(p);
    float bands = smoothstep(0.35, 0.75, fbm(vec3(vPos.y * 3.0 + n * 1.5, uSeed, uTime * 0.02)));
    vec3 deep = uColor * 0.12;
    vec3 land = mix(uColor * 0.45, uColor * 1.1, bands);
    vec3 surface = mix(deep, land, smoothstep(0.42, 0.6, n));
    // light from upper-left; night side keeps faint city-like specks
    vec3 L = normalize(vec3(-0.6, 0.5, 0.65));
    float lit = clamp(dot(vNormal, L) * 0.9 + 0.15, 0.0, 1.0);
    float specks = step(0.985, hash(floor(vPos * 60.0))) * (1.0 - lit) * 0.8;
    vec3 col = surface * lit + uColor * specks;
    // atmosphere rim
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
    col += uColor * fres * (1.1 + uHeat * 1.4);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const haloFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uHeat;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
    gl_FragColor = vec4(uColor, f * (0.55 + uHeat * 0.6));
  }
`;

function Planet({ spec, index, progress, labelRef }: { spec: EarthSpec; index: number; progress: React.RefObject<number>; labelRef: (el: THREE.Object3D | null) => void }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const color = useMemo(() => new THREE.Color(spec.color), [spec.color]);
  const uniforms = useMemo(() => ({ uColor: { value: color }, uTime: { value: 0 }, uSeed: { value: index * 7.3 }, uHeat: { value: 0 } }), [color, index]);
  const haloUniforms = useMemo(() => ({ uColor: { value: color }, uHeat: uniforms.uHeat }), [color, uniforms]);

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    uniforms.uTime.value += dt;
    uniforms.uHeat.value = p;
    const t = state.clock.elapsedTime * 0.06;
    const base = (index / 3) * Math.PI * 2 + Math.PI / 2;
    const radius = 3.3 * (1 - 0.62 * p);
    const a = base + t + p * 0.9;
    group.current?.position.set(Math.cos(a) * radius, Math.sin(a) * radius * 0.72, Math.sin(a) * 0.8);
    if (mesh.current) mesh.current.rotation.y += dt * 0.08;
  });

  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial vertexShader={planetVert} fragmentShader={planetFrag} uniforms={uniforms} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial vertexShader={planetVert} fragmentShader={haloFrag} uniforms={haloUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      {/* label anchor just below the planet */}
      <object3D ref={labelRef} position={[0, -1.45, 0]} />
    </group>
  );
}

/** Thin gravitational rings between the worlds; they tighten as the worlds converge. */
function Tethers({ progress }: { progress: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    const p = progress.current ?? 0;
    if (!g.current) return;
    g.current.rotation.z = s.clock.elapsedTime * 0.04;
    g.current.scale.setScalar(1 - 0.55 * p);
  });
  return (
    <group ref={g}>
      {[3.3, 4.2, 5.4].map((r, i) => (
        <mesh key={r} rotation={[0, 0, 0]} scale={[1, 0.72, 1]}>
          <ringGeometry args={[r - 0.004, r + 0.004, 160]} />
          <meshBasicMaterial color="#9fb3a8" transparent opacity={0.16 - i * 0.04} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Stars({ count }: { count: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    let s = 11;
    const R = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < count; i++) p.set([(R() - 0.5) * 60, (R() - 0.5) * 40, -10 - R() * 30], i * 3);
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.06} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const p = progress.current ?? 0;
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.04;
    camera.position.z += (13 - p * 4 - camera.position.z) * 0.08;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Projects each planet's label anchor to screen space and moves its DOM label. */
function Labels({ anchors, labels }: { anchors: React.RefObject<(THREE.Object3D | null)[]>; labels: React.RefObject<(HTMLDivElement | null)[]> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    anchors.current.forEach((o, i) => {
      const el = labels.current[i];
      if (!o || !el) return;
      o.getWorldPosition(v);
      v.project(camera);
      el.style.transform = `translate3d(${(v.x * 0.5 + 0.5) * size.width}px, ${(-v.y * 0.5 + 0.5) * size.height}px, 0) translate(-50%, 0)`;
      el.style.opacity = "1";
    });
  });
  return null;
}

export default function EarthsScene({ earths, progress }: { earths: EarthSpec[]; progress: React.RefObject<number> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const anchors = useRef<(THREE.Object3D | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState(true);
  const [layout] = useState(() => {
    if (typeof window === "undefined") return { wide: true, mobile: false };
    return { wide: window.innerWidth / window.innerHeight > 1.1, mobile: window.innerWidth < 768 };
  });
  // Wide screens: worlds sit right of the headline. Tall screens: above it.
  const offset: [number, number] = layout.wide ? [3.1, 0.2] : [0, 2.7];

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas frameloop={visible ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0, 13], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={["#040605"]} />
        <Stars count={layout.mobile ? 500 : 1200} />
        <group position={[offset[0], offset[1], 0]} scale={layout.wide ? 0.74 : 0.46}>
          <Tethers progress={progress} />
          {earths.map((e, i) => (
            <Planet key={e.designation} spec={e} index={i} progress={progress} labelRef={(el) => (anchors.current[i] = el)} />
          ))}
        </group>
        <Rig progress={progress} />
        <Labels anchors={anchors} labels={labels} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
        {earths.map((e, i) => (
          <div
            key={e.designation}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className="absolute left-0 top-0 whitespace-nowrap text-center opacity-0 transition-opacity duration-700"
          >
            <div className="font-display text-lg uppercase leading-none tracking-wide text-white sm:text-xl">{e.designation}</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: e.color }}>
              {e.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
