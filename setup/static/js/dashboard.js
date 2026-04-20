/* ── Greeting ─────────────────────────────────────────────── */
async function loadGreeting() {
  const p  = await State.getProfile();
  const el = document.getElementById('greeting');
  if (el) el.textContent = 'Olá, ' + (p.name || 'Usuário') + ' 👋';
}

/* ── Stats + Badges + Activity ───────────────────────────── */
async function refreshDashboard() {
  const [m, o] = await Promise.all([State.getMercado(), State.getOnline()]);

  document.getElementById('stat-mercado').textContent = m.length;
  document.getElementById('stat-online').textContent  = o.length;
  document.getElementById('stat-done').textContent    =
    m.filter(x => x.checked).length + o.filter(x => x.checked).length;

  const bm = document.getElementById('badge-mercado');
  const bo = document.getElementById('badge-online');
  if (bm) bm.textContent = m.length;
  if (bo) bo.textContent = o.length;

  const el  = document.getElementById('activity-list');
  const all = [
    ...m.map(x => ({ ...x, cat: 'mercado' })),
    ...o.map(x => ({ ...x, cat: 'online'  })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

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

/* ── Quick add ───────────────────────────────────────────── */
async function addMercadoQuick() {
  const nome = document.getElementById('m-nome').value.trim();
  if (!nome) { gsap.fromTo('#m-nome', { x: -5 }, { x: 5, duration: 0.07, repeat: 5, yoyo: true }); return; }
  await State.addMercado({
    nome,
    qty:   document.getElementById('m-qty').value || '1',
    unit:  document.getElementById('m-unit').value,
    group: document.getElementById('m-group').value,
  });
  document.getElementById('m-nome').value = '';
  document.getElementById('m-qty').value  = '1';
  closeModal('mercado');
  await refreshDashboard();
}
window.addMercadoQuick = addMercadoQuick;

async function addOnlineQuick() {
  const nome = document.getElementById('o-nome').value.trim();
  if (!nome) { gsap.fromTo('#o-nome', { x: -5 }, { x: 5, duration: 0.07, repeat: 5, yoyo: true }); return; }
  await State.addOnline({
    nome,
    link:       document.getElementById('o-link').value.trim(),
    loja:       document.getElementById('o-loja').value.trim(),
    preco:      parseFloat(document.getElementById('o-preco').value) || null,
    prioridade: document.getElementById('o-prioridade').value,
  });
  document.getElementById('o-nome').value  = '';
  document.getElementById('o-link').value  = '';
  document.getElementById('o-loja').value  = '';
  document.getElementById('o-preco').value = '';
  closeModal('online');
  await refreshDashboard();
}
window.addOnlineQuick = addOnlineQuick;

/* ── Init ────────────────────────────────────────────────── */
(async () => {
  await Promise.all([loadGreeting(), refreshDashboard()]);
  gsap.from('.stat-card',     { opacity: 0, y: 14, duration: 0.35, stagger: 0.07, ease: 'power2.out', delay: 0.1 });
  gsap.from('.quick-card',    { opacity: 0, y: 12, duration: 0.3,  stagger: 0.06, ease: 'power2.out', delay: 0.25 });
  gsap.from('.activity-list', { opacity: 0, y: 10, duration: 0.3,  ease: 'power2.out', delay: 0.4 });
})();
