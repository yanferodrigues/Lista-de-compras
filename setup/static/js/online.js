let activeFilter = 'todos';
let items = [];

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
  document.getElementById('o-nome').value   = '';
  document.getElementById('o-link').value   = '';
  document.getElementById('o-loja').value   = '';
  document.getElementById('o-preco').value  = '';
  document.getElementById('o-imagem').value = '';
}
window.openModal  = openModal;
window.closeModal = closeModal;

document.getElementById('modal-online').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-online')) closeModal();
});
document.getElementById('modal-online').addEventListener('keydown', e => {
  if (e.key === 'Enter') addItem();
});

/* ── Auto-preenchimento por link ─────────────────────────── */
let _scraping = false;

async function scrapeLink() {
  if (_scraping) return;
  const linkEl = document.getElementById('o-link');
  const url    = linkEl.value.trim();
  if (!url || !/^https?:\/\/.+/.test(url)) return;

  _scraping = true;
  document.getElementById('link-wrapper').classList.add('scraping');

  try {
    const data    = await State.scrapeUrl(url);
    const nomeEl  = document.getElementById('o-nome');
    const lojaEl  = document.getElementById('o-loja');
    const precoEl = document.getElementById('o-preco');
    if (data.nome   && !nomeEl.value.trim())  _autofill(nomeEl,  data.nome);
    if (data.loja   && !lojaEl.value.trim())  _autofill(lojaEl,  data.loja);
    if (data.preco  && !precoEl.value.trim()) _autofill(precoEl, data.preco.toFixed(2));
    if (data.imagem) document.getElementById('o-imagem').value = data.imagem;
  } catch (_) { /* silencioso */ } finally {
    _scraping = false;
    document.getElementById('link-wrapper').classList.remove('scraping');
  }
}

function _autofill(el, value) {
  el.value = value;
  gsap.fromTo(el, { backgroundColor: '#eff6ff' }, {
    backgroundColor: '', duration: 0.8, ease: 'power2.out', clearProps: 'backgroundColor',
  });
}

document.getElementById('o-link').addEventListener('blur',  scrapeLink);
document.getElementById('o-link').addEventListener('paste', () => setTimeout(scrapeLink, 0));

/* ── Add item ────────────────────────────────────────────── */
async function addItem() {
  const nome = document.getElementById('o-nome').value.trim();
  if (!nome) { gsap.fromTo('#o-nome', { x: -5 }, { x: 5, duration: 0.07, repeat: 5, yoyo: true }); return; }
  await State.addOnline({
    nome,
    link:       document.getElementById('o-link').value.trim(),
    loja:       document.getElementById('o-loja').value.trim(),
    imagem:     document.getElementById('o-imagem').value.trim(),
    preco:      parseFloat(document.getElementById('o-preco').value) || null,
    prioridade: document.getElementById('o-prioridade').value,
  });
  document.getElementById('o-nome').value   = '';
  document.getElementById('o-link').value   = '';
  document.getElementById('o-loja').value   = '';
  document.getElementById('o-preco').value  = '';
  document.getElementById('o-imagem').value = '';
  closeModal();
  await render();
  await State.updateSidebarBadges();
}
window.addItem = addItem;

/* ── Filter ──────────────────────────────────────────────── */
function setFilter(el, filter) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeFilter = filter;
  renderList();
}
window.setFilter = setFilter;

/* ── Toggle check ────────────────────────────────────────── */
async function toggleItem(id) {
  const it = items.find(x => x.id === id);
  if (!it) return;
  const newChecked = !it.checked;
  await State.patchOnline(id, { checked: newChecked });
  it.checked = newChecked;
  const card  = document.getElementById('oc-' + id);
  const check = card?.querySelector('.check-btn');
  if (newChecked) {
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
  const it = items.find(x => x.id === id);
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
    onComplete: async () => {
      await State.deleteOnline(id);
      await render();
      await State.updateSidebarBadges();
    }
  });
}
window.deleteItem = deleteItem;

/* ── Render list (from cache) ────────────────────────────── */
function renderList() {
  const container = document.getElementById('list');
  let filtered = items;
  if (activeFilter === 'alta')           filtered = items.filter(x => x.prioridade === 'alta');
  else if (activeFilter === 'media')     filtered = items.filter(x => x.prioridade === 'media');
  else if (activeFilter === 'baixa')     filtered = items.filter(x => x.prioridade === 'baixa');
  else if (activeFilter === 'pendentes') filtered = items.filter(x => !x.checked);

  const sub = document.getElementById('page-subtitle');
  if (sub) sub.textContent = `${items.length} ite${items.length !== 1 ? 'ns' : 'm'} — clique no card para abrir o link`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌐</div>
        <h3>Nenhuma compra online</h3>
        <p>Adicione produtos de lojas com link para acessar rapidamente.</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="cards-grid">${filtered.map(it => cardHtml(it)).join('')}</div>`;
  gsap.fromTo(container.querySelectorAll('.item-card'),
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out' });
}

/* ── Fetch + Render ──────────────────────────────────────── */
async function render() {
  items = await State.getOnline();
  renderList();
}

function cardHtml(it) {
  const domain   = it.link ? State.getDomain(it.link) : null;
  const priceStr = it.preco ? `R$ ${parseFloat(it.preco).toFixed(2).replace('.', ',')}` : '';
  const label    = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[it.prioridade];
  const initial  = State.escHtml((it.nome || '?')[0].toUpperCase());

  const imageArea = it.imagem
    ? `<img src="${State.escHtml(it.imagem)}" alt="" loading="lazy"
            onerror="this.closest('.card-thumb').classList.add('card-thumb--fallback'); this.remove()" />`
    : `<span class="card-thumb-letter">${initial}</span>`;

  return `
    <div class="item-card preview-card ${it.checked ? 'checked' : ''}" id="oc-${it.id}">
      <div class="card-thumb ${it.imagem ? '' : 'card-thumb--fallback'}" onclick="openLink(${it.id})">
        ${imageArea}
        <span class="priority-badge ${it.prioridade}">${label}</span>
      </div>
      <div class="card-body">
        <div class="card-actions-row">
          <button class="check-btn ${it.checked ? 'checked' : ''}" onclick="toggleItem(${it.id})" title="Marcar">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="2 6 5 9 10 3"/>
            </svg>
          </button>
          <button class="delete-btn" onclick="deleteItem(${it.id})" title="Remover">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
        <div class="item-name card-name" onclick="openLink(${it.id})">${State.escHtml(it.nome)}</div>
        <div class="card-footer">
          ${domain ? `<span class="link-chip">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            ${State.escHtml(domain)}
          </span>` : ''}
          ${priceStr ? `<span class="item-price">${priceStr}</span>` : ''}
        </div>
      </div>
    </div>`;
}

/* ── Init ────────────────────────────────────────────────── */
(async () => {
  await render();
  await State.updateSidebarBadges();
  gsap.from('.filter-bar', { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out', delay: 0.1 });
})();
