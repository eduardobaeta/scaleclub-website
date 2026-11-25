import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Same curve as the `--easing-standard` token: cubic-bezier(0.22, 1, 0.36, 1) is easeOutQuint. */
export const STANDARD_EASE = 'power4.out';

export { gsap, ScrollTrigger };
