/* Vercel 서버리스 함수 — POST /api/consult */
import { handleConsult } from '../lib/consult-core.mjs';

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

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  const { status, json } = await handleConsult({ payload, ip, origin, referer, env: process.env });
  res.status(status).json(json);
}
