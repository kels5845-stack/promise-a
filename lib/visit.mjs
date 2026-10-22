/**
 * 사람 방문 기록 — 무엇을 셀지 · 어디서 왔는지 · 누구인지(그날만). 사이티드(cited.kr)에서 받는다.
 *
 * 사이티드 쪽 academy/lib/visit.ts 에서 타입만 뺀 같은 로직이다. 고치면 거기서 고치고 여기로 옮긴다 —
 * 사이티드의 academy/scripts/test-visit.mjs 가 이 파일을 불러 행동이 같은지 대조한다.
 * import 가 없어야 한다(Vercel Edge 에서 돈다).
 *
 * 보내는 쪽(middleware.js)은 readVisit 을 쓴다. cleanVisit 은 받는 쪽 검사인데 대조 시험용으로 둔다.
 * IP 는 보내지도 저장하지도 않는다. visitor = sha256(ip + ua + KST 날짜 + 소금) 앞 16자 —
 * 같은 날 같은 사람만 묶이고 다음 날은 못 잇는다. 쿠키가 없어 동의 배너가 필요 없다.
 */

export const REF_KINDS = ["ai", "search", "sns", "direct", "internal", "other"];
const DEVICES = ["mobile", "tablet", "desktop"];

/** AI 답변 서비스. [대표 주소, 그 밖의 주소들, utm_source 에 오는 말]. 대표 주소로 적는다 — 화면이 곳별로 센다 */
const AI = [
  ["chatgpt.com", ["chat.openai.com"], ["chatgpt", "openai"]],
  ["perplexity.ai", [], ["perplexity"]],
  ["gemini.google.com", ["bard.google.com"], ["gemini", "bard"]],
  ["claude.ai", [], ["claude"]],
  ["copilot.microsoft.com", [], ["copilot"]],
  ["chat.deepseek.com", [], ["deepseek"]],
  ["grok.com", [], ["grok"]],
  ["wrtn.ai", [], ["wrtn"]],
  ["clova-x.naver.com", [], ["clova"]],
];
/** 검색보다 먼저 본다 — blog.naver.com·cafe.naver.com 은 검색이 아니라 SNS */
const SNS = ["blog.naver.com", "cafe.naver.com", "cafe.daum.net", "instagram.com", "facebook.com", "kakao.com",
  "youtube.com", "youtu.be", "x.com", "twitter.com", "t.co", "threads.net", "band.us", "tistory.com", "brunch.co.kr"];
/** utm_source 가 이 말과 같거나 이 말로 시작하면 SNS(facebook_ad·kakao_ch). 중간에 든 것은 안 본다 — feedback 이 fb 가 아니다 */
const SNS_UTM = ["instagram", "facebook", "fb", "kakao", "youtube", "twitter", "threads", "band", "blog", "cafe",
  "naver_blog", "naverblog", "naver_cafe", "navercafe"];
const SEARCH = ["naver.com", "daum.net", "bing.com", "duckduckgo.com", "search.brave.com", "zum.com", "ecosia.org"];
const SEARCH_UTM = ["google", "naver", "daum", "bing", "yahoo", "duckduckgo", "brave", "zum"];

const under = (host, d) => host === d || host.endsWith("." + d);
/** 소문자, 앞의 www.·m. 을 뗀다 — 모바일 주소를 따로 세지 않게 */
const bare = (host) => host.toLowerCase().replace(/^(www\.|m\.)+/, "");

/** 들어온 곳. utm_source 가 있으면 그것이 먼저다(chatgpt.com 은 링크에 utm_source=chatgpt.com 을 붙인다) */
export function classifyRef(referer, ownHost, utm) {
  const u = (utm ?? "").trim().toLowerCase().slice(0, 100);
  if (u) {
    const host = bare(u.replace(/^https?:\/\//, "").split("/")[0]);
    for (const [main, alt, words] of AI) {
      if (under(host, main) || alt.some((a) => under(host, a)) || words.indexOf(host) >= 0) return { ref_host: main, ref_kind: "ai" };
    }
    if (SNS.some((d) => under(host, d)) || SNS_UTM.some((w) => host.indexOf(w) === 0)) return { ref_host: host, ref_kind: "sns" };
    if (isSearch(host) || SEARCH_UTM.indexOf(host) >= 0) return { ref_host: host, ref_kind: "search" };
    return { ref_host: host, ref_kind: "other" };
  }
  if (!referer) return { ref_host: "", ref_kind: "direct" };
  let host;
  try {
    host = bare(new URL(referer).hostname);
  } catch {
    return { ref_host: "", ref_kind: "direct" };
  }
  if (!host) return { ref_host: "", ref_kind: "direct" };
  if (host === bare(ownHost)) return { ref_host: host, ref_kind: "internal" };
  for (const [main, alt] of AI) {
    if (under(host, main) || alt.some((a) => under(host, a))) return { ref_host: main, ref_kind: "ai" };
  }
  if (SNS.some((d) => under(host, d))) return { ref_host: host, ref_kind: "sns" };
  if (isSearch(host)) return { ref_host: host, ref_kind: "search" };
  return { ref_host: host, ref_kind: "other" };
}

/** google.com·google.co.kr·yahoo.co.jp 처럼 나라 끝이 붙는 곳까지 */
function isSearch(host) {
  return /(^|\.)(google|yahoo)\.[a-z.]+$/.test(host) || SEARCH.some((d) => under(host, d));
}

export function deviceOf(ua) {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

/** identify() 표에 없는 로봇·미리보기(카톡·페북 링크 미리보기 포함) */
const BOTLIKE = /bot|crawl|spider|headless|preview|monitor|lighthouse|screenshot|scrap|externalhit|slurp/i;
/** 정적 파일 — 끝이 .확장자. 정적 사이트(프라미스)는 문서가 .html 로 끝난다 — .html·.htm 은 문서로 본다 */
const FILE = /\.(?!html?$)[a-z0-9]{1,8}$/i;

/**
 * 사람의 문서 요청이면 true. identify() 가 봇이라고 한 요청에는 부르지 않는다.
 * GET 만, sec-fetch-dest: document(없으면 Accept 에 text/html), 미리 가져오기·RSC 제외, /_next·/api·/admin·파일 제외.
 */
export function isHumanDocument(method, pathname, h) {
  if (method !== "GET") return false;
  const ua = h.get("user-agent") ?? "";
  if (!ua || BOTLIKE.test(ua)) return false;
  if (/^\/(_next|api|admin)(\/|$)/.test(pathname) || FILE.test(pathname)) return false;
  if (h.get("rsc") || h.get("next-router-prefetch") || h.get("next-router-state-tree")) return false;
  const purpose = `${h.get("purpose") ?? ""} ${h.get("sec-purpose") ?? ""} ${h.get("x-purpose") ?? ""} ${h.get("x-moz") ?? ""}`;
  if (/prefetch|prerender/i.test(purpose)) return false;
  const dest = h.get("sec-fetch-dest");
  if (dest) return dest === "document";
  return /text\/html/i.test(h.get("accept") ?? "");
}

/** KST 날짜 YYYY-MM-DD. 서버 시계가 UTC 라도 한국 날짜로 끊는다 */
export function kstDay(now) {
  return new Date(now + 9 * 3600_000).toISOString().slice(0, 10);
}

async function sha16(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 보낼 기록을 만든다. 셀 요청이 아니거나 소금이 없으면 null — 그러면 아무것도 보내지 않는다.
 * path 는 주소창의 경로만(물음표 뒤는 버린다 — 이름·전화가 딸려 올 수 있다).
 */
export async function readVisit(req, salt, now = Date.now()) {
  if (!salt) return null;
  const url = new URL(req.url);
  if (!isHumanDocument(req.method, url.pathname, req.headers)) return null;
  const ua = req.headers.get("user-agent") ?? "";
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ref = classifyRef(req.headers.get("referer"), url.hostname, url.searchParams.get("utm_source"));
  return {
    path: url.pathname.slice(0, 300),
    ref_host: ref.ref_host.slice(0, 100),
    ref_kind: ref.ref_kind,
    visitor: await sha16(`${ip}|${ua}|${kstDay(now)}|${salt}`),
    device: deviceOf(ua),
  };
}

/** 받는 쪽 검사. 모양이 틀리면 null — 키가 새어도 표를 아무 글자로나 채우지 못하게 */
export function cleanVisit(b) {
  if (!b || typeof b !== "object") return null;
  const o = b;
  const path = typeof o.path === "string" ? o.path : "";
  const refHost = typeof o.ref_host === "string" ? o.ref_host : "";
  const visitor = typeof o.visitor === "string" ? o.visitor : "";
  if (!path.startsWith("/") || !/^[0-9a-f]{16}$/.test(visitor)) return null;
  if (REF_KINDS.indexOf(o.ref_kind) < 0 || DEVICES.indexOf(o.device) < 0) return null;
  return {
    path: path.slice(0, 300),
    ref_host: refHost.toLowerCase().replace(/[^a-z0-9.\-_:]/g, "").slice(0, 100),
    ref_kind: o.ref_kind,
    visitor,
    device: o.device,
  };
}
