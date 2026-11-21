"use client";
import { useEffect, useRef } from "react";
import * as T from "three";
import type { PortalState, Quality } from "@/core/portal";
import { linkPortalCamera, targetSize } from "@/renderer/portalCamera";
import { PortalLifecycle } from "@/renderer/lifecycle";

interface Props {
  state: PortalState;
  quality: Quality;
  onMetrics: (fps: number, calls: number) => void;
  onError: (message: string) => void;
}
export default function PortalCanvas({
  state,
  quality,
  onMetrics,
  onError,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef(state);
  useEffect(() => {
    current.current = state;
  }, [state]);
  useEffect(() => {
    const element = host.current!;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        alpha: true,
        antialias: quality !== "Low",
        preserveDrawingBuffer: true,
      });
    } catch {
      onError("WebGL is unavailable. Enable hardware acceleration and reload.");
      return;
    }
    renderer.setPixelRatio(
      Math.min(
        devicePixelRatio,
        quality === "High" ? 2 : quality === "Low" ? 1 : 1.5,
      ),
    );
    renderer.setClearColor(0x000000, 0);
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D portal into a procedural floating island",
    );
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 8.4);
    const destination = new T.Scene();
    destination.background = new T.Color("#111c31");
    destination.fog = new T.FogExp2("#1b2640", 0.035);
    const dc = new T.PerspectiveCamera();
    const exit = new T.Object3D();
    exit.position.set(0, 0, 3);
    exit.rotation.y = Math.PI;
    destination.add(new T.HemisphereLight("#c5e4ff", "#282039", 3));
    const sun = new T.DirectionalLight("#ffe4bb", 4);
    sun.position.set(3, 6, 4);
    destination.add(sun);
    const island = new T.Group();
    island.rotation.x = 0.25;
    destination.add(island);
    const ground = new T.Mesh(
      new T.CylinderGeometry(1.65, 0.25, 1.6, quality === "Low" ? 12 : 32, 5),
      new T.MeshStandardMaterial({
        color: "#677d72",
        flatShading: true,
        roughness: 1,
      }),
    );
    ground.position.y = -0.85;
    island.add(ground);
    const grass = new T.Mesh(
      new T.CylinderGeometry(1.65, 1.65, 0.14, 48),
      new T.MeshStandardMaterial({ color: "#75a493", roughness: 1 }),
    );
    island.add(grass);
    for (let i = 0; i < 19; i++) {
      const a = i * 2.399;
      const r = 0.35 + (((i * 17) % 13) / 13) * 1.1;
      const tree = new T.Mesh(
        new T.ConeGeometry(0.12 + (i % 3) * 0.04, 0.5 + (i % 4) * 0.13, 6),
        new T.MeshStandardMaterial({
          color: i % 3 ? "#326e66" : "#88bca5",
          flatShading: true,
        }),
      );
      tree.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
      island.add(tree);
    }
    const arch = new T.Mesh(
      new T.TorusGeometry(0.45, 0.07, 8, 32, Math.PI),
      new T.MeshStandardMaterial({ color: "#e8dfcd", roughness: 0.6 }),
    );
    arch.position.set(0.15, 0.12, 0);
    island.add(arch);
    for (let i = 0; i < 7; i++) {
      const rock = new T.Mesh(
        new T.IcosahedronGeometry(0.13 + i * 0.016, 0),
        new T.MeshStandardMaterial({ color: "#b6c0c5", flatShading: true }),
      );
      rock.position.set(
        Math.sin(i * 8) * 2.3,
        -0.8 + (i % 3) * 0.55,
        Math.cos(i * 8) * 1.8,
      );
      island.add(rock);
    }
    const water = new T.Mesh(
      new T.PlaneGeometry(0.13, 1.8),
      new T.MeshBasicMaterial({
        color: "#9bd9ef",
        transparent: true,
        opacity: 0.7,
        side: T.DoubleSide,
      }),
    );
    water.position.set(0.8, -0.8, 1.45);
    island.add(water);
    const rt = new T.WebGLRenderTarget(
      quality === "Low" ? 384 : quality === "High" ? 1024 : 640,
      quality === "Low" ? 384 : quality === "High" ? 1024 : 640,
    );
    const portal = new T.Group();
    scene.add(portal);
    const auraMaterial = new T.ShaderMaterial({
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        tint: { value: new T.Color(current.current.color) },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 vUv; uniform float time; uniform vec3 tint;
      void main(){vec2 p=(vUv-.5)*4.4;float angle=atan(p.y,p.x);float r=length(p);
      float ripple=sin(angle*17.+time*2.)*.012+sin(angle*31.-time*3.)*.007;
      float edge=abs(r-1.51-ripple);float glow=exp(-edge*18.)*.42;
      float filaments=pow(max(0.,sin(angle*33.+time*1.4+r*11.)),12.)*exp(-edge*7.)*.36;
      float alpha=(glow+filaments)*smoothstep(1.43,1.5,r);
      gl_FragColor=vec4(tint,alpha);}`,
    });
    const aura = new T.Mesh(new T.PlaneGeometry(4.4, 4.4), auraMaterial);
    aura.position.z = 0.08;
    portal.add(aura);
    const surfaceMaterial = new T.ShaderMaterial({
      uniforms: {
        view: { value: rt.texture },
        resolution: { value: new T.Vector2(1, 1) },
      },
      vertexShader: `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform sampler2D view;uniform vec2 resolution;void main(){gl_FragColor=texture2D(view,gl_FragCoord.xy/resolution);
      #include <colorspace_fragment>
      }`,
      side: T.FrontSide,
    });
    const disk = new T.Mesh(new T.CircleGeometry(1.48, 96), surfaceMaterial);
    portal.add(disk);
    const rings: T.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const ring = new T.Mesh(
        new T.TorusGeometry(
          1.5 + i * 0.065,
          i === 0 ? 0.026 : 0.008,
          8,
          160,
          i === 2 ? Math.PI * 1.65 : Math.PI * 2,
        ),
        new T.MeshBasicMaterial({
          color: i % 2 ? "#e5d4ad" : current.current.color,
          transparent: true,
          opacity: i === 0 ? 1 : 0.55,
        }),
      );
      ring.position.z = 0.03 + i * 0.003;
      ring.rotation.z = i;
      portal.add(ring);
      rings.push(ring);
    }
    const glyphs = new T.Group();
    portal.add(glyphs);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const rune = new T.BufferGeometry().setFromPoints([
        new T.Vector3(-0.035, -0.055, 0),
        new T.Vector3(0, 0.055, 0),
        new T.Vector3(0, 0.055, 0),
        new T.Vector3(0.035, -0.055, 0),
        new T.Vector3(-0.03, 0, 0),
        new T.Vector3(0.03, 0, 0),
        new T.Vector3(0, -0.055, 0),
        new T.Vector3(0, 0.03, 0),
      ]);
      const glyph = new T.LineSegments(
        rune,
        new T.LineBasicMaterial({
          color: "#e5d4ad",
          transparent: true,
          opacity: 0.8,
        }),
      );
      glyph.position.set(Math.cos(a) * 1.76, Math.sin(a) * 1.76, 0);
      glyph.rotation.z = a;
      glyphs.add(glyph);
    }
    const count = quality === "Low" ? 180 : quality === "High" ? 1200 : 550;
    const positions = new Float32Array(count * 3);
    const random = (i: number) => {
      const v = Math.sin(i * 127.1) * 43758.5453;
      return v - Math.floor(v);
    };
    for (let i = 0; i < count; i++) {
      const a = random(i + 1) * Math.PI * 2,
        r = 1.5 + random(i + 100) * 1.5;
      positions.set(
        [Math.cos(a) * r, Math.sin(a) * r, (random(i + 800) - 0.5) * 1.2],
        i * 3,
      );
    }
    const pg = new T.BufferGeometry();
    pg.setAttribute("position", new T.BufferAttribute(positions, 3));
    const particleMaterial = new T.ShaderMaterial({
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        formation: { value: 1 },
        strength: { value: 1 },
        tint: { value: new T.Color("#d1baff") },
      },
      vertexShader: `uniform float time;uniform float formation;varying float alpha;void main(){float angle=time*.25+length(position)*.4;mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));vec3 p=position;p.xy=rotation*p.xy*(.2+.8*formation);p.z+=sin(time+position.x*3.)*.09;vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;gl_PointSize=clamp(14./-view.z,1.,4.);alpha=.3+.7*fract(position.x*13.7+position.y*8.3);}`,
      fragmentShader: `uniform vec3 tint;uniform float strength;varying float alpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(tint,(1.-r)*alpha*strength);}`,
    });
    const particles = new T.Points(pg, particleMaterial);
    portal.add(particles);
    const spark = new T.Mesh(
      new T.SphereGeometry(0.035, 12, 8),
      new T.MeshBasicMaterial({ color: "#fce7cb" }),
    );
    scene.add(spark);
    const lifecycle = new PortalLifecycle();
    const resize = () => {
      const w = element.clientWidth,
        h = element.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const size = targetSize(
        w,
        h,
        quality === "Low" ? 512 : quality === "High" ? 1536 : 1024,
      );
      rt.setSize(size.width, size.height);
      renderer.getDrawingBufferSize(surfaceMaterial.uniforms.resolution.value);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    let frame = 0,
      last = performance.now(),
      frames = 0,
      scale = 1;
    let lost = false;
    let previousFrame = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const contextLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      onError("Graphics context lost. Restore graphics to rebuild the scene.");
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (lost || document.hidden || now - previousFrame < 1000 / 60) return;
      previousFrame = now;
      const s = current.current;
      const t = reducedMotion ? 0 : now * 0.001;
      const life = lifecycle.update(s.open, now, reducedMotion);
      renderer.domElement.dataset.phase = life.phase;
      auraMaterial.uniforms.time.value = t;
      auraMaterial.uniforms.tint.value.set(s.color);
      scale = Math.max(0.001, s.scale * life.amount);
      portal.scale.setScalar(scale);
      portal.visible = life.phase !== "closed";
      portal.position.set(s.x, s.y, 0);
      spark.position.copy(portal.position);
      spark.visible = life.phase === "detection" || life.phase === "collapse";
      spark.scale.setScalar(0.4 + Math.sin(life.amount * Math.PI) * 4);
      disk.scale.setScalar(Math.max(0.001, life.aperture));
      particleMaterial.uniforms.time.value = t;
      particleMaterial.uniforms.formation.value = life.amount;
      particleMaterial.uniforms.strength.value = s.intensity * life.energy;
      portal.rotation.y = s.yaw ?? 0;
      camera.position.x = s.viewX ?? 0;
      camera.lookAt(0, 0, 0);
      rings.forEach((ring, i) => {
        ring.rotation.z = t * (i % 2 ? -0.12 : 0.08) * (i + 1);
        (ring.material as T.MeshBasicMaterial).color.set(
          i % 2 ? "#e5d4ad" : s.color,
        );
      });
      glyphs.rotation.z = -t * 0.035;
      particles.rotation.z = t * 0.045;
      island.rotation.y = Math.sin(t * 0.13) * 0.22;
      island.position.y = Math.sin(t * 0.65) * 0.07;
      const palette =
        s.destination === "Glacier"
          ? ["#162a42", "#b6d9e5", "#b8edf5"]
          : s.destination === "Ember"
            ? ["#301521", "#b76b4d", "#cf8c59"]
            : ["#14263b", "#677d72", "#75a493"];
      destination.background = new T.Color(palette[0]);
      (ground.material as T.MeshStandardMaterial).color.set(palette[1]);
      (grass.material as T.MeshStandardMaterial).color.set(palette[2]);
      const linked = linkPortalCamera(camera, portal, exit, dc);
      disk.visible = linked.front && scale > 0.001;
      renderer.domElement.dataset.portalFront = String(linked.front);
      renderer.domElement.dataset.viewX = String(s.viewX ?? 0);
      renderer.domElement.dataset.yaw = String(s.yaw ?? 0);
      renderer.domElement.dataset.geometries = String(
        renderer.info.memory.geometries,
      );
      renderer.setRenderTarget(rt);
      renderer.clippingPlanes = [linked.plane];
      if (disk.visible) renderer.render(destination, dc);
      renderer.clippingPlanes = [];
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      frames++;
      if (now - last > 1000) {
        onMetrics(
          Math.round((frames * 1000) / (now - last)),
          renderer.info.render.calls,
        );
        frames = 0;
        last = now;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      [scene, destination].forEach((s) =>
        s.traverse((o) => {
          if (
            o instanceof T.Mesh ||
            o instanceof T.Points ||
            o instanceof T.Line
          ) {
            o.geometry.dispose();
            const materials = Array.isArray(o.material)
              ? o.material
              : [o.material];
            materials.forEach((m) => m.dispose());
          }
        }),
      );
      rt.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [quality, onMetrics, onError]);
  return <div className="portal-canvas" ref={host} />;
}
