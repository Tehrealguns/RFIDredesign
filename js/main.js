import { initScene } from './scene.js';
import { initScrollAnimations } from './scroll.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // Init Three.js scene
  const sceneCtx = initScene();

  // Init GSAP scroll animations after a tick (ensure layout)
  requestAnimationFrame(() => {
    initScrollAnimations(sceneCtx);
  });

  // Hide loader
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1200);

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
