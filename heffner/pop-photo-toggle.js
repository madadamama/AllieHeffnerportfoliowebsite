(function () {
  var layout = document.querySelector('.pop-page--photo-reveal .pop-layout');
  var btn = document.querySelector('.pop-photo-toggle');
  var photoId = btn && btn.getAttribute('aria-controls');
  var photo = photoId ? document.getElementById(photoId) : null;
  if (!layout || !btn || !photo) return;

  var label = btn.querySelector('.visually-hidden');

  btn.addEventListener('click', function () {
    var open = layout.classList.toggle('is-photo-open');
    photo.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-open', open);
    if (label) {
      label.textContent = open ? 'Hide photo' : 'Show photo';
    }
  });
})();
