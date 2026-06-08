/* ===== 先輩の声 — senpai_koe/voices.js の VOICES_DATA を使用 ===== */
document.getElementById('voices-grid').innerHTML = VOICES_DATA.map((v, i) => {
  const initial = v.name.charAt(0);
  return `
  <div class="voice-card">
    <span class="voice-num">0${i + 1}</span>
    <blockquote>${v.quote}</blockquote>
    <div class="voice-divider"></div>
    <div class="voice-person">
      <div class="voice-avatar"><span class="voice-initial">${initial}</span></div>
      <div>
        <div class="voice-name">${v.name}</div>
        <div class="voice-role">${v.role}</div>
      </div>
    </div>
  </div>
`}).join('');

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
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


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
  if (setError('agree',   'err-agree',   !document.getElementById('agree').checked)) hasError = true;
  return !hasError;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) {
    const firstErr = form.querySelector('.is-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = form.querySelector('.btn-submit');
  btn.textContent = '送信中';
  btn.classList.add('loading');
  btn.disabled = true;

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
    btn.textContent = '送信する';
    btn.classList.remove('loading');
    btn.disabled = false;
    alert('送信に失敗しました。お電話（0771-56-8323）またはお時間をおいて再度お試しください。');
  }
});

/* ===== プライバシーモーダル ===== */
(function () {
  const overlay     = document.getElementById('privacy-overlay');
  const body        = document.getElementById('privacy-body');
  const check       = document.getElementById('privacy-check');
  const hint        = document.getElementById('privacy-hint');
  const closeBtn    = document.getElementById('privacy-close');
  const openLink    = document.getElementById('open-privacy');
  const agreeMain   = document.getElementById('agree');

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
      agreeMain.checked = true;
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
document.getElementById('agree').addEventListener('change',  function() { setError('agree',   'err-agree',   !this.checked); });
