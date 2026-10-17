/* =========================================================
   ②③ 상담신청서 작성 완료 / 상담 예약 확정 알림톡

   구글 폼(상담신청서)에 연결한 Apps Script가 이 함수를 호출합니다.
   (설정 방법: google-apps-script/consult-automation.gs 와 README ③-2 참고)

     type: 'complete' → 알림톡 ② 신청서 작성 완료 안내
     type: 'reserve'  → 알림톡 ③ 상담 일시 + 상담 시 준비 내용

   필요한 환경변수:
     HOOK_SECRET               Apps Script와 나눠 갖는 비밀 문자열 (필수)
     SOLAPI_TEMPLATE_COMPLETE  알림톡 ② 템플릿 ID
     SOLAPI_TEMPLATE_RESERVE   알림톡 ③ 템플릿 ID
     (그 외 SOLAPI_* 값은 상담 접수와 동일)
   ========================================================= */
import {
  cleanText, cleanMultiline, onlyDigits, isValidMobile,
  sendAlimtalk, sendOwnerSms, secretMatches
} from './solapi.mjs';

/* 준비 내용을 적지 않았을 때 기본으로 나가는 문구
   (교습소 운영에 맞게 Apps Script나 환경변수 DEFAULT_PREP 로 바꾸실 수 있습니다) */
const DEFAULT_PREP =
  '- 상담에는 학생이 함께 와 주세요\n' +
  '- 지금까지 쓰던 교재와 공부한 것들을 챙겨 오세요';

export async function handleNotify({ payload, secretHeader, env }) {
  /* 0) 비밀키 확인 — 아무나 알림톡을 보내지 못하게 */
  const given = secretHeader || payload.secret;
  if (!env.HOOK_SECRET) {
    console.warn('[notify] HOOK_SECRET 미설정');
    return { status: 503, json: { ok: false, message: '서버 설정이 필요합니다. (HOOK_SECRET)' } };
  }
  if (!secretMatches(given, env.HOOK_SECRET)) {
    return { status: 403, json: { ok: false, message: '인증에 실패했습니다.' } };
  }

  /* 1) 공통 값 */
  const type = cleanText(payload.type, 20);

  /* 연결 확인용 — Apps Script의 "연결 상태 확인"이 부릅니다 */
  if (type === 'ping') {
    return {
      status: 200,
      json: {
        ok: true,
        pong: true,
        templates: {
          complete: env.SOLAPI_TEMPLATE_COMPLETE ? '설정됨' : '없음',
          reserve: env.SOLAPI_TEMPLATE_RESERVE ? '설정됨' : '없음'
        }
      }
    };
  }

  const studentName = cleanText(payload.studentName, 20);
  const phone = onlyDigits(payload.phone);
  const displayTel = env.DISPLAY_TEL || env.SOLAPI_SENDER || '';

  if (studentName.length < 2) {
    return { status: 400, json: { ok: false, message: '학생 이름이 없습니다.' } };
  }
  if (!isValidMobile(phone)) {
    return { status: 400, json: { ok: false, message: '휴대폰 번호가 올바르지 않습니다: ' + phone } };
  }

  const base = ['SOLAPI_API_KEY', 'SOLAPI_API_SECRET', 'SOLAPI_SENDER', 'SOLAPI_PFID'];
  const missing = base.filter((k) => !env[k]);
  if (missing.length) {
    console.warn('[notify] 환경변수 미설정:', missing.join(', '));
    return { status: 503, json: { ok: false, message: '발송 설정이 준비되지 않았습니다.' } };
  }

  /* 2) 알림톡 ② — 신청서 작성 완료 */
  if (type === 'complete') {
    if (!env.SOLAPI_TEMPLATE_COMPLETE) {
      return { status: 503, json: { ok: false, message: 'SOLAPI_TEMPLATE_COMPLETE 가 설정되지 않았습니다.' } };
    }
    const sent = await sendAlimtalk({
      to: phone,
      templateId: env.SOLAPI_TEMPLATE_COMPLETE,
      variables: { '#{이름}': studentName, '#{전화번호}': displayTel },
      smsText:
        `[프라미스A 교습소] ${studentName} 학생의 상담신청서가 접수되었습니다.\n` +
        `작성해 주신 내용을 확인한 뒤 상담 가능한 시간을 안내드리겠습니다.\n문의: ${displayTel}`,
      env
    });
    if (sent.failed) {
      console.error('[notify] 완료 알림톡 실패:', JSON.stringify(sent.result.body).slice(0, 300));
      return { status: 502, json: { ok: false, message: '알림톡 발송에 실패했습니다.' } };
    }

    /* 원장님께 "신청서까지 작성 완료" 알림 */
    const school = cleanText(payload.school, 40);
    const note = cleanText(payload.note, 200);
    try {
      await sendOwnerSms({
        subject: '상담신청서 작성 완료',
        text:
          `[신청서 작성 완료]\n학생: ${studentName}\n연락처: ${phone}\n` +
          (school ? `학교·학년: ${school}\n` : '') +
          (note ? `메모: ${note}\n` : '') +
          '→ 상담 시간을 정해 예약 알림톡을 보내 주세요.',
        env
      });
    } catch (err) {
      console.error('[notify] 원장 알림 실패:', err && err.message);
    }
    return { status: 200, json: { ok: true, sent: 'complete' } };
  }

  /* 3) 알림톡 ③ — 상담 예약 확정 (일시 + 준비 내용) */
  if (type === 'reserve') {
    if (!env.SOLAPI_TEMPLATE_RESERVE) {
      return { status: 503, json: { ok: false, message: 'SOLAPI_TEMPLATE_RESERVE 가 설정되지 않았습니다.' } };
    }
    const when = cleanText(payload.when, 60);
    if (!when) {
      return { status: 400, json: { ok: false, message: '상담 일시가 비어 있습니다.' } };
    }
    const place = cleanText(payload.place, 80) || env.PLACE_TEXT || '프라미스A 교습소';
    const prep = cleanMultiline(payload.prep, 400) || cleanMultiline(env.DEFAULT_PREP, 400) || DEFAULT_PREP;

    const sent = await sendAlimtalk({
      to: phone,
      templateId: env.SOLAPI_TEMPLATE_RESERVE,
      variables: {
        '#{이름}': studentName,
        '#{일시}': when,
        '#{장소}': place,
        '#{준비물}': prep,
        '#{전화번호}': displayTel
      },
      smsText:
        `[프라미스A 교습소] ${studentName} 학생 상담 일정이 확정되었습니다.\n` +
        `일시: ${when}\n장소: ${place}\n\n[상담 시 준비]\n${prep}\n\n` +
        `일정 변경이 필요하시면 미리 연락 주세요.\n문의: ${displayTel}`,
      env
    });
    if (sent.failed) {
      console.error('[notify] 예약 알림톡 실패:', JSON.stringify(sent.result.body).slice(0, 300));
      return { status: 502, json: { ok: false, message: '알림톡 발송에 실패했습니다.' } };
    }
    return { status: 200, json: { ok: true, sent: 'reserve', when } };
  }

  return { status: 400, json: { ok: false, message: "type 은 'complete' 또는 'reserve' 여야 합니다." } };
}
