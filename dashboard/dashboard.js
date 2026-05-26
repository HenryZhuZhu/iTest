/* ============================================================
   dashboard.js — render all sections from window.MOCK
   ------------------------------------------------------------
   Section render functions are independent and can be re-called
   when filters change. When real APIs land, swap window.MOCK
   reads for fetch() calls.
   ============================================================ */

(function () {
  const M = window.MOCK;

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const fmt = (n) => n.toLocaleString('en-US');
  const sign = (n) => (n > 0 ? '↑' : n < 0 ? '↓' : '·');
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ============================================================
  // Header — last updated
  // ============================================================
  function renderHeader() {
    const d = new Date(M.LAST_UPDATED);
    const fmtTime = d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
    $('#last-updated').textContent = `Last updated · ${fmtTime}`;
  }

  // ============================================================
  // §1 KPI strip
  // ============================================================
  function renderKPI() {
    const k = M.KPI;
    const tiles = [
      {
        label: 'Active users today',
        value: k.activeUsersToday.value,
        denom: ` / ${k.activeUsersToday.total}`,
        delta: k.activeUsersToday.delta,
        deltaSuffix: ' vs yesterday',
      },
      {
        label: 'Edits today',
        value: fmt(k.editsToday.value),
        delta: k.editsToday.delta,
        deltaSuffix: ' vs yesterday',
      },
      {
        label: 'Avg edits / active user',
        value: k.avgEditsPerUser.value,
        delta: k.avgEditsPerUser.delta,
        deltaSuffix: ' vs 7-day avg',
      },
      {
        label: '30-day adoption',
        value: k.adoption30d.value,
        unit: '%',
        delta: k.adoption30d.delta,
        deltaSuffix: ' pts vs last month',
      },
      {
        label: 'Avg session',
        value: k.avgSessionMin.value,
        unit: ' min',
        delta: k.avgSessionMin.delta,
        deltaSuffix: ' min',
      },
      {
        label: 'Page views today',
        value: fmt(k.pageViewsToday.value),
        delta: k.pageViewsToday.delta,
        deltaSuffix: ' vs yesterday',
      },
    ];

    $('#kpi-strip').innerHTML = tiles.map((t) => {
      const cls = t.delta > 0 ? 'up' : t.delta < 0 ? 'down' : '';
      const deltaText = `${sign(t.delta)} ${Math.abs(t.delta)}${t.deltaSuffix || ''}`;
      return `
        <div class="kpi-tile">
          <div class="label">${escapeHtml(t.label)}</div>
          <div class="value">
            ${escapeHtml(t.value)}${t.unit ? `<span class="unit">${t.unit}</span>` : ''}${t.denom ? `<span class="denom">${t.denom}</span>` : ''}
          </div>
          <div class="delta ${cls}">${deltaText}</div>
        </div>`;
    }).join('');
  }

  // ============================================================
  // §2 Team coverage — clickable dept grid + member panel
  // ============================================================
  let selectedDept = null;

  function renderCoverage() {
    const grid = $('#coverage-grid');
    grid.innerHTML = M.DEPT_COVERAGE.map((d) => {
      const pct = d.total ? Math.round((d.active / d.total) * 100) : 0;
      const tone = pct < 30 ? 'lo' : pct < 70 ? 'mid' : 'hi';
      const subsHtml = d.subs
        .filter(s => s.name !== '—')
        .map(s => `<span class="sub-pill">${escapeHtml(s.name)} <span class="num">${s.active}/${s.total}</span></span>`)
        .join('');
      return `
        <div class="dept-card" data-dept="${escapeHtml(d.name)}">
          <div class="dept-top">
            <span class="dept-name">${escapeHtml(d.name)}</span>
            <span class="dept-frac">
              <span class="num">${d.active}</span> / ${d.total}
              <span class="pct ${tone}">${pct}%</span>
            </span>
          </div>
          <div class="progress"><div class="fill ${tone}" style="width: ${pct}%"></div></div>
          ${subsHtml ? `<div class="subs-mini">${subsHtml}</div>` : ''}
        </div>`;
    }).join('');

    grid.querySelectorAll('.dept-card').forEach((card) => {
      card.addEventListener('click', () => selectDept(card.dataset.dept));
    });

    // Default selection
    selectDept(M.DEPT_COVERAGE[0].name);
  }

  function selectDept(deptName) {
    selectedDept = deptName;
    $$('.dept-card').forEach(c =>
      c.classList.toggle('selected', c.dataset.dept === deptName)
    );
    renderMemberPanel(deptName);
  }

  function statusOf(user) {
    if (user.isActiveToday) return { cls: 'active',  label: 'today' };
    if (user.isActiveLast30d) return { cls: 'recent',  label: `${user.daysSinceActive}d ago` };
    return { cls: 'dormant', label: `${user.daysSinceActive}d idle` };
  }

  function renderMemberPanel(deptName) {
    const members = M.USERS.filter(u => u.dept === deptName);
    $('#mp-scope').textContent = `· ${deptName}`;
    const active = members.filter(u => u.isActiveLast30d).length;
    $('#mp-count').textContent = `${active}/${members.length} active`;

    // Sort: active today first, then recent, then dormant; within each group, most edits first.
    members.sort((a, b) => {
      const rank = (u) => u.isActiveToday ? 0 : u.isActiveLast30d ? 1 : 2;
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return b.editsToday - a.editsToday;
    });

    $('#mp-list').innerHTML = members.map((u) => {
      const st = statusOf(u);
      const products = u.productsAll.length
        ? u.productsAll.slice(0, 3).map(p => `<span class="chip product">${escapeHtml(p)}</span>`).join('') +
          (u.productsAll.length > 3 ? `<span class="chip product">+${u.productsAll.length - 3}</span>` : '')
        : `<span class="none">no products</span>`;
      return `
        <a class="member-row" href="user.html?id=${encodeURIComponent(u.id)}">
          <span class="dot ${st.cls}" title="${st.label}"></span>
          <div class="mr-info">
            <div class="mr-name">${escapeHtml(u.name)}</div>
            <div class="mr-meta">${escapeHtml(u.sub === '—' ? deptName : u.sub)} · ${st.label}</div>
          </div>
          <div class="mr-products">${products}</div>
        </a>`;
    }).join('');
  }

  // ============================================================
  // §3 Dormant users + Unattended products
  // ============================================================
  function renderAttention() {
    const dormant = M.USERS.filter((u) => !u.isActiveLast30d)
      .sort((a, b) => b.daysSinceActive - a.daysSinceActive);
    $('#dormant-count').textContent = `${dormant.length} users`;
    $('#dormant-list').innerHTML = dormant.map((u) => `
      <a class="list-item is-user" href="user.html?id=${encodeURIComponent(u.id)}">
        <div>
          <span class="primary">${escapeHtml(u.name)}</span>
          <span style="margin-left:8px; color: var(--muted); font-size: 12px;">${escapeHtml(u.dept)} · ${escapeHtml(u.sub === '—' ? '' : u.sub)}</span>
        </div>
        <span class="secondary">${u.daysSinceActive}d idle</span>
      </a>`).join('') || '<div class="list-item"><span class="primary" style="color: var(--muted);">No dormant users — great.</span></div>';

    const unattended = M.PRODUCTS.filter((p) => p.maintainers === 0);
    $('#unattended-count').textContent = `${unattended.length} products`;
    $('#unattended-list').innerHTML = unattended.map((p) => `
      <div class="list-item">
        <div>
          <span class="primary">${escapeHtml(p.name)}</span>
          <span style="margin-left:8px; color: var(--muted); font-size: 12px;">${escapeHtml(p.family)}</span>
        </div>
        <span class="secondary">0 maintainers</span>
      </div>`).join('') || '<div class="list-item"><span class="primary" style="color: var(--muted);">All products covered.</span></div>';
  }

  // ============================================================
  // §4 Daily activity table (with search / filter / pagination)
  // Cascades with the global date-range filter.
  // ============================================================
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let filtered = [];
  let currentRange = 'today';  // 'today' | 'yesterday' | '7d' | '30d' | '90d'

  const RANGE_META = {
    today:     { label: "Today's",         hint: 'today',           days: 0,   edits: 'editsToday',      products: 'products',          sites: 'sites' },
    yesterday: { label: "Yesterday's",     hint: 'yesterday',       days: 1,   edits: 'editsYesterday',  products: 'productsYesterday', sites: 'sitesYesterday' },
    '7d':      { label: 'Last 7-day',      hint: 'the last 7 days', days: 7,   edits: 'editsLast7Days',  products: 'productsAll',       sites: 'sitesAll' },
    '30d':     { label: 'Last 30-day',     hint: 'the last 30 days',days: 30,  edits: 'editsLast30Days', products: 'productsAll',       sites: 'sitesAll' },
    '90d':     { label: 'Last 90-day',     hint: 'the last 90 days',days: 90,  edits: 'editsLast90Days', products: 'productsAll',       sites: 'sitesAll' },
  };

  function userInRange(user, range) {
    const meta = RANGE_META[range];
    if (range === 'today')     return user.isActiveToday;
    if (range === 'yesterday') return user.isActiveLast30d && user.daysSinceActive <= 1 && (user.editsYesterday > 0 || user.daysSinceActive === 1);
    return user.isActiveLast30d && user.daysSinceActive <= meta.days;
  }

  function applyFilters() {
    const meta = RANGE_META[currentRange];
    const q = $('#activity-search').value.trim().toLowerCase();
    const dept = $('#activity-dept-filter').value;
    const site = $('#activity-site-filter').value;

    filtered = M.USERS.filter((u) => userInRange(u, currentRange)).filter((u) => {
      if (dept && u.dept !== dept) return false;
      const userSites = u[meta.sites] || [];
      if (site && !userSites.includes(site)) return false;
      if (q) {
        const userProducts = u[meta.products] || [];
        const blob = `${u.name} ${u.dept} ${u.sub} ${userProducts.join(' ')}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    // Sort by edits in current range (most active first).
    filtered.sort((a, b) => (b[meta.edits] || 0) - (a[meta.edits] || 0));

    currentPage = 1;
    renderActivityHeading();
    renderActivityPage();
  }

  function renderActivityHeading() {
    const meta = RANGE_META[currentRange];
    $('#activity-heading').textContent = `${meta.label} Activity`;
    $('#activity-hint').textContent = `Per-user: products maintained, test sites, edit count ${meta.hint === 'today' ? 'today' : 'over ' + meta.hint}`;
    $('#th-products').textContent = currentRange === 'today' ? 'Products today' :
                                     currentRange === 'yesterday' ? 'Products yesterday' :
                                     'Products';
    $('#th-edits').textContent = currentRange === 'today' ? 'Edits today' :
                                  currentRange === 'yesterday' ? 'Edits yest.' :
                                  `Edits (${meta.hint.replace('the last ', '')})`;
  }

  function renderActivityPage() {
    const meta = RANGE_META[currentRange];
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    const countLabel = currentRange === 'today' ? 'active today' :
                       currentRange === 'yesterday' ? 'active yesterday' :
                       `active in ${meta.hint.replace('the ', '')}`;
    $('#activity-count').textContent = `${filtered.length} ${countLabel}`;
    $('#page-info').textContent = `Page ${currentPage} / ${totalPages}`;
    $('#page-prev').disabled = currentPage <= 1;
    $('#page-next').disabled = currentPage >= totalPages;

    $('#activity-body').innerHTML = slice.map((u) => {
      const userProducts = u[meta.products] || [];
      const userSites = u[meta.sites] || [];
      const edits = u[meta.edits] || 0;
      const products = userProducts.length
        ? userProducts.map((p) => `<span class="chip product">${escapeHtml(p)}</span>`).join('')
        : '<span class="empty-cell">—</span>';
      const sites = userSites.length
        ? userSites.map((s) => `<span class="chip site ${s}">${s}</span>`).join('')
        : '<span class="empty-cell">—</span>';
      return `
        <tr data-user="${u.id}">
          <td class="user-cell">
            <span class="name">${escapeHtml(u.name)}</span>
            <span class="uid">${u.id}</span>
          </td>
          <td class="dept-cell">
            <span class="dept">${escapeHtml(u.dept)}</span><br>
            <span class="sub">${escapeHtml(u.sub === '—' ? '' : u.sub)}</span>
          </td>
          <td>${products}</td>
          <td>${sites}</td>
          <td class="edits-cell">${edits}</td>
        </tr>`;
    }).join('') || `<tr><td colspan="5" style="text-align:center; padding: 32px; color: var(--muted);">No matching users in this range.</td></tr>`;

    // Wire row clicks to user detail page (only on user cell so chips don't trigger nav)
    $$('#activity-body .user-cell').forEach((cell) => {
      cell.addEventListener('click', () => {
        const uid = cell.parentElement.dataset.user;
        if (uid) window.location.href = `user.html?id=${encodeURIComponent(uid)}`;
      });
    });
  }

  function initActivity() {
    // Populate department filter from data
    const deptSelect = $('#activity-dept-filter');
    M.DEPARTMENTS.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d.name;
      opt.textContent = d.name;
      deptSelect.appendChild(opt);
    });

    $('#activity-search').addEventListener('input', applyFilters);
    $('#activity-dept-filter').addEventListener('change', applyFilters);
    $('#activity-site-filter').addEventListener('change', applyFilters);
    $('#page-prev').addEventListener('click', () => { currentPage--; renderActivityPage(); });
    $('#page-next').addEventListener('click', () => { currentPage++; renderActivityPage(); });

    applyFilters();
  }

  // ============================================================
  // §5 + §6 Hot columns + Hot intents
  // ============================================================
  function renderBars(elId, items, valueKey = 'edits') {
    const max = Math.max(...items.map((i) => i[valueKey]));
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

  // ============================================================
  // Time-ago formatter (shared by Programs sections)
  // ============================================================
  function formatAgo(min) {
    if (min < 1) return 'JUST NOW';
    if (min < 60) return `${min}M AGO`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}H AGO`;
    return `${Math.floor(h / 24)}D AGO`;
  }

  // ============================================================
  // §8 Product Update Velocity — tick timeline
  // Each tick is one program version. Hover shows: author + version
  // + interval to previous and next updates.
  // ============================================================
  const TIMELINE_WINDOW_MIN = 14 * 24 * 60;

  function formatGap(min) {
    if (min < 1) return '<1m';
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h < 24) return m ? `${h}h ${m}m` : `${h}h`;
    const d = Math.floor(h / 24);
    const hh = h % 24;
    return hh ? `${d}d ${hh}h` : `${d}d`;
  }

  function renderVelocity() {
    const el = $('#velocity-grid-a');
    if (!el) return;

    el.innerHTML = M.PROGRAMS.map((p) => {
      // updates is sorted newest first (smallest minutesAgo first)
      const updates = p.updates || [];
      const ticks = updates.map((u, i) => {
        // x-position = how far into the 14d window (older = left, newer = right)
        const x = Math.max(0, Math.min(100,
          ((TIMELINE_WINDOW_MIN - u.minutesAgo) / TIMELINE_WINDOW_MIN) * 100
        ));
        const prev = updates[i + 1];   // older (larger minutesAgo)
        const next = updates[i - 1];   // newer (smaller minutesAgo)
        const gapToPrev = prev ? prev.minutesAgo - u.minutesAgo : null;
        const gapToNext = next ? u.minutesAgo - next.minutesAgo : null;
        const prevLine = gapToPrev != null
          ? `<span class="tt-value">${formatGap(gapToPrev)}</span>`
          : `<span class="tt-value muted">first in window</span>`;
        const nextLine = gapToNext != null
          ? `<span class="tt-value">${formatGap(gapToNext)}</span>`
          : `<span class="tt-value muted">latest</span>`;
        const isLatest = i === 0 ? 'is-latest' : '';
        return `
          <span class="tick ${isLatest}" style="left: ${x.toFixed(2)}%">
            <span class="tick-tip">
              <span class="tt-head">
                <span class="tt-author">${escapeHtml(u.author)}</span>
                <span class="tt-version">${escapeHtml(u.version)}</span>
              </span>
              <span class="tt-row">
                <span class="tt-arrow">←</span>
                <span class="tt-label">prev</span>
                ${prevLine}
              </span>
              <span class="tt-row">
                <span class="tt-arrow">→</span>
                <span class="tt-label">next</span>
                ${nextLine}
              </span>
            </span>
          </span>`;
      }).join('');

      return `
        <div class="velocity-card vc-style-a">
          <div class="vc-head">
            <span class="vc-name">${escapeHtml(p.name)}</span>
            <span class="vc-version">${escapeHtml(p.latestVersion)}</span>
          </div>
          <div class="vc-meta">${escapeHtml(p.family)} · ${p.maintainers} maintainers</div>
          <div class="vc-viz">${ticks}</div>
          <div class="vc-axis"><span>14d ago</span><span>now</span></div>
          <div class="vc-foot">
            <span class="vc-stat"><span class="num">${p.updatesLast7d}</span><span class="unit">updates / 7d</span></span>
            <span class="vc-ago">${formatAgo(p.lastUpdatedMin)}</span>
          </div>
        </div>`;
    }).join('');
  }

  // ============================================================
  // §9 Recent Program Changes (cell-level diffs)
  // ============================================================
  function renderDiffStream() {
    const el = $('#diff-stream');
    if (!el) return;
    el.innerHTML = M.RECENT_DIFFS.map((d) => {
      const rows = d.changes.map((c) => `
        <div class="diff-row">
          <span class="diff-col">${escapeHtml(c.col)}</span>
          <span class="diff-before">${escapeHtml(c.before)}${c.unit ? `<span class="unit">${escapeHtml(c.unit)}</span>` : ''}</span>
          <span class="diff-arrow">→</span>
          <span class="diff-after">${escapeHtml(c.after)}${c.unit ? `<span class="unit">${escapeHtml(c.unit)}</span>` : ''}</span>
          <span class="diff-intent">${escapeHtml(c.intent)}</span>
        </div>`).join('');
      return `
        <div class="diff-card">
          <div class="diff-head">
            <span class="diff-version">${escapeHtml(d.version)}</span>
            <span class="diff-product">${escapeHtml(d.productName)}<span class="family">${escapeHtml(d.productFamily)}</span></span>
            <a class="diff-author" href="user.html?id=${encodeURIComponent(d.authorId)}">${escapeHtml(d.author)}</a>
            <span class="diff-time">${formatAgo(d.minutesAgo)}</span>
          </div>
          <div class="diff-rows">${rows}</div>
        </div>`;
    }).join('');
  }

  // ============================================================
  // §7 Interaction hotspot
  // ============================================================
  function renderHotspot() {
    // Build a faux column-header row so the heatmap reads as a table editor.
    const cols = M.COLUMNS.slice(0, 10);
    $('#hotspot-header').innerHTML = cols.map((c) => `<span>${escapeHtml(c.name)}</span>`).join('');

    // Place blobs at semi-random positions weighted by edit volume.
    const canvas = $('#hotspot-canvas');
    const sorted = [...M.COLUMNS].sort((a, b) => b.edits - a.edits);
    sorted.forEach((col, idx) => {
      const blob = document.createElement('div');
      const lvl = idx < 3 ? 'lvl-1' : idx < 7 ? 'lvl-2' : 'lvl-3';
      blob.className = `hotspot-blob ${lvl}`;
      // Spread across the canvas — x follows column index, y follows a pseudo-random vertical scatter.
      const idxInVisible = Math.min(idx, cols.length - 1);
      const xPct = 8 + (idxInVisible / cols.length) * 84;
      const yPct = 30 + ((idx * 37) % 60);
      blob.style.left = `${xPct}%`;
      blob.style.top = `${yPct}%`;
      // Size scales with edit count
      const size = 60 + (col.edits / sorted[0].edits) * 60;
      blob.style.width = blob.style.height = `${size}px`;
      canvas.appendChild(blob);
    });
  }

  // ============================================================
  // Tabs — hide/show top-level content panels
  // URL hash syncs so bookmarks & back-button work.
  // ============================================================
  const VALID_TABS = ['overview', 'activity', 'edits', 'programs'];

  function setTab(name, opts = {}) {
    if (!VALID_TABS.includes(name)) name = 'overview';
    $$('.dash-tabs button').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === name);
      b.setAttribute('aria-selected', b.dataset.tab === name ? 'true' : 'false');
    });
    $$('.tab-content').forEach((panel) => {
      panel.hidden = panel.dataset.tab !== name;
    });
    if (!opts.skipHash && location.hash.replace('#', '') !== name) {
      // Use replaceState so each tab click doesn't pollute browser history.
      history.replaceState(null, '', `#${name}`);
    }
    // Scroll to top of tab content when switching (not on initial load)
    if (opts.scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initTabs() {
    $$('.dash-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => setTab(btn.dataset.tab, { scroll: true }));
    });
    window.addEventListener('hashchange', () => {
      setTab(location.hash.replace('#', ''), { skipHash: true });
    });
    // Initial state from URL hash, fallback to overview.
    setTab(location.hash.replace('#', ''), { skipHash: true });
  }

  // ============================================================
  // Date range filter — cascades the Activity section
  // ============================================================
  function initDateFilter() {
    $$('.date-filter button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const r = btn.dataset.range;
        if (!r || !RANGE_META[r]) return;
        $$('.date-filter button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentRange = r;
        applyFilters();   // re-renders activity heading + table for the new range
      });
    });
  }

  // ============================================================
  // Boot
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderKPI();
    renderCoverage();
    renderAttention();
    initActivity();
    renderBars('#columns-list', M.COLUMNS, 'edits');
    renderBars('#intents-list', M.INTENTS, 'count');
    renderHotspot();
    renderVelocity();
    renderDiffStream();
    initDateFilter();
    initTabs();
  });
})();
