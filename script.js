/* ===== カードデータ（事業内容・募集職種・待遇・先輩の声）=====
   microCMS( /api/content?type=... )から取得。失敗時は data/*.json をフォールバックとして使用 */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* microCMSの「テキストエリア」フィールドは配列ではなく1本の文字列として保存されるため、
   「1行に1つ」「カンマ区切り」の項目は表示時にこちらで分割する */
function splitLines(str) {
  return String(str ?? '').split('\n').map(s => s.trim()).filter(Boolean);
}
function splitCsv(str) {
  return String(str ?? '').split(/[,，、]/).map(s => s.trim()).filter(Boolean);
}

/* ---- 対応する業務：山と町の地図の上の基準点記号。記号に触れると、横の野帳の札がその業務に切り替わる ---- */
const BIZ_PHOTOS = { measure: 'image/photo/biz-survey.jpg', design: 'image/photo/biz-design.jpg', research: 'image/photo/biz-research.jpg' };
// 業務ごとの地図記号と位置（%）：測量＝山頂の三角点、設計＝町なかの電子基準点、調査＝県道沿いの水準点（image/business-map.svg と合わせている）
const BIZ_MARKS = {
  measure:  { x: 18.5, y: 37.3, name: '三角点',     svg: '<path d="M20 3 L37 33 H3 Z"/><circle cx="20" cy="23" r="3"/>' },
  design:   { x: 72.5, y: 29.3, name: '電子基準点', svg: '<path d="M20 6 L35 33 H5 Z"/><circle cx="20" cy="24" r="2.8"/><path class="ant" d="M20 6 V-12 L25 -7 L29.5 -13 L34.5 -7 L39 -14"/>' },
  research: { x: 75,   y: 62,   name: '水準点',     svg: '<path d="M7 9 H33 V35 H7 Z"/><circle cx="20" cy="22" r="3"/>' },
};
const BIZ_MARK_ORDER = ['measure', 'design', 'research'];

// 図面の枠：二重の図郭線、区画の目盛り（1〜4／A〜C）、方位記号、右下の表題欄
function drawingFrameSvg() {
  const ticks = [], labels = [];
  for (let k = 0; k < 4; k++) {
    const x0 = 16 + 92 * k, cx = x0 + 46;
    if (k) ticks.push(`M${x0} 4V16M${x0} 284V296`);
    labels.push(`<text x="${cx}" y="12.5">${k + 1}</text><text x="${cx}" y="292.5">${k + 1}</text>`);
  }
  ['A', 'B', 'C'].forEach((ch, k) => {
    const y0 = 16 + 89.33 * k, cy = y0 + 44.7;
    if (k) ticks.push(`M4 ${y0.toFixed(1)}H16M384 ${y0.toFixed(1)}H396`);
    labels.push(`<text x="10" y="${(cy + 2.5).toFixed(1)}">${ch}</text><text x="390" y="${(cy + 2.5).toFixed(1)}">${ch}</text>`);
  });
  return `
      <svg class="biz-drawing" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
        <rect class="frame-outer" x="4" y="4" width="392" height="292"/>
        <rect class="frame-inner" x="16" y="16" width="368" height="268"/>
        <path class="frame-tick" d="${ticks.join('')}"/>
        <g class="frame-zone">${labels.join('')}</g>
        <g class="north" transform="translate(360 30)"><circle class="north-bg" r="15" cy="3"/><path d="M0 -12 L6 8 L0 4 L-6 8 Z"/><text y="20">N</text></g>
        <g class="title-block">
          <rect x="250" y="246" width="134" height="38"/>
          <path d="M280 246V284M250 265H384"/>
          <text class="tb-key" x="265" y="258.5">図名</text><text class="tb-val" x="332" y="258.5">M・M・Gの仕事地図</text>
          <text class="tb-key" x="265" y="277.5">作成</text><text class="tb-val" x="332" y="277.5">office M・M・G</text>
        </g>
      </svg>`;
}
function renderBusiness(el, contents) {
  const points = contents.map((c, i) => {
    const p = BIZ_MARKS[c.iconKey] || BIZ_MARKS[BIZ_MARK_ORDER[i % BIZ_MARK_ORDER.length]];
    return `
      <button type="button" class="tri-point${i === 0 ? ' is-active' : ''}" style="left:${p.x}%; top:${p.y}%;"
        aria-controls="biz-card-${i}" aria-expanded="${i === 0}" aria-label="${escapeHtml(c.title)}（${p.name}）" data-index="${i}">
        <svg viewBox="0 0 40 36" aria-hidden="true">${p.svg}</svg>
        <span class="tri-label">${escapeHtml(c.title)}</span>
      </button>`;
  }).join('');
  const cards = contents.map((c, i) => `
      <article class="biz-card${i === 0 ? ' is-active' : ''}" id="biz-card-${i}"${i === 0 ? '' : ' hidden'}>
        ${BIZ_PHOTOS[c.iconKey] ? `<div class="biz-photo" style="background-image:url('${BIZ_PHOTOS[c.iconKey]}')" aria-hidden="true"></div>` : ''}
        <div class="biz-card-body">
          <h3>${escapeHtml(c.title)}</h3>
          <ul class="business-list">${splitLines(c.items).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          ${c.note ? `<p class="business-etc">${escapeHtml(c.note)}</p>` : ''}
        </div>
      </article>`).join('');

  el.innerHTML = `
    <div class="biz-map" role="group" aria-label="対応する業務の地図">
      ${drawingFrameSvg()}
      ${points}
    </div>
    <div class="biz-cards">${cards}</div>`;

  const btns = [...el.querySelectorAll('.tri-point')];
  const show = idx => {
    btns.forEach((b, i) => {
      const on = i === idx;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-expanded', String(on));
      const card = el.querySelector(`#biz-card-${i}`);
      card.hidden = !on;
      card.classList.toggle('is-active', on);
    });
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => show(i));
    b.addEventListener('mouseenter', () => show(i));
  });
}

/* ---- 募集要項（RecruitInfoSection：未経験者採用／経験者採用タブ。野帳に書き込んだ見せ方） ---- */
function renderJobPanel(c, label, job) {
  if (!c) return '';
  const duties = splitLines(c.duties);
  const qualificationNote = splitLines(c.qualificationNote);
  const highlights = splitLines(c.highlights);
  const checks = (items) => `<ul class="note-check">${items.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`;
  const row = (dt, html) => `
      <div>
        <dt>${escapeHtml(dt)}</dt>
        <dd>${html}</dd>
      </div>`;
  // 給与は「円」だけ小さく
  const pay = (dt, v) => v ? `
      <div>
        <dt>${escapeHtml(dt)}</dt>
        <dd>${escapeHtml(v).replace(/円/g, '<small>円</small>')}</dd>
      </div>` : '';

  return `
    <div class="note-head">
      <h3>${escapeHtml(c.title)}${label ? `（${escapeHtml(label)}）` : ''}</h3>
      <span class="meta">${splitCsv(c.tags).map(escapeHtml).join(' ／ ')}</span>
    </div>
    <dl class="note-pay">
      ${pay('基本給（月給）', c.salaryBase)}
      ${pay('日給', c.salaryDaily)}
    </dl>
    <dl class="note-rows">
      ${row('仕事内容', checks(duties))}
      ${row('年齢', escapeHtml(c.age))}
      ${row('資格・免許', `${escapeHtml(c.qualification)}${qualificationNote.length ? `<small>${qualificationNote.map(escapeHtml).join('<br>')}</small>` : ''}`)}
      ${row('必要な経験', escapeHtml(c.experience))}
      ${highlights.length ? row('活躍できる方', checks(highlights)) : ''}
    </dl>
    ${c.careerPath ? `
    <div class="sticky note-career">
      <b>キャリアパス</b>
      <p>${escapeHtml(c.careerPath)}</p>
    </div>` : ''}
    <a href="#entry" class="btn btn-apply-card" data-job="${job}">この職種に応募する<span class="arrow" aria-hidden="true"></span></a>
  `;
}

function renderJobs(_el, contents) {
  const panelBeginner = document.getElementById('panel-beginner');
  const panelExperienced = document.getElementById('panel-experienced');
  if (!panelBeginner || !panelExperienced) return;

  const beginner = contents.find(c => c.iconKey === 'entry') || contents[0];
  const experienced = contents.find(c => c.iconKey === 'experienced') || contents[1];

  panelBeginner.innerHTML = renderJobPanel(beginner, '未経験者採用', 'surveyor-entry');
  panelExperienced.innerHTML = renderJobPanel(experienced, '経験者採用', 'surveyor-exp');
}

/* ---- 待遇・福利厚生（付箋。画面に入ったら1枚ずつ貼られる） ---- */
function renderBenefits(el, contents) {
  el.innerHTML = contents.map((c, i) => `
    <div class="benefit-item sticky" style="--i:${i}">
      <dt>${escapeHtml(c.title)}</dt>
      <dd>${escapeHtml(c.description)}</dd>
    </div>
  `).join('');
}

/* ---- 先輩の声（lead を大きく、本文を右に表示） ---- */
// 一言の後ろに敷く羽（3枚。1枚ずつ動かすためインラインSVGにする。下の羽から順に表示）
function wingSvg(i) {
  return `
      <span class="wing" aria-hidden="true">
        <svg viewBox="0 0 200 112">
          <defs><linearGradient id="wing-g${i}" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stop-color="#9fe3e3" stop-opacity="0.85"/>
            <stop offset="0.6" stop-color="#a9e9e9" stop-opacity="0.65"/>
            <stop offset="1" stop-color="#bdf3f3" stop-opacity="0.4"/>
          </linearGradient></defs>
          <g fill="url(#wing-g${i})">
            <path class="f3" d="M34,108 C76,96 116,84 154,82 C124,96 90,106 56,110 Z"/>
            <path class="f2" d="M24,102 C70,80 122,56 176,46 C138,68 94,88 46,106 Z"/>
            <path class="f1" d="M14,96 C58,62 118,22 192,8 C156,34 104,66 40,100 Z"/>
          </g>
        </svg>
      </span>`;
}

// lead（見出しの一言）が未登録のとき、本文から印象に残る一文を選ぶ
const LEAD_WORDS = ['やりがい', '誇り', 'ワクワク', '楽し', '魅力', '成長', '安心', '活躍', '自信', '嬉し', 'うれし', '面白', 'おもしろ', '達成感', '役立', '役に立', '形に', '地図', '一緒に'];
function makeLead(quote) {
  const sentences = String(quote ?? '').split(/(?<=[。！？!?])|\n/).map(s => s.trim()).filter(Boolean);
  // 文そのもの＋「、」で区切った後半（結論になりやすい）を候補にする
  const cands = [];
  sentences.forEach((s, i) => {
    const t = s.replace(/[。！？!?]+$/, '');
    cands.push({ t, i });
    const parts = t.split('、');
    if (parts.length > 1) cands.push({ t: parts.slice(-2).join('、'), i }, { t: parts[parts.length - 1], i });
  });
  const scored = cands
    .filter(c => c.t.length >= 8 && c.t.length <= 22)
    .map(c => ({ ...c, score: LEAD_WORDS.filter(w => c.t.includes(w)).length * 3 - Math.abs(c.t.length - 15) / 3 }))
    .sort((a, b) => b.score - a.score);
  return scored.length ? scored[0].t + '。' : '';
}

// 見出しの一言を必ず2行にする。句読点の位置で改行する場合はその句読点を消す
function leadLines(text) {
  const t = String(text ?? '').trim();
  const end = (t.match(/[。！？!?]+$/) || [''])[0];
  const core = t.slice(0, t.length - end.length);
  const mid = core.length / 2;
  let a, b;
  const commas = [...core.matchAll(/[、，,]/g)].map(m => m.index).filter(i => i > 1 && i < core.length - 2);
  if (commas.length) {
    // 真ん中にいちばん近い読点で分け、読点は消す
    const at = commas.reduce((p, c) => (Math.abs(c - mid) < Math.abs(p - mid) ? c : p));
    a = core.slice(0, at); b = core.slice(at + 1);
  } else {
    // 読点がなければ、文節の切れ目（ひらがなの後に漢字・カタカナ・数字が始まる所）のうち真ん中に近い所で分ける
    const hira = /[ぁ-ゖー]/, head = /[一-龠々ァ-ヶｦ-ﾟ0-9０-９A-Za-zＡ-Ｚａ-ｚ「『]/;
    const cuts = [];
    for (let i = 2; i < core.length - 1; i++) {
      if (!hira.test(core[i - 1]) || !head.test(core[i])) continue;
      // 「飛び｜込む」のような送りがなの直後は切らない（直前のひらがなが助詞か2文字以上のときだけ）
      let run = 0;
      while (i - 1 - run >= 0 && hira.test(core[i - 1 - run])) run++;
      if (run >= 2 || /[はがをにでのとへもてば]/.test(core[i - 1])) cuts.push(i);
    }
    if (!cuts.length) return escapeHtml(t);
    const at = cuts.reduce((p, c) => (Math.abs(c - mid) < Math.abs(p - mid) ? c : p));
    a = core.slice(0, at); b = core.slice(at);
  }
  return `${escapeHtml(a)}<br>${escapeHtml(b + end)}`;
}

function renderVoices(el, contents) {
  el.innerHTML = contents.map((v, i) => {
    const quote = String(v.quote ?? '');
    const pull = v.lead || makeLead(quote);
    return `
    <article class="voice-card">
      <p class="voice-pull">${pull ? `<span>${leadLines(pull)}</span>${wingSvg(i)}` : ''}</p>
      <div>
        <blockquote>${escapeHtml(quote)}</blockquote>
        <div class="voice-who">
          <div class="voice-name">${escapeHtml(v.name)}</div>
          <div class="voice-role">${escapeHtml(v.role)}</div>
        </div>
      </div>
    </article>`;
  }).join('');
  // 1人ずつ、画面に入ったら「一言 → 本文 → 名前」の順に表示
  el.querySelectorAll('.voice-card').forEach(card => observeReveal(card));
}

const CARD_SECTIONS = [
  { type: 'business', containerId: 'business-grid', render: renderBusiness },
  { type: 'jobs', containerId: null, render: renderJobs },
  { type: 'benefits', containerId: 'benefits-grid', render: renderBenefits },
  { type: 'voices', containerId: 'voices-grid', render: renderVoices },
];

async function loadCards({ type, containerId, render }) {
  const el = containerId ? document.getElementById(containerId) : null;
  if (containerId && !el) return;
  try {
    const res = await fetch(`/api/content?type=${type}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const contents = (data.contents || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    render(el, contents);
  } catch (err) {
    console.warn(`microCMSからの取得に失敗（${type}）。フォールバックデータを使用します。`, err);
    try {
      const res = await fetch(`data/${type}.json`);
      const contents = (await res.json()).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      render(el, contents);
    } catch (fallbackErr) {
      console.error(`フォールバックの読み込みにも失敗しました（${type}）`, fallbackErr);
    }
  }
}

CARD_SECTIONS.forEach(loadCards);

/* ===== 採用情報タブ（未経験者採用／経験者採用） ===== */
(function () {
  const tabs = [
    { btn: document.getElementById('tab-beginner'), panel: document.getElementById('panel-beginner') },
    { btn: document.getElementById('tab-experienced'), panel: document.getElementById('panel-experienced') },
  ];
  if (!tabs[0].btn || !tabs[1].btn) return;

  function activate(activeIndex) {
    tabs.forEach((t, i) => {
      const isActive = i === activeIndex;
      t.btn.classList.toggle('active', isActive);
      t.btn.setAttribute('aria-selected', String(isActive));
      t.btn.tabIndex = isActive ? 0 : -1;
      t.panel.hidden = !isActive;
    });
  }
  tabs.forEach((t, i) => {
    t.btn.addEventListener('click', () => activate(i));
    t.btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
        tabs[next].btn.focus();
        activate(next);
      }
    });
  });
})();

/* ===== スクロール連動の表示（.reveal はフェードイン、.reason-item は左右から、.voice-card は順番に。一度だけ） ===== */
const revealIO = prefersReducedMotion ? null : new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
function observeReveal(el) {
  if (revealIO) revealIO.observe(el); else el.classList.add('in-view');
}
document.querySelectorAll('.reveal, .reason-item').forEach(observeReveal);

/* ===== 社訓：1文字ずつ表示（1行目を上から、少し間をおいて2行目） ===== */
(function () {
  const p = document.querySelector('.shakkun-lines');
  if (!p) return;
  const lines = p.innerHTML.split(/<br\s*\/?>/i).map(l => l.trim());
  let n = 0;
  const html = lines.map((line, li) => [...line].map(ch => {
    // 行が変わるところは少し間を空ける
    const delay = n++ * 0.13 + li * 0.5;
    return `<span class="ch" style="--d:${delay.toFixed(2)}s">${ch}</span>`;
  }).join('')).join('<br>');
  p.innerHTML = html;
})();

/* ===== 写真の上の文字：1文字ずつ表示（画面に入ったとき一度だけ。改行の前後は少し間を空ける） ===== */
(function () {
  if (prefersReducedMotion) return;
  const targets = [
    ['.hero-catch', 0.12], ['.statement-banner-text', 0.09],
    ['.reason-photo .note', 0.05], ['.photo-cap, .hero-cap', 0.035],
  ];
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('tw-on');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  targets.forEach(([sel, step]) => document.querySelectorAll(sel).forEach(el => {
    let n = 0, gap = 0;
    const wrap = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 1) { if (child.tagName === 'BR') gap += step * 4; else wrap(child); return; }
        if (child.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        [...child.textContent].forEach(ch => {
          if (!ch.trim()) { frag.append(ch); return; }
          const span = document.createElement('span');
          span.className = 'tw-c';
          span.style.setProperty('--d', `${(n++ * step + gap).toFixed(2)}s`);
          span.textContent = ch;
          frag.append(span);
        });
        child.replaceWith(frag);
      });
    };
    el.setAttribute('aria-label', el.textContent.trim());
    wrap(el);
    io.observe(el);
  }));
})();

/* ===== 視準十字：ページ全体でカーソルに追従し、ページ内の位置を本社付近の緯度経度として表示（マウス操作の端末のみ） ===== */
(function () {
  const reticle = document.getElementById('reticle');
  const read = document.getElementById('reticle-read');
  const pageWrap = document.getElementById('page-wrapper');
  if (!reticle || prefersReducedMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const BASE_LAT = 35.0233, BASE_LON = 135.5642; // 京都府亀岡市 付近
  const INTERACTIVE = 'a, button, input, select, textarea, label, [role="tab"], .privacy-overlay';
  const dms = deg => {
    const d = Math.floor(deg), mf = (deg - d) * 60, m = Math.floor(mf), sec = Math.round((mf - m) * 60);
    return `${d}°${String(m).padStart(2, '0')}′${String(sec).padStart(2, '0')}″`;
  };
  let x = 0, y = 0, frame = 0;
  const draw = () => {
    frame = 0;
    const r = pageWrap.getBoundingClientRect();
    const rx = (x - r.left) / r.width;
    const ry = (pageWrap.scrollTop + y) / pageWrap.scrollHeight; // 下へ行くほど南へ
    reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    read.innerHTML = `N ${dms(BASE_LAT + 0.004 - ry * 0.012)}<br>E ${dms(BASE_LON + (rx - 0.5) * 0.012)}`;
  };
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    // リンク・ボタン・入力欄の上では十字を隠して通常のカーソルに戻す
    const onUi = e.target.closest && e.target.closest(INTERACTIVE);
    document.documentElement.classList.toggle('aiming', !onUi);
    if (!frame) frame = requestAnimationFrame(draw);
  });
  document.addEventListener('pointerleave', () => document.documentElement.classList.remove('aiming'));
  document.addEventListener('mouseout', e => { if (!e.relatedTarget) document.documentElement.classList.remove('aiming'); });
  pageWrap.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(draw); }, { passive: true });
})();

/* ===== 数字のカウントアップ（表示されたときに一度だけ） ===== */
(function () {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length || prefersReducedMotion) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target, to = Number(el.dataset.count), start = performance.now(), dur = 1200;
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

/* ===== HERO 背景クロスフェード（Ken Burns） ===== */
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;
  let current = 0;
  slides[current].classList.add('active');
  if (!prefersReducedMotion) {
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 6000);
  }
})();

/* ===== 私たちについて：写真カードの入れ替え ===== */
(function () {
  const box = document.querySelector('.env-cards');
  if (!box || prefersReducedMotion) return;
  const cards = Array.from(box.querySelectorAll('.env-card'));
  if (cards.length < 2) return;
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(box);
  cards.forEach(c => c.addEventListener('animationend', () => c.classList.remove('is-out')));
  setInterval(() => {
    if (!visible || document.hidden) return;
    cards.forEach(c => {
      const pos = Number(c.dataset.pos);
      if (pos === 0) {
        c.dataset.pos = String(cards.length - 1);
        c.classList.add('is-out');
      } else {
        c.dataset.pos = String(pos - 1);
      }
    });
  }, 4000);
})();

/* ===== ヘッダー スクロール連動 ===== */
const wrapper = document.getElementById('page-wrapper');
const header = document.getElementById('site-header');
const headerProgress = header.querySelector('.header-progress');
const onScroll = () => {
  header.classList.toggle('scrolled', wrapper.scrollTop > 30);
  // 読んだ量（0〜1）を目盛りのバーに反映
  const max = wrapper.scrollHeight - wrapper.clientHeight;
  headerProgress.style.setProperty('--p', max > 0 ? (wrapper.scrollTop / max).toFixed(4) : 0);
};
wrapper.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 固定表示のヘッダー・応募ボタンを、#page-wrapper のスクロールバーに重ならない位置に置くための幅
const setScrollbarWidth = () => document.documentElement.style.setProperty('--sbw', `${wrapper.offsetWidth - wrapper.clientWidth}px`);
setScrollbarWidth();
window.addEventListener('resize', setScrollbarWidth);

/* ===== ナビ：今いるセクションの項目に印を付ける（「1日の流れ」は「仕事を知る」に含める） ===== */
(function () {
  const links = [...document.querySelectorAll('.nav-links a')];
  const map = { day: 'work' };
  const sections = ['environment', 'work', 'day', 'voice', 'recruit', 'company', 'entry']
    .map(id => document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = map[entry.target.id] || entry.target.id;
      links.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`));
    });
  }, { root: wrapper, rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(sec => io.observe(sec));
  // ヒーローに戻ったら印を消す
  new IntersectionObserver(([e]) => { if (e.isIntersecting) links.forEach(a => a.classList.remove('is-current')); },
    { root: wrapper, rootMargin: '-45% 0px -50% 0px' }).observe(document.getElementById('hero'));
})();

/* ===== アンカーリンクのスムーズスクロール ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  const href = a.getAttribute('href');
  if (href === '#') return; // 「#」だけのリンク（プライバシーポリシーを開く等）は別の処理に任せる
  a.addEventListener('click', e => {
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

/* ===== ハンバーガーメニュー ===== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  mobileNav.classList.toggle('open', isOpen);
  wrapper.style.overflowY = isOpen ? 'hidden' : 'scroll';
  setScrollbarWidth();
});
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    wrapper.style.overflowY = 'scroll';
    setScrollbarWidth();
  });
});

/* ===== フローティング応募ボタン（ヒーロー通過後に表示・応募エリア表示中は非表示） ===== */
const floatApply = document.getElementById('float-apply');
const heroSection = document.getElementById('hero');
const entrySection = document.getElementById('entry');
let heroGone = false;
let entryVisible = false;

const updateFloatButton = () => {
  floatApply.classList.toggle('visible', heroGone && !entryVisible);
};

new IntersectionObserver(([entry]) => {
  heroGone = !entry.isIntersecting;
  updateFloatButton();
}, { threshold: 0 }).observe(heroSection);

new IntersectionObserver(([entry]) => {
  entryVisible = entry.isIntersecting;
  updateFloatButton();
}, { threshold: 0 }).observe(entrySection);

/* ===== 応募フォーム（ステップ型：職種 → お名前 → 連絡先 → 内容 → 確認） ===== */
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const btnSubmit = document.getElementById('btn-submit');
const btnNext = document.getElementById('step-next');
const btnBack = document.getElementById('step-back');
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let privacyAgreed = false;
const jobValue = () => (form.querySelector('input[name="job"]:checked') || {}).value || '';
const val = id => document.getElementById(id).value.trim();

function setError(fieldId, errId, show) {
  const field = document.getElementById(fieldId);
  field.classList.toggle('is-error', show);
  // 読み上げ環境にも「入力に問題がある」ことを伝える
  if (field.matches('input, textarea')) field.setAttribute('aria-invalid', String(show));
  document.getElementById(errId).classList.toggle('show', show);
  return show;
}

// ステップごとの入力チェック（問題なければ true）
const STEP_CHECKS = {
  1: () => !setError('job', 'err-job', jobValue() === ''),
  2: () => !setError('name', 'err-name', val('name') === ''),
  3: () => !setError('email', 'err-email', !emailRe.test(val('email'))),
  4: () => !setError('message', 'err-message', val('message') === ''),
  5: () => {
    const agreed = !setError('agree', 'err-agree', !privacyAgreed);
    const human = !setError('turnstile-widget', 'err-turnstile', !turnstileToken);
    return agreed && human;
  },
};

const steps = [...form.querySelectorAll('.step')];
const points = [...document.querySelectorAll('.tv-pt')];
const segs = [...document.querySelectorAll('.traverse .seg')];
let current = 1;
let editing = false; // 確認画面の「修正」から来たときは、直したら確認画面へ戻す

// 線は縦横比を変えて描くので、画面上の長さを計算して破線の長さにする（引かれていく動き用）
function measureSegs() {
  const box = document.querySelector('.traverse').getBoundingClientRect();
  const sx = box.width / 100, sy = box.height / 64;
  segs.forEach(sg => {
    const dx = (sg.x2.baseVal.value - sg.x1.baseVal.value) * sx;
    const dy = (sg.y2.baseVal.value - sg.y1.baseVal.value) * sy;
    sg.style.setProperty('--len', Math.ceil(Math.hypot(dx, dy)) + 1);
  });
}
measureSegs();
window.addEventListener('resize', measureSegs);

// 確認画面：入力内容を一覧にして、各行から修正に戻れるようにする
function renderConfirm() {
  const jobLabel = {
    'surveyor-entry': '測量士・測量士補（正社員）未経験者採用',
    'surveyor-exp': '測量士・測量士補（正社員）経験者採用',
    other: 'その他・一般問い合わせ',
  }[jobValue()] || '';
  const rows = [
    ['応募職種', jobLabel, 1], ['お名前', val('name'), 2], ['メールアドレス', val('email'), 3],
    ['電話番号', val('tel'), 3], ['お問い合わせ内容', val('message'), 4],
  ];
  const list = document.getElementById('confirm-list');
  list.textContent = '';
  rows.forEach(([label, value, step]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value || '（未入力）';
    if (!value) dd.className = 'empty';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = '修正';
    edit.setAttribute('aria-label', `${label}を修正`);
    edit.addEventListener('click', () => { editing = true; goTo(step); });
    row.append(dt, dd, edit);
    list.append(row);
  });
}

function goTo(n, { focus = true } = {}) {
  const back = n < current;
  current = n;
  steps.forEach(st => {
    const on = Number(st.dataset.step) === n;
    st.hidden = !on;
    st.classList.toggle('from-left', on && back);
  });
  // トラバース：通過した測点を塗り、線を引く
  points.forEach((pt, i) => {
    pt.classList.toggle('done', i + 1 < n);
    pt.classList.toggle('now', i + 1 === n);
  });
  segs.forEach((sg, i) => sg.classList.toggle('done', i + 1 < n));
  document.getElementById('step-now').textContent = n;
  btnBack.hidden = n === 1;
  btnNext.hidden = n === 5;
  btnSubmit.hidden = n !== 5;
  if (n === 5) editing = false;
  btnNext.firstChild.textContent = editing ? '確認へ戻る' : n === 4 ? '確認へ進む' : '次へ';
  updateSubmit();
  if (n >= 2) loadTurnstile().catch(() => {}); // 入力を始めたら先に読み込んでおく
  if (n === 5) { renderConfirm(); renderTurnstile(); }
  if (!focus) return;
  // フォームの上端が画面外なら戻してから、入力欄（なければ問い）にフォーカス
  const card = document.querySelector('.form-wrapper');
  if (card.getBoundingClientRect().top < 80) card.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  const active = steps[n - 1];
  const first = active.querySelector('input.form-control, textarea');
  (first || active.querySelector('.step-q')).focus({ preventScroll: true });
}

function next() {
  if (!STEP_CHECKS[current]()) {
    const bad = steps[current - 1].querySelector('input.is-error, textarea.is-error');
    if (bad) bad.focus();
    return;
  }
  if (current < 5) goTo(editing ? 5 : current + 1);
}
btnNext.addEventListener('click', next);
btnBack.addEventListener('click', () => { if (current > 1) goTo(current - 1); });

// 職種は選んだら少し待って次へ
form.querySelectorAll('input[name="job"]').forEach(r => r.addEventListener('change', () => {
  setError('job', 'err-job', false);
  if (current === 1) setTimeout(() => { if (current === 1) goTo(editing ? 5 : 2); }, 320);
}));
// 入力欄で Enter を押したら次へ（テキストエリアは改行のまま。変換確定の Enter は除く）
form.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('input.form-control') && !e.isComposing) {
    e.preventDefault();
    next();
  }
});

// 入力OKの欄には右端のチェック。エラーは打ち直したら消す
function markOk(el, ok) { el.classList.toggle('is-ok', ok); }
document.getElementById('name').addEventListener('input', function () {
  const ok = this.value.trim() !== '';
  if (ok) setError('name', 'err-name', false);
  markOk(this, ok);
});
document.getElementById('email').addEventListener('input', function () {
  const ok = emailRe.test(this.value.trim());
  if (ok) setError('email', 'err-email', false);
  markOk(this, ok);
});
document.getElementById('tel').addEventListener('input', function () { markOk(this, this.value.trim() !== ''); });
document.getElementById('message').addEventListener('input', function () {
  const ok = this.value.trim() !== '';
  if (ok) setError('message', 'err-message', false);
  markOk(this, ok);
});

// 書き出しの例：押すと本文の先頭に入れる
document.querySelectorAll('.msg-chips button').forEach(b => b.addEventListener('click', () => {
  const ta = document.getElementById('message');
  if (!ta.value.includes(b.dataset.text)) ta.value = b.dataset.text + (ta.value ? '\n' + ta.value : '');
  ta.dispatchEvent(new Event('input'));
  ta.focus();
}));

/* ---- ボット対策（Cloudflare Turnstile）。サイトキーは /api/config から受け取る ---- */
const TURNSTILE_TEST_KEY = '1x00000000000000000000AA'; // ローカル確認用：Cloudflare公式の「常に通る」テストキー
let turnstileToken = '';
let turnstileWidget = null;
let turnstileLoading = null;

function loadTurnstile() {
  if (!turnstileLoading) {
    turnstileLoading = (async () => {
      let sitekey = '';
      try {
        const r = await fetch('/api/config');
        if (r.ok) sitekey = (await r.json()).turnstileSiteKey || '';
      } catch {}
      if (!sitekey && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) sitekey = TURNSTILE_TEST_KEY;
      if (!sitekey) throw new Error('Turnstile のサイトキーを取得できません');
      if (typeof window.turnstile?.render !== 'function') {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          s.async = true;
          s.onload = resolve;
          s.onerror = () => reject(new Error('Turnstile の読み込みに失敗しました'));
          document.head.append(s);
        });
      }
      return sitekey;
    })();
    // 失敗したら次の機会に読み込み直せるようにする
    turnstileLoading.catch(() => { turnstileLoading = null; });
  }
  return turnstileLoading;
}

async function renderTurnstile() {
  if (turnstileWidget !== null) return;
  const errEl = document.getElementById('err-turnstile');
  try {
    const sitekey = await loadTurnstile();
    if (turnstileWidget !== null) return;
    const done = token => { turnstileToken = token; if (token) setError('turnstile-widget', 'err-turnstile', false); updateSubmit(); };
    turnstileWidget = window.turnstile.render('#turnstile-widget', {
      sitekey,
      language: 'ja',
      theme: 'light',
      callback: done,
      'expired-callback': () => done(''),
      'error-callback': () => done(''),
    });
  } catch (err) {
    console.error(err);
    errEl.textContent = '確認の読み込みに失敗しました。ページを再読み込みするか、お電話（0771-56-8323）でご連絡ください。';
    setError('turnstile-widget', 'err-turnstile', true);
  }
}

function resetTurnstile() {
  turnstileToken = '';
  if (turnstileWidget !== null && window.turnstile) window.turnstile.reset(turnstileWidget);
  updateSubmit();
}

// 送信ボタンは「同意済み」かつ「ボット確認済み」のときだけ押せる
function updateSubmit() {
  const ready = privacyAgreed && turnstileToken !== '';
  btnSubmit.disabled = !ready;
  const note = document.getElementById('submit-note');
  note.textContent = !privacyAgreed ? '個人情報の取り扱いに同意すると送信できます' : '確認のチェックが終わると送信できます';
  note.hidden = current !== 5 || ready;
}

goTo(1, { focus: false });

form.addEventListener('submit', async e => {
  e.preventDefault();
  const firstBad = [1, 2, 3, 4, 5].find(n => !STEP_CHECKS[n]());
  if (firstBad) {
    goTo(firstBad);
    return;
  }

  btnSubmit.firstChild.textContent = '送信中';
  btnSubmit.classList.add('loading');
  btnSubmit.disabled = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    val('name'),
        email:   val('email'),
        tel:     val('tel'),
        job:     jobValue(),
        message: val('message'),
        turnstileToken,
        website: document.querySelector('input[name="website"]').value,
      }),
    });
    if (res.ok) {
      const { mailed = true } = await res.json().catch(() => ({}));
      // 受付完了メールが送れなかったときは、届くと断定しない
      if (!mailed) document.getElementById('success-mail').textContent = '受付完了メールをお送りできませんでしたが、内容は受け付けております。';
      form.style.display = 'none';
      document.querySelector('.traverse').style.display = 'none';
      document.querySelector('.form-head span').style.visibility = 'hidden';
      formSuccess.style.display = 'block';
      formSuccess.querySelector('h3').focus();
    } else {
      throw new Error('送信失敗');
    }
  } catch {
    btnSubmit.firstChild.textContent = 'この内容で送信する';
    btnSubmit.classList.remove('loading');
    resetTurnstile(); // トークンは1回限りなので、送り直す前に取り直す
    alert('送信に失敗しました。お電話（0771-56-8323）またはお時間をおいて再度お試しください。');
  }
});

/* ===== プライバシーモーダル ===== */
(function () {
  const overlay  = document.getElementById('privacy-overlay');
  const body     = document.getElementById('privacy-body');
  const check    = document.getElementById('privacy-check');
  const hint     = document.getElementById('privacy-hint');
  const closeBtn = document.getElementById('privacy-close');
  const openLink = document.getElementById('open-privacy');

  let returnFocus = null;

  // 最後まで読んだら同意できるようにする（画面が縦に長く、スクロール不要な場合もここで有効になる）
  function checkReadToEnd() {
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 40) {
      check.disabled = false;
      hint.classList.add('hidden');
    }
  }

  function openModal() {
    returnFocus = document.activeElement;
    overlay.classList.add('open');
    check.checked  = false;
    check.disabled = true;
    hint.classList.remove('hidden');
    body.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    checkReadToEnd();
    closeBtn.focus();
  }

  function closeModal() {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // 同意後は呼び出し元のリンクが消えるので、確認画面の問いへ戻す
    const back = returnFocus && returnFocus.offsetParent ? returnFocus : document.querySelector('.step[data-step="5"] .step-q');
    if (back) back.focus({ preventScroll: true });
  }

  openLink.addEventListener('click', e => { e.preventDefault(); openModal(); });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  body.addEventListener('scroll', checkReadToEnd);
  window.addEventListener('resize', () => { if (overlay.classList.contains('open')) checkReadToEnd(); });

  // Esc で閉じる。Tab はモーダルの中だけを巡回する
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    const items = [...overlay.querySelectorAll('button, a[href], input:not([disabled])')].filter(el => el.offsetParent);
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  check.addEventListener('change', () => {
    if (check.checked) {
      privacyAgreed = true;
      document.getElementById('agree-pending').style.display = 'none';
      const agreeDone = document.getElementById('agree-done');
      agreeDone.style.display = 'flex';
      setError('agree', 'err-agree', false);
      updateSubmit();
      setTimeout(closeModal, 300);
    }
  });
})();

// 募集要項の「この職種に応募する」から来たら、そのタブの区分（未経験者／経験者）を選んだ状態で次の問いから始める
document.addEventListener('click', e => {
  const card = e.target.closest('.btn-apply-card');
  if (!card) return;
  const r = form.querySelector(`input[name="job"][value="${card.dataset.job}"]`);
  if (r) { r.checked = true; setError('job', 'err-job', false); }
  if (current === 1) goTo(2, { focus: false });
  else if (current === 5) renderConfirm(); // 確認画面まで進んでいたら、表示中の職種を更新
});
