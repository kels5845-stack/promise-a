/* =========================================================
   프라미스A 교습소 — 사이트 공통 설정
   ⚠️ 실제 값으로 바꿔야 하는 곳은 모두 "여기 한 곳"에 모아두었습니다.
      (자세한 안내: README.md → "① 먼저 채워 넣을 값")
   ========================================================= */
window.SITE_CONFIG = {
  /* 기본 정보 */
  name: '프라미스A 교습소',
  url: 'https://promise-a.com',          // 실제 도메인으로 교체
  tel: '02-6013-0579',                    // 실제 전화번호로 교체 (하이픈 포함)
  address: '서울특별시 송파구 송파대로37길 52, 3층',       // 실제 주소로 교체 (챗봇 답변에 사용)
  hours: '오후 2시 ~ 9시',              // 실제 운영시간으로 교체 (챗봇 답변에 사용)

  /* 상담 자동화 */
  // 상담 신청을 처리할 서버(서버리스 함수) 주소.
  // Netlify에 올리면 '/.netlify/functions/consult', Vercel이면 '/api/consult'.
  consultEndpoint: '/api/consult',
  // 알림톡이 아직 준비되지 않았을 때(또는 전송 실패 시) 화면에 바로 띄워 줄 구글 상담신청서 주소
  googleFormUrl: 'https://docs.google.com/forms/d/e/FORM_ID/viewform',

  /* 랜딩 페이지 버튼 주소 (비워 두면 '준비 중'으로 안내됩니다) */
  blogUrl: 'https://blog.naver.com/promise6013',              // 예: 'https://blog.naver.com/promise-a'
  kakaoChannelUrl: 'https://pf.kakao.com/_Xexenxj/chat',      // 예: 'https://pf.kakao.com/_xxxxx/chat'

  /* 애널리틱스 — 발급받은 ID를 넣으면 자동으로 켜집니다.
     비워 두면(기본값) 아무 스크립트도 로드하지 않습니다. */
  analytics: {
    ga4: '',        // 예: 'G-XXXXXXXXXX'   (구글 애널리틱스 4)
    naver: '',      // 예: 'a1b2c3d4e5'     (네이버 애널리틱스 계정 ID)
    bingUet: '',    // 예: '123456789'      (Bing UET 태그 ID)
    clarity: ''     // 예: 'abcdefghij'     (Microsoft Clarity, 선택)
  }
};
