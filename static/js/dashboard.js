/* ── Greeting (reads saved name) ─────────────────────────── */
function loadGreeting() {
  const p = State.getProfile();
  const el = document.getElementById('greeting');
  if (el) el.textContent = 'Olá, ' + (p.name || 'Usuário') + ' 👋';
}

/* ── Stats ───────────────────────────────────────────────── */
function updateStats() {
  const m = State.getMercado();
  const o = State.getOnline();
  document.getElementById('stat-mercado').textContent = m.length;
  document.getElementById('stat-online').textContent  = o.length;
  document.getElementById('stat-done').textContent    =
    m.filter(x => x.checked).length + o.filter(x => x.checked).length;
}

/* ── Activity ────────────────────────────────────────────── */
function renderActivity() {
  const el = document.getElementById('activity-list');
  const all = [
    ...State.getMercado().map(x => ({ ...x, cat: 'mercado' })),
    ...State.getOnline().map(x => ({ ...x, cat: 'online'  })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 6);

  if (all.length === 0) {
    el.innerHTML = `<p style="color:var(--text-dim);font-size:13px;padding:12px 0;">
      Nenhuma atividade ainda. Adicione itens às listas.</p>`;
    return;
  }

  el.innerHTML = all.map(it => `
    <div class="activity-item">
      <div class="act-dot ${it.cat}"></div>
      <span class="act-name">${State.escHtml(it.nome)}</span>
      <span class="act-cat">${it.cat === 'mercado' ? 'Mercado' : 'Online'}</span>
    </div>`).join('');

  gsap.from(el.querySelectorAll('.activity-item'),
    { opacity: 0, y: 8, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
}

/* ── Quick-add modals ────────────────────────────────────── */
function openModal(type) {
  const overlay = document.getElementById('modal-' + type);
  const inner   = document.getElementById('modal-' + type + '-inner');
  overlay.classList.add('open');
  gsap.fromTo(inner, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' });
  setTimeout(() => overlay.querySelector('input')?.focus(), 360);
}
function closeModal(type) {
  const overlay = document.getElementById('modal-' + type);
  const inner   = document.getElementById('modal-' + type + '-inner');
  gsap.to(inner, { y: '100%', duration: 0.25, ease: 'power2.in', onComplete: () => {
    overlay.classList.remove('open');
  }});
}
window.openModal  = openModal;
window.closeModal = closeModal;

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) closeModal(el.id.replace('modal-', ''));
  });
});
document.getElementById('modal-mercado').addEventListener('keydown', e => { if (e.key === 'Enter') addMercadoQuick(); });
document.getElementById('modal-online').addEventListener('keydown',  e => { if (e.key === 'Enter') addOnlineQuick(); });

/* ── Add from quick buttons ──────────────────────────────── */
function addMercadoQuick() {
  const nome = document.getElementById('m-nome').value.trim();
  if (!nome) { gsap.fromTo('#m-nome', { x: -5 }, { x: 5, duration: 0.07, repeat: 5, yoyo: true }); return; }
  const items = State.getMercado();
  items.push({
    id:      State.genId(),
    nome,
    qty:     document.getElementById('m-qty').value || '1',
    unit:    document.getElementById('m-unit').value,
    group:   document.getElementById('m-group').value,
    checked: false,
    ts:      Date.now(),
  });
  State.saveMercado(items);
  document.getElementById('m-nome').value = '';
  document.getElementById('m-qty').value  = '1';
  closeModal('mercado');
  updateStats();
  renderActivity();
  State.updateSidebarBadges();
}
window.addMercadoQuick = addMercadoQuick;

function addOnlineQuick() {
  const nome = document.getElementById('o-nome').value.trim();
  if (!nome) { gsap.fromTo('#o-nome', { x: -5 }, { x: 5, duration: 0.07, repeat: 5, yoyo: true }); return; }
  const items = State.getOnline();
  items.push({
    id:         State.genId(),
    nome,
    link:       document.getElementById('o-link').value.trim(),
    loja:       document.getElementById('o-loja').value.trim(),
    preco:      parseFloat(document.getElementById('o-preco').value) || 0,
    prioridade: document.getElementById('o-prioridade').value,
    checked:    false,
    ts:         Date.now(),
  });
  State.saveOnline(items);
  document.getElementById('o-nome').value  = '';
  document.getElementById('o-link').value  = '';
  document.getElementById('o-loja').value  = '';
  document.getElementById('o-preco').value = '';
  closeModal('online');
  updateStats();
  renderActivity();
  State.updateSidebarBadges();
}
window.addOnlineQuick = addOnlineQuick;

/* ── Init ────────────────────────────────────────────────── */
loadGreeting();
updateStats();
renderActivity();
State.updateSidebarBadges();

gsap.from('.stat-card',     { opacity: 0, y: 14, duration: 0.35, stagger: 0.07, ease: 'power2.out', delay: 0.1 });
gsap.from('.quick-card',    { opacity: 0, y: 12, duration: 0.3,  stagger: 0.06, ease: 'power2.out', delay: 0.25 });
gsap.from('.activity-list', { opacity: 0, y: 10, duration: 0.3,  ease: 'power2.out', delay: 0.4 });
