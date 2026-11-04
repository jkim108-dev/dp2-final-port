(() => {
  const tabs = [...document.querySelectorAll('.finish-tab')];
  function selectFinish(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectFinish(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectFinish(tabs[next], true);
    });
  });

  const video = document.getElementById('scrollVideo');
  const section = document.querySelector('.scroll-video-section');
  const sticky = document.querySelector('.sticky-video-container');
  const progressBar = document.getElementById('motionProgress');
  if (!video || !section || !sticky) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frameDuration = 1 / 60;
  let start = 0, distance = 1, target = 0, position = 0;
  let animation = 0, previousTime = 0;

  function wake() {
    if (!animation && !reducedMotion.matches && Number.isFinite(video.duration)) {
      previousTime = performance.now();
      animation = requestAnimationFrame(update);
    }
  }
  function readScroll() {
    if (reducedMotion.matches) return;
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
    target = progress * Math.max(0, (video.duration || 0) - frameDuration);
    if (progressBar) progressBar.value = progress;
    wake();
  }
  function measure() {
    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    start = section.getBoundingClientRect().top + window.scrollY - stickyTop;
    distance = Math.max(1, section.offsetHeight - sticky.offsetHeight);
    readScroll();
  }
  function update(now) {
    animation = 0;
    if (reducedMotion.matches) return;
    const elapsed = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
    previousTime = now;
    // A short ease softens wheel steps without leaving the film behind the scroll.
    position += (target - position) * (1 - Math.exp(-elapsed / 0.065));
    const settled = Math.abs(target - position) < frameDuration / 2;
    if (settled) position = target;
    // Finish decoding each seek before requesting the next frame.
    if (!video.seeking && video.readyState >= 2 &&
        Math.abs(video.currentTime - position) > frameDuration / 2) {
      video.currentTime = position;
    }
    if (!settled) animation = requestAnimationFrame(update);
  }
  function setMotionPreference() {
    cancelAnimationFrame(animation);
    animation = 0;
    video.pause();
    video.controls = reducedMotion.matches;
    measure();
  }
  video.addEventListener('seeked', wake);
  video.addEventListener('loadeddata', wake);
  video.addEventListener('loadedmetadata', measure);
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  reducedMotion.addEventListener('change', setMotionPreference);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  setMotionPreference();
})();
