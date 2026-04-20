const nameInput  = document.getElementById('profile-name');
const emailInput = document.getElementById('profile-email');
const avatarEl   = document.getElementById('avatar');

function setAvatar(name) {
  if (avatarEl) avatarEl.textContent = (name || 'U')[0].toUpperCase();
}

let saveTimer;
nameInput.addEventListener('input', () => {
  setAvatar(nameInput.value);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    State.saveProfile({ name: nameInput.value, email: emailInput.value });
  }, 500);
});

emailInput.addEventListener('input', () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    State.saveProfile({ name: nameInput.value, email: emailInput.value });
  }, 500);
});

async function updateBadges() {
  const [m, o] = await Promise.all([State.getMercado(), State.getOnline()]);
  const bm = document.getElementById('badge-mercado');
  const bo = document.getElementById('badge-online');
  if (bm) bm.textContent = m.length;
  if (bo) bo.textContent = o.length;
}

async function confirmClear() {
  if (!confirm('Tem certeza? Todos os itens das listas serão removidos permanentemente.')) return;
  const [m, o] = await Promise.all([State.getMercado(), State.getOnline()]);
  await Promise.all([
    ...m.map(it => State.deleteMercado(it.id)),
    ...o.map(it => State.deleteOnline(it.id)),
  ]);
  document.getElementById('stat-mercado').textContent = 0;
  document.getElementById('stat-online').textContent  = 0;
  document.getElementById('stat-done').textContent    = 0;
  gsap.fromTo('.danger-zone', { scale: 1 }, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
}
window.confirmClear = confirmClear;

(async () => {
  await updateBadges();
  gsap.from('.user-info-card', { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out', delay: 0.05 });
  gsap.from('.profile-card',   { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out', delay: 0.15 });
  gsap.from('.stat-card',      { opacity: 0, y: 14, duration: 0.35, stagger: 0.07, ease: 'power2.out', delay: 0.27 });
  gsap.from('.danger-zone',    { opacity: 0, y: 10, duration: 0.3,  ease: 'power2.out', delay: 0.45 });
})();
