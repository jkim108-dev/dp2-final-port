// =========================
// SCROLL VIDEO CONTROL
// =========================

const video =
document.getElementById('scrollVideo');

const section =
document.querySelector('.scroll-video-section');

// WAIT FOR VIDEO

video.addEventListener('loadedmetadata', () => {

  const duration =
  video.duration;

  // SCROLL EVENT

  window.addEventListener('scroll', () => {

    const scrollTop =
    window.scrollY;

    const sectionTop =
    section.offsetTop;

    const sectionHeight =
    section.offsetHeight -
    window.innerHeight;

    // HOW FAR INSIDE SECTION

    const distance =
    scrollTop - sectionTop;

    // NORMALIZED VALUE

    let progress =
    distance / sectionHeight;

    // LIMIT 0~1

    progress =
    Math.min(
      Math.max(progress,0),
      1
    );

    // VIDEO TIME

    video.currentTime =
    duration * progress;

  });

});