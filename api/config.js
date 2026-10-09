// 画面側で使う公開設定（Turnstile のサイトキーは公開してよい値。シークレットキーは api/contact.js だけで使う）
module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;
  if (!turnstileSiteKey) {
    console.error('TURNSTILE_SITE_KEY is not set');
    return res.status(500).json({ error: 'Turnstile is not configured' });
  }
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json({ turnstileSiteKey });
};
