import { gsap, STANDARD_EASE } from './gsap-setup';

const REVEAL_START = 'top 88%';
const RISE_DISTANCE = 16;
const DURATION = 0.7;

function revealElement(element: HTMLElement): void {
  const delay = Number(element.dataset.revealDelay ?? 0) || 0;
  const from: gsap.TweenVars = { autoAlpha: 0 };
  if (element.dataset.reveal !== 'fade') from.y = RISE_DISTANCE;

  gsap.from(element, {
    ...from,
    duration: DURATION,
    delay,
    ease: STANDARD_EASE,
    clearProps: 'transform',
    scrollTrigger: { trigger: element, start: REVEAL_START, once: true },
  });
}

export function initReveals(): void {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(revealElement);
}
