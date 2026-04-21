const State = (() => {
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (res.status === 204) return null;
    return res.json();
  }

  return {
    getMercado:    ()      => apiFetch('/api/mercado/'),
    addMercado:    (data)  => apiFetch('/api/mercado/', { method: 'POST', body: JSON.stringify(data) }),
    patchMercado:  (id, d) => apiFetch(`/api/mercado/${id}/`, { method: 'PATCH', body: JSON.stringify(d) }),
    deleteMercado: (id)    => apiFetch(`/api/mercado/${id}/`, { method: 'DELETE' }),

    getOnline:    ()      => apiFetch('/api/online/'),
    addOnline:    (data)  => apiFetch('/api/online/', { method: 'POST', body: JSON.stringify(data) }),
    patchOnline:  (id, d) => apiFetch(`/api/online/${id}/`, { method: 'PATCH', body: JSON.stringify(d) }),
    deleteOnline: (id)    => apiFetch(`/api/online/${id}/`, { method: 'DELETE' }),
    scrapeUrl:    (url)   => apiFetch('/api/online/scrape/', { method: 'POST', body: JSON.stringify({ url }) }),

    getProfile:  ()     => apiFetch('/api/usuario/'),
    saveProfile: (data) => apiFetch('/api/usuario/', { method: 'POST', body: JSON.stringify(data) }),

    async updateSidebarBadges() {
      const [m, o] = await Promise.all([State.getMercado(), State.getOnline()]);
      const bm = document.getElementById('badge-mercado');
      const bo = document.getElementById('badge-online');
      if (bm) bm.textContent = m.length;
      if (bo) bo.textContent = o.length;
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
