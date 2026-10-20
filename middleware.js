/**
 * AI·검색 크롤러 방문 기록 — 사이티드(cited.kr)로 한 줄씩 보낸다.
 *
 * - Vercel 환경변수 CITED_CRAWL_KEY 가 없으면 아무것도 안 한다(미리보기 배포·키 넣기 전).
 * - 봇만 센다. 사람 방문은 안 보낸다.
 * - 응답을 기다리지 않는다(waitUntil). 실패는 삼킨다 — 페이지를 막으면 안 된다.
 * - 키는 코드에 없다. 소유자가 Vercel 프로젝트 설정에 넣는다.
 */
import { identify } from "./lib/bots.mjs";

export const config = {
  matcher: [
    "/((?!api/|assets/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|webm|css|js|woff2?)$).*)",
  ],
};

const ENDPOINT = "https://cited.kr/api/crawl";

export default function middleware(request, context) {
  const key = process.env.CITED_CRAWL_KEY;
  if (!key) return;
  const ua = request.headers.get("user-agent");
  const hit = identify(ua);
  if (!hit) return;
  const url = new URL(request.url);
  const send = fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", "x-cited-client": "promise", "x-cited-key": key },
    body: JSON.stringify({
      bot: hit.bot,
      vendor: hit.vendor,
      path: url.pathname,
      ua: ua ?? "",
      ip: (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim(),
    }),
  }).catch(() => {});
  context?.waitUntil?.(send);
}
