"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime * 0.25 + aPhase;
    p += vec3(sin(t) * 0.06, cos(t * 1.3) * 0.06, sin(t * 0.7) * 0.06);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (28.0 / -mv.z);
    vColor = aColor;
    vAlpha = 0.55 + 0.45 * sin(uTime * 1.5 + aPhase * 6.0);
  }
`;
const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * (1.0 + a), a * vAlpha);
  }
`;

const portalFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float swirl = sin(a * 6.0 + r * 30.0 - uTime * 2.0) * 0.5 + 0.5;
    float ring = smoothstep(0.5, 0.36, r) * smoothstep(0.2, 0.36, r);
    float core = smoothstep(0.22, 0.0, r);
    vec3 green = vec3(0.35, 1.0, 0.6);
    vec3 col = green * (ring * (0.6 + swirl * 1.4)) + vec3(0.8, 1.0, 0.9) * core * 0.9;
    float alpha = clamp(ring * (0.5 + swirl) + core, 0.0, 1.0);
    gl_FragColor = vec4(col * 2.0, alpha);
  }
`;
const portalVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

function rand(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function Universes({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();

  const { geometry, bubbles } = useMemo(() => {
    const R = rand(42);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const palette = [new THREE.Color("#7dffb0"), new THREE.Color("#3fae6a"), new THREE.Color("#e8fff1"), new THREE.Color("#5ad1c8")];
    const bubbles = Array.from({ length: 34 }, () => {
      const r = 4 + R() * 9;
      const a = R() * Math.PI * 2;
      const y = (R() - 0.5) * 7;
      return { c: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r - 2), rad: 0.35 + R() * 1.4 };
    });
    for (let i = 0; i < count; i++) {
      let p: THREE.Vector3;
      if (i < count * 0.62) {
        // particles on the shells of bubble universes
        const b = bubbles[i % bubbles.length];
        const u = R() * 2 - 1;
        const th = R() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        p = new THREE.Vector3(s * Math.cos(th), u, s * Math.sin(th)).multiplyScalar(b.rad).add(b.c);
      } else {
        // a flattened spiral of loose matter around the portal
        const t = R();
        const arm = Math.floor(R() * 3);
        const ang = t * Math.PI * 5 + (arm * Math.PI * 2) / 3;
        const rad = 1.6 + t * 16;
        p = new THREE.Vector3(Math.cos(ang) * rad + (R() - 0.5) * 1.6, (R() - 0.5) * (0.6 + t * 2), Math.sin(ang) * rad + (R() - 0.5) * 1.6);
      }
      pos.set([p.x, p.y, p.z], i * 3);
      const c = palette[Math.floor(R() * palette.length)];
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = 0.6 + Math.pow(R(), 4) * 4;
      phase[i] = R() * 10;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return { geometry: g, bubbles };
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }), [gl]);

  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
    if (group.current) group.current.rotation.y += dt * 0.025;
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {bubbles.slice(0, 12).map((b, i) => (
        <mesh key={i} position={b.c}>
          <icosahedronGeometry args={[b.rad, 1]} />
          <meshBasicMaterial color="#7dffb0" wireframe transparent opacity={0.07} />
        </mesh>
      ))}
    </group>
  );
}

function Portal() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    uniforms.uTime.value += dt;
    if (ring.current) {
      ring.current.rotation.z += dt * 0.3;
      ring.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });
  return (
    <group>
      <mesh>
        <planeGeometry args={[5, 5]} />
        <shaderMaterial vertexShader={portalVert} fragmentShader={portalFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1.95, 0.012, 8, 160]} />
        <meshBasicMaterial color="#c8ffe0" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const p = progress.current ?? 0;
    const targetZ = 14 - p * 11;
    camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 1.0 + 0.6 - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.08;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function MultiverseScene({ progress }: { progress: React.RefObject<number> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [mobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.6, 14], fov: 55 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#040605"]} />
        <fog attach="fog" args={["#040605", 12, 30]} />
        <Universes count={mobile ? 5000 : 11000} />
        <Portal />
        <Rig progress={progress} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
          <Vignette offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
