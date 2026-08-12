"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function CinzadosScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const disposables: { dispose(): void }[] = [];
    function track<T extends { dispose(): void }>(item: T): T {
      disposables.push(item);
      return item;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 140);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- Luz ambiente + noite de estádio ---
    scene.add(new THREE.AmbientLight(0x2a3550, 0.65));
    const moonLight = new THREE.DirectionalLight(0x8fb8ff, 0.35);
    moonLight.position.set(-4, 10, 6);
    scene.add(moonLight);

    // --- Gramado listrado, se afastando em direção ao gol ---
    const pitchGroup = new THREE.Group();
    scene.add(pitchGroup);

    const PITCH_WIDTH = 11;
    const PITCH_LENGTH = 20;
    const STRIPES = 10;
    const stripeGeometry = track(new THREE.PlaneGeometry(PITCH_WIDTH, PITCH_LENGTH / STRIPES));
    for (let i = 0; i < STRIPES; i++) {
      const dark = i % 2 === 0;
      const material = track(
        new THREE.MeshStandardMaterial({
          color: dark ? 0x0b3323 : 0x0f4229,
          roughness: 0.92,
          metalness: 0,
          emissive: dark ? 0x03150d : 0x051d12,
          emissiveIntensity: 0.55,
        })
      );
      const strip = new THREE.Mesh(stripeGeometry, material);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(0, 0, -(i + 0.5) * (PITCH_LENGTH / STRIPES) + 3);
      pitchGroup.add(strip);
    }

    const lineMaterial = track(new THREE.LineBasicMaterial({ color: 0xeaf6f0, transparent: true, opacity: 0.55 }));
    function addLine(points: THREE.Vector3[]) {
      const geometry = track(new THREE.BufferGeometry().setFromPoints(points));
      pitchGroup.add(new THREE.Line(geometry, lineMaterial));
    }
    const y = 0.015;
    // linhas laterais
    addLine([new THREE.Vector3(-PITCH_WIDTH / 2, y, 3), new THREE.Vector3(-PITCH_WIDTH / 2, y, 3 - PITCH_LENGTH)]);
    addLine([new THREE.Vector3(PITCH_WIDTH / 2, y, 3), new THREE.Vector3(PITCH_WIDTH / 2, y, 3 - PITCH_LENGTH)]);
    // linha de meio-campo
    addLine([new THREE.Vector3(-PITCH_WIDTH / 2, y, -6), new THREE.Vector3(PITCH_WIDTH / 2, y, -6)]);
    // círculo central
    const circle: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      circle.push(new THREE.Vector3(Math.cos(a) * 2.1, y, -6 + Math.sin(a) * 2.1));
    }
    addLine(circle);
    // grande área perto do gol
    const goalZ = 3 - PITCH_LENGTH;
    addLine([
      new THREE.Vector3(-3.6, y, goalZ + 6.5),
      new THREE.Vector3(-3.6, y, goalZ),
      new THREE.Vector3(3.6, y, goalZ),
      new THREE.Vector3(3.6, y, goalZ + 6.5),
    ]);
    addLine([
      new THREE.Vector3(-1.8, y, goalZ + 2.2),
      new THREE.Vector3(-1.8, y, goalZ),
      new THREE.Vector3(1.8, y, goalZ),
      new THREE.Vector3(1.8, y, goalZ + 2.2),
    ]);

    // --- Gol (traves + rede sugerida) ---
    const goal = new THREE.Group();
    goal.position.set(0, 0, goalZ - 0.05);
    scene.add(goal);
    const postMaterial = track(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 }));
    const postGeometry = track(new THREE.CylinderGeometry(0.045, 0.045, 1.9, 16));
    const postLeft = new THREE.Mesh(postGeometry, postMaterial);
    postLeft.position.set(-1.9, 0.95, 0);
    goal.add(postLeft);
    const postRight = postLeft.clone();
    postRight.position.x = 1.9;
    goal.add(postRight);
    const crossbarGeometry = track(new THREE.CylinderGeometry(0.045, 0.045, 3.8, 16));
    const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 1.9, 0);
    goal.add(crossbar);

    const netMaterial = track(new THREE.LineBasicMaterial({ color: 0xdfe9ea, transparent: true, opacity: 0.22 }));
    const netGeometries: THREE.BufferGeometry[] = [];
    for (let i = 0; i <= 9; i++) {
      const x = -1.9 + (i / 9) * 3.8;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 1.9, 0),
        new THREE.Vector3(x * 0.9, 0, -0.7),
      ]);
      netGeometries.push(geometry);
      goal.add(new THREE.Line(geometry, netMaterial));
    }
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 9; j++) {
        const x = -1.9 + (j / 9) * 3.8;
        points.push(new THREE.Vector3(x * (1 - t * 0.1), 1.9 * (1 - t), -0.7 * t));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      netGeometries.push(geometry);
      goal.add(new THREE.Line(geometry, netMaterial));
    }
    netGeometries.forEach((g) => track(g));

    // --- Holofotes do estádio ---
    const glowTexture = track(makeGlowTexture());
    function makeFloodlight(baseX: number, z: number) {
      const group = new THREE.Group();
      group.position.set(baseX, 0, z);
      scene.add(group);

      const poleMaterial = track(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 }));
      const poleGeometry = track(new THREE.CylinderGeometry(0.06, 0.09, 6, 10));
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 3;
      group.add(pole);

      const light = new THREE.PointLight(0xbfe4ff, 60, 26);
      light.position.y = 6;
      group.add(light);

      const glowMaterial = track(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0xdff2ff,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const glow = new THREE.Sprite(glowMaterial);
      glow.position.y = 6;
      glow.scale.setScalar(3.4);
      group.add(glow);

      return { group, glowMaterial, baseX, z };
    }
    const floodlights = [
      makeFloodlight(-6.4, goalZ + 1),
      makeFloodlight(6.4, goalZ + 1),
      makeFloodlight(-6.8, 3 - PITCH_LENGTH * 0.42),
      makeFloodlight(6.8, 3 - PITCH_LENGTH * 0.42),
    ];

    // --- Poeira / luz flutuante no ar do estádio ---
    const dustCount = 90;
    const dustGeometry = track(new THREE.BufferGeometry());
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSpeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 13;
      dustPositions[i * 3 + 1] = Math.random() * 6;
      dustPositions[i * 3 + 2] = 3 - Math.random() * PITCH_LENGTH;
      dustSpeeds[i] = 0.1 + Math.random() * 0.25;
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = track(
      new THREE.PointsMaterial({
        color: 0xbfe4ff,
        size: 0.028,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    // Estado de enquadramento, recalculado continuamente pela proporção da tela
    // (não por um corte fixo mobile/desktop), pra nunca sobrar vão de um lado.
    const frameState = { baseY: 3.2, lookY: -1, lookZ: -6.5, spread: 1 };

    function applyLayout(width: number, height: number) {
      renderer.setSize(width, height, false);
      const aspect = width / Math.max(height, 1);
      camera.aspect = aspect;

      // t=0 em telas bem estreitas (celular em pé), t=1 em telas bem largas (desktop)
      const t = clamp((aspect - 0.5) / 1.3, 0, 1);

      camera.fov = lerp(68, 44, t);
      const distance = lerp(6, 10.5, t);
      const height3d = lerp(3.9, 3.1, t);
      camera.position.set(0, height3d, distance);

      frameState.baseY = height3d;
      frameState.lookY = lerp(-1.5, -0.5, t);
      frameState.lookZ = lerp(-5, -9, t);
      // em telas bem largas, espalha o campo/holofotes pra preencher a largura
      frameState.spread = lerp(1, 1.55, t);

      pitchGroup.scale.x = frameState.spread;
      for (const f of floodlights) {
        f.group.position.x = f.baseX * frameState.spread;
      }

      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      applyLayout(width, height);
    });
    resizeObserver.observe(container);
    applyLayout(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    let frame = 0;
    let raf = 0;
    function animate() {
      frame += 0.012;

      const idleX = Math.sin(frame * 0.14) * 0.35;
      const idleY = Math.cos(frame * 0.11) * 0.08;

      for (const f of floodlights) {
        f.glowMaterial.opacity = 0.62 + Math.sin(frame * 0.9 + f.group.position.x) * 0.12;
      }

      const pos = dustGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        pos[i * 3 + 1] += dustSpeeds[i] * 0.006;
        if (pos[i * 3 + 1] > 6.2) pos[i * 3 + 1] = 0;
      }
      dustGeometry.attributes.position.needsUpdate = true;

      camera.position.x += (idleX - camera.position.x) * 0.015;
      camera.position.y += (frameState.baseY + idleY - camera.position.y) * 0.015;
      camera.lookAt(0, frameState.lookY, frameState.lookZ);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.dispose();
      disposables.forEach((item) => item.dispose());
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" data-cinzados-three="true" />;
}
