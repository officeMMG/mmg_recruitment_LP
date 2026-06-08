const JOB_LABELS = {
  surveyor:     '測量士・測量士補（正社員）',
  drone:        'ドローンオペレーター（正社員）',
  'assist-full':'測量補助・事務スタッフ（正社員）',
  'assist-part':'測量補助・事務スタッフ（パート）',
  other:        'その他・一般問い合わせ',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, tel, job, message, website } = req.body;

  // ハニーポット：ボットが隠しフィールドに値を入れたらブロック
  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !job || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const payload = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📬 採用応募フォームに新しい送信があります', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*お名前*\n${name}` },
          { type: 'mrkdwn', text: `*メールアドレス*\n${email}` },
          { type: 'mrkdwn', text: `*電話番号*\n${tel || '（未入力）'}` },
          { type: 'mrkdwn', text: `*応募職種*\n${JOB_LABELS[job] || job}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*お問い合わせ内容*\n${message}` },
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `送信日時：${now}` }],
      },
    ],
  };

  try {
    const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!slackRes.ok) throw new Error(`Slack responded: ${slackRes.status}`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Slack send error:', err);
    return res.status(500).json({ error: 'Failed to notify' });
  }
}
