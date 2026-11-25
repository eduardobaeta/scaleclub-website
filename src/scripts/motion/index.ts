import { ScrollTrigger } from './gsap-setup';
import { initHeroBadges } from './hero-badges';
import { initHeroMesh } from './hero-mesh';
import { initHorizontalCards } from './horizontal-cards';
import { initPps } from './pps';
import { prefersReducedMotion } from './reduced-motion';
import { initReveals } from './reveals';
import { initScrollSteps } from './scroll-steps';
import { initTableSequence } from './table-sequence';

export function initMotion(): void {
  // Scroll-driven states follow the visitor's own scrolling, so they run even with reduced motion.
  initScrollSteps();
  initTableSequence();
  initHorizontalCards();

  if (prefersReducedMotion()) return;

  initHeroMesh();

  // Reveal positions are measured after the web fonts settle.
  document.fonts.ready.then(() => {
    initReveals();
    initHeroBadges();
    initPps();
    ScrollTrigger.refresh();
  });
}
