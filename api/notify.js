/* Vercel 서버리스 함수 — POST /api/notify
   구글 폼(Apps Script)이 호출합니다. 비밀키(HOOK_SECRET)로 인증합니다. */
import { handleNotify } from '../lib/notify-core.mjs';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'POST 요청만 처리합니다.' });
    return;
  }
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { payload = {}; }
  }
  if (!payload || typeof payload !== 'object') payload = {};

  const secretHeader = req.headers['x-hook-secret'] || '';
  const { status, json } = await handleNotify({ payload, secretHeader, env: process.env });
  res.status(status).json(json);
}
