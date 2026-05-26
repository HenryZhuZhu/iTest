/* ============================================================
   user.js — render user detail page from URL ?id=
   ============================================================ */

(function () {
  const M = window.MOCK;
  const $ = (sel) => document.querySelector(sel);
  const fmt = (n) => n.toLocaleString('en-US');
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function initials(name) {
    return name.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  function statusBadge(user) {
    if (user.isActiveToday) return { cls: 'active',  label: 'Active today' };
    if (user.isActiveLast30d) return { cls: 'recent',  label: `Active ${user.daysSinceActive}d ago` };
    return { cls: 'dormant', label: `Dormant — ${user.daysSinceActive}d idle` };
  }

  function render(user) {
    document.title = `${user.name} · Condition Table · iTest`;

    // Header card
    $('#user-avatar').textContent = initials(user.name);
    $('#user-name').textContent = user.name;
    $('#bc-user').textContent = user.name;
    $('#user-id').textContent = user.id;
    $('#user-dept').textContent = user.sub === '—'
      ? user.dept
      : `${user.dept} · ${user.sub}`;

    const st = statusBadge(user);
    $('#user-status').innerHTML = `
      <span class="status-badge ${st.cls}">
        <span class="dot"></span>${escapeHtml(st.label)}
      </span>`;

    // KPI strip
    const kpis = [
      { label: 'Edits today',    value: fmt(user.editsToday) },
      { label: 'Edits 7-day',    value: fmt(user.editsLast7Days) },
      { label: 'Edits 30-day',   value: fmt(user.editsLast30Days) },
      { label: 'Avg / day',      value: user.avgEditsPerDay },
    ];
    $('#user-kpi').innerHTML = kpis.map(k => `
      <div class="kpi-tile">
        <div class="label">${escapeHtml(k.label)}</div>
        <div class="value">${escapeHtml(k.value)}</div>
      </div>`).join('');

    // Products maintained
    $('#product-list').innerHTML = user.productsDetail.length ? user.productsDetail.map(p => `
      <div class="product-item">
        <div>
          <span class="pname">${escapeHtml(p.name)}</span>
          <span class="pfamily">${escapeHtml(p.family)}</span>
        </div>
        <span class="pedits">${fmt(p.edits)} edits</span>
      </div>`).join('') :
      `<div style="grid-column: span 2; color: var(--muted); font-size: 13px; padding: 12px 0;">
         This user has no maintained products yet.
       </div>`;

    // 14-day edit history (bar chart)
    const maxEdits = Math.max(1, ...user.dailyHistory.map(d => d.edits));
    $('#history-chart').innerHTML = user.dailyHistory.map(d => {
      const pct = (d.edits / maxEdits) * 100;
      return `<div class="hbar" title="${d.date}: ${d.edits} edits" style="height: ${Math.max(2, pct)}%"></div>`;
    }).join('');
    $('#history-axis').innerHTML =
      `<span>${user.dailyHistory[0].date}</span><span>${user.dailyHistory[user.dailyHistory.length - 1].date}</span>`;

    // Hot columns (user-specific)
    renderBars('#user-columns', user.userColumns, 'edits');
    renderBars('#user-intents', user.userIntents, 'count');

    // Sessions list
    $('#session-list').innerHTML = user.sessions.length ? user.sessions.map(s => `
      <div class="session-row">
        <span class="date">${s.date}</span>
        <span class="summary">${s.durationMin} min · ${s.editsInSession} edits</span>
        <a href="#" data-session="${s.sessionId}">
          Replay
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
        </a>
      </div>`).join('') :
      `<div style="color: var(--muted); font-size: 13px; padding: 12px 0; text-align: center;">
         No sessions recorded.
       </div>`;
  }

  function renderBars(elId, items, valueKey) {
    if (!items.length) {
      $(elId).innerHTML =
        `<div style="color: var(--muted); font-size: 13px; padding: 8px 0;">No data yet.</div>`;
      return;
    }
    const max = Math.max(...items.map(i => i[valueKey]));
    $(elId).innerHTML = items.map((i) => {
      const pct = (i[valueKey] / max) * 100;
      return `
        <div class="bar-item">
          <span class="name">${escapeHtml(i.name)}</span>
          <span class="track"><div class="fill" style="width: ${pct.toFixed(1)}%"></div></span>
          <span class="num">${fmt(i[valueKey])}</span>
        </div>`;
    }).join('');
  }

  function notFound() {
    document.title = 'User not found · iTest';
    document.querySelector('main.dash-wrap').innerHTML = `
      <div class="dash-head"><div class="title-block">
        <div class="breadcrumb">
          <a href="condition-table.html">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back to dashboard
          </a>
        </div>
        <h1>User not found</h1>
        <p class="lede">No user matches the requested id. Try opening a name from the
        <a href="condition-table.html" style="color: var(--accent);">dashboard</a>.</p>
      </div></div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('id');
    if (!uid) { notFound(); return; }
    const user = M.getUserDetail(uid);
    if (!user) { notFound(); return; }
    render(user);
  });
})();
