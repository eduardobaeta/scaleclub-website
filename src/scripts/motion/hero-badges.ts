import { gsap, STANDARD_EASE } from './gsap-setup';

export function initHeroBadges(): void {
  const badges = gsap.utils.toArray<HTMLElement>('[data-hero-badge]');
  if (badges.length === 0) return;

  gsap.from(badges, { autoAlpha: 0, y: 24, duration: 0.8, ease: STANDARD_EASE, stagger: 0.05, delay: 0.2 });

  const header = document.querySelector<HTMLElement>('[data-site-header]');
  badges.forEach((badge) => {
    gsap.to(badge, {
      autoAlpha: 0,
      scale: 0.8,
      duration: 0.3,
      immediateRender: false,
      scrollTrigger: {
        trigger: badge,
        start: () => `top ${(header?.offsetHeight ?? 80) + 8}px`,
        toggleActions: 'play none none reverse',
      },
    });
  });
}
