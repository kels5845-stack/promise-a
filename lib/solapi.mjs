/* =========================================================
   솔라피(SOLAPI) 발송 공용 모듈
   상담 접수 / 신청서 작성 완료 / 상담 예약 확정 —
   세 가지 알림톡이 모두 이 파일을 통해 나갑니다.
   ========================================================= */
import crypto from 'node:crypto';

const SOLAPI_ENDPOINT = 'https://api.solapi.com/messages/v4/send';

/* ── 입력값 정리 ─────────────────────────────────── */
export function cleanText(v, max) {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u001F\u007F]/g, ' ') // 제어문자 제거
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/* 여러 줄을 유지해야 하는 값(준비물 등)은 줄바꿈만 살려서 정리합니다 */
export function cleanMultiline(v, max) {
  return String(v == null ? '' : v)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, ' ') // 줄바꿈만 남기고 제어문자 제거
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

export function onlyDigits(v) {
  return String(v == null ? '' : v).replace(/[^0-9]/g, '');
}

export function isValidMobile(digits) {
  return /^01[016789][0-9]{7,8}$/.test(digits);
}

/* ── 인증 헤더 (HMAC-SHA256) ─────────────────────── */
function authHeader(apiKey, apiSecret) {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString('hex');
  const signature = crypto.createHmac('sha256', apiSecret).update(date + salt).digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

/* ── 발송 ────────────────────────────────────────── */
export async function solapiSend(message, env) {
  const res = await fetch(SOLAPI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: authHeader(env.SOLAPI_API_KEY, env.SOLAPI_API_SECRET),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message }),
    signal: AbortSignal.timeout(10000) // 응답이 없으면 10초 후 중단
  });
  const text = await res.text();
  let body = {};
  try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 400) }; }
  return { ok: res.ok, status: res.status, body };
}

/* HTTP 200이어도 개별 메시지가 실패할 수 있어 응답 내용까지 확인합니다 */
export function sendFailed(result) {
  if (!result.ok) return true;
  const b = result.body || {};
  if (Array.isArray(b.failedMessageList) && b.failedMessageList.length) return true;
  if (b.statusCode && !String(b.statusCode).startsWith('2')) return true;
  const failedCount = b.groupInfo && b.groupInfo.count && b.groupInfo.count.registeredFailed;
  if (failedCount) return true;
  return false;
}

/* ── 알림톡 한 건 보내기 ─────────────────────────────
   templateId : 승인된 알림톡 템플릿 ID
   variables  : { '#{이름}': '홍길동', ... }
   smsText    : 알림톡이 실패했을 때 문자로 대신 나갈 내용
   ────────────────────────────────────────────────── */
export async function sendAlimtalk({ to, templateId, variables, smsText, env }) {
  const message = {
    to,
    from: onlyDigits(env.SOLAPI_SENDER),
    type: 'ATA',
    kakaoOptions: {
      pfId: env.SOLAPI_PFID,
      templateId,
      variables,
      disableSms: false // 알림톡 실패 시 아래 text 로 문자 대체발송
    },
    text: smsText
  };
  const result = await solapiSend(message, env);
  return { failed: sendFailed(result), result };
}

/* ── 교습소(원장님)께 보내는 알림 문자 ───────────────── */
export async function sendOwnerSms({ text, subject, env }) {
  const ownerPhone = onlyDigits(env.OWNER_PHONE || '');
  if (!isValidMobile(ownerPhone)) return null;
  return solapiSend(
    {
      to: ownerPhone,
      from: onlyDigits(env.SOLAPI_SENDER),
      type: text.length > 45 ? 'LMS' : 'SMS',
      subject: subject || '프라미스A 알림',
      text
    },
    env
  );
}

/* ── 요청 출처 확인 ──────────────────────────────── */
export function originAllowed(env, origin, referer) {
  if (!env.ALLOWED_ORIGIN) return true;
  const allowed = String(env.ALLOWED_ORIGIN).replace(/\/+$/, '');
  if (origin) return String(origin).replace(/\/+$/, '') === allowed;
  if (referer) return String(referer).startsWith(allowed);
  return false; // 출처를 알 수 없는 요청은 거부
}

/* ── 비밀키 비교 (타이밍 공격 방지) ────────────────── */
export function secretMatches(given, expected) {
  if (!expected) return false;
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
