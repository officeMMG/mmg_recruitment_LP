/* ===== 先輩の声 — data/voices.json から読み込み ===== */
fetch('data/voices.json')
  .then(r => r.json())
  .then(voices => {
    document.getElementById('voices-grid').innerHTML = voices.map(v => `
      <div class="voice-card">
        <div class="voice-quote">"</div>
        <blockquote>${v.quote}</blockquote>
        <div class="voice-person">
          <div class="voice-avatar">${v.avatar}</div>
          <div>
            <div class="voice-name">${v.name}</div>
            <div class="voice-role">${v.role}</div>
          </div>
        </div>
      </div>
    `).join('');
  })
  .catch(() => {
    document.getElementById('voices-grid').innerHTML =
      '<p style="text-align:center;color:#999;">先輩の声を読み込めませんでした。</p>';
  });

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

/* ===== フローティング応募ボタン（ヒーロー通過後に表示） ===== */
const floatApply = document.getElementById('float-apply');
const heroSection = document.getElementById('hero');
const heroObserver = new IntersectionObserver(([entry]) => {
  floatApply.classList.toggle('visible', !entry.isIntersecting);
}, { threshold: 0 });
heroObserver.observe(heroSection);

/* ===== お問い合わせフォーム ===== */
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------
// Formspree 設定
// 1. https://formspree.io にアクセスしてアカウント作成（無料）
// 2. 「New Form」を作成し、送信先メールアドレスを登録
// 3. 発行された8文字のフォームIDを下記 FORMSPREE_ID に貼り付ける
// 例: const FORMSPREE_ID = 'xabc1234';
// ---------------------------------------------------------------
const FORMSPREE_ID = 'YOUR_FORM_ID';

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

  // Formspree IDが未設定の場合はデモ動作（実際は送信されません）
  if (FORMSPREE_ID === 'YOUR_FORM_ID') {
    await new Promise(r => setTimeout(r, 800));
    form.style.display = 'none';
    formSuccess.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
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

/* ===== リアルタイムバリデーション ===== */
document.getElementById('name').addEventListener('input',    function() { setError('name',    'err-name',    this.value.trim() === ''); });
document.getElementById('email').addEventListener('input',   function() { if (this.value.trim()) setError('email', 'err-email', !emailRe.test(this.value.trim())); });
document.getElementById('job').addEventListener('change',    function() { setError('job',     'err-job',     this.value === ''); });
document.getElementById('message').addEventListener('input', function() { setError('message', 'err-message', this.value.trim() === ''); });
document.getElementById('agree').addEventListener('change',  function() { setError('agree',   'err-agree',   !this.checked); });
