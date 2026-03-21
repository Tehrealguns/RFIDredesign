import * as THREE from 'three';

export function initScene() {
  const canvas = document.getElementById('scene');
  const w = window.innerWidth || document.documentElement.clientWidth || 1280;
  const h = window.innerHeight || document.documentElement.clientHeight || 720;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x061a30, 0.025);

  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(0, 0, 8);

  // ---- LIGHTS ----
  const ambientLight = new THREE.AmbientLight(0x44bdc4, 0.12);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x44bdc4, 0.6);
  mainLight.position.set(5, 8, 5);
  scene.add(mainLight);

  const purpleLight = new THREE.PointLight(0x854c9e, 1.5, 30);
  purpleLight.position.set(-6, 3, -3);
  scene.add(purpleLight);

  const tealLight = new THREE.PointLight(0x44bdc4, 0.8, 25);
  tealLight.position.set(4, -2, 4);
  scene.add(tealLight);

  // ---- MATERIALS ----
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x44bdc4,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });

  const wirePurpleMat = new THREE.MeshBasicMaterial({
    color: 0x854c9e,
    wireframe: true,
    transparent: true,
    opacity: 0.05,
  });

  // ---- FLOATING PARTICLES ----
  const particleCount = 800;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5;
    speeds[i] = Math.random() * 0.5 + 0.2;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x44bdc4,
    size: 0.035,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- GEOMETRIC ACCENTS (wireframe shapes floating in space) ----
  const accents = [];
  const accentConfigs = [
    { geo: new THREE.IcosahedronGeometry(1.2, 1), pos: [5, 2, -6], mat: wireMat },
    { geo: new THREE.OctahedronGeometry(0.8, 0), pos: [-6, -1, -4], mat: wirePurpleMat },
    { geo: new THREE.TetrahedronGeometry(0.6, 0), pos: [3, -4, -7], mat: wireMat },
    { geo: new THREE.DodecahedronGeometry(0.7, 0), pos: [-4, 4, -8], mat: wirePurpleMat },
    { geo: new THREE.IcosahedronGeometry(1.5, 1), pos: [7, -1, -10], mat: wireMat },
    { geo: new THREE.OctahedronGeometry(1, 0), pos: [-7, -4, -9], mat: wirePurpleMat },
    { geo: new THREE.TorusGeometry(0.8, 0.15, 8, 20), pos: [0, 5, -12], mat: wireMat },
    { geo: new THREE.TorusKnotGeometry(0.5, 0.15, 40, 6), pos: [-3, -6, -11], mat: wirePurpleMat },
  ];

  accentConfigs.forEach((cfg) => {
    const mesh = new THREE.Mesh(cfg.geo, cfg.mat.clone());
    mesh.position.set(...cfg.pos);
    mesh.userData = {
      speed: 0.15 + Math.random() * 0.25,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    accents.push(mesh);
  });

  // ---- GRID FLOOR ----
  const gridHelper = new THREE.GridHelper(50, 50, 0x44bdc4, 0x44bdc4);
  gridHelper.position.y = -6;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.025;
  scene.add(gridHelper);

  // ---- CONNECTING LINES (subtle network visualization) ----
  const lineCount = 15;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineCount * 6);
  for (let i = 0; i < lineCount; i++) {
    linePositions[i * 6] = (Math.random() - 0.5) * 20;
    linePositions[i * 6 + 1] = (Math.random() - 0.5) * 15;
    linePositions[i * 6 + 2] = (Math.random() - 0.5) * 15 - 5;
    linePositions[i * 6 + 3] = (Math.random() - 0.5) * 20;
    linePositions[i * 6 + 4] = (Math.random() - 0.5) * 15;
    linePositions[i * 6 + 5] = (Math.random() - 0.5) * 15 - 5;
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x44bdc4,
    transparent: true,
    opacity: 0.03,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ---- MOUSE TRACKING ----
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ---- SCROLL STATE (GSAP will update this) ----
  const scrollState = { progress: 0 };

  // ---- ANIMATION LOOP ----
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    // Particles drift
    const posArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.0015;
      posArr[i * 3] += Math.cos(t * speeds[i] * 0.5 + i) * 0.0008;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y = t * 0.015;

    // Accent shapes rotation + float
    accents.forEach(mesh => {
      const s = mesh.userData.speed;
      mesh.rotation.x = t * s + mesh.userData.phaseX;
      mesh.rotation.y = t * s * 0.7 + mesh.userData.phaseY;
      mesh.position.y += Math.sin(t * s * 0.8 + mesh.userData.phaseX) * 0.0008;
    });

    // Lines subtle rotation
    lines.rotation.y = t * 0.008;
    lines.rotation.x = Math.sin(t * 0.1) * 0.02;

    // Camera parallax from mouse + scroll
    camera.position.x = mouse.x * 0.4;
    camera.position.y = mouse.y * -0.25 + scrollState.progress * -2;
    camera.position.z = 8 - scrollState.progress * 3;
    camera.lookAt(0, scrollState.progress * -2, -4);

    // Lights respond to scroll
    purpleLight.intensity = 1.5 + scrollState.progress * 3;
    tealLight.position.y = -2 + scrollState.progress * 5;

    // Grid moves with scroll
    gridHelper.position.z = -scrollState.progress * 10;

    renderer.render(scene, camera);
  }

  animate();

  // ---- RESIZE ----
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  return { scene, camera, renderer, scrollState, particles, accents, mouse };
}
