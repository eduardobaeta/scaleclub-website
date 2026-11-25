import { gsap } from './gsap-setup';

const DIM = 0.2;

export function initPps(): void {
  const section = document.querySelector<HTMLElement>('[data-pps]');
  if (!section) return;

  const tagline = section.querySelector('[data-pps-tagline]');
  const lines = section.querySelectorAll('[data-pps-line]');
  const letters = section.querySelector('[data-pps-letters]');

  gsap.set(tagline, { opacity: 1 });
  gsap.set(lines, { opacity: 0 });
  gsap.set(letters, { opacity: 0, scale: 0.6 });

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
  });

  timeline
    .to(tagline, { opacity: 0, duration: 0.6 }, 0.4)
    .to(lines, { opacity: DIM, duration: 0.6 }, 0.6)
    .to(lines[0] ?? null, { opacity: 1, duration: 1 }, 1.4)
    .to(lines[1] ?? null, { opacity: 1, duration: 1 }, 2.4)
    .to(lines[2] ?? null, { opacity: 1, duration: 1 }, 3.4)
    .to(lines, { opacity: DIM, duration: 0.6 }, 4.8)
    .to(letters, { opacity: 1, scale: 1, duration: 0.8 }, 4.8)
    .to({}, { duration: 1.2 });
}
