/* Slayed by Soup — 3D stage: floating press-on nails, the scroll-built hero nail,
   diamonds, sparkle field, neon bloom. Source file: run `npm run build` to bundle
   into js/scene.js (plain script, no modules, so it runs anywhere). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const canvas = document.getElementById('scene');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 767px), (pointer: coarse)').matches;

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (err) {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .92;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07030a');
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 9);

  // Screen-space backdrop: drifting pink/plum glows (replaces the CSS body glow)
  const backMat = new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false,
    uniforms: { uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uScroll: { value: 0 } },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: /* glsl */`
      uniform vec2 uRes; uniform float uTime, uScroll;
      vec3 glow(vec2 uv, vec2 c, float r, vec3 col){ float d = length((uv - c) * vec2(uRes.x / uRes.y, 1.0)); return col * smoothstep(r, 0.0, d); }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float s = uScroll * 0.15;
        vec3 c = vec3(0.0024, 0.0009, 0.0033);
        c += glow(uv, vec2(0.85 + 0.08 * sin(uTime * 0.13 + s), 1.05 + 0.05 * cos(uTime * 0.11)), 0.95, vec3(0.045, 0.004, 0.021));
        c += glow(uv, vec2(0.05 + 0.06 * cos(uTime * 0.09 + s * 1.3), 0.35 + 0.15 * sin(s)), 0.85, vec3(0.026, 0.002, 0.017));
        c += glow(uv, vec2(0.5 + 0.3 * sin(s * 0.7), -0.15), 0.7, vec3(0.02, 0.001, 0.012));
        gl_FragColor = vec4(c, 1.0);
      }`
  });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backMat);
  back.frustumCulled = false;
  back.renderOrder = -1;
  scene.add(back);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .65;

  const keyPink = new THREE.PointLight(0xff3fb4, 60, 30, 2);
  keyPink.position.set(-4, 2.5, 5);
  const rimPink = new THREE.PointLight(0xff8ad0, 40, 30, 2);
  rimPink.position.set(5, -2, 3);
  const sun = new THREE.DirectionalLight(0xffffff, .9);
  sun.position.set(3, 5, 6);
  scene.add(keyPink, rimPink, sun);

  /* ---------- textures ---------- */
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  const frenchTex = canvasTex(128, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, h, 0, 0);
    grd.addColorStop(0, '#f7a9c9'); grd.addColorStop(.7, '#ffc4dc'); grd.addColorStop(1, '#ffd6e8');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff6fb';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * .36);
    g.quadraticCurveTo(w / 2, h * .1, 0, h * .36); g.closePath(); g.fill();
  });
  const glitterTex = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#ff5fb6'; g.fillRect(0, 0, w, h);
    const cols = ['#ffffff', '#ffd1ec', '#ff2aa6', '#c9b6ff', '#ffe89a'];
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = cols[(Math.random() * cols.length) | 0];
      g.globalAlpha = .5 + Math.random() * .5;
      const s = Math.random() * 3 + .6;
      g.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  });
  const flakeTex = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#ffd3ea'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `hsla(${300 + Math.random() * 80}, 90%, ${75 + Math.random() * 20}%, ${.35 + Math.random() * .5})`;
      g.beginPath();
      const x = Math.random() * w, y = Math.random() * h, r = 8 + Math.random() * 22;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + Math.random();
        g.lineTo(x + Math.cos(a) * r * (0.5 + Math.random()), y + Math.sin(a) * r * (0.5 + Math.random()));
      }
      g.fill();
    }
  });

  /* ---------- nail geometry: a deformed sphere shaped like a press-on ---------- */
  const L = 2.5;
  const archZ = (t) => -Math.pow(t - .45, 2) * .35;
  function nailGeometry(type) {
    const g = new THREE.SphereGeometry(1, 48, 72);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const t = (y + 1) / 2;
      const r = Math.hypot(x, z);
      const th = Math.atan2(z, x);
      let halfW, e;
      if (type === 'stiletto') {
        halfW = .46 * Math.pow(1 - t, .75) + .01;
        e = t > .5 ? .9 : .55;
      } else {
        halfW = .47 - t * .19;
        e = t > .5 ? .22 : .55; // squared-off coffin tip, rounded cuticle
      }
      const rr = Math.pow(r, e);
      const X = Math.cos(th) * rr * halfW;
      const thick = .075 * (1 - t * .35);
      let Z = Math.sin(th) * rr * thick;
      Z += -X * X * .95 + archZ(t); // C-curve + lengthwise arch
      pos.setXYZ(i, X, t * L - L / 2, Z);
      uv.setXY(i, X / .95 + .5, t);
    }
    g.computeVertexNormals();
    return g;
  }
  const geo = { coffin: nailGeometry('coffin'), stiletto: nailGeometry('stiletto') };

  const physical = (o) => new THREE.MeshPhysicalMaterial({ clearcoat: 1, clearcoatRoughness: .04, ...o });
  const mats = {
    french: physical({ map: frenchTex, roughness: .22, sheen: .4, sheenColor: new THREE.Color('#ffd6ea') }),
    iri: physical({ color: '#ff9fd2', roughness: .16, metalness: .2, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 900] }),
    chrome: physical({ color: '#ff7cc9', roughness: .1, metalness: 1 }),
    glitter: physical({ map: glitterTex, roughness: .3, metalness: .45, iridescence: .6 }),
    jelly: mobile
      ? physical({ map: flakeTex, roughness: .08, transparent: true, opacity: .82, iridescence: .7 })
      : physical({ map: flakeTex, roughness: .06, transmission: .75, thickness: .6, ior: 1.45, iridescence: .7 })
  };

  const gemGeo = new THREE.OctahedronGeometry(.09, 0);
  const gemMats = [
    new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: .02, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#ff3fa0', metalness: .9, roughness: .05, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: '#c77dff', metalness: .9, roughness: .05, flatShading: true })
  ];
  function addGems(mesh, count) {
    for (let k = 0; k < count; k++) {
      const gem = new THREE.Mesh(gemGeo, gemMats[k % 3]);
      const t = .18 + Math.random() * .35;
      const x = (Math.random() - .5) * .45;
      gem.position.set(x, t * L - L / 2, .075 - x * x * .95 + archZ(t) + .03);
      const s = .6 + Math.random() * .9;
      gem.scale.set(s, s, s * .55);
      gem.rotation.z = Math.random() * Math.PI;
      mesh.add(gem);
    }
  }

  /* ---------- the nail set ---------- */
  const setup = [
    { type: 'coffin', mat: 'french', gems: 7 },
    { type: 'stiletto', mat: 'jelly', gems: 0 },
    { type: 'coffin', mat: 'iri', gems: 9 },
    { type: 'stiletto', mat: 'chrome', gems: 0 },
    { type: 'coffin', mat: 'glitter', gems: 4 }
  ];
  const group = new THREE.Group();
  scene.add(group);
  const nails = setup.map((cfg, i) => {
    const mesh = new THREE.Mesh(geo[cfg.type], mats[cfg.mat]);
    if (cfg.gems) addGems(mesh, cfg.gems);
    const pivot = new THREE.Group();
    pivot.add(mesh);
    group.add(pivot);
    const a = (i - 2) * .36;
    return {
      pivot, mesh,
      fan: { x: Math.sin(a) * 2.6, y: Math.cos(a) * 1.1 - .9 + (i === 2 ? .15 : 0), z: -Math.abs(i - 2) * .25, rz: -a * 1.05 },
      phase: Math.random() * Math.PI * 2,
      spin: 0, spinVel: 0, hover: 0
    };
  });

  /* ---------- the hero nail that gets built on scroll ---------- */
  const starTex = canvasTex(256, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, h, 0, 0);
    grd.addColorStop(0, '#ff2a9d'); grd.addColorStop(1, '#ff7fcb');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      g.fillStyle = Math.random() > .5 ? '#ffffff' : '#ffc6e6';
      g.globalAlpha = Math.random() * .7;
      const s = Math.random() * 1.8 + .4;
      g.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  });
  const starU = { uFill: { value: 0 }, uNude: { value: new THREE.Color('#c98b7c') }, uEdge: { value: new THREE.Color('#ff3fb4') } };
  const starMat = physical({ map: starTex, roughness: .45, metalness: 0, clearcoat: .3, iridescence: 0, iridescenceIOR: 1.7, iridescenceThicknessRange: [250, 900] });
  starMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, starU);
    sh.fragmentShader = 'uniform float uFill; uniform vec3 uNude; uniform vec3 uEdge;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        float unpainted = smoothstep(uFill - 0.012, uFill + 0.012, vMapUv.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, uNude, unpainted);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float band = (1.0 - smoothstep(0.0, 0.04, abs(vMapUv.y - uFill))) * step(0.001, uFill) * step(uFill, 0.995);
        totalEmissiveRadiance += uEdge * band * 2.5;`);
  };
  const star = new THREE.Group();
  const starMesh = new THREE.Mesh(geo.coffin, starMat);
  star.add(starMesh);
  scene.add(star);
  let starSpin = 0, starSpinVel = 0;

  // Crystals: fly in from all around and land on the nail (Soup's signature cluster)
  const starGems = [];
  const bigGem = new THREE.OctahedronGeometry(.1, 0);
  const gemSpots = [];
  for (let k = 0; k < 7; k++) gemSpots.push([(k - 3) * .105, .16 + Math.abs(k - 3) * .03, 1.1]); // cuticle arc
  for (let k = 0; k < 6; k++) gemSpots.push([(Math.random() - .5) * .34, .24 + Math.random() * .12, .75 + Math.random() * .4]);
  for (let k = 0; k < 7; k++) gemSpots.push([0, .36 + k * .075, 1 - k * .08]); // center line toward tip
  gemSpots.push([0, .23, 2.1]); // the big center stone
  gemSpots.forEach(([x, t, size], k) => {
    const m = new THREE.Mesh(k === gemSpots.length - 1 ? new THREE.OctahedronGeometry(.13, 0) : bigGem, gemMats[k % 3]);
    const target = new THREE.Vector3(x, t * L - L / 2, .075 - x * x * .95 + archZ(t) + .035);
    const a = Math.random() * Math.PI * 2;
    const from = new THREE.Vector3(Math.cos(a) * (3 + Math.random() * 2), Math.sin(a) * (3 + Math.random() * 2), 2 + Math.random() * 3);
    m.visible = false;
    starMesh.add(m);
    starGems.push({ m, target, from, size, delay: k / gemSpots.length * .55, rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6) });
  });

  /* ---------- floating diamonds ---------- */
  const diamondGeo = new THREE.OctahedronGeometry(1, 0);
  const diamonds = [];
  const dCount = mobile ? 5 : 10;
  for (let i = 0; i < dCount; i++) {
    const m = new THREE.Mesh(diamondGeo, gemMats[i % 3]);
    const side = i % 2 ? 1 : -1;
    const base = {
      x: side * (mobile ? 1 + Math.random() * .9 : 4.2 + Math.random() * 3),
      y: (Math.random() - .5) * 10,
      z: -2.5 - Math.random() * 4,
      s: (mobile ? .12 : .12) + Math.random() * .16,
      speed: .5 + Math.random()
    };
    m.scale.set(base.s, base.s * 1.35, base.s);
    diamonds.push({ m, base, rx: Math.random() * 3, ry: Math.random() * 3 });
    scene.add(m);
  }

  /* ---------- sparkle field ---------- */
  const COUNT = mobile ? 900 : 2400;
  const pPos = new Float32Array(COUNT * 3);
  const pSize = new Float32Array(COUNT);
  const pPhase = new Float32Array(COUNT);
  const pDepth = new Float32Array(COUNT);
  const pCol = new Float32Array(COUNT * 3);
  const palette = [new THREE.Color('#ffffff'), new THREE.Color('#ffb8e0'), new THREE.Color('#ff4fb8'), new THREE.Color('#ff8ad0')];
  for (let i = 0; i < COUNT; i++) {
    const d = Math.random();
    pDepth[i] = d;
    pPos[i * 3] = (Math.random() - .5) * 22;
    pPos[i * 3 + 1] = (Math.random() - .5) * 14;
    pPos[i * 3 + 2] = -8 + d * 10;
    pSize[i] = Math.random() < .06 ? 22 + Math.random() * 18 : 4 + Math.random() * 10;
    pPhase[i] = Math.random() * 10;
    const c = palette[(Math.random() * palette.length) | 0];
    pCol.set([c.r, c.g, c.b], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
  pGeo.setAttribute('aPhase', new THREE.BufferAttribute(pPhase, 1));
  pGeo.setAttribute('aDepth', new THREE.BufferAttribute(pDepth, 1));
  pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uH: { value: innerHeight }, uBoost: { value: 0 } },
    vertexShader: /* glsl */`
      attribute float aSize; attribute float aPhase; attribute float aDepth; attribute vec3 aColor;
      uniform float uTime, uScroll, uPR, uH;
      varying float vTw; varying vec3 vColor;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uScroll * (0.35 + aDepth * 0.9) + 7.0, 14.0) - 7.0;
        p.x += sin(uTime * 0.25 + aPhase) * 0.12;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vTw = 0.5 + 0.5 * sin(uTime * (1.0 + fract(aPhase) * 2.5) + aPhase * 6.2831);
        gl_PointSize = aSize * uPR * (0.55 + vTw * 0.7) * (uH / 900.0) * (7.0 / -mv.z);
        vColor = aColor;
      }`,
    fragmentShader: /* glsl */`
      varying float vTw; varying vec3 vColor; uniform float uBoost;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float core = pow(smoothstep(0.5, 0.0, d), 3.0);
        float flare = max(0.0, 1.0 - abs(uv.x) * 16.0) * smoothstep(0.5, 0.0, abs(uv.y))
                    + max(0.0, 1.0 - abs(uv.y) * 16.0) * smoothstep(0.5, 0.0, abs(uv.x));
        float a = min((core + flare * 0.7) * (0.25 + vTw * 0.75) * (1.0 + uBoost * 0.9), 1.0);
        gl_FragColor = vec4(vColor * a, a);
      }`
  });
  const sparkles = new THREE.Points(pGeo, pMat);
  sparkles.frustumCulled = false;
  scene.add(sparkles);

  /* ---------- neon bloom ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .5, .45, .97);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- layout / resize ---------- */
  let W = 0, H = 0, layout = { x: 0, y: 0, s: 1, ringX: 4, ringY: 2.2 };
  function resize() {
    const w = innerWidth, h = innerHeight;
    if (mobile && w === W && Math.abs(h - H) < 160) return; // ignore URL-bar jiggle
    W = w; H = h;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    backMat.uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    pMat.uniforms.uH.value = h;
    const aspect = w / h;
    if (aspect < .8) layout = { x: 0, y: -2.45, s: .62, ringX: 1.25, ringY: 2.5, sx: 0, sy: .95, ss: .95 };
    else if (aspect < 1.25) layout = { x: 1.3, y: -1.1, s: .8, ringX: 2.8, ringY: 2.2, sx: 1.2, sy: 0, ss: 1.1 };
    else layout = { x: 2.75, y: -.75, s: .7, ringX: Math.min(4.6, 2.9 * aspect), ringY: 2.25, sx: 2.2, sy: -.1, ss: 1.25 };
    needsRender = true;
  }
  addEventListener('resize', resize);

  /* ---------- input ---------- */
  const mouse = new THREE.Vector2(0, 0), mouseS = new THREE.Vector2(0, 0), ndc = new THREE.Vector2(-9, -9);
  const ray = new THREE.Raycaster();
  let hovered = null;
  addEventListener('pointermove', (e) => {
    mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ndc.copy(mouse);
  }, { passive: true });
  function pick() {
    if (!group.visible && !star.visible) return null;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(nails.map((n) => n.mesh).concat(star.visible ? [starMesh] : []), false)[0];
    if (!hit) return null;
    return hit.object === starMesh ? 'star' : nails.find((n) => n.mesh === hit.object);
  }
  addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, input, label, .menu, .nav')) return;
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    const n = pick();
    if (n === 'star') { starSpinVel += 14; burstTime = time; } else if (n) { n.spinVel += 14; burstTime = time; }
  });
  window.addEventListener('slay:celebrate', () => { nails.forEach((n, i) => (n.spinVel += 10 + i * 2)); burstTime = time; });

  let introStart = null;
  window.addEventListener('slay:intro', () => { if (introStart === null) introStart = performance.now(); });
  setTimeout(() => { if (introStart === null) introStart = performance.now(); }, 4000);

  /* ---------- scroll state ---------- */
  const bookEl = document.getElementById('book');
  const buildEl = document.getElementById('build');
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  let lastBuild = 0;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const smooth = (v) => v * v * (3 - 2 * v);
  const ease = (v) => 1 - Math.pow(1 - v, 4);

  /* ---------- loop ---------- */
  let time = 0, last = performance.now(), running = true, needsRender = true, burstTime = -10;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; last = performance.now(); if (running) requestAnimationFrame(tick); });
  addEventListener('scroll', () => { needsRender = true; }, { passive: true });

  function update(dt) {
    if (!reduce) time += dt;
    const heroP = clamp01(scrollY / innerHeight);
    const br = bookEl.getBoundingClientRect();
    const bookP = smooth(clamp01(1 - br.top / innerHeight));
    const intro = reduce ? 1 : introStart === null ? 0 : ease(clamp01((performance.now() - introStart) / 1800));

    pMat.uniforms.uTime.value = time;
    backMat.uniforms.uTime.value = time;
    backMat.uniforms.uScroll.value = scrollY / innerHeight;
    pMat.uniforms.uScroll.value = scrollY / innerHeight * 1.6;

    mouseS.lerp(reduce ? mouse.set(0, 0) : mouse, .05);
    camera.position.x = mouseS.x * .35;
    camera.position.y = mouseS.y * .25;
    camera.lookAt(0, 0, 0);

    const inBook = bookP > 0.001;
    group.visible = heroP < .999 || inBook;

    if (!reduce && group.visible && ndc.x > -2) {
      const h = pick();
      if (h !== hovered) {
        hovered = h;
        document.body.style.cursor = h ? 'pointer' : '';
        window.dispatchEvent(new CustomEvent('slay:nailhover', { detail: !!h }));
      }
    }

    const burst = Math.max(0, 1 - (time - burstTime) * 1.2);
    nails.forEach((n, i) => {
      const f = reduce ? 0 : Math.sin(time * .9 + n.phase);
      n.spinVel *= Math.pow(.04, dt);
      n.spin += n.spinVel * dt;
      n.hover += ((hovered === n ? 1 : 0) - n.hover) * Math.min(1, dt * 8);

      let x, y, z, rx, ry, rz, s;
      if (!inBook) {
        const lift = heroP * 6.5;
        x = layout.x + n.fan.x * layout.s * (1 + heroP * .6);
        y = layout.y + n.fan.y * layout.s + lift + f * .08;
        z = n.fan.z + heroP * 1.5;
        rz = n.fan.rz + f * .05 + heroP * (i - 2) * .5;
        rx = -.25 + mouseS.y * .3 + heroP * .8;
        ry = mouseS.x * .45 + Math.sin(time * .5 + n.phase) * .12 + n.spin;
        s = layout.s * intro * (1 + n.hover * .12);
        // intro: fly up from below with a twist
        y -= (1 - intro) * 3;
        ry += (1 - intro) * 4;
      } else {
        const a = (i / nails.length) * Math.PI * 2 + time * .28;
        x = Math.cos(a) * layout.ringX;
        y = Math.sin(a) * layout.ringY - (1 - bookP) * 9;
        z = -2.2 + Math.sin(a) * .8;
        rz = a - Math.PI / 2;
        rx = .2;
        ry = time * .8 + n.phase + n.spin;
        s = layout.s * .85 * (1 + n.hover * .12);
      }
      s *= 1 + burst * .15;
      n.pivot.position.set(x, y, z);
      n.pivot.rotation.set(rx, ry, rz);
      n.pivot.scale.setScalar(Math.max(s, .0001));
    });

    diamonds.forEach((d, i) => {
      const b = d.base;
      const yy = ((b.y + scrollY / innerHeight * b.speed * 1.8 + 7) % 14 + 14) % 14 - 7;
      d.m.position.set(b.x + Math.sin(time * .4 + i) * .2, yy + Math.sin(time * .7 + i) * .15, b.z);
      d.m.rotation.set(d.rx + time * .3 * b.speed, d.ry + time * .5 * b.speed, 0);
    });

    /* ----- the build ----- */
    let bp = reduce ? 1 : (window.__slayBuild || 0);
    let vis = 0;
    if (buildEl) {
      const r = buildEl.getBoundingClientRect();
      vis = clamp01(Math.min(1 - r.top / innerHeight, r.bottom / innerHeight));
      const enter = clamp01(1 - r.top / innerHeight), exit = clamp01(r.bottom / innerHeight);
      star.visible = vis > 0.001;
      if (star.visible) {
        if (bp >= .88 && lastBuild < .88) { burstTime = time; starSpinVel += 9; window.dispatchEvent(new CustomEvent('slay:slayed')); }
        lastBuild = bp;
        starSpinVel *= Math.pow(.04, dt);
        starSpin += starSpinVel * dt;
        const intro = smooth(seg(bp, 0, .22));
        const finale = ease(seg(bp, .86, .96));
        star.position.set(
          layout.sx + mouseS.x * .15,
          layout.sy - (1 - smooth(enter)) * 7 + (1 - exit) * 7 + (reduce ? 0 : Math.sin(time * .9) * .06),
          0);
        star.rotation.set(-.15 + mouseS.y * .2, (1 - intro) * Math.PI * 2.5 + finale * Math.PI * 2 + mouseS.x * .35 + starSpin + (reduce ? 0 : Math.sin(time * .6) * .1), -.22 + (1 - intro) * .5);
        star.scale.setScalar(layout.ss * (1 + burst * .06));
        // polish flood (cuticle -> tip), then chrome shine
        starU.uFill.value = smooth(seg(bp, .3, .5));
        const shine = smooth(seg(bp, .5, .68));
        starMat.roughness = .45 - shine * .37;
        starMat.metalness = shine * .5;
        starMat.clearcoat = .3 + shine * .7;
        starMat.iridescence = shine;
        // crystals fly in and land
        const cp = seg(bp, .68, .86);
        starGems.forEach((g) => {
          const k = clamp01((cp - g.delay) / .45);
          g.m.visible = k > 0;
          if (!g.m.visible) return;
          const e = ease(k);
          g.m.position.lerpVectors(g.from, g.target, e);
          g.m.rotation.set(g.rot.x * (1 - e), g.rot.y * (1 - e) + (k >= 1 ? 0 : time * 3), g.rot.z * (1 - e) + .8);
          const pop = k >= 1 ? 1 : e + Math.sin(k * Math.PI) * .6;
          g.m.scale.set(g.size * pop, g.size * pop, g.size * .55 * pop);
        });
      }
    }

    pMat.uniforms.uBoost.value = burst;
    bloom.strength = .55 + burst * .9;
    keyPink.intensity = 60 + burst * 120;
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    if (!reduce || needsRender) {
      update(dt);
      composer.render();
      needsRender = false;
    }
    requestAnimationFrame(tick);
  }

  resize();
  canvas.classList.add('is-ready');
  requestAnimationFrame(tick);
}

start();
