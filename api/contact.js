const https = require('https');
const nodemailer = require('nodemailer');

const JOB_LABELS = {
  'surveyor-entry': '測量士・測量士補（正社員）未経験者採用',
  'surveyor-exp':   '測量士・測量士補（正社員）経験者採用',
  surveyor:      '測量士・測量士補（正社員）', // 区分を分ける前の画面（キャッシュ）から送られた場合用
  drone:         'ドローンオペレーター（正社員）',
  'assist-full': '測量補助・事務スタッフ（正社員）',
  'assist-part': '測量補助・事務スタッフ（パート）',
  other:         'その他・一般問い合わせ',
};

// 入力の上限文字数（Slack の mrkdwn は1ブロック3000字までなので、本文はそれより短く）
const MAX_LEN = { name: 100, email: 254, tel: 30, message: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
// Slack の mrkdwn で <!channel> やリンク記法として解釈されないように
function escapeSlack(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function postToSlack(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) resolve();
      else reject(new Error(`Slack status: ${res.statusCode}`));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Cloudflare Turnstile のトークンを検証（トークンは1回限り・発行から5分で失効）
async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY is not set');
  const params = new URLSearchParams({ secret, response: token });
  if (ip) params.set('remoteip', ip);
  // Cloudflare が応答しないときに関数が止まり続けないよう、8秒で打ち切る
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body: params, signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Turnstile siteverify status: ${r.status}`);
  const data = await r.json();
  if (!data.success) {
    console.warn('Turnstile rejected:', data['error-codes']);
    return false;
  }
  // TURNSTILE_HOSTNAMES（カンマ区切り）を設定した場合は、そのドメインで発行されたトークンだけ受け付ける
  const allowed = String(process.env.TURNSTILE_HOSTNAMES || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(data.hostname)) {
    console.warn('Turnstile hostname mismatch:', data.hostname);
    return false;
  }
  return true;
}

async function insertInquiry({ name, email, tel, job, message }) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set');

  const res = await fetch(`${url}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, tel: tel || null, job, message }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase insert failed: ${res.status} ${text}`);
  }
}

let gmailTransporter = null;
function getGmailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD is not set');
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return gmailTransporter;
}

async function sendConfirmationEmail({ name, email, jobLabel }) {
  const user = process.env.GMAIL_USER;
  const transporter = getGmailTransporter();

  const html = `
    <p>${escapeHtml(name)} 様</p>
    <p>この度は株式会社office M・M・Gの採用ページよりお問い合わせいただき、誠にありがとうございます。</p>
    <p>以下の内容で受け付けいたしました。担当者より改めてご連絡いたしますので、今しばらくお待ちください。</p>
    <p>――――――――――――――――<br>
    応募職種: ${escapeHtml(jobLabel)}<br>
    ――――――――――――――――</p>
    <p>お急ぎの場合はお電話（0771-56-8323／平日9:00〜18:00）でもお問い合わせいただけます。</p>
    <p>株式会社office M・M・G</p>
  `;

  await transporter.sendMail({
    from: `採用担当 <${user}>`,
    to: email,
    subject: '【株式会社office M・M・G】お問い合わせを受け付けました',
    html,
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // ハニーポット：ボットが隠しフィールドに値を入れたらブロック
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  // 文字列以外（配列・オブジェクト）は空として扱い、前後の空白を落とす
  const str = v => (typeof v === 'string' ? v.trim() : '');
  const name = str(body.name), email = str(body.email), tel = str(body.tel), job = str(body.job), message = str(body.message);

  if (!name || !email || !job || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!EMAIL_RE.test(email) || !Object.hasOwn(JOB_LABELS, job)
      || Object.entries(MAX_LEN).some(([k, max]) => ({ name, email, tel, message })[k].length > max)) {
    return res.status(400).json({ error: 'Invalid fields' });
  }

  // ボット対策：Turnstile を通っていない送信は、保存・通知・メールのどれも行わない
  const token = str(body.turnstileToken);
  if (!token || token.length > 2048) {
    return res.status(403).json({ error: 'Bot check required' });
  }
  try {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (!(await verifyTurnstile(token, ip))) {
      return res.status(403).json({ error: 'Bot check failed' });
    }
  } catch (err) {
    console.error('Turnstile verify error:', err);
    return res.status(500).json({ error: 'Bot check unavailable' });
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
          { type: 'mrkdwn', text: `*お名前*\n${escapeSlack(name)}` },
          { type: 'mrkdwn', text: `*メールアドレス*\n${escapeSlack(email)}` },
          { type: 'mrkdwn', text: `*電話番号*\n${tel ? escapeSlack(tel) : '（未入力）'}` },
          { type: 'mrkdwn', text: `*応募職種*\n${JOB_LABELS[job]}` },
        ],
      },
      {
        type: 'section',
        // エスケープで「<」→「&lt;」と伸びても1ブロック3000字の上限に収める（全文はSupabase側に残る）
        text: { type: 'mrkdwn', text: `*お問い合わせ内容*\n${escapeSlack(message).slice(0, 2900)}` },
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `送信日時：${now}` }],
      },
    ],
  };

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL is not set');
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  try {
    await insertInquiry({ name, email, tel, job, message });
  } catch (err) {
    console.error('Supabase insert error:', err);
    return res.status(500).json({ error: 'Failed to save inquiry' });
  }

  // DBに保存できた時点で受付は成立。ここで失敗を返すと応募者が再送し、同じ問い合わせが重複登録されるため、
  // Slack通知はベストエフォート（失敗はログに残し、Supabase側で拾う）
  try {
    await postToSlack(webhookUrl, payload);
  } catch (err) {
    console.error('Slack send error:', err);
  }

  // 受付確認メールもベストエフォート：送れたかどうかだけ画面に返して、完了メッセージを出し分ける
  let mailed = true;
  try {
    await sendConfirmationEmail({ name, email, jobLabel: JOB_LABELS[job] });
  } catch (err) {
    mailed = false;
    console.error('Gmail confirmation email error:', err);
  }

  return res.status(200).json({ ok: true, mailed });
};
