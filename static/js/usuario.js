const nameInput  = document.getElementById('profile-name');
const emailInput = document.getElementById('profile-email');
const avatarEl   = document.getElementById('avatar');

function load() {
  const p = State.getProfile();
  nameInput.value  = p.name  || '';
  emailInput.value = p.email || '';
  setAvatar(p.name);
}

function setAvatar(name) {
  if (avatarEl) avatarEl.textContent = (name || 'U')[0].toUpperCase();
}

nameInput.addEventListener('input', () => {
  const p = State.getProfile();
  p.name = nameInput.value;
  State.saveProfile(p);
  setAvatar(p.name);
});

emailInput.addEventListener('input', () => {
  const p = State.getProfile();
  p.email = emailInput.value;
  State.saveProfile(p);
});

function updateStats() {
  const m = State.getMercado();
  const o = State.getOnline();
  document.getElementById('stat-mercado').textContent = m.length;
  document.getElementById('stat-online').textContent  = o.length;
  document.getElementById('stat-done').textContent    =
    m.filter(x => x.checked).length + o.filter(x => x.checked).length;
}

function confirmClear() {
  if (!confirm('Tem certeza? Todos os itens das listas serão removidos permanentemente.')) return;
  State.saveMercado([]);
  State.saveOnline([]);
  updateStats();
  State.updateSidebarBadges();
  gsap.fromTo('.danger-zone', { scale: 1 }, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
}
window.confirmClear = confirmClear;

load();
updateStats();
State.updateSidebarBadges();

gsap.from('.profile-card', { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out', delay: 0.1 });
gsap.from('.stat-card',    { opacity: 0, y: 14, duration: 0.35, stagger: 0.07, ease: 'power2.out', delay: 0.22 });
gsap.from('.danger-zone',  { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out', delay: 0.4 });
