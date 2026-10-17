/* =========================================================
   프라미스A 교습소 — 나가려 할 때 뜨는 체크리스트 팝업

   "못 나가게 막는" 것이 아니라, 떠나기 직전에 한 번 더
   "우리 아이에게 맞는 곳인지" 스스로 판단할 기회를 드립니다.

   언제 뜨나
     · PC   — 마우스가 화면 위(주소창 쪽)로 빠져나갈 때
     · 모바일 — 뒤로가기를 처음 눌렀을 때 (한 번만 가로챕니다)

   언제 뜨지 않나
     · 이미 상담 신청을 마친 분
     · 한 번 닫은 분 (7일간)
     · 같은 방문에서 이미 본 경우
     · 상담 신청서를 작성하는 중일 때
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  /* 구글 상담신청서 주소가 있으면 팝업에서도 바로 그 폼으로 보냅니다 */
  var FORM = CFG.googleFormUrl && CFG.googleFormUrl.indexOf('FORM_ID') === -1 ? CFG.googleFormUrl : '';
  var KEY_DISMISS = 'promiseA.exitIntent.dismissedUntil';
  var KEY_DONE = 'promiseA.consult.submitted';
  var KEY_SEEN = 'promiseA.exitIntent.seen';

  /* ── 체크리스트 (교습소 실제 기준에 맞춘 문항) ───── */
  var ITEMS = [
    '학원을 다녀도 남는 게 없다고 느낀 적이 있다',
    '단어는 외우는데 문장을 정확히 쓰지는 못한다',
    '해석은 하는데 무슨 내용인지 정리하지 못한다',
    '과제를 스스로 챙기는 습관이 아직 없다',
    '조용히 집중할 수 있는 분위기를 원한다',
    '확인받고 다시 하는 과정을 아이가 견딜 수 있다'
  ];

  var RESULTS = [
    { min: 4, title: '프라미스A와 잘 맞을 가능성이 높습니다',
      text: '체크하신 부분이 바로 저희가 매 수업 잡는 것들입니다. 상담에서 학생 상태를 보고 필요한 부분을 정확히 말씀드리겠습니다.' },
    { min: 2, title: '한 번 상담해 보시길 권합니다',
      text: '해당되는 항목이 있다면 지금 방식에서 놓치고 있는 부분이 있을 수 있습니다. 상담은 무료이고, 맞지 않으면 그 점도 솔직하게 말씀드립니다.' },
    { min: 1, title: '천천히 알아보셔도 좋습니다',
      text: '급하게 결정하실 필요는 없습니다. 블로그에서 수업 이야기를 먼저 보시거나, 카카오톡 채널로 편하게 물어보세요.' },
    { min: 0, title: '먼저 편하게 둘러보세요',
      text: '궁금한 점이 생기면 카카오톡 채널로 물어보실 수 있습니다. 블로그에 수업 이야기를 올리고 있습니다.' }
  ];

  /* ── 저장소 (사생활 보호 모드에서도 오류가 나지 않도록) ── */
  function get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, val) { try { window.localStorage.setItem(key, val); } catch (e) { /* noop */ } }
  function seenThisVisit() { try { return window.sessionStorage.getItem(KEY_SEEN) === '1'; } catch (e) { return false; } }
  function markSeen() { try { window.sessionStorage.setItem(KEY_SEEN, '1'); } catch (e) { /* noop */ } }

  function shouldSkip() {
    if (seenThisVisit()) return true;
    if (get(KEY_DONE) === '1') return true;               // 이미 상담 신청을 마친 분
    var until = Number(get(KEY_DISMISS) || 0);
    if (until && Date.now() < until) return true;          // 닫은 뒤 7일
    return false;
  }

  /* 상담 신청서를 쓰는 중이면 방해하지 않습니다 */
  function isFillingForm() {
    var el = document.activeElement;
    if (el && el.closest && el.closest('#consult-form')) return true;
    var form = document.getElementById('consult-form');
    if (!form) return false;
    var name = form.querySelector('[name="studentName"]');
    var phone = form.querySelector('[name="phone"]');
    return !!((name && name.value.trim()) || (phone && phone.value.trim()));
  }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* ── 화면 만들기 ────────────────────────────────── */
  var backdrop, modal, lastFocused;

  function build() {
    backdrop = document.createElement('div');
    backdrop.className = 'exit-backdrop';
    backdrop.hidden = true;

    modal = document.createElement('div');
    modal.className = 'exit-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'exit-title');

    var hasBlog = !!CFG.blogUrl;
    var hasKakao = !!CFG.kakaoChannelUrl;
    var onLanding = /landing\.html$/.test(location.pathname);

    modal.innerHTML =
      '<button type="button" class="exit-close" aria-label="닫기">✕</button>' +
      '<p class="exit-eyebrow">잠깐만요</p>' +
      '<h2 id="exit-title">우리 아이에게 맞는 곳일까요?</h2>' +
      '<p class="exit-lead">해당되는 것만 눌러 보세요. 30초면 됩니다.</p>' +
      '<ul class="exit-list">' +
        ITEMS.map(function (t, i) {
          return '<li><label><input type="checkbox" data-idx="' + i + '"><span>' + esc(t) + '</span></label></li>';
        }).join('') +
      '</ul>' +
      '<div class="exit-result" id="exit-result" aria-live="polite"></div>' +
      '<div class="exit-actions">' +
        (FORM
          ? '<a class="btn btn-primary" href="' + esc(FORM) + '" target="_blank" rel="noopener" data-cta="exit-consult">상담신청서 작성하기</a>'
          : '<a class="btn btn-primary" href="' + (onLanding ? '#consult-form' : 'contact.html#consult-form') +
            '" data-cta="exit-consult">상담 신청하기</a>') +
        (hasKakao
          ? '<a class="btn btn-ghost" href="' + esc(CFG.kakaoChannelUrl) + '" target="_blank" rel="noopener" data-cta="exit-kakao">카카오톡으로 물어보기</a>'
          : '') +
        (hasBlog
          ? '<a class="btn btn-ghost" href="' + esc(CFG.blogUrl) + '" target="_blank" rel="noopener" data-cta="exit-blog">블로그 먼저 보기</a>'
          : '') +
      '</div>' +
      '<button type="button" class="exit-later">괜찮습니다, 그냥 둘러볼게요</button>';

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    modal.querySelector('.exit-close').addEventListener('click', function () { close(true); });
    modal.querySelector('.exit-later').addEventListener('click', function () { close(true); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(true); });
    modal.addEventListener('change', updateResult);
    modal.addEventListener('click', function (e) {
      var link = e.target.closest('a[data-cta]');
      if (link) close(false);
    });
    document.addEventListener('keydown', onKeydown);
  }

  function updateResult() {
    var checked = modal.querySelectorAll('input[type="checkbox"]:checked').length;
    var r = RESULTS[0];
    for (var i = 0; i < RESULTS.length; i++) {
      if (checked >= RESULTS[i].min) { r = RESULTS[i]; break; }
    }
    var box = modal.querySelector('#exit-result');
    box.className = 'exit-result is-shown' + (checked >= 2 ? ' is-fit' : '');
    box.innerHTML = '<strong>' + esc(r.title) + '</strong><span>' + esc(r.text) + '</span>';
    if (window.trackEvent) window.trackEvent('exit_checklist', { checked: checked });
  }

  /* ── 열기 / 닫기 ────────────────────────────────── */
  function open(reason) {
    if (!modal || !backdrop.hidden) return;
    if (shouldSkip() || isFillingForm()) return;

    lastFocused = document.activeElement;
    backdrop.hidden = false;
    document.body.classList.add('exit-open');
    markSeen();

    var first = modal.querySelector('.exit-close');
    if (first && first.focus) first.focus();
    if (window.trackEvent) window.trackEvent('exit_intent_open', { reason: reason });
  }

  function close(dismissed) {
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.classList.remove('exit-open');
    if (dismissed) {
      set(KEY_DISMISS, String(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7일간 다시 안 뜸
      if (window.trackEvent) window.trackEvent('exit_intent_dismiss', {});
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (backdrop.hidden) return;
    if (e.key === 'Escape') { close(true); return; }
    if (e.key !== 'Tab') return;
    // 포커스가 팝업 밖으로 나가지 않도록
    var focusables = modal.querySelectorAll('a[href], button, input');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ── 감지 ───────────────────────────────────────── */
  function watchDesktop() {
    document.addEventListener('mouseout', function (e) {
      if (e.relatedTarget || e.toElement) return;   // 창 밖으로 나간 경우만
      if (e.clientY > 8) return;                    // 위쪽(주소창·닫기 버튼)으로 향할 때만
      open('desktop-mouseout');
    });
  }

  function watchMobileBack() {
    // 히스토리에 한 칸 넣어 두고 '뒤로가기'를 딱 한 번만 가로챕니다.
    // 팝업이 뜬 뒤 다시 뒤로가기를 누르면 정상적으로 이전 화면으로 나갑니다.
    var armed = true;
    try { history.pushState({ promiseAExit: 1 }, '', location.href); } catch (e) { return; }
    window.addEventListener('popstate', function () {
      if (!armed) return;
      armed = false;
      if (shouldSkip() || isFillingForm()) return;  // 조건에 안 맞으면 그냥 나가게 둡니다
      open('mobile-back');
    });
  }

  /* 터치 기기 판별 — (hover: none) 하나만 보면 터치스크린 노트북 등에서
     잘못 판정됩니다. 실제 터치 지점 수까지 함께 확인합니다. */
  function isTouch() {
    if ((navigator.maxTouchPoints || 0) > 0) return true;
    return !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    if (shouldSkip()) return;
    build();
    /* 마우스 이탈 감지는 항상 켜 둡니다 — 터치 기기에서는 애초에 발생하지 않으므로
       기기 판별이 틀려도 손해가 없습니다.
       뒤로가기 가로채기는 터치 기기에서만 (PC에서는 뒤로가기를 그대로 둡니다) */
    watchDesktop();
    if (isTouch()) watchMobileBack();
  });
})();
