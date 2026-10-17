/* =========================================================
   수업 맛보기 영상
   썸네일을 먼저 보여 주고, 누를 때만 유튜브 재생기를 띄웁니다.
   그래야 페이지가 가볍고, 보지 않는 분의 정보도 유튜브로 넘어가지 않습니다.
   ========================================================= */
(function () {
  'use strict';

  function play(btn) {
    var id = btn.getAttribute('data-video');
    var title = btn.getAttribute('data-title') || '수업 영상';
    if (!id || btn.classList.contains('is-playing')) return;

    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
                '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    frame.title = title;
    frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('loading', 'lazy');

    btn.innerHTML = '';
    btn.appendChild(frame);
    btn.classList.add('is-playing');
    btn.setAttribute('aria-label', title + ' 재생 중');

    if (typeof window.trackEvent === 'function') {
      window.trackEvent('video_play', { video_title: title });
    }
  }

  function init() {
    var list = document.querySelectorAll('.video-frame[data-video]');
    for (var i = 0; i < list.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () { play(btn); });
      })(list[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
