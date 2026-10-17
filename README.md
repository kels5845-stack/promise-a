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
| `curriculum.html` | 커리큘럼 · 교재 (루티 잉글리시) |
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
