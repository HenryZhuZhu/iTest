# Monitoring.md — Self-hosted User Behavior Analytics

为 iTest 这种**静态 HTML 内部演示项目**提供两套自托管方案的部署 + 接入说明：**PostHog**（产品分析为主）和 **OpenReplay**（会话回放为主）。两者都开源、数据全程留在自有基础设施。

---

## 0. 快速选型

| | **PostHog** | **OpenReplay** |
|---|---|---|
| 主打 | 产品分析 (事件 / 漏斗 / 留存) + 附带回放、热图 | 会话回放 + 热图 + 前端 DevTools 还原 |
| 热图 | ✅ Toolbar 浮层式（点击 / rage click / 死链） | ✅ 点击热图 + 鼠标轨迹 + 滚动深度 |
| 鼠标轨迹 | 部分（mouse coordinates 在 replay 里） | ✅ 完整轨迹回放 |
| 会话回放 | ✅ | ✅ 还能看 console / network / Redux state |
| 自托管最低资源 | 4 vCPU / 16 GB RAM（Docker Compose hobby 版） | 2 vCPU / 8 GB RAM |
| 依赖 | Postgres + ClickHouse + Kafka + Redis + MinIO + Zookeeper | Postgres + ClickHouse + Redis + MinIO |
| License | MIT（部分企业功能 Enterprise） | Elastic License v2 / 社区版 |
| 集成方式 | CDN snippet 或 `posthog-js` npm | CDN snippet 或 `@openreplay/tracker` npm |
| 适合 iTest 的场景 | 想知道**哪个工具卡片点击最多**、**漏斗转化** | 想看**用户在哪卡住**、**鼠标怎么动** |

**针对 iTest 的建议**：如果只能选一个，选 **OpenReplay** —— 你最关心的是"鼠标轨迹 + hotspot"，OpenReplay 在这块更直接，资源占用也更小。如果将来要做 A/B 测试或转化分析再加 PostHog。

---

## 1. PostHog 自托管

### 1.1 部署（Docker Compose / Hobby 版）

> Hobby 版适合 < 100k events/月 的内部演示，正式生产请用 Kubernetes Helm chart。

```bash
# 在内网服务器上（任何能跑 Docker 的 Linux）
git clone https://github.com/PostHog/posthog.git
cd posthog
./bin/deploy-hobby
```

部署脚本会：
1. 安装 Docker（如未装）
2. 启动一份 `docker-compose.hobby.yml`：Postgres、ClickHouse、Kafka、Redis、MinIO、Zookeeper、PostHog web、PostHog worker
3. 申请 Caddy 自动 HTTPS（或可改成内网自签证书）

**关键环境变量**（部署前先 `export`）：
```bash
export DOMAIN=posthog.cxmt.internal      # 你的内网域名
export TLS_BLOCK="tls internal"          # 跳过 Let's Encrypt，用 Caddy 自签
```

部署完成后访问 `https://posthog.cxmt.internal`，创建第一个 admin 用户和 Project，拿到 **Project API Key**（`phc_xxxxx`）。

### 1.2 接入 iTest 页面

在每个 HTML 的 `</body>` 前加一段（推荐做法：抽到 `analytics.js`，见 §3）：

```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){
    function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){
      t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")
    ).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",
    (r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;
    void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){
      var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},
    u.people.toString=function(){return u.toString(1)+".people (stub)"},
    o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group".split(" "),
    n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init('phc_YOUR_PROJECT_API_KEY', {
    api_host: 'https://posthog.cxmt.internal',
    autocapture: true,               // 自动捕获所有 click / change / submit
    capture_pageview: true,
    session_recording: { maskAllInputs: true },   // 启用回放，遮盖输入框
    persistence: 'localStorage+cookie'
  });
</script>
```

**Snippet 最新版本会变**，直接在 PostHog 后台 `Project Settings → Web snippet` 里复制最权威的版本。

### 1.3 查看热图

PostHog 的热图是**浮层式**：

1. 在 PostHog 后台启用 Toolbar：`Project Settings → Toolbar → Add authorized URL` → 填 `https://itest.cxmt.com`
2. 打开 `index.html`，在 URL 末尾加 `?__posthog=<your-token>` 触发 Toolbar
3. 屏幕右下角出现工具栏 → 点 "Heatmap" → 切换 Click / Rageclick / Mouse Movement

**autocapture** 默认开启时，点击会立刻出现在热图，无需埋点。

### 1.4 自定义事件（按 iTest 业务埋点）

```js
// 工具卡片点击
document.querySelectorAll('.card-A').forEach(card => {
  card.addEventListener('click', () => {
    posthog.capture('tool_card_clicked', {
      tool: card.querySelector('h3').textContent,
      location: 'homepage'
    });
  });
});

// 主题切换
document.getElementById('theme-toggle').addEventListener('click', () => {
  posthog.capture('theme_toggled', {
    new_theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  });
});
```

---

## 2. OpenReplay 自托管

### 2.1 部署（Docker Compose）

```bash
# 在内网服务器上
wget https://github.com/openreplay/openreplay/archive/refs/heads/main.tar.gz
tar -xzf main.tar.gz && cd openreplay-main/scripts/docker-compose
cp .env.example .env
```

编辑 `.env`：
```bash
DOMAIN_NAME=openreplay.cxmt.internal
JWT_SECRET=<随机长字符串>
MINIO_ACCESS_KEY=<随机>
MINIO_SECRET_KEY=<随机>
PG_PASSWORD=<随机>
```

启动：
```bash
docker compose up -d
```

访问 `https://openreplay.cxmt.internal`，创建账户和 Project，拿到 **Project Key**（一串短哈希）。

### 2.2 接入 iTest 页面

OpenReplay 推荐 npm 安装，但静态项目用 CDN snippet 即可。把以下代码加到 `</body>` 前：

```html
<script>
  (function(){
    var t=document.createElement('script');
    t.async=true;
    t.src='https://openreplay.cxmt.internal/assist/openreplay-assist.js';
    document.head.appendChild(t);
  })();
</script>
<script type="module">
  import Tracker from 'https://static.openreplay.com/latest/tracker.esm.js';
  const tracker = new Tracker({
    projectKey: "YOUR_PROJECT_KEY",
    ingestPoint: "https://openreplay.cxmt.internal/ingest",
    defaultInputMode: 1,             // 0=plain, 1=obscured, 2=hidden（推荐 1 = 遮盖输入）
    obscureTextNumbers: false,
    obscureTextEmails: true,
    network: { capturePayload: false }   // 不收 request body，省存储
  });
  tracker.start();
  window.__tracker = tracker;            // 暴露给自定义事件用
</script>
```

`projectKey` 和 `ingestPoint` 在后台 `Preferences → Projects` 找。

### 2.3 查看热图与轨迹

OpenReplay 后台主要四块：

1. **Sessions** — 选一条会话回放，能看完整的鼠标轨迹、点击、滚动、键盘、控制台、网络请求
2. **Click Maps** — 进入某页面 URL（如 `/index.html`），右上角 "Click map" 切换叠加层
3. **Funnels** — 自定义事件转化漏斗（需要先在 §2.4 埋点）
4. **Cards / Dashboards** — 把事件聚合成图表

### 2.4 自定义事件

```js
// 工具卡片点击
document.querySelectorAll('.card-A').forEach(card => {
  card.addEventListener('click', () => {
    window.__tracker?.event('tool_card_clicked', {
      tool: card.querySelector('h3').textContent,
      location: 'homepage'
    });
  });
});

// 标记用户身份（如果有登录系统）
window.__tracker?.setUserID('shanshanshen@microsoft.com');
window.__tracker?.setMetadata('team', 'PTE');
```

---

## 3. 接入到 iTest 的实操路径

### 3.1 抽出一个共享 `analytics.js`

iTest 共 19 个 HTML 页面（首页 + EFA 子页 + 16 个工具详情页 + 2 个 reference）。手动每个都贴 snippet 容易出错。建议：

新建 `/Users/katherineshen/Desktop/iTest/analytics.js`：

```js
// analytics.js — 统一接入点
(function () {
  // ---------- OpenReplay ----------
  import('https://static.openreplay.com/latest/tracker.esm.js').then(({ default: Tracker }) => {
    const tracker = new Tracker({
      projectKey: "YOUR_PROJECT_KEY",
      ingestPoint: "https://openreplay.cxmt.internal/ingest",
      defaultInputMode: 1,
    });
    tracker.start();
    window.__tracker = tracker;
    bindEvents(tracker);
  });

  function bindEvents(tracker) {
    // 工具卡片点击（首页 + EFA 页都覆盖）
    document.querySelectorAll('.card-A, .tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.querySelector('h3, h4')?.textContent?.trim();
        tracker.event('tool_card_clicked', {
          tool: name,
          page: location.pathname,
        });
      });
    });

    // 主题切换
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      tracker.event('theme_toggled', {
        new_theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      });
    });

    // 主 CTA 按钮
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('click', () => {
        tracker.event('primary_cta_clicked', {
          label: btn.textContent.trim(),
          page: location.pathname,
        });
      });
    });

    // 滚动深度（25/50/75/100%）
    let maxDepth = 0;
    window.addEventListener('scroll', () => {
      const depth = Math.round((window.scrollY + innerHeight) / document.body.scrollHeight * 100);
      [25, 50, 75, 100].forEach(threshold => {
        if (depth >= threshold && maxDepth < threshold) {
          maxDepth = threshold;
          tracker.event('scroll_depth', { percent: threshold, page: location.pathname });
        }
      });
    }, { passive: true });
  }
})();
```

然后在 19 个 HTML 的 `</body>` 前**只加一行**：

```html
<script src="analytics.js" defer></script>
```

可以让我用 Python 脚本批量加（参考之前批量改导航的做法）。

### 3.2 自托管的额外建议

- **DNS / 证书**：内网用 Caddy 的 `tls internal` 自签证书，无需外部 CA。如果 iTest 部署在 `itest.cxmt.com`，监控站点放在 `monitor.cxmt.com` 同域 cookie 共享更方便。
- **数据备份**：PostHog 的 ClickHouse 和 OpenReplay 的 MinIO 都要纳入备份策略，session 录像会快速增长（约 1 MB/分钟）。
- **保留期**：内部演示无需长期保留，建议两边都设 30~90 天滚动删除。
- **镜像加速**：国内拉 Docker 镜像慢，配 `daemon.json` 加阿里云 / DaoCloud 镜像。

---

## 4. 推荐监控的事件（针对 iTest 业务）

| 事件 | 触发位置 | 回答什么问题 |
|---|---|---|
| `pageview` （自动） | 全部页面 | 哪些工具页被访问 / 流量分布 |
| `tool_card_clicked` | `index.html` `.card-A` + `efa-tools.html` `.tool-card` | 7 个一级工具 / 11 个 EFA 子工具的关注度排名 |
| `primary_cta_clicked` | 详情页 `.btn-primary` | 用户是否真的点 "Launch editor"，还是只看不点 |
| `breadcrumb_back` | 详情页面包屑 | 用户更多从首页还是从 EFA 子页进入详情 |
| `sidebar_category_clicked` | `efa-tools.html` 侧栏 | 5 个分类哪个被主动点击最多 |
| `theme_toggled` | header `#theme-toggle` | 暗色模式使用率，决定是否优化某些渐变 |
| `scroll_depth` | 所有详情页 | 用户是否真的看完 statement / bento / use-case |
| `time_on_page` | 自动（两个工具都有） | 哪些工具页"读完一半就走"，可能内容质量不够 |

热图层面重点看：
- **首页 `Tools` 区**的 click density —— EFA collection 卡片（grad-7）是否吸引到点击
- **EFA 子页的 sidebar** —— 用户是用侧栏导航还是直接滚
- **详情页的 bento featured 卡** —— 是否产生比 wide 卡更多点击

---

## 5. 隐私 / 合规

- 两套方案**全部数据留在自有服务器**，无外发，满足国内数据出境要求
- **遮盖输入**默认开启（PostHog: `maskAllInputs`，OpenReplay: `defaultInputMode: 1`），避免误录密码 / 邮箱 / 工号
- **不录视频**，只录 DOM 变更 + 鼠标坐标 + 事件流，体积比真正的屏幕录像小一个数量级
- 如果未来要接外部用户，需要加 cookie consent banner；目前内部演示阶段可以跳过
- 建议在 iTest footer 加一行小字：`Anonymized usage data is collected internally to improve the platform.`

---

## 6. 我的建议

**第一步**：先跑 OpenReplay（资源占用小、轨迹清晰）。Docker Compose 跑起来不到 30 分钟，接入 `analytics.js` 5 分钟，立刻能看到第一条 session 回放和热图。

**第二步**（可选，2~4 周后）：如果业务方开始问"漏斗转化率"、"留存"、"按团队分组"，再加 PostHog —— 它和 OpenReplay 是互补关系，可以共存（两个 snippet 都加），不冲突。

要不要现在就把 §3.1 的 `analytics.js` 创建出来，再用脚本把 `<script src="analytics.js" defer>` 批量插入到 19 个 HTML？等服务器部署好之后只需要把 `YOUR_PROJECT_KEY` 替换掉就能用。
