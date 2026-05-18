/* ===== ヘッダー スクロール連動 ===== */
const header = document.getElementById('site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll);
onScroll();

/* ===== ハンバーガーメニュー ===== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ===== お問い合わせフォーム バリデーション ===== */
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

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) {
    const firstErr = form.querySelector('.is-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  form.style.display = 'none';
  formSuccess.style.display = 'block';
});

/* ===== リアルタイムバリデーション ===== */
document.getElementById('name').addEventListener('input',    function() { setError('name',    'err-name',    this.value.trim() === ''); });
document.getElementById('email').addEventListener('input',   function() { if (this.value.trim()) setError('email', 'err-email', !emailRe.test(this.value.trim())); });
document.getElementById('job').addEventListener('change',    function() { setError('job',     'err-job',     this.value === ''); });
document.getElementById('message').addEventListener('input', function() { setError('message', 'err-message', this.value.trim() === ''); });
document.getElementById('agree').addEventListener('change',  function() { setError('agree',   'err-agree',   !this.checked); });
