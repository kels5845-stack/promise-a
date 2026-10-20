/**
 * AI·검색 크롤러 판별. 각 사가 공개한 User-agent 기준.
 * 사이티드 web/lib/bots.ts 의 사본 — 그쪽이 바뀌면 여기도.
 */
const TABLE = [
  [/GPTBot/i, "GPTBot", "openai"],
  [/OAI-SearchBot/i, "OAI-SearchBot", "openai"],
  [/ChatGPT-User/i, "ChatGPT-User", "openai"],
  [/ClaudeBot/i, "ClaudeBot", "anthropic"],
  [/Claude-SearchBot/i, "Claude-SearchBot", "anthropic"],
  [/Claude-User/i, "Claude-User", "anthropic"],
  [/anthropic-ai/i, "anthropic-ai", "anthropic"],
  [/PerplexityBot/i, "PerplexityBot", "perplexity"],
  [/Perplexity-User/i, "Perplexity-User", "perplexity"],
  [/Google-Extended/i, "Google-Extended", "google"],
  [/Google-CloudVertexBot/i, "Vertex", "google"],
  [/Applebot-Extended/i, "Applebot-Extended", "apple"],
  [/meta-externalagent/i, "meta-externalagent", "meta"],
  [/FacebookBot/i, "FacebookBot", "meta"],
  [/Bytespider/i, "Bytespider", "bytedance"],
  [/CCBot/i, "CCBot", "commoncrawl"],
  [/Amazonbot/i, "Amazonbot", "amazon"],
  [/YouBot/i, "YouBot", "you"],
  [/cohere-ai/i, "cohere-ai", "cohere"],
  [/Diffbot/i, "Diffbot", "diffbot"],
  [/Applebot/i, "Applebot", "apple"],
  [/Googlebot/i, "Googlebot", "google"],
  [/bingbot|BingPreview/i, "Bingbot", "microsoft"],
  [/Yeti/i, "Yeti", "naver"],
  [/DuckDuckBot/i, "DuckDuckBot", "duckduckgo"],
];

export function identify(ua) {
  if (!ua) return null;
  for (const [re, bot, vendor] of TABLE) if (re.test(ua)) return { bot, vendor };
  return null;
}
