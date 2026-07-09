const ALLOWED = new Set(['business', 'jobs', 'benefits', 'voices']);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;
  if (!ALLOWED.has(type)) {
    return res.status(404).json({ error: 'Unknown content type' });
  }

  const domain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;
  if (!domain || !apiKey) {
    return res.status(500).json({ error: 'microCMS is not configured' });
  }

  try {
    const r = await fetch(`https://${domain}.microcms.io/api/v1/${type}?limit=100&orders=order`, {
      headers: { 'X-MICROCMS-API-KEY': apiKey },
    });
    if (!r.ok) throw new Error(`microCMS status: ${r.status}`);
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    console.error(`content(${type}) fetch error:`, err);
    return res.status(502).json({ error: 'Failed to fetch content' });
  }
};
