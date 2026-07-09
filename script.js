/* ===== カードデータ（事業内容・募集職種・待遇・先輩の声）=====
   microCMS( /api/content?type=... )から取得。失敗時は data/*.json をフォールバックとして使用 */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function iconSvg(key) {
  return (typeof ICONS !== 'undefined' && ICONS[key]) || '';
}

/* microCMSの「テキストエリア」フィールドは配列ではなく1本の文字列として保存されるため、
   「1行に1つ」「カンマ区切り」の項目は表示時にこちらで分割する */
function splitLines(str) {
  return String(str ?? '').split('\n').map(s => s.trim()).filter(Boolean);
}
function splitCsv(str) {
  return String(str ?? '').split(',').map(s => s.trim()).filter(Boolean);
}

function renderBusiness(el, contents) {
  el.innerHTML = contents.map(c => `
    <div class="business-card">
      <div class="business-icon">${iconSvg(c.iconKey)}</div>
      <h3>${escapeHtml(c.title)}</h3>
      <ul class="business-list">${splitLines(c.items).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      ${c.note ? `<p class="business-etc">${escapeHtml(c.note)}</p>` : ''}
    </div>
  `).join('');
}

function renderJobs(el, contents) {
  el.innerHTML = contents.map(c => {
    const qualificationNote = splitLines(c.qualificationNote);
    const highlights = splitLines(c.highlights);
    return `
    <div class="job-card-full">
      <div class="job-card-header">
        <div class="job-icon-lg">${iconSvg(c.iconKey)}</div>
        <div>
          <h3>${escapeHtml(c.title)}</h3>
          ${splitCsv(c.tags).map(t => `<span class="job-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <div class="job-sections">
        <div class="job-section">
          <h4>仕事内容</h4>
          <ul class="job-list">${splitLines(c.duties).map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
        </div>
        <div class="job-detail-grid">
          <div class="job-detail-block"><h4>基本給</h4><p>${escapeHtml(c.salaryBase)}</p></div>
          <div class="job-detail-block"><h4>日給</h4><p>${escapeHtml(c.salaryDaily)}</p></div>
          <div class="job-detail-block"><h4>年齢</h4><p>${escapeHtml(c.age)}</p></div>
          <div class="job-detail-block job-detail-block--wide">
            <h4>必要な資格・免許</h4>
            <p>${escapeHtml(c.qualification)}${qualificationNote.length ? `<br><small>${qualificationNote.map(escapeHtml).join('<br>')}</small>` : ''}</p>
          </div>
          <div class="job-detail-block"><h4>必要な経験</h4><p>${escapeHtml(c.experience)}</p></div>
        </div>
        ${c.careerPath ? `<div class="job-section"><h4>キャリアパス</h4><p>${escapeHtml(c.careerPath)}</p></div>` : ''}
        ${highlights.length ? `<div class="job-section"><h4>活躍できる方</h4><ul class="job-list">${highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul></div>` : ''}
      </div>
      <a href="#contact" class="btn-apply-card">この職種に応募する →</a>
    </div>
  `;
  }).join('');
}

function renderBenefits(el, contents) {
  el.innerHTML = contents.map((c, i) => `
    <div class="benefit-item">
      <span class="benefit-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="benefit-icon">${iconSvg(c.iconKey)}</div>
      <h4>${escapeHtml(c.title)}</h4>
      <p>${escapeHtml(c.description)}</p>
    </div>
  `).join('');
}

function renderVoices(el, contents) {
  el.innerHTML = contents.map((v, i) => `
    <div class="voice-card">
      <span class="voice-num">${String(i + 1).padStart(2, '0')}</span>
      <blockquote>${escapeHtml(v.quote)}</blockquote>
      <div class="voice-divider"></div>
      <div class="voice-person">
        <div class="voice-avatar"><span class="voice-initial">${escapeHtml((v.name || '').charAt(0))}</span></div>
        <div>
          <div class="voice-name">${escapeHtml(v.name)}</div>
          <div class="voice-role">${escapeHtml(v.role)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

const CARD_SECTIONS = [
  { type: 'business', containerId: 'business-grid', render: renderBusiness },
  { type: 'jobs', containerId: 'jobs-grid', render: renderJobs },
  { type: 'benefits', containerId: 'benefits-grid', render: renderBenefits },
  { type: 'voices', containerId: 'voices-grid', render: renderVoices },
];

async function loadCards({ type, containerId, render }) {
  const el = document.getElementById(containerId);
  if (!el) return;
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

/* ===== 全ページ背景スライドショー ===== */
(function () {
  const slides = document.querySelectorAll('.page-bg-slide');
  if (!slides.length) return;
  let current = 0;
  slides[current].classList.add('active');
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
})();

/* ===== ヘッダー スクロール連動 ===== */
const wrapper = document.getElementById('page-wrapper');
const header = document.getElementById('site-header');
const onScroll = () => header.classList.toggle('scrolled', wrapper.scrollTop > 30);
wrapper.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ===== アンカーリンクのスムーズスクロール ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===== ハンバーガーメニュー ===== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', isOpen);
  wrapper.style.overflowY = isOpen ? 'hidden' : 'scroll';
});
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    wrapper.style.overflowY = 'scroll';
  });
});

/* ===== フローティング応募ボタン（ヒーロー通過後に表示・お問い合わせ表示中は非表示） ===== */
const floatApply = document.getElementById('float-apply');
const heroSection = document.getElementById('hero');
const contactSection = document.getElementById('contact');
let heroGone = false;
let contactVisible = false;

const updateFloatButton = () => {
  floatApply.classList.toggle('visible', heroGone && !contactVisible);
};

new IntersectionObserver(([entry]) => {
  heroGone = !entry.isIntersecting;
  updateFloatButton();
}, { threshold: 0 }).observe(heroSection);

new IntersectionObserver(([entry]) => {
  contactVisible = entry.isIntersecting;
  updateFloatButton();
}, { threshold: 0 }).observe(contactSection);

/* ===== お問い合わせフォーム ===== */
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const btnSubmit = document.getElementById('btn-submit');
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let privacyAgreed = false;

function setError(fieldId, errId, show) {
  document.getElementById(fieldId).classList.toggle('is-error', show);
  document.getElementById(errId).classList.toggle('show', show);
  return show;
}

function validate() {
  let hasError = false;
  if (setError('name',    'err-name',    document.getElementById('name').value.trim() === '')) hasError = true;
  if (setError('email',   'err-email',   !emailRe.test(document.getElementById('email').value.trim()))) hasError = true;
  if (setError('job',     'err-job',     document.getElementById('job').value === '')) hasError = true;
  if (setError('message', 'err-message', document.getElementById('message').value.trim() === '')) hasError = true;
  if (setError('agree',   'err-agree',   !privacyAgreed)) hasError = true;
  return !hasError;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) {
    const firstErr = form.querySelector('.is-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  btnSubmit.textContent = '送信中';
  btnSubmit.classList.add('loading');
  btnSubmit.disabled = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    document.getElementById('name').value.trim(),
        email:   document.getElementById('email').value.trim(),
        tel:     document.getElementById('tel').value.trim(),
        job:     document.getElementById('job').value,
        message: document.getElementById('message').value.trim(),
        website: document.querySelector('input[name="website"]').value,
      }),
    });
    if (res.ok) {
      form.style.display = 'none';
      formSuccess.style.display = 'block';
    } else {
      throw new Error('送信失敗');
    }
  } catch {
    btnSubmit.textContent = '送信する';
    btnSubmit.classList.remove('loading');
    btnSubmit.disabled = false;
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

  function openModal() {
    overlay.classList.add('open');
    check.checked  = false;
    check.disabled = true;
    hint.classList.remove('hidden');
    body.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openLink.addEventListener('click', e => { e.preventDefault(); openModal(); });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  body.addEventListener('scroll', () => {
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 40) {
      check.disabled = false;
      hint.classList.add('hidden');
    }
  });

  check.addEventListener('change', () => {
    if (check.checked) {
      privacyAgreed = true;
      document.getElementById('agree-pending').style.display = 'none';
      const agreeDone = document.getElementById('agree-done');
      agreeDone.style.display = 'flex';
      btnSubmit.disabled = false;
      setError('agree', 'err-agree', false);
      setTimeout(closeModal, 300);
    }
  });
})();

/* ===== リアルタイムバリデーション ===== */
document.getElementById('name').addEventListener('input',    function() { setError('name',    'err-name',    this.value.trim() === ''); });
document.getElementById('email').addEventListener('input',   function() { if (this.value.trim()) setError('email', 'err-email', !emailRe.test(this.value.trim())); });
document.getElementById('job').addEventListener('change',    function() { setError('job',     'err-job',     this.value === ''); });
document.getElementById('message').addEventListener('input', function() { setError('message', 'err-message', this.value.trim() === ''); });
