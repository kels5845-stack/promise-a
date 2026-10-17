/* =========================================================
   프라미스A 교습소 — 공통 스크립트
   1) 모바일 내비게이션  2) 현재 메뉴 표시  3) 전화번호 자동 반영
   4) 애널리틱스(구글·네이버·빙·클래리티) 로딩  5) 이벤트 추적 헬퍼
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var A = CFG.analytics || {};

  /* ── 0) 웹폰트 적용 ─────────────────────────────
     폰트 스타일시트는 media="print"로 걸어 두어 화면 표시와 스크립트를
     막지 않습니다. 페이지가 준비되면 여기서 실제로 적용합니다.
     (폰트 서버가 막혀 있어도 시스템 글꼴로 정상 표시됩니다) */
  function enableWebfonts() {
    var links = document.querySelectorAll('link[data-font]');
    for (var i = 0; i < links.length; i++) links[i].media = 'all';
  }

  /* ── 1) 모바일 내비게이션 ───────────────────────── */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    // 데스크톱으로 넓어지면 열림 상태 초기화
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 900px)');
      var onChange = function (ev) { if (ev.matches) close(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ── 2) 현재 페이지 메뉴 표시 ───────────────────── */
  function initCurrentNav() {
    var path = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '/') || '/';
    var file = path.split('/').pop() || 'index.html';
    if (file === '') file = 'index.html';
    var links = document.querySelectorAll('#site-nav a[href]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || href.charAt(0) === '#') continue;
      var target = href.split('/').pop().split('#')[0] || 'index.html';
      if (target === file) links[i].setAttribute('aria-current', 'page');
    }
  }

  /* ── 3) 전화번호·연도 자동 반영 ─────────────────── */
  function initDynamicText() {
    var tel = CFG.tel || '';
    if (tel) {
      var digits = tel.replace(/[^0-9+]/g, '');
      var telNodes = document.querySelectorAll('[data-tel]');
      for (var i = 0; i < telNodes.length; i++) {
        var el = telNodes[i];
        if (el.tagName === 'A') el.setAttribute('href', 'tel:' + digits);
        if (el.hasAttribute('data-tel-text')) el.textContent = tel;
      }
    }
    var years = document.querySelectorAll('[data-year]');
    for (var j = 0; j < years.length; j++) years[j].textContent = String(new Date().getFullYear());
  }

  /* ── 4) 애널리틱스 ──────────────────────────────── */
  function loadScript(src, attrs) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
    return s;
  }

  function initGA4(id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id));
  }

  function initNaver(accountId) {
    var s = loadScript('https://wcs.naver.net/wcslog.js');
    s.addEventListener('load', function () {
      if (!window.wcs_add) window.wcs_add = {};
      window.wcs_add.wa = accountId;
      if (window.wcs && typeof window.wcs_do === 'function') window.wcs_do();
    });
  }

  function initBingUet(tagId) {
    (function (w, d, t, r, u) {
      var f, n, i;
      w[u] = w[u] || [];
      f = function () {
        var o = { ti: tagId, enableAutoSpaTracking: true };
        o.q = w[u]; w[u] = new w.UET(o); w[u].push('pageLoad');
      };
      n = d.createElement(t); n.src = r; n.async = 1;
      n.onload = n.onreadystatechange = function () {
        var s = this.readyState;
        if (s && s !== 'loaded' && s !== 'complete') return;
        f(); n.onload = n.onreadystatechange = null;
      };
      i = d.getElementsByTagName(t)[0]; i.parentNode.insertBefore(n, i);
    })(window, document, 'script', 'https://bat.bing.com/bat.js', 'uetq');
  }

  function initClarity(id) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', id);
  }

  function initAnalytics() {
    // '' 또는 예시값(XXXX 포함)이면 로드하지 않음 → 잘못된 요청 방지
    // 값이 비어 있거나 예시값(XXXX…)이면 로드하지 않습니다.
    var valid = function (v) { return typeof v === 'string' && v.length > 3 && !/X{4,}/.test(v); };
    try {
      if (valid(A.ga4)) initGA4(A.ga4);
      if (valid(A.naver)) initNaver(A.naver);
      if (valid(A.bingUet)) initBingUet(A.bingUet);
      if (valid(A.clarity)) initClarity(A.clarity);
    } catch (e) { /* 애널리틱스 실패가 사이트를 막지 않도록 */ }
  }

  /* ── 5) 이벤트 추적 헬퍼 ────────────────────────── */
  window.trackEvent = function (name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
      if (window.uetq && window.uetq.push) window.uetq.push('event', name, params || {});
      if (typeof window.clarity === 'function') window.clarity('event', name);
    } catch (e) { /* noop */ }
  };

  /* 랜딩 페이지의 '준비 중' 버튼 (블로그·카카오 채널 주소 미설정 시) */
  function initPendingLinks() {
    var buttons = document.querySelectorAll('[data-pending]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        var label = e.currentTarget.getAttribute('data-pending');
        var row = e.currentTarget.closest('.btn-row') || e.currentTarget.parentNode;
        var note = row.parentNode.querySelector('.pending-note');
        if (!note) {
          note = document.createElement('p');
          note.className = 'pending-note';
          note.setAttribute('role', 'status');
          row.parentNode.insertBefore(note, row.nextSibling);
        }
        note.innerHTML = label + ' 주소가 아직 연결되지 않았습니다. ' +
          '<a href="#consult-form">상담 신청서</a>를 남겨 주시거나 전화로 문의해 주세요.';
      });
    }
  }

  function initCtaTracking() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="tel:"], a[data-cta]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) window.trackEvent('call_click', { location: a.getAttribute('data-cta') || 'unknown' });
      else window.trackEvent('cta_click', { location: a.getAttribute('data-cta') });
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    enableWebfonts();
    initNav();
    initCurrentNav();
    initPendingLinks();
    initDynamicText();
    initCtaTracking();
    initAnalytics();
  });
})();
