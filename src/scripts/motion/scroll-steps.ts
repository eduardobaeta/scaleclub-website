/** Mirrors the reference's pinned sections: each trigger that crosses the middle of the viewport advances a step. */
const STEP_THRESHOLD = 0.5;

type StepHandler = (section: HTMLElement, step: number) => void;

export function initScrollSteps(): void {
  document.querySelectorAll<HTMLElement>('[data-scroll-steps]').forEach((section) => {
    const triggers = [...section.querySelectorAll<HTMLElement>('[data-step-trigger]')];
    const handler: StepHandler = section.dataset.scrollSteps === 'areas' ? showArea : showProgress;
    let current = -1;
    let frame = 0;

    const update = () => {
      frame = 0;
      const threshold = window.innerHeight * STEP_THRESHOLD;
      const step = triggers.filter((trigger) => trigger.getBoundingClientRect().top <= threshold).length;
      if (step === current) return;
      current = step;
      handler(section, step);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  });
}

/** Items share a step through `data-step-index` (a diagram part and its card); otherwise their order is the step. */
function showProgress(section: HTMLElement, step: number): void {
  const items = [...section.querySelectorAll<HTMLElement>('[data-step-item]')];
  const indexOf = (item: HTMLElement, position: number) => Number(item.dataset.stepIndex ?? position);
  const lastIndex = Math.max(...items.map(indexOf));
  items.forEach((item, position) => {
    const index = indexOf(item, position);
    const finished = step > lastIndex + 1;
    item.dataset.state = finished || index < step - 1 ? 'done' : index === step - 1 ? 'current' : 'hidden';
  });
}

function showArea(section: HTMLElement, step: number): void {
  section.dataset.phase = step === 0 ? 'intro' : 'list';
  const active = Math.max(0, step - 1);
  const items = [...section.querySelectorAll<HTMLElement>('[data-step-item]')];
  items.forEach((item, index) => (item.dataset.active = String(index === active)));
  section
    .querySelectorAll<HTMLElement>('[data-step-detail]')
    .forEach((detail, index) => (detail.dataset.active = String(step > 0 && index === active)));

  const list = section.querySelector<HTMLElement>('[data-areas-list]');
  const activeItem = items[active];
  if (list && activeItem) {
    list.style.transform = `translateY(${-(activeItem.offsetTop + activeItem.offsetHeight / 2)}px)`;
  }
}
