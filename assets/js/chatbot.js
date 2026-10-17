/* =========================================================
   프라미스A 교습소 — 자주 묻는 질문 챗봇

   · 외부 AI 서비스를 쓰지 않습니다. 비용 0원, 개인정보 전송 없음.
   · 아래 KB(지식 목록)의 키워드를 맞춰 답합니다.
   · 답을 모르면 지어내지 않고 상담 신청·전화로 안내합니다.

   ▸ 답변을 고치거나 새 질문을 추가하려면 아래 KB 배열만 수정하세요.
     keywords : 학부모님이 입력할 만한 낱말 (띄어쓰기 없이 적어도 됩니다)
     question : 추천 질문 버튼에 표시할 문구 (chip: true 인 항목만 버튼으로 나옴)
     answer   : 실제 답변 (간단한 HTML 사용 가능)
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var TEL = (CFG.tel || '').replace(/[^0-9+]/g, '');
  var TEL_TEXT = CFG.tel || '';

  /* 상담 신청 버튼 (답변 끝에 붙일 때 사용)
     구글 상담신청서 주소가 있으면 바로 그 폼으로 보냅니다 */
  var FORM = CFG.googleFormUrl && CFG.googleFormUrl.indexOf('FORM_ID') === -1 ? CFG.googleFormUrl : '';
  var CTA_CONSULT = FORM
    ? '<a class="msg-cta" href="' + FORM + '" target="_blank" rel="noopener">상담신청서 작성하기</a>'
    : '<a class="msg-cta" href="contact.html">상담 신청하기</a>';
  var CTA_CALL = TEL && TEL.indexOf('0000') === -1
    ? '<a class="msg-cta" href="tel:' + TEL + '">전화 문의 ' + TEL_TEXT + '</a>'
    : '';

  /* ── 지식 목록 ─────────────────────────────────── */
  var KB = [
    {
      id: 'fee',
      chip: true,
      question: '수강료가 궁금해요',
      keywords: ['수강료', '학원비', '교습비', '얼마', '비용', '가격', '금액', '돈', '월비용', '한달'],
      answer:
        '모두 <strong>주 3회</strong> 기준입니다.<br>' +
        '· <strong>초등 4학년</strong> 오후 2시 · 130분 · <strong>월 31만 원</strong><br>' +
        '· <strong>초등 5~6학년</strong> 오후 3시 · 150분 · <strong>월 35만 원</strong><br>' +
        '· <strong>중등</strong> 월·수·금 오후 4시 · 160분 · <strong>월 41만 원</strong><br>' +
        '고등 내신반은 학년·과정에 따라 편성되어 상담 시 안내드립니다.<br>' +
        '교재는 첫 수업 후 정해 구매 링크를 보내 드립니다. ' +
        '<a href="tuition.html">수강료 안내 자세히 보기</a>'
    },
    {
      id: 'time',
      chip: true,
      question: '시간표가 어떻게 되나요?',
      keywords: ['시간표', '수업시간', '몇시', '몇시간', '횟수', '주몇번', '주3회', '몇번', '요일',
                 '월수금', '얼마나', '오후', '스케줄'],
      answer:
        '수업은 기본적으로 <strong>주 3회</strong>로 진행합니다.<br>' +
        '· <strong>초등 — 월·수·금</strong><br>' +
        '&nbsp;&nbsp;4학년 <strong>오후 2시</strong> (130분) / 5~6학년 <strong>오후 3시</strong> (150분)<br>' +
        '· <strong>중등 — 월·수·금 오후 4시</strong> (160분)<br>' +
        '정원과 학년에 따라 배정이 달라질 수 있어, 실제 가능한 시간은 상담 때 확인해 드립니다.'
    },
    {
      id: 'method',
      question: '수업은 어떻게 하나요?',
      keywords: ['수업방식', '어떻게가르', '어떻게수업', '진도', '체킹', '다지기', '커리큘럼', '방식', '특징'],
      answer:
        '진도를 빨리 빼기보다 <strong>확인(체킹)과 다지기</strong>에 무게를 둡니다.<br>' +
        '배운 내용을 그 자리에서 확인하고, 기준을 넘지 못하면 다음으로 넘어가지 않습니다.<br>' +
        '집중 훈련 영역은 <strong>라이팅 · 독해 · 문해력</strong>입니다. ' +
        '<a href="about.html">교습소 소개 보기</a>'
    },
    {
      id: 'elementary',
      chip: true,
      question: '초등 수업이 궁금해요',
      keywords: ['초등', '초딩', '초3', '초4', '초5', '초6', '아이가초등'],
      answer:
        '초등 정규반은 어휘와 문장을 확인 학습으로 익히고, 지문을 끊어 읽으며 요지를 정리하는 ' +
        '<strong>독해·문해력 훈련</strong>을 합니다. 이어서 배운 표현으로 직접 쓰는 <strong>라이팅 훈련</strong>을 하고, ' +
        '마지막에 그날 배운 내용을 다시 확인하는 다지기로 마무리합니다.<br>' +
        '초등은 <strong>월·수·금 주 3회</strong>이고, 4학년반은 <strong>오후 2시 · 130분(월 31만 원)</strong>, ' +
        '5~6학년반은 <strong>오후 3시 150분(월 35만 원)</strong>입니다. ' +
        '<a href="elementary.html">초등 과정 자세히 보기</a>'
    },
    {
      id: 'middle',
      chip: true,
      question: '중·고등 내신은요?',
      keywords: ['중등', '중학', '중1', '중2', '중3', '고등', '고1', '고2', '고3', '내신', '시험대비', '기말', '중간고사'],
      answer:
        '중·고등은 <strong>내신 전문</strong>입니다. 학교 시험 범위를 기준으로 교과서 본문과 수업 자료를 ' +
        '문장 단위로 확인하고, 문법 포인트를 정리한 뒤 틀린 문제는 이유를 설명할 수 있을 때까지 다시 확인합니다.<br>' +
        '평소 라이팅 훈련이 <strong>서술형 대비</strong>로 이어집니다.<br>' +
        '중등은 <strong>월·수·금 주 3회 · 160분 · 오후 4시 시작 · 월 41만 원</strong>입니다.<br>' +
        '정규 과정으로만 운영해서, <strong>시험 기간에만 내신 대비를 따로 수강하시는 것은 받지 않습니다.</strong> ' +
        '<a href="middle.html">중·고등 과정 보기</a>'
    },
    {
      id: 'homework',
      question: '과제가 많나요?',
      keywords: ['과제', '숙제', '집에서', '많나요', '부담'],
      answer:
        '수업에서 배운 것을 집에서 한 번 더 확인하는 과제가 나갑니다.<br>' +
        '과제를 해 오지 않으면 다음 수업의 확인 학습에서 통과하기 어렵기 때문에, ' +
        '<strong>과제를 성실히 하는 것이 중요합니다.</strong>'
    },
    {
      id: 'attitude',
      keywords: ['태도', '습관', '관리', '학습태도', '공부습관', '생활지도'],
      answer:
        '프라미스A는 실력보다 <strong>태도와 습관을 먼저 잡는 것</strong>을 원칙으로 합니다.<br>' +
        '과제 수행과 수업 태도를 기록하고, 필요한 시점에 학부모님께 사실 그대로 안내드립니다.'
    },
    {
      id: 'mood',
      keywords: ['분위기', '면학', '시끄', '조용', '산만', '교실분위기'],
      answer:
        '조용히 집중할 수 있는 교실을 유지합니다.<br>' +
        '열심히 하는 학생이 손해 보지 않도록, 수업 분위기에 대해서는 분명한 기준을 두고 운영합니다.'
    },
    {
      id: 'notfit',
      chip: true,
      question: '우리 아이와 맞을까요?',
      keywords: ['안맞', '맞을까', '힘든', '까다', '엄격', '그만두', '적응', '맞지않'],
      answer:
        '솔직하게 말씀드리면, <strong>모든 학생에게 맞는 곳은 아닙니다.</strong><br>' +
        '수업 태도가 준비되지 않았거나 과제·확인 과정을 성실히 따라오기 어려운 경우에는 다니기 힘든 곳입니다.<br>' +
        '반대로 기초부터 다시 다지고 싶고 조용히 집중하고 싶은 학생에게는 잘 맞습니다.<br>' +
        '상담 때 학생 상황을 보고 솔직하게 말씀드립니다. ' + CTA_CONSULT
    },
    {
      id: 'consult',
      chip: true,
      question: '상담은 어떻게 신청해요?',
      keywords: ['상담', '신청', '예약', '문의', '등록', '입학', '방문', '테스트', '레벨'],
      answer:
        '상담 신청 페이지에서 <strong>학생 이름과 휴대폰 번호</strong>만 남겨 주시면 됩니다.<br>' +
        '그다음은 카카오톡 알림톡으로 순서대로 안내드려요.<br>' +
        '① 상담신청서 링크 → ② 작성하시면 접수 확인 → ' +
        '③ <strong>상담 일시와 준비하실 내용</strong>까지 보내 드립니다.<br>' +
        '상담에는 <strong>학생이 함께</strong> 와 주시고, 쓰던 교재도 챙겨 오세요. ' + CTA_CONSULT
    },
    {
      id: 'leveltest',
      chip: true,
      question: '레벨테스트가 있나요?',
      keywords: ['레벨테스트', '레벨', '테스트', '시험보고', '진단', '실력테스트', '평가'],
      answer:
        '상담 전에 따로 레벨테스트를 보지는 않습니다.<br>' +
        '<strong>레벨테스트는 등록 후 첫날 수업에서 진행</strong>합니다.<br>' +
        '대신 상담 때 지금까지 쓰던 교재와 공부한 것들을 가져오시면 현재 상태를 더 정확히 볼 수 있어요.'
    },
    {
      id: 'prepare',
      keywords: ['준비물', '준비해', '준비하', '뭐준비', '뭐가지고', '무엇을준비', '상담준비',
                 '가져갈', '가져가', '챙길', '챙겨', '지참', '같이가', '학생도', '학생만'],
      answer:
        '상담에는 <strong>학생이 꼭 함께 와 주세요.</strong><br>' +
        '그리고 지금까지 <strong>쓰던 교재와 공부한 것들</strong>을 챙겨 오시면 좋습니다.<br>' +
        '어떤 방식으로 공부해 왔는지 보면 필요한 부분을 훨씬 정확히 안내드릴 수 있습니다.'
    },
    {
      id: 'shortterm',
      keywords: ['시험기간만', '시험기간에만', '기간에만', '만다닐', '시험때만', '단기',
                 '특강만', '내신만', '잠깐', '한달만', '시험대비만', '단기수강'],
      answer:
        '중등부는 <strong>정규 과정으로만 운영</strong>합니다.<br>' +
        '시험 기간에만 내신 수업을 따로 수강하시는 것은 받지 않습니다.<br>' +
        '평소의 확인 학습이 쌓여야 시험에서 점수로 이어지기 때문입니다.'
    },
    {
      id: 'license',
      keywords: ['등록번호', '교육청', '정식', '허가', '등록된', '인가'],
      answer:
        '네, 교육청에 등록된 교습소입니다.<br>' +
        '<strong>등록번호 제5600호</strong>, <strong>교습과목 영어</strong>이며, ' +
        '교습비는 신고된 기준에 따라 홈페이지에 공개하고 있습니다.'
    },
    {
      id: 'location',
      question: '어디에 있나요?',
      keywords: ['위치', '주소', '어디', '오시는길', '찾아', '지도', '근처', '길'],
      answer: null /* 아래에서 주소를 채워 넣습니다 */
    },
    {
      id: 'hours',
      keywords: ['운영시간', '몇시까지', '언제', '영업', '문여', '문열'],
      answer: null
    },
    {
      id: 'phone',
      keywords: ['전화', '연락처', '번호', '통화'],
      answer: null
    },
    {
      id: 'curriculum',
      chip: true,
      question: '커리큘럼이 어떻게 되나요?',
      keywords: ['커리큘럼', '커리큘럼이', '자체커리', '프로그램', '어떤과정', '과정이', '수업내용',
                 '뭘배우', '무엇을배', '어떻게가르치'],
      answer:
        '수업에서 아이들이 <strong>반복해서 막히는 자리</strong>를 보고 <strong>교재부터 직접 만들었습니다.</strong><br>' +
        '<strong>루티 잉글리시</strong> — 루티 리딩 · 루티 문법 · 수행평가 트레이닝 세 갈래이고, ' +
        '<strong>씨앗 → 잎사귀 → 꽃 → 열매</strong> 네 단계로 올라갑니다.<br>' +
        '반복이 필요한 부분은 <strong>루티 영어 시스템(온라인)</strong>으로 집에서 이어 갑니다.<br>' +
        '독해는 별도의 <strong>독해 시스템</strong>으로 훈련하고, <strong>학습 분석</strong>으로 어디에서 막히는지 확인해 다음 수업에 반영합니다.<br>' +
        '<a href="curriculum.html">커리큘럼 · 교재 자세히 보기</a>'
    },
    {
      id: 'reading',
      keywords: ['독해', '독해시스템', '리딩', '읽기', '해석', '문해력', '지문', '독해가안'],
      answer:
        '독해가 안 되는 학생 대부분은 단어를 몰라서가 아니라, ' +
        '<strong>해석은 되는데 글이 무슨 말인지 잡히지 않는</strong> 상태입니다.<br>' +
        '프라미스A의 독해 시스템은 <strong>단어 → 문장 → 문단 → 글 전체</strong>로 넓혀 가며 단계를 올리고, ' +
        '읽은 내용을 <strong>자기 말로 써 보게</strong> 해서 진짜 읽었는지 확인합니다.<br>' +
        '<a href="curriculum.html">독해 시스템 자세히 보기</a>'
    },
    {
      id: 'online',
      keywords: ['루티', '루티영어', '루티영어시스템', '온라인', '온라인프로그램', '집에서',
                 '숙제프로그램', '앱', '인강', '온라인수업'],
      answer:
        '<strong>루티 영어 시스템</strong>이라는 온라인 프로그램을 운영합니다.<br>' +
        '교재의 <strong>같은 STEP</strong>이 온라인에도 있어, 수업에서 걸린 자리를 집에서 그대로 이어 갑니다.<br>' +
        '새로운 내용을 배우는 인터넷 강의가 아니라, <strong>수업 내용을 다지는 용도</strong>입니다.<br>' +
        '언제 얼마나 했는지, 어떤 유형에서 자주 틀리는지 기록이 남아 학습 분석으로 이어집니다.'
    },
    {
      id: 'analysis',
      keywords: ['학습분석', '분석', '성적분석', '리포트', '기록', '어디서막', '피드백'],
      answer:
        '몇 점을 맞았는지보다 <strong>어디에서 반복해서 막히는지</strong>를 봅니다.<br>' +
        '같은 점수라도 단어가 안 잡힌 학생, 문장 구조에서 무너지는 학생은 해야 할 일이 다릅니다.<br>' +
        '수업과 루티 영어 시스템에 남는 기록을 모아 정리하고, <strong>상담 때 근거로 보여 드립니다.</strong>'
    },
    {
      id: 'book',
      keywords: ['교재', '교재비', '책값', '부교재', '책', '구매', '어디서사',
                 '루티잉글리시', '루티문법', '루티리딩', '수행평가', '씨앗', '잎사귀', '열매'],
      answer:
        '교재는 <strong>첫 수업에서 학생 수준을 확인한 뒤</strong> 정합니다.<br>' +
        '정해지면 <strong>구매 링크를 보내 드리고, 학부모님께서 직접 구매</strong>하시면 됩니다.<br>' +
        '교습소에서 교재를 판매하지는 않습니다.<br>' +
        '교재는 직접 만든 <strong>루티 잉글리시</strong>를 씁니다. ' +
        '리딩 · 문법 · 수행평가 세 갈래에 <strong>씨앗 · 잎사귀 · 꽃 · 열매</strong> 네 단계가 있고, ' +
        '<strong>나이가 아니라 학생 상태</strong>로 단계를 정합니다. ' +
        '<a href="curriculum.html">교재 라인 보기</a>'
    },
    {
      id: 'absence',
      keywords: ['결석', '보강', '빠지', '못가', '아프면', '휴원'],
      answer:
        '결석·보강 운영 기준은 반 편성과 시기에 따라 달라질 수 있어 <strong>상담 시 안내</strong>드립니다.<br>' +
        '미리 연락 주시면 학습 내용이 비지 않도록 챙겨 드립니다.'
    },
    {
      id: 'etc',
      keywords: ['형제', '할인', '차량', '셔틀', '픽업', '자매'],
      answer:
        '해당 부분은 교습소 운영 기준에 따라 달라질 수 있어, <strong>상담 때 정확히 안내</strong>드리는 것이 맞습니다.<br>' +
        '확인해서 바로 알려 드릴게요. ' + (CTA_CALL || CTA_CONSULT)
    },
    {
      id: 'greeting',
      keywords: ['안녕', '하이', 'hi', 'hello', '반가', '처음'],
      answer:
        '안녕하세요! 프라미스A 교습소입니다 🙂<br>' +
        '수강료, 수업 시간, 초등·중등 과정, 상담 신청 방법 등 자주 묻는 질문에 답해 드려요.<br>' +
        '아래 버튼을 누르거나 궁금한 내용을 입력해 주세요.'
    },
    {
      id: 'thanks',
      keywords: ['감사', '고마', '고맙', '알겠'],
      answer: '도움이 되었다면 다행이에요. 더 궁금한 점이 있으면 언제든 물어보세요! ' + CTA_CONSULT
    }
  ];

  /* 설정에서 값을 가져와야 하는 답변 채우기 */
  (function fillDynamic() {
    var byId = {};
    for (var i = 0; i < KB.length; i++) byId[KB[i].id] = KB[i];

    byId.location.answer =
      '주소는 <strong>' + (CFG.address || '홈페이지 하단 안내') + '</strong> 입니다.<br>' +
      '<a href="contact.html#main">오시는 길 보기</a> 에서 네이버 지도·카카오맵 링크로 바로 확인하실 수 있어요.';

    byId.hours.answer =
      '운영시간은 <strong>' + (CFG.hours || '상담 시 안내') + '</strong> 입니다.<br>' +
      '자세한 반 시간표는 상담 때 안내드립니다.';

    byId.phone.answer = TEL && TEL.indexOf('0000') === -1
      ? '전화는 <strong>' + TEL_TEXT + '</strong> 입니다.<br>수업 중에는 연결이 어려울 수 있어, ' +
        '상담 신청을 남겨 주시면 순서대로 연락드립니다.<br>' + CTA_CALL
      : '전화 상담을 원하시면 홈페이지 하단의 번호로 연락 주세요.<br>' +
        '상담 신청을 남겨 주시면 저희가 먼저 연락드립니다. ' + CTA_CONSULT;
  })();

  /* ── 검색(키워드 맞추기) ────────────────────────── */
  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  function findAnswer(input) {
    var q = normalize(input);
    if (!q) return null;

    var best = null;
    var bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var item = KB[i];
      var score = 0;
      for (var k = 0; k < item.keywords.length; k++) {
        var kw = normalize(item.keywords[k]);
        if (kw && q.indexOf(kw) !== -1) score += kw.length >= 3 ? 2 : 1;
      }
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return bestScore > 0 ? best : null;
  }

  var FALLBACK =
    '죄송해요, 그 부분은 제가 정확히 답변드리기 어렵습니다.<br>' +
    '잘못된 정보를 드리는 것보다 <strong>직접 확인해서 알려 드리는 것</strong>이 맞다고 생각합니다.<br>' +
    '상담을 신청해 주시면 순서대로 연락드려 자세히 안내드릴게요. ' + CTA_CONSULT +
    (CTA_CALL ? ' ' + CTA_CALL : '');

  /* ── 화면 만들기 ────────────────────────────────── */
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  var launcher, panel, log, chips, form, input, closeBtn;

  function build() {
    launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'chat-launcher';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'faq-chat');
    launcher.innerHTML = '<span class="dot" aria-hidden="true"></span>궁금한 점 물어보기';

    panel = document.createElement('section');
    panel.className = 'chat-panel';
    panel.id = 'faq-chat';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '자주 묻는 질문 챗봇');
    panel.innerHTML =
      '<div class="chat-head">' +
        '<div>' +
          '<h2>무엇이든 물어보세요</h2>' +
          '<p>자주 묻는 질문에 바로 답해 드립니다</p>' +
        '</div>' +
        '<button type="button" class="chat-close" aria-label="챗봇 닫기">✕</button>' +
      '</div>' +
      '<div class="chat-log" id="chat-log" role="log" aria-live="polite" aria-atomic="false"></div>' +
      '<div class="chat-chips" id="chat-chips"></div>' +
      '<form class="chat-form" id="chat-form">' +
        '<input type="text" id="chat-input" autocomplete="off" maxlength="100" ' +
               'placeholder="예) 수강료가 얼마인가요?" aria-label="궁금한 점을 입력하세요">' +
        '<button type="submit">보내기</button>' +
      '</form>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    log = panel.querySelector('#chat-log');
    chips = panel.querySelector('#chat-chips');
    form = panel.querySelector('#chat-form');
    input = panel.querySelector('#chat-input');
    closeBtn = panel.querySelector('.chat-close');

    for (var i = 0; i < KB.length; i++) {
      if (!KB[i].chip) continue;
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = KB[i].question;
      b.setAttribute('data-id', KB[i].id);
      chips.appendChild(b);
    }

    launcher.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    chips.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-id]');
      if (!btn) return;
      ask(btn.textContent, btn.getAttribute('data-id'));
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      ask(text, null);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });
  }

  function addMessage(who, html) {
    var el = document.createElement('div');
    el.className = 'msg ' + who;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function ask(text, forcedId) {
    addMessage('me', esc(text));
    if (window.trackEvent) window.trackEvent('chatbot_question', { question: text.slice(0, 60) });

    var item = null;
    if (forcedId) {
      for (var i = 0; i < KB.length; i++) if (KB[i].id === forcedId) item = KB[i];
    }
    if (!item) item = findAnswer(text);

    // 답이 바로 뜨면 기계 같으니 아주 짧게 텀을 둡니다
    window.setTimeout(function () {
      if (item) {
        addMessage('bot', item.answer);
      } else {
        addMessage('bot', FALLBACK);
        if (window.trackEvent) window.trackEvent('chatbot_no_match', { question: text.slice(0, 60) });
      }
    }, 260);
  }

  function open() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    if (!log.childNodes.length) {
      addMessage('bot',
        '안녕하세요, 프라미스A 교습소입니다 🙂<br>' +
        '<strong>수강료 · 수업 시간 · 초등/중등 과정 · 상담 신청</strong> 등 자주 묻는 질문에 바로 답해 드려요.<br>' +
        '아래 버튼을 누르거나 궁금한 점을 직접 입력해 주세요.');
    }
    if (input && input.focus) input.focus();
    if (window.trackEvent) window.trackEvent('chatbot_open', {});
  }

  function close() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    if (launcher.focus) launcher.focus();
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  ready(build);
})();
