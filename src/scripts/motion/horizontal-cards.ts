import { gsap } from './gsap-setup';

export function initHorizontalCards(): void {
  document.querySelectorAll<HTMLElement>('[data-horizontal-cards]').forEach((section) => {
    const track = section.querySelector<HTMLElement>('[data-horizontal-track]');
    if (!track) return;

    const distance = () => Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? 0));
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
  });
}
