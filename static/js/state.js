const State = (() => {
  function load(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  let _idCounter = parseInt(localStorage.getItem('lv_id') || '1', 10);
  function genId() {
    const id = _idCounter++;
    localStorage.setItem('lv_id', _idCounter);
    return id;
  }

  return {
    genId,

    getMercado:   () => load('lv_mercado'),
    saveMercado:  (d) => save('lv_mercado', d),

    getOnline:    () => load('lv_online'),
    saveOnline:   (d) => save('lv_online', d),

    getProfile: () => load('lv_profile', { name: 'Usuário', email: '' }),
    saveProfile: (d) => save('lv_profile', d),

    updateSidebarBadges() {
      const bm = document.getElementById('badge-mercado');
      const bo = document.getElementById('badge-online');
      if (bm) bm.textContent = State.getMercado().length;
      if (bo) bo.textContent = State.getOnline().length;
    },

    escHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    getDomain(url) {
      try { return new URL(url).hostname.replace('www.', ''); }
      catch { return url; }
    },
  };
})();
