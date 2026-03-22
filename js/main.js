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

  // ---- SCROLL-DRIVEN VIDEO (Canvas Frame Sequence) ----
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    const frames = [];
    const TOTAL_FRAMES = 120;
    let framesLoaded = false;
    let currentFrame = 0;
    let targetFrame = 0;

    // Size canvas to viewport
    const resizeCanvas = () => {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Extract all frames from video into ImageBitmap array
    const extractFrames = () => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = '/video/bg.mp4';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        video.addEventListener('loadeddata', async () => {
          const duration = video.duration;
          const step = duration / TOTAL_FRAMES;
          // Use half-res for faster extraction + less memory
          const offscreen = document.createElement('canvas');
          offscreen.width = Math.round(video.videoWidth / 1.5);
          offscreen.height = Math.round(video.videoHeight / 1.5);
          const offCtx = offscreen.getContext('2d');

          const loaderText = document.querySelector('.loader-text');

          for (let i = 0; i < TOTAL_FRAMES; i++) {
            video.currentTime = i * step;
            await new Promise(r => {
              video.addEventListener('seeked', r, { once: true });
            });
            offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
            const bitmap = await createImageBitmap(offscreen);
            frames.push(bitmap);

            // Update loader with progress
            if (loaderText) {
              loaderText.textContent = `${Math.round(((i + 1) / TOTAL_FRAMES) * 100)}%`;
            }
          }

          framesLoaded = true;
          drawFrame(0);
          // Hide loader now that frames are ready
          document.getElementById('loader').classList.add('hidden');
          resolve();
        });
      });
    };

    // Draw a specific frame to the canvas, cover-fit
    const drawFrame = (index) => {
      const frame = frames[index];
      if (!frame) return;

      const cw = bgCanvas.width;
      const ch = bgCanvas.height;
      const fw = frame.width;
      const fh = frame.height;

      // Cover fit calculation
      const scale = Math.max(cw / fw, ch / fh);
      const dw = fw * scale;
      const dh = fh * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(frame, dx, dy, dw, dh);
    };

    // Smooth animation loop — lerps to target frame
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      if (framesLoaded) {
        currentFrame = lerp(currentFrame, targetFrame, 0.12);
        const idx = Math.round(currentFrame);
        if (idx >= 0 && idx < frames.length) {
          drawFrame(idx);
        }
      }
      requestAnimationFrame(tick);
    };
    tick();

    // Map scroll position to frame index (triangle wave)
    window.addEventListener('scroll', () => {
      if (!framesLoaded) return;
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(y / maxScroll, 0), 1);
      targetFrame = progress * (TOTAL_FRAMES - 1);
    }, { passive: true });

    // Start extraction
    extractFrames();
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
