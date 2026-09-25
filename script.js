// Просмотр фото на весь экран: свайп — нативная прокрутка со «щелчком» (scroll-snap),
// без библиотек. Кнопка «Назад» на телефоне закрывает фото, а не уводит с сайта.
(function () {
  var viewer = document.querySelector('.viewer');
  var track = viewer.querySelector('.viewer__track');
  var count = viewer.querySelector('.viewer__count');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.gallery__item img'));
  var sticky = document.querySelector('.btn--sticky');
  var built = false;

  if (typeof viewer.showModal !== 'function') return; // очень старый браузер: фото просто в сетке

  function build() {
    thumbs.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'viewer__slide';
      var full = document.createElement('img');
      full.alt = img.alt;
      full.decoding = 'async';
      full.loading = 'lazy';
      full.src = img.dataset.full || img.src;
      slide.appendChild(full);
      track.appendChild(slide);
    });
    built = true;
  }

  function current() {
    return Math.round(track.scrollLeft / track.clientWidth);
  }

  var shown = 0; // номер открытого фото — нужен при повороте экрана, когда ширина уже другая

  function updateCount() {
    shown = current();
    count.textContent = (shown + 1) + ' из ' + thumbs.length;
  }

  function go(i) {
    i = Math.max(0, Math.min(thumbs.length - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }

  function open(i) {
    if (!built) build();
    viewer.showModal();
    sticky.hidden = true;
    document.documentElement.style.overflow = 'hidden';
    track.scrollLeft = i * track.clientWidth;
    updateCount();
    history.pushState({ foto: true }, '');
  }

  function cleanup() {
    sticky.hidden = false;
    document.documentElement.style.overflow = '';
  }

  thumbs.forEach(function (img, i) {
    img.parentElement.addEventListener('click', function () { open(i); });
  });

  track.addEventListener('scroll', updateCount, { passive: true });
  viewer.querySelector('.viewer__close').addEventListener('click', function () { history.back(); });
  viewer.querySelector('.viewer__arrow--prev').addEventListener('click', function () { go(current() - 1); });
  viewer.querySelector('.viewer__arrow--next').addEventListener('click', function () { go(current() + 1); });

  viewer.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') go(current() - 1);
    if (e.key === 'ArrowRight') go(current() + 1);
  });

  // Esc закрывает окно сам — убираем и лишнюю запись в истории
  viewer.addEventListener('cancel', function (e) { e.preventDefault(); history.back(); });

  window.addEventListener('popstate', function () {
    if (viewer.open) { viewer.close(); cleanup(); }
  });

  // при повороте экрана держим текущее фото на месте
  window.addEventListener('resize', function () {
    if (viewer.open) track.scrollLeft = shown * track.clientWidth;
  });
})();
