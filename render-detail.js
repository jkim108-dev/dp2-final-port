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

  // Tie still-image visibility to position, so scrolling back reverses the reveal.
  const revealImages = [...document.querySelectorAll('[data-scroll-reveal]')];
  const revealPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let revealFrame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const soften = value => value * value * (3 - 2 * value);

  function renderReveals() {
    revealFrame = 0;
    const height = window.innerHeight;
    const navHeight = document.querySelector('.product-nav')?.offsetHeight || 0;
    // Read stable figure bounds before writing transforms to their images.
    const states = revealImages.map(figure => {
      const rect = figure.getBoundingClientRect();
      const enter = soften(clamp((height - rect.top) / (height * 0.32)));
      const leave = soften(clamp((rect.bottom - navHeight) / (height * 0.25)));
      const visible = revealPreference.matches ? 1 : Math.min(enter, leave);
      return {
        figure,
        opacity: visible.toFixed(3),
        shift: revealPreference.matches ? '0px' : `${((1 - enter) * 30 - (1 - leave) * 14).toFixed(2)}px`,
        scale: revealPreference.matches ? '1' : (0.98 + visible * 0.02).toFixed(4),
      };
    });
    states.forEach(({figure, opacity, shift, scale}) => {
      figure.style.setProperty('--reveal-opacity', opacity);
      figure.style.setProperty('--reveal-shift', shift);
      figure.style.setProperty('--reveal-scale', scale);
      figure.classList.add('scroll-reveal-ready');
    });
  }
  function requestReveals() {
    if (!revealFrame) revealFrame = requestAnimationFrame(renderReveals);
  }
  if (revealImages.length) {
    window.addEventListener('scroll', requestReveals, { passive: true });
    window.addEventListener('resize', requestReveals, { passive: true });
    window.addEventListener('load', requestReveals, { once: true });
    revealPreference.addEventListener('change', requestReveals);
    revealImages.forEach(figure => {
      figure.querySelector('img')?.addEventListener('load', requestReveals, { once: true });
    });
    requestReveals();
  }


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
