/* ============================================================
   iTest · OpenReplay analytics
   Loaded as an ES module from every live HTML page via:
     <script type="module" src="analytics.js"></script>

   BEFORE GOING LIVE — fill in these two values:
     1. PROJECT_KEY  (from OpenReplay UI: Preferences → Projects)
     2. INGEST_POINT (your self-hosted OpenReplay domain)

   The tracker module is loaded from jsDelivr by default so this
   file works without any build step. Once OpenReplay is deployed
   in your internal network, you can swap TRACKER_URL to a
   self-hosted copy of the tracker bundle to avoid the external CDN.
   ============================================================ */

const PROJECT_KEY  = 'YOUR_PROJECT_KEY';
const INGEST_POINT = 'https://openreplay.cxmt.internal/ingest';
const TRACKER_URL  = 'https://cdn.jsdelivr.net/npm/@openreplay/tracker@15/+esm';

// Skip on localhost / file:// — only run on the deployed site.
const isLive = location.protocol === 'http:' || location.protocol === 'https:';
const isPlaceholderKey = PROJECT_KEY === 'YOUR_PROJECT_KEY';

if (isLive && !isPlaceholderKey) {
  try {
    const { default: Tracker } = await import(TRACKER_URL);

    const tracker = new Tracker({
      projectKey: PROJECT_KEY,
      ingestPoint: INGEST_POINT,
      defaultInputMode: 1,        // 1 = obscure user input (recommended)
      obscureTextEmails: true,
      obscureTextNumbers: false,
      network: { capturePayload: false },  // don't record request bodies
    });
    tracker.start();
    window.__tracker = tracker;

    bindEvents(tracker);
  } catch (err) {
    console.warn('[itest-analytics] tracker failed to load:', err);
  }
} else if (isPlaceholderKey) {
  console.info('[itest-analytics] PROJECT_KEY not configured — tracker disabled.');
}

// ---------- Event bindings ----------

function bindEvents(tracker) {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    // Tool card clicks — covers both homepage (.card-A) and EFA sub-page (.tool-card).
    document.querySelectorAll('.card-A, .tool-card').forEach((card) => {
      card.addEventListener('click', () => {
        const name = card.querySelector('h3, h4')?.textContent?.trim();
        tracker.event('tool_card_clicked', {
          tool: name,
          page: location.pathname,
        });
      });
    });

    // Sidebar category clicks on EFA sub-page.
    document.querySelectorAll('.efa-c-side .side-link').forEach((link) => {
      link.addEventListener('click', () => {
        tracker.event('sidebar_category_clicked', {
          category: link.textContent.trim().replace(/\s+\d+$/, ''),
        });
      });
    });

    // Primary CTAs on every detail page.
    document.querySelectorAll('.btn-primary').forEach((btn) => {
      btn.addEventListener('click', () => {
        tracker.event('primary_cta_clicked', {
          label: btn.textContent.trim(),
          page: location.pathname,
        });
      });
    });

    // Breadcrumb back-navigation.
    document.querySelectorAll('.breadcrumb a').forEach((link) => {
      link.addEventListener('click', () => {
        tracker.event('breadcrumb_back', {
          to: link.getAttribute('href'),
          from: location.pathname,
        });
      });
    });

    // Theme toggle.
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      tracker.event('theme_toggled', {
        new_theme: document.documentElement.classList.contains('dark') ? 'light' : 'dark',
      });
    });

    // Scroll-depth milestones (25 / 50 / 75 / 100%).
    let maxDepth = 0;
    const milestones = [25, 50, 75, 100];
    window.addEventListener('scroll', () => {
      const total = document.body.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const depth = Math.round((window.scrollY / total) * 100);
      for (const m of milestones) {
        if (depth >= m && maxDepth < m) {
          maxDepth = m;
          tracker.event('scroll_depth', { percent: m, page: location.pathname });
        }
      }
    }, { passive: true });
  });
}
