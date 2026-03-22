import { initScene } from './scene.js';
import { initScrollAnimations } from './scroll.js';
import Lenis from 'lenis';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

  // ---- SMOOTH SCROLL (Lenis) ----
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  // Init Three.js scene
  const sceneCtx = initScene();

  // Init GSAP scroll animations after a tick (ensure layout)
  requestAnimationFrame(() => {
    initScrollAnimations(sceneCtx);
  });

  // ---- SCROLL-DRIVEN VIDEO (Parallel Frame Loading) ----
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    const TOTAL_FRAMES = 120;
    const frames = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let currentFrame = 0;
    let targetFrame = 0;

    // Size canvas to viewport
    const resizeCanvas = () => {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
      // Redraw current frame after resize
      const idx = Math.round(currentFrame);
      if (frames[idx]) drawFrame(idx);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Step 1: Play video once to populate browser cache, then seek all frames
    const loadFrames = async () => {
      const video = document.createElement('video');
      video.src = '/video/bg.mp4';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      await new Promise(r => video.addEventListener('loadeddata', r, { once: true }));

      const duration = video.duration;
      const step = duration / TOTAL_FRAMES;
      const loaderText = document.querySelector('.loader-text');

      // Use a smaller offscreen canvas for speed
      const ow = Math.round(video.videoWidth * 0.65);
      const oh = Math.round(video.videoHeight * 0.65);

      // Extract with multiple video elements in parallel (4 workers)
      const WORKERS = 4;
      const chunkSize = Math.ceil(TOTAL_FRAMES / WORKERS);

      const extractChunk = async (startIdx, endIdx) => {
        const v = document.createElement('video');
        v.src = '/video/bg.mp4';
        v.muted = true;
        v.playsInline = true;
        v.preload = 'auto';
        v.crossOrigin = 'anonymous';
        await new Promise(r => v.addEventListener('loadeddata', r, { once: true }));

        const c = document.createElement('canvas');
        c.width = ow;
        c.height = oh;
        const cx = c.getContext('2d');

        for (let i = startIdx; i < endIdx && i < TOTAL_FRAMES; i++) {
          v.currentTime = i * step;
          await new Promise(r => v.addEventListener('seeked', r, { once: true }));
          cx.drawImage(v, 0, 0, ow, oh);
          frames[i] = await createImageBitmap(c);
          loadedCount++;
          if (loaderText) {
            loaderText.textContent = `${Math.round((loadedCount / TOTAL_FRAMES) * 100)}%`;
          }
        }
      };

      // Launch all chunks in parallel
      const promises = [];
      for (let w = 0; w < WORKERS; w++) {
        const start = w * chunkSize;
        const end = start + chunkSize;
        promises.push(extractChunk(start, end));
      }
      await Promise.all(promises);

      // Draw first frame and hide loader
      drawFrame(0);
      document.getElementById('loader').classList.add('hidden');
    };

    // Draw a specific frame to the canvas, cover-fit
    const drawFrame = (index) => {
      const frame = frames[index];
      if (!frame) return;

      const cw = bgCanvas.width;
      const ch = bgCanvas.height;
      const scale = Math.max(cw / frame.width, ch / frame.height);
      const dw = frame.width * scale;
      const dh = frame.height * scale;

      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    // Smooth animation loop
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      if (loadedCount > 0) {
        currentFrame = lerp(currentFrame, targetFrame, 0.12);
        const idx = Math.min(Math.round(currentFrame), loadedCount - 1);
        if (idx >= 0 && frames[idx]) {
          drawFrame(idx);
        }
      }
      requestAnimationFrame(tick);
    };
    tick();

    // Map scroll to frame index
    window.addEventListener('scroll', () => {
      if (loadedCount < 2) return;
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(y / maxScroll, 0), 1);
      targetFrame = progress * (TOTAL_FRAMES - 1);
    }, { passive: true });

    // Start loading
    loadFrames();
  }

  // Loader is hidden by frame extraction completion above

  // Navigation scroll state
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = y;

    // Scroll progress bar
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (y / total) * 100;
    document.getElementById('scroll-progress').style.width = pct + '%';
  }, { passive: true });

  // Mobile hamburger
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Drag scroll for case studies
  const casesScroll = document.querySelector('.cases-scroll');
  if (casesScroll) {
    let isDown = false, startX, scrollLeft;
    casesScroll.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - casesScroll.offsetLeft;
      scrollLeft = casesScroll.scrollLeft;
    });
    casesScroll.addEventListener('mouseleave', () => isDown = false);
    casesScroll.addEventListener('mouseup', () => isDown = false);
    casesScroll.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - casesScroll.offsetLeft;
      casesScroll.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }
});
