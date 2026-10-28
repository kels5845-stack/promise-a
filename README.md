# 프라미스A 교습소 홈페이지

서울 송파구 초·중등 전문 영어 교습소 **프라미스A**의 홈페이지입니다.
교육청 학원·교습소 등록번호 제5600호 · 교습과목 영어

👉 **https://promise-a.com** (운영)
👉 https://kels5845-stack.github.io/promise-a/ (미리보기)

## 이 저장소에 든 것

화면에 보이는 정적 파일만 들어 있습니다. HTML 11개와 CSS·JS·이미지입니다.
빌드 과정이 없어, 올린 파일이 그대로 서비스됩니다.

| 페이지 | 내용 |
|---|---|
| `index.html` | 홈 |
| `about.html` | 교습소 소개 |
| `curriculum.html` | 커리큘럼 · 교재 (자체 교재) |
| `elementary.html` | 초등 영어 정규반 |
| `middle.html` | 중·고등 내신반 |
| `tuition.html` | 수강료 · 수업 시간 |
| `faq.html` | 자주 묻는 질문 |
| `contact.html` | 상담 신청 |
| `privacy.html` | 개인정보 처리방침 |
| `landing.html` | 광고 유입용 랜딩 (검색 제외) |
| `404.html` | 없는 페이지 |

## 상담 알림톡 (서버리스 함수)

| 경로 | 하는 일 |
|---|---|
| `api/consult.js` | 홈페이지 상담 폼 접수 → 신청서 링크 알림톡 |
| `api/notify.js` | 구글 폼(Apps Script) 호출 → 작성 완료 · 예약 확정 알림톡 |

Vercel에서만 동작합니다. 깃헙 페이지에는 서버가 없어 화면만 뜹니다.

**API 키는 이 저장소에 없습니다.** Vercel의 환경변수로만 넣습니다.
`.env.example` 은 어떤 이름으로 넣어야 하는지 알려 주는 형식 안내용 파일입니다.

## 배포

- **Vercel** — 이 저장소를 Import. Root Directory는 비워 둡니다(저장소 최상위).
  Framework Preset은 `Other`, Build Command는 비워 둡니다. 빌드 과정이 없습니다.
- **GitHub Pages** — `main` 브랜치 `/ (root)`

## 고칠 때

페이지를 만드는 생성 스크립트는 비공개 저장소에 있습니다.
내용을 고칠 때는 그쪽에서 다시 만들어 이곳에 올립니다.

## 사이티드가 이 저장소에서 직접 고친 것 (2026-10-21)

생성 스크립트를 거치지 않고 이 저장소에서 바로 고쳤습니다.

새로 만든 파일
- `songpa-english-gyoseupso.html` — 송파 영어교습소, 학원과 뭐가 다른가요?
- `songpa-middle-english-naesin.html` — 송파 중등 영어학원, 시험 기간에만 다닐 수 있나요?
- `songpa-elementary-english-cost.html` — 송파 초등 영어학원 비용은 얼마인가요?
- `songpa-english-academy-choose.html` — 송파 영어학원 잘하는 곳, 상담 때 무엇을 물어봐야 하나요?
- `assets/img/guide/` — 위 네 쪽의 도해 SVG 4개

고친 파일
- `index.html` `about.html` `curriculum.html` `elementary.html` `middle.html` `tuition.html` `faq.html` `contact.html` — 제목·설명·공유 문구에 「송파」
- 위 8개와 `privacy.html` `landing.html` `404.html` — 구조화 정보(기관)에 서비스 지역(서울특별시 송파구)과 sameAs(블로그·카카오톡 채널)
- `faq.html` — 질문 5개 추가(17 → 22), 화면과 구조화 정보 둘 다
- `index.html` `curriculum.html` `middle.html` `elementary.html` `tuition.html` — 질문 쪽으로 가는 링크
- `sitemap.xml` — 새 4쪽, 고친 쪽 날짜
- `llms.txt` — 「학부모 질문 안내」 절과 주요 페이지 4줄

**생성 스크립트로 다시 만들면 이 변경이 사라집니다. 생성 스크립트에도 옮겨 주세요.**

크롤러 방문 기록: 소유자가 Vercel 환경변수 `CITED_CRAWL_KEY` 를 넣음(2026-10-22). 키는 코드에 없습니다.

사람 방문 기록: 같은 `CITED_CRAWL_KEY` 로 돕니다(새로 넣을 것 없음). 방문자 해시 소금을 따로 두려면 `VISIT_SALT` 를 넣습니다 — 선택. IP 는 보내지 않습니다.

네이버 서치어드바이저 소유확인: 모든 쪽 `naver-site-verification` 메타에 값을 넣음(2026-10-28). 지우면 네이버 등록이 풀립니다.
