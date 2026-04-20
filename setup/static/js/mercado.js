let items = [];

/* ── Modal helpers ───────────────────────────────────────── */
function openModal() {
  const overlay = document.getElementById('modal-mercado');
  const inner   = document.getElementById('modal-mercado-inner');
  overlay.classList.add('open');
  gsap.fromTo(inner, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' });
  setTimeout(() => document.getElementById('m-nome')?.focus(), 360);
}
function closeModal() {
  const overlay = document.getElementById('modal-mercado');
  const inner   = document.getElementById('modal-mercado-inner');
  gsap.to(inner, { y: '100%', duration: 0.25, ease: 'power2.in', onComplete: () => {
    overlay.classList.remove('open');
  }});
}
window.openModal  = openModal;
window.closeModal = closeModal;

document.getElementById('modal-mercado').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-mercado')) closeModal();
});
document.getElementById('modal-mercado').addEventListener('keydown', e => {
  if (e.key === 'Enter') addItem();
});

/* ── Add item ────────────────────────────────────────────── */
async function addItem() {
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
  closeModal();
  await render();
  await State.updateSidebarBadges();
}
window.addItem = addItem;

/* ── Toggle check ────────────────────────────────────────── */
async function toggleItem(id) {
  const it = items.find(x => x.id === id);
  if (!it) return;
  const newChecked = !it.checked;
  await State.patchMercado(id, { checked: newChecked });
  it.checked = newChecked;
  const card  = document.getElementById('mc-' + id);
  const check = card?.querySelector('.check-btn');
  if (newChecked) {
    card?.classList.add('checked');
    check?.classList.add('checked');
    gsap.fromTo(card, { scale: 1 }, { scale: 0.98, duration: 0.12, yoyo: true, repeat: 1 });
  } else {
    card?.classList.remove('checked');
    check?.classList.remove('checked');
  }
  updateProgress();
}
window.toggleItem = toggleItem;

/* ── Delete item ─────────────────────────────────────────── */
function deleteItem(id) {
  const card = document.getElementById('mc-' + id);
  gsap.to(card, {
    opacity: 0, x: 20, height: 0, paddingTop: 0, paddingBottom: 0,
    marginBottom: 0, duration: 0.28, ease: 'power2.in',
    onComplete: async () => {
      await State.deleteMercado(id);
      await render();
      await State.updateSidebarBadges();
    }
  });
}
window.deleteItem = deleteItem;

/* ── Progress ────────────────────────────────────────────── */
function updateProgress() {
  const total = items.length;
  const done  = items.filter(x => x.checked).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('prog-label').textContent = `${done} de ${total} itens concluídos`;
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('prog-fill').style.width  = pct + '%';
  const sub = document.getElementById('page-subtitle');
  if (sub) sub.textContent = `${total} ite${total !== 1 ? 'ns' : 'm'} • ${done} concluído${done !== 1 ? 's' : ''}`;
}

/* ── Toggle group ────────────────────────────────────────── */
function toggleGroup(header) {
  const body = header.nextElementSibling;
  header.classList.toggle('collapsed');
  if (header.classList.contains('collapsed')) {
    gsap.to(body, { height: 0, duration: 0.28, ease: 'power2.inOut', overflow: 'hidden' });
  } else {
    gsap.set(body, { height: 'auto' });
    gsap.from(body, { height: 0, duration: 0.28, ease: 'power2.out' });
  }
}
window.toggleGroup = toggleGroup;

/* ── Render ──────────────────────────────────────────────── */
async function render() {
  items = await State.getMercado();
  const container = document.getElementById('list');

  updateProgress();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>Lista vazia</h3>
        <p>Adicione itens usando o botão "Adicionar" acima.</p>
      </div>`;
    return;
  }

  const groups = {};
  items.forEach(it => {
    if (!groups[it.group]) groups[it.group] = [];
    groups[it.group].push(it);
  });

  container.innerHTML = Object.entries(groups).map(([g, gItems]) => `
    <div class="group-wrap">
      <div class="group-header" onclick="toggleGroup(this)">
        <span class="g-name">${State.escHtml(g)}</span>
        <span class="g-count">${gItems.length}</span>
        <svg class="g-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="group-body">
        <div class="cards-list">
          ${gItems.map(it => cardHtml(it)).join('')}
        </div>
      </div>
    </div>`).join('');

  gsap.fromTo(container.querySelectorAll('.item-card'),
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out' });
}

function cardHtml(it) {
  return `
    <div class="item-card ${it.checked ? 'checked' : ''}" id="mc-${it.id}">
      <button class="check-btn ${it.checked ? 'checked' : ''}" onclick="toggleItem(${it.id})">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="2 6 5 9 10 3"/>
        </svg>
      </button>
      <div class="item-info">
        <div class="item-name">${State.escHtml(it.nome)}</div>
        <div class="item-meta">
          <span class="item-qty">${State.escHtml(it.qty)} ${State.escHtml(it.unit)}</span>
          <span class="group-badge">${State.escHtml(it.group)}</span>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteItem(${it.id})" title="Remover item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>`;
}

/* ── Init ────────────────────────────────────────────────── */
(async () => {
  await render();
  await State.updateSidebarBadges();
  gsap.from('.progress-wrap', { opacity: 0, y: 10, duration: 0.35, ease: 'power2.out', delay: 0.1 });
})();
