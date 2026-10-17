/* =========================================================
   프라미스A 교습소 — 상담 신청 폼
   신청 → 서버(서버리스 함수) → 솔라피 알림톡 → 구글 상담신청서 링크 자동 발송
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var form = document.getElementById('consult-form');
  if (!form) return;

  var statusBox = document.getElementById('form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var openedAt = Date.now();

  /* ── 유틸 ───────────────────────────────────────── */
  function setStatus(kind, html) {
    if (!statusBox) return;
    statusBox.className = 'form-status is-shown is-' + kind;
    statusBox.innerHTML = html;
    statusBox.setAttribute('role', kind === 'err' ? 'alert' : 'status');
  }
  function clearStatus() {
    if (!statusBox) return;
    statusBox.className = 'form-status';
    statusBox.innerHTML = '';
  }
  function showError(field, message) {
    var el = form.querySelector('[name="' + field + '"]');
    var err = document.getElementById('err-' + field);
    if (el) { el.setAttribute('aria-invalid', 'true'); }
    if (err) { err.textContent = message; err.classList.add('is-shown'); }
    if (el && el.focus) el.focus();
  }
  function clearErrors() {
    var invalid = form.querySelectorAll('[aria-invalid="true"]');
    for (var i = 0; i < invalid.length; i++) invalid[i].removeAttribute('aria-invalid');
    var errs = form.querySelectorAll('.field-error');
    for (var j = 0; j < errs.length; j++) { errs[j].classList.remove('is-shown'); errs[j].textContent = ''; }
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* 휴대폰 번호: 숫자만 남기고 010-1234-5678 형태로 정리 */
  function normalizePhone(raw) {
    var d = String(raw || '').replace(/[^0-9]/g, '');
    if (d.indexOf('82') === 0 && d.length > 10) d = '0' + d.slice(2);
    return d;
  }
  function formatPhone(digits) {
    if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    return digits;
  }
  function isValidMobile(digits) {
    return /^01[016789][0-9]{7,8}$/.test(digits);
  }

  /* ── 입력 중 자동 하이픈 ────────────────────────── */
  var phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var d = normalizePhone(phoneInput.value).slice(0, 11);
      phoneInput.value = formatPhone(d);
      phoneInput.removeAttribute('aria-invalid');
    });
  }
  form.addEventListener('input', function (e) {
    if (e.target && e.target.getAttribute) e.target.removeAttribute('aria-invalid');
  });

  /* ── 제출 ───────────────────────────────────────── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    clearStatus();

    var data = {
      studentName: (form.studentName.value || '').trim(),
      phone: normalizePhone(form.phone.value),
      grade: form.grade ? form.grade.value : '',
      memo: form.memo ? (form.memo.value || '').trim().slice(0, 500) : '',
      consent: form.consent ? form.consent.checked : false,
      // 스팸 방지용(사람은 채우지 않는 칸 + 너무 빠른 제출 차단)
      website: form.website ? form.website.value : '',
      elapsedMs: Date.now() - openedAt
    };

    /* 검증 */
    if (data.studentName.length < 2 || data.studentName.length > 20) {
      showError('studentName', '학생 이름을 2자 이상 정확히 입력해 주세요.');
      return;
    }
    if (!isValidMobile(data.phone)) {
      showError('phone', '휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)');
      return;
    }
    if (!data.consent) {
      showError('consent', '개인정보 수집·이용에 동의해 주셔야 상담 신청이 가능합니다.');
      return;
    }

    /* 전송 */
    if (submitBtn) { submitBtn.setAttribute('aria-busy', 'true'); submitBtn.textContent = '신청 중…'; }
    setStatus('info', '상담 신청을 접수하는 중입니다…');
    if (window.trackEvent) window.trackEvent('consult_submit', { grade: data.grade || 'unknown' });

    var endpoint = CFG.consultEndpoint || '/api/consult';
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 15000);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          return { ok: res.ok, status: res.status, body: body };
        });
      })
      .then(function (r) {
        clearTimeout(timeout);
        if (r.ok && r.body && r.body.ok) {
          onSuccess(data, r.body);
        } else {
          var msg = (r.body && r.body.message) || '';
          onFailure(msg);
        }
      })
      .catch(function () {
        clearTimeout(timeout);
        onFailure('');
      })
      .then(function () {
        if (submitBtn) { submitBtn.removeAttribute('aria-busy'); submitBtn.textContent = '상담 신청하기'; }
      });
  });

  /* ── 성공 ───────────────────────────────────────── */
  function onSuccess(data, body) {
    var link = (body && body.formUrl) || CFG.googleFormUrl || '';
    var html = '<strong>' + esc(data.studentName) + ' 학생 상담 신청이 접수되었습니다.</strong><br>' +
      '입력하신 <strong>' + esc(formatPhone(data.phone)) + '</strong> 번호로 ' +
      '<strong>카카오톡 알림톡</strong>과 함께 상담신청서 링크를 보내 드렸습니다. ' +
      '알림톡의 링크에서 상담신청서를 작성해 주시면 순서대로 연락드립니다.';
    if (link && link.indexOf('FORM_ID') === -1) {
      html += '<br><br><a class="btn btn-primary" style="margin-top:6px" href="' + esc(link) +
        '" target="_blank" rel="noopener">상담신청서 바로 작성하기</a>';
    }
    setStatus('ok', html);
    form.reset();
    try { window.localStorage.setItem('promiseA.consult.submitted', '1'); } catch (e) { /* noop */ }
    if (window.trackEvent) window.trackEvent('consult_success', { grade: data.grade || 'unknown' });
    if (statusBox && statusBox.scrollIntoView) statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── 실패(서버 미연결 포함) → 수동 경로 안내 ───── */
  function onFailure(message) {
    var tel = CFG.tel || '';
    var link = CFG.googleFormUrl || '';
    var html = '<strong>' + (message ? esc(message) : '지금은 자동 접수가 되지 않았습니다.') + '</strong><br>' +
      '아래 상담신청서를 직접 작성해 주시거나, 전화로 문의해 주세요. 확인 후 바로 연락드리겠습니다.';
    if (link && link.indexOf('FORM_ID') === -1) {
      html += '<br><br><a class="btn btn-primary" style="margin-top:6px" href="' + esc(link) +
        '" target="_blank" rel="noopener">상담신청서 작성하기</a>';
    }
    if (tel && tel.indexOf('0000') === -1) {
      html += '<br><br>전화 문의: <a href="tel:' + esc(tel.replace(/[^0-9+]/g, '')) + '">' + esc(tel) + '</a>';
    }
    setStatus('err', html);
    if (window.trackEvent) window.trackEvent('consult_fail', {});
    if (statusBox && statusBox.scrollIntoView) statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();
