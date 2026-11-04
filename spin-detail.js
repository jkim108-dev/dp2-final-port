const photoDialog = document.querySelector('.photo-dialog');
const dialogImage = photoDialog.querySelector('.dialog-image');
const photoCaption = document.querySelector('#photo-caption');
let lastPhotoButton;

document.querySelectorAll('[data-photo]').forEach((button) => {
  button.addEventListener('click', () => {
    lastPhotoButton = button;
    dialogImage.src = button.dataset.photo;
    dialogImage.alt = button.querySelector('img').alt;
    photoCaption.textContent = button.dataset.caption;
    photoDialog.showModal();
    document.body.classList.add('photo-open');
  });
});

photoDialog.querySelector('.close-photo').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', (event) => {
  if (event.target !== photoDialog) return;
  const bounds = photoDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close();
});
photoDialog.addEventListener('close', () => {
  document.body.classList.remove('photo-open');
  lastPhotoButton?.focus({ preventScroll: true });
});
