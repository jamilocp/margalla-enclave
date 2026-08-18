
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('open'));
});

const form = document.getElementById('interest-form');
const note = document.getElementById('form-note');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  note.textContent = 'Demo form submitted locally. Next step: connect it to your email or CRM.';
  form.reset();
});
