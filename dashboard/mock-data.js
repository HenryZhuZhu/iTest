/* ============================================================
   Mock data for Condition Table Operations Dashboard
   ------------------------------------------------------------
   Once OpenReplay + Condition Table backend APIs are available,
   replace these constants with real fetch() calls. Schema stays
   the same so dashboard.js doesn't need to change.

   Departments / sub-departments / headcounts are taken from
   User.md (the only ground-truth input from the user). All
   other numbers are illustrative.
   ============================================================ */

window.MOCK = (() => {
  // ---- Departments (from User.md) ----
  const DEPARTMENTS = [
    {
      name: 'EFA', total: 71, subs: [
        { name: 'EFA LP', total: 12 },
        { name: 'EFA DDR', total: 11 },
        { name: 'PVA', total: 11 },
        { name: 'PFA', total: 3 },
        { name: 'SA', total: 8 },
        { name: 'AV', total: 7 },
        { name: 'CTV', total: 5 },
        { name: 'Antifuse', total: 11 },
        { name: 'FAE', total: 3 },
      ]
    },
    {
      name: 'CP NT PE', total: 14, subs: [
        { name: 'NT1', total: 9 },
        { name: 'NT2', total: 5 },
      ]
    },
    {
      name: 'FT Array PE', total: 20, subs: [
        { name: 'FT LP', total: 7 },
        { name: 'FT DDR', total: 8 },
        { name: 'FT AI', total: 5 },
      ]
    },
    {
      name: 'Array Coverage', total: 11, subs: [
        { name: 'LP', total: 5 },
        { name: 'DDR', total: 6 },
      ]
    },
    {
      name: 'CP NP PE', total: 12, subs: [
        { name: 'LP', total: 7 },
        { name: 'DDR', total: 5 },
      ]
    },
    { name: 'FAP', total: 3, subs: [] },
  ];

  // ---- Products (semiconductor DRAM/HBM lineup) ----
  // Some products intentionally have 0 active maintainers — these surface
  // in the "Unattended Products" alert.
  const PRODUCTS = [
    { name: 'LP5-G2', family: 'LPDDR5', maintainers: 8 },
    { name: 'LP5-G3', family: 'LPDDR5', maintainers: 6 },
    { name: 'LP5-X1', family: 'LPDDR5', maintainers: 4 },
    { name: 'LP4-A2', family: 'LPDDR4', maintainers: 3 },
    { name: 'D5-C1',  family: 'DDR5',   maintainers: 7 },
    { name: 'D5-C2',  family: 'DDR5',   maintainers: 5 },
    { name: 'D5-D1',  family: 'DDR5',   maintainers: 2 },
    { name: 'D4-B1',  family: 'DDR4',   maintainers: 4 },
    { name: 'H3-X1',  family: 'HBM3',   maintainers: 3 },
    { name: 'H3-X2',  family: 'HBM3',   maintainers: 0 },   // unattended
    { name: '3D-Y1',  family: '3DS',    maintainers: 0 },   // unattended
    { name: 'AF-Z1',  family: 'Antifuse', maintainers: 2 },
    { name: 'AF-Z2',  family: 'Antifuse', maintainers: 0 }, // unattended
    { name: 'LP4-A1', family: 'LPDDR4', maintainers: 0 },   // unattended
  ];

  // ---- Condition Table columns (typical semiconductor test parameters) ----
  // Edit counts are last-7-day totals.
  const COLUMNS = [
    { name: 'VCC',     edits: 412 },
    { name: 'VPP',     edits: 387 },
    { name: 'tRCD',    edits: 298 },
    { name: 'Pattern', edits: 256 },
    { name: 'Temp',    edits: 234 },
    { name: 'VBL',     edits: 198 },
    { name: 'tRP',     edits: 176 },
    { name: 'tRAS',    edits: 142 },
    { name: 'TM',      edits: 121 },
    { name: 'VWL',     edits: 98 },
    { name: 'tCK',     edits: 87 },
    { name: 'Cycle',   edits: 64 },
    { name: 'Address', edits: 41 },
    { name: 'VPL',     edits: 23 },
  ];

  // ---- Edit intents (captured on every cell modification) ----
  const INTENTS = [
    { name: 'Margin tuning',           count: 487 },
    { name: 'Match characterization',  count: 342 },
    { name: 'Apply correlation',       count: 278 },
    { name: 'Update from FA finding',  count: 195 },
    { name: 'Yield improvement',       count: 168 },
    { name: 'Copy from prev revision', count: 134 },
    { name: 'Apply template',          count: 112 },
    { name: 'Manual override',         count: 76 },
    { name: 'Fix typo',                count: 58 },
    { name: 'Add new condition',       count: 43 },
  ];

  // ---- Users ----
  // Generate 131 mock users distributed across sub-departments matching
  // User.md counts. Each user gets activity profile (active/dormant,
  // products maintained, sites worked on today, edits today).
  const SURNAMES = ['Wang','Li','Zhang','Liu','Chen','Yang','Zhao','Huang',
                    'Zhou','Wu','Xu','Sun','Hu','Zhu','Gao','Lin','He','Guo',
                    'Ma','Luo','Liang','Song','Zheng','Xie','Han','Tang','Feng'];
  const GIVEN = ['Wei','Min','Lei','Jing','Yu','Fei','Hao','Jun','Qiang','Yan',
                 'Ling','Tao','Xin','Bo','Kai','Rui','Yi','Meng','Yue','Dan'];

  const SITES = ['CP', 'RDBI', 'FT'];

  const seededRand = (() => {
    let s = 42;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  })();
  const pick = (arr) => arr[Math.floor(seededRand() * arr.length)];
  const pickN = (arr, n) => {
    const c = [...arr];
    const out = [];
    for (let i = 0; i < n && c.length; i++) out.push(c.splice(Math.floor(seededRand() * c.length), 1)[0]);
    return out;
  };

  const USERS = [];
  let uid = 1;
  for (const dept of DEPARTMENTS) {
    const subs = dept.subs.length ? dept.subs : [{ name: '—', total: dept.total }];
    for (const sub of subs) {
      for (let i = 0; i < sub.total; i++) {
        // Activity profile — biased so most users are active but some dormant.
        const r = seededRand();
        const isActiveLast30d = r > 0.18;       // ~82% adoption overall
        const isActiveToday   = isActiveLast30d && seededRand() > 0.55;  // subset active today

        // productsAll = the set of products this user is known to maintain
        // (broader than today's edits; used in member panel + user detail).
        const productsAll = isActiveLast30d
          ? pickN(PRODUCTS.filter(p => p.maintainers > 0), 1 + Math.floor(seededRand() * 3))
          : [];
        // products = today's subset of productsAll
        const productsToday = isActiveToday && productsAll.length
          ? pickN(productsAll, 1 + Math.floor(seededRand() * Math.min(2, productsAll.length)))
          : [];
        // productsYesterday — a different sub-slice of productsAll
        const productsYesterday = isActiveLast30d && productsAll.length
          ? pickN(productsAll, 1 + Math.floor(seededRand() * Math.min(2, productsAll.length)))
          : [];

        const sitesAll = isActiveLast30d
          ? pickN(SITES, 1 + Math.floor(seededRand() * 2))
          : [];
        const sitesToday = isActiveToday && sitesAll.length
          ? pickN(sitesAll, 1 + Math.floor(seededRand() * Math.min(2, sitesAll.length)))
          : [];
        const sitesYesterday = isActiveLast30d && sitesAll.length
          ? pickN(sitesAll, 1 + Math.floor(seededRand() * Math.min(2, sitesAll.length)))
          : [];

        // Days since last activity — for dormant users.
        const daysSinceActive = isActiveToday ? 0 :
                                isActiveLast30d ? Math.floor(seededRand() * 14) + 1 :
                                Math.floor(seededRand() * 60) + 30;

        // Range-aware edit counts (cumulative — larger ranges include smaller).
        const editsToday = isActiveToday ? Math.floor(seededRand() * 60) + 3 : 0;
        const editsYesterday = (isActiveLast30d && daysSinceActive <= 1)
          ? Math.floor(seededRand() * 50) + (daysSinceActive === 1 ? 5 : 1)
          : 0;
        const editsLast7Days  = editsToday + editsYesterday +
                                (isActiveLast30d && daysSinceActive <= 7 ? Math.floor(seededRand() * 80) + 5 : 0);
        const editsLast30Days = editsLast7Days +
                                (isActiveLast30d ? Math.floor(seededRand() * 150) + 10 : 0);
        const editsLast90Days = editsLast30Days +
                                (isActiveLast30d ? Math.floor(seededRand() * 300) + 20 :
                                 Math.floor(seededRand() * 12));

        USERS.push({
          id: `usr-${String(uid).padStart(3, '0')}`,
          name: `${pick(SURNAMES)} ${pick(GIVEN)}`,
          dept: dept.name,
          sub: sub.name,
          isActiveToday,
          isActiveLast30d,
          daysSinceActive,
          productsAll: productsAll.map(p => p.name),
          products: productsToday.map(p => p.name),
          productsYesterday: productsYesterday.map(p => p.name),
          sitesAll,
          sites: sitesToday,
          sitesYesterday,
          editsToday,
          editsYesterday,
          editsLast7Days,
          editsLast30Days,
          editsLast90Days,
        });
        uid++;
      }
    }
  }

  // ---- KPI summary (would come from aggregation API) ----
  const activeToday  = USERS.filter(u => u.isActiveToday).length;
  const active30d    = USERS.filter(u => u.isActiveLast30d).length;
  const editsToday   = USERS.reduce((s, u) => s + u.editsToday, 0);
  const totalUsers   = USERS.length;

  const KPI = {
    activeUsersToday: { value: activeToday, total: totalUsers, delta: +5 },
    editsToday:       { value: editsToday, delta: +124 },
    avgEditsPerUser:  { value: activeToday ? +(editsToday / activeToday).toFixed(1) : 0, delta: -2.1 },
    adoption30d:      { value: +(active30d / totalUsers * 100).toFixed(0), delta: +3 },     // percent
    avgSessionMin:    { value: 18.4, delta: +1.2 },
    pageViewsToday:   { value: 312, delta: +34 },
  };

  // ---- Dept coverage rollup (active in last 30d / total) ----
  const DEPT_COVERAGE = DEPARTMENTS.map(d => {
    const deptUsers = USERS.filter(u => u.dept === d.name);
    const active   = deptUsers.filter(u => u.isActiveLast30d).length;
    const subs = (d.subs.length ? d.subs : [{ name: '—', total: d.total }]).map(s => {
      const subUsers = deptUsers.filter(u => u.sub === s.name);
      const subActive = subUsers.filter(u => u.isActiveLast30d).length;
      return { name: s.name, total: s.total, active: subActive };
    });
    return { name: d.name, total: d.total, active, subs };
  });

  // ---- Programs (Product update velocity) ----
  // Each maintained product publishes a new program version whenever
  // cell edits accumulate. Updates/day measures product release cadence.
  const PROGRAMS = PRODUCTS.filter(p => p.maintainers > 0).map((p, idx) => {
    const updatesLast7d  = 2 + Math.floor(seededRand() * 14);
    const updatesLast30d = updatesLast7d * (2 + Math.floor(seededRand() * 3));
    const updatesLast14d = Array.from({ length: 14 }, () => Math.floor(seededRand() * 5));
    // Build a believable semver: minor bumps with patches
    const minor = Math.floor(seededRand() * 5);
    const patch = updatesLast30d;
    const latestVersion = `v1.${minor}.${patch}`;
    const lastUpdatedMin = Math.floor(seededRand() * 480);  // 0–8h ago
    const cadenceMin = Math.round(30 * 24 * 60 / Math.max(1, updatesLast30d));

    // Per-tick update events for the timeline (14-day window).
    // Distributes events across the window with mild jitter so the rhythm
    // looks organic; each event has: minutesAgo, author, version.
    const TOTAL_MIN = 14 * 24 * 60;
    const totalUpdates = updatesLast14d.reduce((a, b) => a + b, 0);
    const updates = [];
    if (totalUpdates > 0) {
      for (let i = 0; i < totalUpdates; i++) {
        // Even spacing with ±30% jitter, in chronological order (oldest first).
        const baseT = ((i + 1) / (totalUpdates + 1)) * TOTAL_MIN;
        const jitter = (seededRand() - 0.5) * (TOTAL_MIN / totalUpdates) * 0.6;
        const t = baseT + jitter;
        updates.push({ minutesAgo: Math.max(2, Math.round(TOTAL_MIN - t)) });
      }
      // Ensure newest event matches lastUpdatedMin (cap the smallest minutesAgo)
      updates.sort((a, b) => a.minutesAgo - b.minutesAgo); // newest first
      updates[0].minutesAgo = Math.max(2, lastUpdatedMin);

      // Author pool: prefer this product's actual maintainers
      const candidates = USERS.filter(u => u.isActiveLast30d && u.productsAll.includes(p.name));
      const pool = candidates.length ? candidates : USERS.slice(0, 8);

      // Assign authors + versions chronologically (oldest → newest)
      updates.sort((a, b) => b.minutesAgo - a.minutesAgo); // oldest first
      updates.forEach((u, ix) => {
        const author = pool[Math.floor(seededRand() * pool.length)];
        u.author = author.name;
        u.authorId = author.id;
        u.version = `v1.${minor}.${Math.max(0, patch - totalUpdates + 1 + ix)}`;
      });
      // Final order: newest first (for display + tooltip indexing)
      updates.sort((a, b) => a.minutesAgo - b.minutesAgo);
    }

    // Recent versions (kept for compatibility / detail page)
    const recentVersions = updates.slice(0, 5).map(u => ({
      version: u.version, minutesAgo: u.minutesAgo,
    }));

    return {
      name: p.name,
      family: p.family,
      maintainers: p.maintainers,
      latestVersion,
      updatesLast7d,
      updatesLast30d,
      updatesLast14d,
      updates,                                                          // ← new
      lastUpdatedMin,
      cadenceDays: +(30 / Math.max(1, updatesLast30d)).toFixed(1),
      recentVersions,
    };
  }).sort((a, b) => b.updatesLast7d - a.updatesLast7d);

  // ---- Recent program changes (cell-level diffs) ----
  // Each diff captures what changed in this version vs the previous one.
  const VALUE_RANGES = {
    VCC:     { unit: 'V',  base: 1.10, step: 0.005, mode: 'num' },
    VPP:     { unit: 'V',  base: 2.50, step: 0.010, mode: 'num' },
    VBL:     { unit: 'V',  base: 0.50, step: 0.005, mode: 'num' },
    VPL:     { unit: 'V',  base: 1.20, step: 0.010, mode: 'num' },
    VWL:     { unit: 'V',  base: 2.80, step: 0.010, mode: 'num' },
    tRCD:    { unit: 'ns', base: 14,   step: 1,     mode: 'num' },
    tRP:     { unit: 'ns', base: 14,   step: 1,     mode: 'num' },
    tRAS:    { unit: 'ns', base: 32,   step: 1,     mode: 'num' },
    tCK:     { unit: 'ns', base: 0.83, step: 0.01,  mode: 'num' },
    Temp:    { unit: '°C', base: 85,   step: 5,     mode: 'num' },
    Cycle:   { unit: '',   base: 100000, step: 1000, mode: 'num' },
    TM:      { mode: 'enum', values: ['TM_default', 'TM_high', 'TM_low'] },
    Pattern: { mode: 'enum', values: ['March', 'Checker', 'Solid', 'Stripe'] },
    Address: { mode: 'enum', values: ['0x0000', '0x4000', '0x8000', '0xC000'] },
  };

  function formatNum(v, step) {
    const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3;
    return v.toFixed(decimals);
  }

  const RECENT_DIFFS = [];
  for (let i = 0; i < 12; i++) {
    const prog = PROGRAMS[Math.floor(seededRand() * Math.min(8, PROGRAMS.length))];
    if (!prog) continue;

    // Pick an author who actually maintains this product if possible
    const candidates = USERS.filter(u => u.isActiveLast30d && u.productsAll.includes(prog.name));
    const author = candidates.length
      ? candidates[Math.floor(seededRand() * candidates.length)]
      : USERS[Math.floor(seededRand() * USERS.length)];

    const numChanges = 1 + Math.floor(seededRand() * 4);
    const usedCols = pickN(COLUMNS, numChanges);
    const changes = usedCols.map((c) => {
      const range = VALUE_RANGES[c.name];
      let before, after;
      if (!range) {
        before = '—'; after = '—';
      } else if (range.mode === 'enum') {
        const i1 = Math.floor(seededRand() * range.values.length);
        let i2 = Math.floor(seededRand() * range.values.length);
        if (i2 === i1) i2 = (i1 + 1) % range.values.length;
        before = range.values[i1];
        after  = range.values[i2];
      } else {
        const dir = seededRand() > 0.5 ? 1 : -1;
        const offset = Math.floor(seededRand() * 3) - 1;
        const b = range.base + offset * range.step;
        const a = b + dir * range.step;
        before = formatNum(b, range.step);
        after  = formatNum(a, range.step);
      }
      return {
        col: c.name,
        before, after,
        unit: range?.unit || '',
        intent: INTENTS[Math.floor(seededRand() * Math.min(6, INTENTS.length))].name,
      };
    });

    // Spread over the last ~48 h, recent ones first
    const minutesAgo = Math.floor(seededRand() * 48 * 60);

    RECENT_DIFFS.push({
      version: prog.latestVersion,
      productName: prog.name,
      productFamily: prog.family,
      author: author.name,
      authorId: author.id,
      minutesAgo,
      changes,
    });
  }
  RECENT_DIFFS.sort((a, b) => a.minutesAgo - b.minutesAgo);

  // ---- Last-updated timestamp ----
  const LAST_UPDATED = new Date().toISOString();

  // ---- Per-user detail (computed on demand from userId seed) ----
  // Generates: per-product edits, per-column edits, per-intent edits,
  // 14-day daily edit history, recent sessions.
  function getUserDetail(userId) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return null;

    // Deterministic per-user PRNG seeded by numeric uid.
    const seed = parseInt(userId.split('-')[1], 10) || 1;
    let s = seed * 1234567;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Pull cumulative edit counts straight off the user record so the detail
    // page is consistent with the activity table.
    const editsLast7Days  = user.editsLast7Days;
    const editsLast30Days = user.editsLast30Days;
    const avgEditsPerDay  = user.isActiveLast30d
      ? +(editsLast30Days / 30).toFixed(1)
      : 0;

    // Per-product breakdown — distribute editsLast30Days across user's products.
    const productsDetail = user.productsAll.map((pname) => {
      const meta = PRODUCTS.find(p => p.name === pname);
      const weight = 0.3 + rnd() * 0.7;
      return { name: pname, family: meta?.family || '—', weight };
    });
    const wsum = productsDetail.reduce((s, p) => s + p.weight, 0) || 1;
    productsDetail.forEach(p => {
      p.edits = Math.round((p.weight / wsum) * editsLast30Days);
      delete p.weight;
    });
    productsDetail.sort((a, b) => b.edits - a.edits);

    // Per-column breakdown — bias toward 4-5 favorite columns.
    const favCols = [];
    const colsCopy = [...COLUMNS];
    for (let i = 0; i < 5 && colsCopy.length; i++) {
      favCols.push(colsCopy.splice(Math.floor(rnd() * colsCopy.length), 1)[0]);
    }
    const colWeights = favCols.map(() => 0.5 + rnd());
    const colWSum = colWeights.reduce((a, b) => a + b, 0);
    const userColumns = favCols.map((c, i) => ({
      name: c.name,
      edits: Math.round((colWeights[i] / colWSum) * editsLast30Days),
    })).sort((a, b) => b.edits - a.edits);

    // Per-intent breakdown — 3 favorite intents.
    const favInt = [];
    const intCopy = [...INTENTS];
    for (let i = 0; i < 4 && intCopy.length; i++) {
      favInt.push(intCopy.splice(Math.floor(rnd() * intCopy.length), 1)[0]);
    }
    const intWeights = favInt.map(() => 0.4 + rnd());
    const intWSum = intWeights.reduce((a, b) => a + b, 0);
    const userIntents = favInt.map((it, i) => ({
      name: it.name,
      count: Math.round((intWeights[i] / intWSum) * editsLast30Days),
    })).sort((a, b) => b.count - a.count);

    // 14-day daily history — front-loaded if recently dormant.
    const dailyHistory = [];
    for (let d = 13; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      let edits = 0;
      if (user.isActiveLast30d) {
        if (d >= user.daysSinceActive) {
          edits = Math.floor(rnd() * 30) + (d === 0 && user.isActiveToday ? user.editsToday : 0);
          if (d === 0 && user.isActiveToday) edits = user.editsToday;
        }
      }
      dailyHistory.push({ date: date.toISOString().slice(5, 10), edits });
    }

    // Recent sessions (last 5 working days for active users).
    const sessions = [];
    if (user.isActiveLast30d) {
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        sessions.push({
          date: date.toISOString().slice(0, 10),
          durationMin: Math.floor(rnd() * 38) + 4,
          editsInSession: Math.floor(rnd() * 28) + 1,
          sessionId: `sess-${seed}-${i}`,
        });
      }
    }

    return {
      ...user,
      editsLast7Days,
      editsLast30Days,
      avgEditsPerDay,
      productsDetail,
      userColumns,
      userIntents,
      dailyHistory,
      sessions,
    };
  }

  return {
    DEPARTMENTS,
    PRODUCTS,
    COLUMNS,
    INTENTS,
    USERS,
    KPI,
    DEPT_COVERAGE,
    PROGRAMS,
    RECENT_DIFFS,
    LAST_UPDATED,
    TOTAL_USERS: totalUsers,
    getUserDetail,
  };
})();
