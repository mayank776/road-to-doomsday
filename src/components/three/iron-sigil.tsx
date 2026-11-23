"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/** An abstract armoured core: faceted iron shards around a green energy heart. Scroll splits it apart. */
function Sigil({ progress }: { progress: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);

  const shards = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.6, 1); // already non-indexed: 3 vertices per face
    const pos = geo.getAttribute("position");
    const list: { geo: THREE.BufferGeometry; dir: THREE.Vector3 }[] = [];
    for (let i = 0; i < pos.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(pos, i);
      const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
      const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
      const center = a.clone().add(b).add(c).divideScalar(3);
      // extrude each face into a thick plate
      const inner = [a, b, c].map((v) => v.clone().sub(center).multiplyScalar(0.92).add(center.clone().multiplyScalar(0.82)));
      const outer = [a, b, c].map((v) => v.clone().sub(center).multiplyScalar(0.92).add(center));
      const verts = [
        ...outer, ...inner.slice().reverse(),
        outer[0], outer[1], inner[1], outer[0], inner[1], inner[0],
        outer[1], outer[2], inner[2], outer[1], inner[2], inner[1],
        outer[2], outer[0], inner[0], outer[2], inner[0], inner[2],
      ];
      const g = new THREE.BufferGeometry().setFromPoints(verts.map((v) => v.clone().sub(center)));
      g.computeVertexNormals();
      list.push({ geo: g, dir: center });
    }
    return list;
  }, []);

  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += dt * 0.18;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.2 + p * 0.8;
    }
    const spread = Math.max(0, (p - 0.15) * 1.6);
    meshes.current.forEach((m, i) => {
      if (!m) return;
      const s = shards[i];
      const wobble = Math.sin(t * 1.2 + i) * 0.015;
      m.position.copy(s.dir).multiplyScalar(1 + spread * (0.6 + (i % 5) * 0.12) + wobble);
    });
    if (core.current) core.current.emissiveIntensity = 3 + Math.sin(t * 2) * 1.2 + spread * 4;
  });

  return (
    <group ref={group}>
      {shards.map((s, i) => (
        <mesh key={i} geometry={s.geo} ref={(el) => { meshes.current[i] = el; }}>
          <meshStandardMaterial color="#5b6460" metalness={1} roughness={0.28} flatShading />
        </mesh>
      ))}
      <mesh>
        <icosahedronGeometry args={[1.05, 3]} />
        <meshStandardMaterial ref={core} color="#0a2014" emissive="#3dff8f" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight color="#3dff8f" intensity={30} distance={8} />
    </group>
  );
}

export default function IronSigil({ progress }: { progress: React.RefObject<number> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 [mask-image:radial-gradient(closest-side,black_55%,transparent_100%)]">
      <Canvas frameloop={visible ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 40 }} gl={{ antialias: true }}>
        <Environment resolution={256}>
          <Lightformer intensity={4} position={[0, 5, -5]} scale={[10, 2, 1]} color="#ffffff" />
          <Lightformer intensity={2} position={[-5, 0, 2]} scale={[2, 8, 1]} color="#7dffb0" />
          <Lightformer intensity={1.5} position={[5, -2, 2]} scale={[2, 6, 1]} color="#9fb5ff" />
          <Lightformer form="ring" intensity={3} position={[0, 0, 6]} scale={3} color="#ffffff" />
        </Environment>
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
          <Sigil progress={progress} />
        </Float>
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.4} luminanceThreshold={0.5} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
