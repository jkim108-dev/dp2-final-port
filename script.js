// =========================
// PROJECT CARD ANIMATION
// =========================

const cards = document.querySelectorAll('.project-card');

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if(entry.isIntersecting){

      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0px)";

    }

  });

}, {
  threshold:0.15
});

cards.forEach((card) => {

  card.style.opacity = "0";
  card.style.transform = "translateY(60px)";
  card.style.transition =
  "1.2s cubic-bezier(.16,1,.3,1)";

  observer.observe(card);

});


// =========================
// IMAGE SLIDER
// =========================

const sliders = document.querySelectorAll('.image-slider');

sliders.forEach((slider) => {

  const slides = slider.querySelectorAll('.slider-image');

  // 이미지 1개면 실행 안 함
  if(slides.length <= 1) return;

  let currentSlide = 0;

  // 초기화
  slides.forEach((slide) => {
    slide.classList.remove('active');
  });

  slides[0].classList.add('active');

  setInterval(() => {

    slides[currentSlide].classList.remove('active');

    currentSlide++;

    if(currentSlide >= slides.length){
      currentSlide = 0;
    }

    slides[currentSlide].classList.add('active');

  }, 3200);

});