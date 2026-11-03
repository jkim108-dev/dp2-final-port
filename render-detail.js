// Ease scroll changes into the video without interrupting an unfinished seek.
(() => {
  const video = document.getElementById('scrollVideo');
  const section = document.querySelector('.scroll-video-section');
  if (!video || !section) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frameDuration = 1 / 60;
  let start = 0, distance = 1, target = 0, position = 0;
  let animation = 0, previousTime = 0;

  function wake() {
    if (!animation && Number.isFinite(video.duration)) {
      previousTime = performance.now();
      animation = requestAnimationFrame(update);
    }
  }
  function readScroll() {
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
    target = progress * Math.max(0, (video.duration || 0) - frameDuration);
    wake();
  }
  function measure() {
    start = section.getBoundingClientRect().top + window.scrollY;
    distance = Math.max(1, section.offsetHeight - window.innerHeight);
    readScroll();
  }
  function update(now) {
    animation = 0;
    const elapsed = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
    previousTime = now;
    const amount = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 0.12);
    position += (target - position) * amount;
    const settled = Math.abs(target - position) < frameDuration / 2;
    if (settled) position = target;
    // Wait for the previous decoded frame instead of cancelling its seek.
    if (!video.seeking && video.readyState >= 2 &&
        Math.abs(video.currentTime - position) > frameDuration / 2) {
      video.currentTime = position;
    }
    if (!settled) animation = requestAnimationFrame(update);
  }
  video.addEventListener('seeked', wake);
  video.addEventListener('loadeddata', wake);
  video.addEventListener('loadedmetadata', measure);
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  if (video.readyState >= 1) measure();
})();
