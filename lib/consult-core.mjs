/* =========================================================
   ① 상담 신청 접수 (홈페이지 폼)

   흐름:  홈페이지에서 이름·휴대폰 입력 + 개인정보 동의
          → 이 함수가 검증
          → 알림톡 ①(구글 상담신청서 링크) 발송
          → 원장님께 접수 알림 문자
          → 홈페이지에 결과 응답

   필요한 환경변수 (서버에만 저장, 절대 코드에 넣지 마세요):
     SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_SENDER / SOLAPI_PFID
     SOLAPI_TEMPLATE_ID   ← 알림톡 ① (상담 신청 접수 + 신청서 링크)
     GOOGLE_FORM_URL      구글 상담신청서 링크
     OWNER_PHONE          (선택) 접수 알림을 받을 원장님 휴대폰 번호
     DISPLAY_TEL          (선택) 안내 문구에 표시할 교습소 전화번호
     ALLOWED_ORIGIN       (선택) 허용할 도메인 (예: https://promise-a.co.kr)
   ========================================================= */
import {
  cleanText, onlyDigits, isValidMobile,
  sendAlimtalk, sendOwnerSms, originAllowed
} from './solapi.mjs';

/* ── 스팸/과다 요청 차단 (같은 인스턴스 안에서만 유효한 최소 방어) ── */
const recent = new Map(); // key → { first, count }
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 3;

function rateLimited(key) {
  const now = Date.now();
  for (const [k, v] of recent) if (now - v.first > RATE_WINDOW_MS) recent.delete(k);
  const hit = recent.get(key);
  if (!hit) {
    recent.set(key, { first: now, count: 1 });
    return false;
  }
  hit.count += 1;
  return hit.count > RATE_MAX;
}

export { isValidMobile };

/* ── 메인 처리 ───────────────────────────────────── */
export async function handleConsult({ payload, ip, origin, referer, env }) {
  /* 0) 도메인 확인 (설정한 경우에만) */
  if (!originAllowed(env, origin, referer)) {
    return { status: 403, json: { ok: false, message: '허용되지 않은 요청입니다.' } };
  }

  /* 1) 값 정리 */
  const studentName = cleanText(payload.studentName, 20);
  const phone = onlyDigits(payload.phone);
  const grade = cleanText(payload.grade, 20);
  const memo = cleanText(payload.memo, 300);
  const consent = payload.consent === true || payload.consent === 'true';
  const honeypot = cleanText(payload.website, 50);
  const elapsedMs = Number(payload.elapsedMs) || 0;

  /* 2) 봇 차단 — 보이지 않는 칸이 채워졌거나, 너무 빨리 제출된 경우 */
  if (honeypot) return { status: 200, json: { ok: true, formUrl: env.GOOGLE_FORM_URL || '' } };
  if (elapsedMs > 0 && elapsedMs < 2000) {
    return { status: 429, json: { ok: false, message: '잠시 후 다시 시도해 주세요.' } };
  }

  /* 3) 검증 */
  if (studentName.length < 2) {
    return { status: 400, json: { ok: false, message: '학생 이름을 정확히 입력해 주세요.' } };
  }
  if (!isValidMobile(phone)) {
    return { status: 400, json: { ok: false, message: '휴대폰 번호를 정확히 입력해 주세요.' } };
  }
  if (!consent) {
    return { status: 400, json: { ok: false, message: '개인정보 수집·이용 동의가 필요합니다.' } };
  }

  /* 4) 과다 요청 차단 */
  if (rateLimited(`${ip}|${phone}`)) {
    return { status: 429, json: { ok: false, message: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' } };
  }

  /* 5) 서버 설정 확인 — 아직 연동 전이면 홈페이지가 수동 안내로 넘어갑니다 */
  const required = [
    'SOLAPI_API_KEY', 'SOLAPI_API_SECRET', 'SOLAPI_SENDER',
    'SOLAPI_PFID', 'SOLAPI_TEMPLATE_ID', 'GOOGLE_FORM_URL'
  ];
  const missing = required.filter((k) => !env[k]);
  if (missing.length) {
    console.warn('[consult] 환경변수 미설정:', missing.join(', '));
    return {
      status: 503,
      json: { ok: false, message: '자동 접수 준비 중입니다.', formUrl: env.GOOGLE_FORM_URL || '' }
    };
  }

  const formUrl = env.GOOGLE_FORM_URL;
  const displayTel = env.DISPLAY_TEL || env.SOLAPI_SENDER;

  /* 6) 알림톡 ① — 상담신청서 링크 (실패 시 문자로 자동 대체) */
  let sent;
  try {
    sent = await sendAlimtalk({
      to: phone,
      templateId: env.SOLAPI_TEMPLATE_ID,
      variables: {
        '#{이름}': studentName,
        '#{링크}': formUrl,
        '#{전화번호}': displayTel
      },
      smsText:
        `[프라미스A 교습소] ${studentName} 학생 상담 신청이 접수되었습니다.\n` +
        `아래 상담신청서를 작성해 주시면 확인 후 순서대로 연락드리겠습니다.\n${formUrl}\n문의: ${displayTel}`,
      env
    });
  } catch (err) {
    console.error('[consult] 발송 요청 실패:', err && err.message);
    return { status: 502, json: { ok: false, message: '알림톡 발송에 실패했습니다.', formUrl } };
  }

  if (sent.failed) {
    console.error('[consult] 솔라피 응답 오류:', sent.result.status,
      JSON.stringify(sent.result.body).slice(0, 300));
    return { status: 502, json: { ok: false, message: '알림톡 발송에 실패했습니다.', formUrl } };
  }

  /* 7) 원장님께 접수 알림 (실패해도 학부모 응답에는 영향 없음) */
  try {
    await sendOwnerSms({
      subject: '상담 신청 접수',
      text:
        `[상담 신청]\n학생: ${studentName}\n연락처: ${phone}\n` +
        (grade ? `학년: ${grade}\n` : '') +
        (memo ? `문의: ${memo}` : ''),
      env
    });
  } catch (err) {
    console.error('[consult] 원장 알림 발송 실패:', err && err.message);
  }

  return { status: 200, json: { ok: true, formUrl } };
}
