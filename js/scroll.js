import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations(sceneCtx) {
  const { scrollState } = sceneCtx;

  // ---- GLOBAL SCROLL PROGRESS (drives 3D scene) ----
  ScrollTrigger.create({
    trigger: '#content',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      scrollState.progress = self.progress;
    }
  });

  // ---- HERO ANIMATIONS ----
  const heroTL = gsap.timeline({ delay: 1.4 });

  heroTL
    .to('.hero-tag', {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    })
    .to('.hero-title .word', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.12,
      ease: 'expo.out'
    }, '-=0.4')
    .to('.hero-sub', {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5')
    .to('.hero-ctas', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.scroll-indicator', {
      opacity: 0.6,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2');

  // Fade out hero on scroll
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '60% top',
      scrub: 0.5,
    },
    opacity: 0,
    y: -80,
    scale: 0.95,
  });

  gsap.to('.scroll-indicator', {
    scrollTrigger: {
      trigger: '#hero',
      start: '10% top',
      end: '30% top',
      scrub: 0.3,
    },
    opacity: 0,
  });

  // ---- RFID INTRO ----
  gsap.to('#rfid-intro .reveal-text', {
    scrollTrigger: {
      trigger: '#rfid-intro',
      start: 'top 75%',
      end: 'top 30%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  gsap.to('.rfid-hero-img', {
    scrollTrigger: {
      trigger: '.rfid-hero-img',
      start: 'top 85%',
      end: 'top 50%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  gsap.to('#rfid-intro .split-right .reveal-fade:first-child', {
    scrollTrigger: {
      trigger: '#rfid-intro .split-right',
      start: 'top 70%',
      end: 'top 35%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  // Stats counter animation
  const statItems = document.querySelectorAll('#rfid-intro .stat-item');
  statItems.forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 0.5,
      },
      opacity: 1,
      y: 0,
    });

    // Counter animation
    const numEl = item.querySelector('.stat-number');
    const target = parseInt(numEl.dataset.count);
    ScrollTrigger.create({
      trigger: item,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            numEl.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });

  // ---- TRUSTED SECTION ----
  gsap.to('.trusted-title', {
    scrollTrigger: {
      trigger: '.section--trusted',
      start: 'top 80%',
      end: 'top 50%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  // ---- SOLUTIONS ----
  gsap.to('#solutions .section-label', {
    scrollTrigger: {
      trigger: '#solutions',
      start: 'top 75%',
      end: 'top 50%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  gsap.to('#solutions .section-title', {
    scrollTrigger: {
      trigger: '#solutions',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  document.querySelectorAll('.solution-card').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        end: 'top 50%',
        scrub: 0.5,
      },
      opacity: 1,
      y: 0,
      delay: i * 0.1,
    });
  });

  // ---- CASE STUDIES ----
  gsap.to('#case-studies .section-label', {
    scrollTrigger: {
      trigger: '#case-studies',
      start: 'top 75%',
      end: 'top 50%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  gsap.to('#case-studies .section-title', {
    scrollTrigger: {
      trigger: '#case-studies',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  // ---- TECHNOLOGY ----
  gsap.to('#technology .section-label', {
    scrollTrigger: {
      trigger: '#technology',
      start: 'top 75%',
      end: 'top 50%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  gsap.to('#technology .section-title', {
    scrollTrigger: {
      trigger: '#technology',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  document.querySelectorAll('.tech-item').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        end: 'top 55%',
        scrub: 0.5,
      },
      opacity: 1,
      y: 0,
    });
  });

  // ---- ABOUT ----
  gsap.to('#about .section-title', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  gsap.to('.about-description', {
    scrollTrigger: {
      trigger: '.about-description',
      start: 'top 80%',
      end: 'top 50%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  gsap.to('.credentials-row', {
    scrollTrigger: {
      trigger: '.credentials-row',
      start: 'top 85%',
      end: 'top 55%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  // ---- PARTNERS ----
  gsap.to('#partners .section-title', {
    scrollTrigger: {
      trigger: '#partners',
      start: 'top 70%',
      end: 'top 45%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  document.querySelectorAll('.partner-card').forEach((card) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        end: 'top 60%',
        scrub: 0.5,
      },
      opacity: 1,
      y: 0,
    });
  });

  // ---- CONTACT ----
  gsap.to('#contact .section-title', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  document.querySelectorAll('#contact .reveal-fade').forEach((el) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 55%',
        scrub: 0.5,
      },
      opacity: 1,
      y: 0,
    });
  });

  gsap.to('.contact-form', {
    scrollTrigger: {
      trigger: '.contact-form',
      start: 'top 85%',
      end: 'top 55%',
      scrub: 0.5,
    },
    opacity: 1,
    y: 0,
  });

  // ---- SECTION LABELS (generic) ----
  document.querySelectorAll('.section-label').forEach(label => {
    if (label.closest('#solutions') || label.closest('#case-studies') || label.closest('#technology')) return;
    gsap.to(label, {
      scrollTrigger: {
        trigger: label,
        start: 'top 80%',
        end: 'top 55%',
        scrub: 0.5,
      },
      opacity: 1,
      y: 0,
    });
  });
}
