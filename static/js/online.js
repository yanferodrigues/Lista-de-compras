let activeFilter = 'todos';

/* ── Modal helpers ───────────────────────────────────────── */
function openModal() {
  const overlay = document.getElementById('modal-online');
  const inner   = document.getElementById('modal-online-inner');
  overlay.classList.add('open');
  gsap.fromTo(inner, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' });
  setTimeout(() => document.getElementById('o-nome')?.focus(), 360);
}
function closeModal() {
  const overlay = document.getElementById('modal-online');
  const inner   = document.getElementById('modal-online-inner');
  gsap.to(inner, { y: '100%', duration: 0.25, ease: 'power2.in', onComplete: () => {
    overlay.classList.remove('open');
  }});
}
window.openModal  = openModal;
window.closeModal = closeModal;

document.getElementById('modal-online').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-online')) closeModal();
});
document.getElementById('modal-online').addEventListener('keydown', e => {
  if (e.key === 'Enter') addItem();
});

/* ── Add item ────────────────────────────────────────────── */
function addItem() {
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
  closeModal();
  render();
  State.updateSidebarBadges();
}
window.addItem = addItem;

/* ── Filter ──────────────────────────────────────────────── */
function setFilter(el, filter) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeFilter = filter;
  render();
}
window.setFilter = setFilter;

/* ── Toggle check ────────────────────────────────────────── */
function toggleItem(id) {
  const items = State.getOnline();
  const it = items.find(x => x.id === id);
  if (!it) return;
  it.checked = !it.checked;
  State.saveOnline(items);
  const card  = document.getElementById('oc-' + id);
  const check = card?.querySelector('.check-btn');
  if (it.checked) {
    card?.classList.add('checked');
    check?.classList.add('checked');
  } else {
    card?.classList.remove('checked');
    check?.classList.remove('checked');
  }
}
window.toggleItem = toggleItem;

/* ── Open link ───────────────────────────────────────────── */
function openLink(id) {
  const it = State.getOnline().find(x => x.id === id);
  if (!it?.link) return;
  const card = document.getElementById('oc-' + id);
  gsap.fromTo(card, { scale: 1 }, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1,
    onComplete: () => window.open(it.link, '_blank', 'noopener') });
}
window.openLink = openLink;

/* ── Delete item ─────────────────────────────────────────── */
function deleteItem(id) {
  const card = document.getElementById('oc-' + id);
  gsap.to(card, {
    opacity: 0, x: 20, height: 0, paddingTop: 0, paddingBottom: 0,
    marginBottom: 0, duration: 0.28, ease: 'power2.in',
    onComplete: () => {
      const items = State.getOnline().filter(x => x.id !== id);
      State.saveOnline(items);
      render();
      State.updateSidebarBadges();
    }
  });
}
window.deleteItem = deleteItem;

/* ── Render ──────────────────────────────────────────────── */
function render() {
  const container = document.getElementById('list');
  const all = State.getOnline();

  let items = all;
  if (activeFilter === 'alta')      items = all.filter(x => x.prioridade === 'alta');
  else if (activeFilter === 'media') items = all.filter(x => x.prioridade === 'media');
  else if (activeFilter === 'baixa') items = all.filter(x => x.prioridade === 'baixa');
  else if (activeFilter === 'pendentes') items = all.filter(x => !x.checked);

  const sub = document.getElementById('page-subtitle');
  if (sub) sub.textContent = `${all.length} ite${all.length !== 1 ? 'ns' : 'm'} — clique no card para abrir o link`;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌐</div>
        <h3>Nenhuma compra online</h3>
        <p>Adicione produtos de lojas com link para acessar rapidamente.</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="cards-list">${items.map(it => cardHtml(it)).join('')}</div>`;
  gsap.fromTo(container.querySelectorAll('.item-card'),
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out' });
}

function cardHtml(it) {
  const domain   = it.link ? State.getDomain(it.link) : null;
  const priceStr = it.preco ? `R$ ${it.preco.toFixed(2).replace('.', ',')}` : '';
  const clickable = it.link ? 'clickable' : '';
  const onclick   = it.link ? `onclick="openLink(${it.id})"` : '';

  return `
    <div class="item-card ${clickable} ${it.checked ? 'checked' : ''}" id="oc-${it.id}" ${onclick}>
      <button class="check-btn ${it.checked ? 'checked' : ''}"
        onclick="event.stopPropagation(); toggleItem(${it.id})">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="2 6 5 9 10 3"/>
        </svg>
      </button>
      <div class="item-info">
        <div class="item-name">${State.escHtml(it.nome)}</div>
        <div class="item-meta">
          ${it.loja ? `<span class="item-qty">${State.escHtml(it.loja)}</span>` : ''}
          ${domain  ? `<span class="link-chip">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            ${State.escHtml(domain)}
          </span>` : ''}
        </div>
      </div>
      ${priceStr ? `<span class="item-price">${priceStr}</span>` : ''}
      <span class="priority-badge ${it.prioridade}">
        ${{ alta: 'Alta', media: 'Média', baixa: 'Baixa' }[it.prioridade]}
      </span>
      <button class="delete-btn" onclick="event.stopPropagation(); deleteItem(${it.id})" title="Remover">
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
render();
State.updateSidebarBadges();
gsap.from('.filter-bar', { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out', delay: 0.1 });
