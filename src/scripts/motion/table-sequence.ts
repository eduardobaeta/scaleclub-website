const PRELOAD_MARGIN = '100% 0px';

function readFrameUrls(canvas: HTMLCanvasElement): string[] {
  const parsed: unknown = JSON.parse(canvas.dataset.frames ?? '[]');
  return Array.isArray(parsed) ? parsed.filter((url): url is string => typeof url === 'string') : [];
}

export function initTableSequence(): void {
  const section = document.querySelector<HTMLElement>('[data-table-sequence]');
  const canvas = section?.querySelector<HTMLCanvasElement>('[data-table-canvas]');
  const context = canvas?.getContext('2d');
  if (!section || !canvas || !context) return;

  const track = section.querySelector<HTMLElement>('[data-table-track]');
  const urls = readFrameUrls(canvas);
  const phases = [...section.querySelectorAll<HTMLElement>('[data-table-phase]')];
  let frames: HTMLImageElement[] = [];
  let frame = 0;
  let drawnKey = '';

  // The frames and phases play while the track scrolls by; the offer block then rises over the last frame.
  const trackLength = () => Math.max(1, track?.offsetHeight ?? window.innerHeight);
  const progress = () => Math.min(1, Math.max(0, -section.getBoundingClientRect().top / trackLength()));

  const drawCover = (image: HTMLImageElement, alpha: number) => {
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.globalAlpha = alpha;
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  };

  const drawFrame = (value: number) => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      drawnKey = '';
    }

    const position = value * (frames.length - 1);
    const base = Math.floor(position);
    const next = Math.min(frames.length - 1, base + 1);
    const key = String(Math.round(position * 100));
    const current = frames[base];
    if (key === drawnKey || !current?.complete || !current.naturalWidth) return;

    drawnKey = key;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCover(current, 1);
    const following = frames[next];
    if (following?.complete && following.naturalWidth && next !== base) drawCover(following, position - base);
    context.globalAlpha = 1;
  };

  // Phases end as the offer block starts to rise, so the two never overlap.
  const showPhase = (value: number) => {
    const phasesEnd = Math.max(0.1, (trackLength() - window.innerHeight) / trackLength());
    const phaseValue = value / phasesEnd;
    const active = phaseValue >= 1 ? -1 : Math.floor(phaseValue * phases.length);
    phases.forEach((element, index) => {
      element.dataset.active = String(index === active);
      element.inert = index !== active;
    });
  };

  const render = () => {
    frame = 0;
    const value = progress();
    if (frames.length > 0) drawFrame(value);
    showPhase(value);
  };
  const schedule = () => {
    frame ||= requestAnimationFrame(render);
  };

  const loader = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      loader.disconnect();
      frames = urls.map((url) => {
        const image = new Image();
        image.decoding = 'async';
        image.addEventListener('load', schedule, { once: true });
        image.src = url;
        return image;
      });
    },
    { rootMargin: PRELOAD_MARGIN },
  );
  loader.observe(section);

  render();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}
