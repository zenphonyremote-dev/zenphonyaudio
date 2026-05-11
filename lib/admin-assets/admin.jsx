/* ============================================================================
   ZENPHONY AUDIO — ADMIN HUB
   Operator surface. Phase 1 = Dashboard. Other routes ship as roadmap stubs.
   ============================================================================ */

const { useState, useEffect, useMemo } = React;

const ADMIN_DEFAULTS = /*EDITMODE-BEGIN*/{
  "persona": "zenphony",
  "distRoute": "dist-dashboard",
  "dealerRoute": "dealer-dashboard",
  "route": "support",
  "range": "30d",
  "topMetric": "revenue",
  "userSegment": "all",
  "selectedUser": "ops@velvetstatic.fm",
  "selectedSession": "sess_912340",
  "selectedThread": "thr_8841",
  "selectedFlag": "pearl_v5_beta",
  "selectedAudit": null,
  "auditSeverity": "all",
  "auditOperator": "all",
  "selectedPluginVersion": "2.4.1",
  "selectedOperator": "jamie",
  "selectedRefund": "rfd_4421",
  "refundFilter": "all",
  "selectedTicket": "tkt_8842",
  "supportQueue": "inbox",
  "supportDraft": null
}/*EDITMODE-END*/;

/* AIcon and seedRand are loaded from admin-helpers.jsx onto window. */
const { AIcon, seedRand } = window;

/* ============================================================================
   CHART PRIMITIVES
   ============================================================================ */
function AreaChart({ series, height = 240, palette }) {
  // series: [{ key, label, color, points: [{x, y}] }]
  const pad = { l: 36, r: 12, t: 12, b: 22 };
  const w = 800, h = height;
  const allY = series.flatMap(s => s.points.map(p => p.y));
  const yMax = Math.max(...allY) * 1.18;
  const yMin = 0;
  const xs = series[0].points.map(p => p.x);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);

  const sx = x => pad.l + ((x - xMin) / (xMax - xMin || 1)) * (w - pad.l - pad.r);
  const sy = y => h - pad.b - ((y - yMin) / (yMax - yMin || 1)) * (h - pad.t - pad.b);

  const yTicks = 4;
  const tickVals = Array.from({length: yTicks + 1}, (_, i) => yMin + (yMax - yMin) * (i / yTicks));
  const xLabels = series[0].points.filter((_, i, a) => i % Math.ceil(a.length / 6) === 0 || i === a.length - 1);

  const formatY = v => v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'k' : '$' + v.toFixed(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {/* Y gridlines */}
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={sy(v)} y2={sy(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="var(--font-mono)">{formatY(v)}</text>
        </g>
      ))}
      {/* X labels */}
      {xLabels.map((p, i) => (
        <text key={i} x={sx(p.x)} y={h - 6} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="var(--font-mono)">{p.label}</text>
      ))}
      {/* series */}
      {series.map(s => {
        const path = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x)} ${sy(p.y)}`).join(' ');
        const area = path + ` L ${sx(s.points[s.points.length-1].x)} ${h - pad.b} L ${sx(s.points[0].x)} ${h - pad.b} Z`;
        return (
          <g key={s.key}>
            <path d={area} fill={`url(#grad-${s.key})`} />
            <path d={path} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            {s.points.map((p, i) => (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="2" fill={s.color} opacity={i === s.points.length - 1 ? 1 : 0} />
            ))}
            {/* terminal dot glow */}
            <circle cx={sx(s.points[s.points.length-1].x)} cy={sy(s.points[s.points.length-1].y)} r="5" fill={s.color} opacity="0.25" />
          </g>
        );
      })}
    </svg>
  );
}

function BarChart({ data, height = 240, color = "hsl(190, 80%, 60%)", color2 = "hsl(265, 80%, 65%)" }) {
  // data: [{ label, primary, secondary }]
  const pad = { l: 32, r: 12, t: 12, b: 22 };
  const w = 800, h = height;
  const yMax = Math.max(...data.map(d => (d.primary || 0) + (d.secondary || 0))) * 1.2;
  const barW = (w - pad.l - pad.r) / data.length * 0.6;
  const slot = (w - pad.l - pad.r) / data.length;

  const sy = y => h - pad.b - (y / (yMax || 1)) * (h - pad.t - pad.b);
  const yTicks = 4;
  const tickVals = Array.from({length: yTicks + 1}, (_, i) => (yMax * i / yTicks));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={sy(v)} y2={sy(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="var(--font-mono)">{Math.round(v)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = pad.l + slot * (i + 0.5);
        const x = cx - barW / 2;
        const total = (d.primary || 0) + (d.secondary || 0);
        const yTotal = sy(total);
        const yPrimary = sy(d.primary || 0);
        return (
          <g key={i}>
            {/* secondary stacked on top of primary */}
            <rect x={x} y={yTotal} width={barW} height={yPrimary - yTotal} rx="2" fill={color2} opacity="0.7" />
            <rect x={x} y={yPrimary} width={barW} height={(h - pad.b) - yPrimary} rx="2" fill={color} />
            <text x={cx} y={h - 6} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="var(--font-mono)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Sparkline({ values, color = "var(--accent)", height = 36, fill = true }) {
  const w = 200, h = height;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const sx = i => (i / (values.length - 1)) * w;
  const sy = v => h - ((v - min) / range) * h * 0.85 - h * 0.07;
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  const gradId = "spark-" + Math.random().toString(36).slice(2, 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.30" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradId})`} />
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================================
   MOCK DATA
   ============================================================================ */
const NAV_GROUPS = [
  {
    title: 'Overview',
    links: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dash', phase: 1 }
    ]
  },
  {
    title: 'Customers',
    links: [
      { id: 'users',         label: 'Users',         icon: 'users',  phase: 2, count: '12.4k' },
      { id: 'subscriptions', label: 'Subscriptions', icon: 'card',   phase: 2 },
      { id: 'support',       label: 'Support',       icon: 'mail',   phase: 3, count: 23, warn: true },
      { id: 'support_logs',  label: 'Support logs',  icon: 'log',    phase: 2 }
    ]
  },
  {
    title: 'Product',
    links: [
      { id: 'sessions',  label: 'Analysis sessions', icon: 'waves',   phase: 3, count: 38, warn: true },
      { id: 'forum',     label: 'Forum',        icon: 'forum',   phase: 4, count: 7, warn: true },
      { id: 'flags',     label: 'Feature flags',icon: 'flag',    phase: 4 }
    ]
  },
  {
    title: 'Software Hub',
    links: [
      { id: 'plugin',    label: 'Plugin builds', icon: 'plug',     phase: 4 },
      { id: 'hub',       label: 'Hub builds',    icon: 'download', phase: 4 }
    ]
  },
  {
    title: 'Revenue',
    links: [
      { id: 'revenue',    label: 'Revenue',     icon: 'chart',   phase: 3 },
      { id: 'refunds',    label: 'Refunds',     icon: 'refund',  phase: 3, count: 4, warn: true }
    ]
  },
  {
    title: 'Operations',
    links: [
      { id: 'system',   label: 'System health', icon: 'cpu',      phase: 5, count: 2, danger: true },
      { id: 'audit',    label: 'Audit log',     icon: 'log',      phase: 4 },
      { id: 'admins',   label: 'Admin team',    icon: 'key',      phase: 5 },
      { id: 'settings', label: 'Settings',      icon: 'settings', phase: 5 }
    ]
  }
];

function buildDashboardData(rangeKey) {
  const days = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }[rangeKey] || 30;
  const r = seedRand(42 + days);

  // MRR series — slowly trending up with realistic noise
  const mrrPoints = [];
  const arrPoints = [];
  let mrr = 38400;
  let arr = 35200;
  const stepDays = days <= 30 ? 1 : days <= 90 ? 3 : 14;
  const labels = days <= 30 ? d => `D${d+1}` : days <= 90 ? d => `W${Math.floor(d/7)+1}` : d => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Math.floor(d/30)%12];

  for (let d = 0; d < days; d += stepDays) {
    mrr += (r() - 0.42) * 800 + 120;
    arr += (r() - 0.42) * 700 + 100;
    mrrPoints.push({ x: d, y: Math.round(mrr), label: labels(d) });
    arrPoints.push({ x: d, y: Math.round(arr), label: labels(d) });
  }

  // signups bars (last 14 days)
  const signupBars = Array.from({length: 14}, (_, i) => {
    const day = i;
    return {
      label: ['M','T','W','T','F','S','S'][day % 7],
      primary:   Math.round(60 + r() * 80),    // free signups
      secondary: Math.round(8 + r() * 18)      // direct paid
    };
  });

  return { mrrPoints, arrPoints, signupBars };
}

const ACTIVITY = [
  { tone: 'green',  ico: 'card',    text: <><strong>Marcus Chen</strong> upgraded <span className="muted">Solo → Master</span></>,    time: '2m' },
  { tone: 'cyan',   ico: 'user',    text: <><strong>Sofia Almeida</strong> signed up <span className="muted">via promo MASTER30</span></>, time: '4m' },
  { tone: 'green',  ico: 'card',    text: <><strong>blueheronstudios.com</strong> added 4 seats <span className="muted">to Studio plan</span></>, time: '11m' },
  { tone: 'amber',  ico: 'forum',   text: <><strong>New thread</strong> reported a bug <span className="muted">"Reaper 7 hangs on init"</span></>, time: '18m' },
  { tone: 'red',    ico: 'refund',  text: <><strong>Refund processed</strong> <span className="muted">— $59 / Master annual prorate</span></>, time: '32m' },
  { tone: '',       ico: 'plug',    text: <><strong>v2.4.1 build</strong> promoted from beta to stable channel</>, time: '1h' },
  { tone: 'green',  ico: 'card',    text: <><strong>Tomoko Watanabe</strong> upgraded <span className="muted">Master → Studio</span></>, time: '1h' },
  { tone: 'red',    ico: 'alert',   text: <><strong>Churn alert</strong> <span className="muted">— Bedroom Tapes ended Master after 14 mo</span></>, time: '2h' },
  { tone: 'cyan',   ico: 'user',    text: <><strong>Kofi Boateng</strong> verified email <span className="muted">+ activated trial</span></>, time: '3h' },
  { tone: 'amber',  ico: 'mail',    text: <><strong>3 support tickets</strong> awaiting first reply <span className="muted">— SLA breach in 22m</span></>, time: '3h' }
];

const TOP_USERS_REVENUE = [
  { name: 'Velvet Static FM',    sub: 'studio · 14 seats · annual',    plan: 'studio', val: '$5,880', meta: 'LTV' , avatar: 'VS' },
  { name: 'Blue Heron Studios',  sub: 'studio · 8 seats · annual',     plan: 'studio', val: '$3,360', meta: 'LTV' , avatar: 'BH', cls: 'alt-1' },
  { name: 'Tomoko Watanabe',     sub: 'master · monthly · 22 mo',      plan: 'master', val: '$648',   meta: 'LTV' , avatar: 'TW', cls: 'alt-2' },
  { name: 'Marcus Chen',         sub: 'master · annual · 11 mo',       plan: 'master', val: '$352',   meta: 'LTV' , avatar: 'MC', cls: 'alt-3' },
  { name: 'Lo-fi Cooperative',   sub: 'studio · 4 seats · monthly',    plan: 'studio', val: '$320',   meta: 'LTV' , avatar: 'LC', cls: 'alt-4' },
  { name: 'Maya Reyes',          sub: 'master · annual · 18 mo',       plan: 'master', val: '$294',   meta: 'LTV' , avatar: 'MR' },
  { name: 'Kenji Park',          sub: 'solo · monthly · 8 mo',         plan: 'solo',   val: '$112',   meta: 'LTV' , avatar: 'KP', cls: 'alt-1' }
];

const TOP_USERS_USAGE = [
  { name: 'Tomoko Watanabe',     sub: 'master · 1,284 sessions',       plan: 'master', val: '4,820',  meta: 'TRACKS', avatar: 'TW', cls: 'alt-2' },
  { name: 'Velvet Static FM',    sub: 'studio · 14 seats · 10k sessions', plan: 'studio', val: '38.2k', meta: 'TRACKS', avatar: 'VS' },
  { name: 'Marcus Chen',         sub: 'master · 980 sessions',         plan: 'master', val: '3,140',  meta: 'TRACKS', avatar: 'MC', cls: 'alt-3' },
  { name: 'Sofia Almeida',       sub: 'master · 612 sessions',         plan: 'master', val: '1,820',  meta: 'TRACKS', avatar: 'SA', cls: 'alt-1' },
  { name: 'Blue Heron Studios',  sub: 'studio · 8 seats · 5,840 sess.', plan: 'studio', val: '22.1k', meta: 'TRACKS', avatar: 'BH', cls: 'alt-1' },
  { name: 'Kofi Boateng',        sub: 'solo · 410 sessions',           plan: 'solo',   val: '1,180',  meta: 'TRACKS', avatar: 'KB', cls: 'alt-3' },
  { name: 'Maya Reyes',          sub: 'master · 380 sessions',         plan: 'master', val: '1,040',  meta: 'TRACKS', avatar: 'MR' }
];

const PLAN_DIST = [
  { label: 'Free',    pct: 71.4, count: '8,856', color: 'rgba(255,255,255,0.40)' },
  { label: 'Solo',    pct: 16.2, count: '2,008', color: 'hsl(190, 70%, 60%)' },
  { label: 'Master',  pct: 9.1,  count: '1,128', color: 'hsl(265, 90%, 70%)' },
  { label: 'Studio',  pct: 3.3,  count: '408',   color: 'hsl(48, 100%, 65%)' }
];

/* ============================================================================
   LAYOUT — sidebar + topbar + page
   ============================================================================ */
function PersonaSwitcher({ persona, setPersona }) {
  const opts = [
    { id: 'zenphony',    label: 'Zenphony',    sub: 'Internal admin' },
    { id: 'distributor', label: 'Distributor', sub: 'ILIO panel' },
    { id: 'dealer',      label: 'Dealer',      sub: 'Sweetwater panel' }
  ];
  const cur = opts.find(o => o.id === persona) || opts[0];
  const [open, setOpen] = useState(false);
  return (
    <div className="persona-switch">
      <button className="persona-trigger" onClick={() => setOpen(o => !o)}>
        <div className="persona-trigger-l">
          <span className={`persona-dot p-${cur.id}`}/>
          <div className="persona-trigger-text">
            <div className="persona-trigger-label">{cur.label}</div>
            <div className="persona-trigger-sub">{cur.sub}</div>
          </div>
        </div>
        <span className="persona-caret">▾</span>
      </button>
      {open && (
        <div className="persona-menu">
          {opts.map(o => (
            <button key={o.id} className={`persona-opt ${o.id===persona?'on':''}`} onClick={() => { setPersona(o.id); setOpen(false); }}>
              <span className={`persona-dot p-${o.id}`}/>
              <div>
                <div className="persona-opt-label">{o.label}</div>
                <div className="persona-opt-sub">{o.sub}</div>
              </div>
              {o.id === persona && <span className="persona-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdmSidebar({ persona, setPersona, route, setRoute, navGroups }) {
  const personaUser = persona === 'distributor'
    ? { name: window.DIST_SELF.rep, role: `${window.DIST_SELF.name} · Distributor admin`, av: 'MR' }
    : persona === 'dealer'
    ? { name: window.DEALER_SELF.rep, role: `${window.DEALER_SELF.name} · Dealer admin`, av: 'DP' }
    : { name: 'Maya Reyes', role: 'Owner · Admin', av: 'MR' };

  return (
    <aside className="adm-side">
      <div className="adm-side-h">
        <a href="/" className="brand-link">
          <img src="assets/zenphony-audio-logo.png" alt="Zenphony Audio" className="brand-logo" />
        </a>
        <span className={`badge persona-badge p-${persona}`}>
          {persona === 'zenphony' ? 'Admin' : persona === 'distributor' ? 'Distributor' : 'Dealer'}
        </span>
      </div>

      <PersonaSwitcher persona={persona} setPersona={setPersona} />

      {navGroups.map(grp => (
        <React.Fragment key={grp.title}>
          <div className="adm-side-section">{grp.title}</div>
          {grp.links.map(l => (
            <div
              key={l.id}
              className={`adm-side-link ${route === l.id ? 'active' : ''} ${l.warn ? 'warn' : ''} ${l.danger ? 'danger' : ''}`}
              onClick={() => setRoute(l.id)}
            >
              <AIcon name={l.icon} />
              <span>{l.label}</span>
              {l.count != null && <span className="count">{l.count}</span>}
            </div>
          ))}
        </React.Fragment>
      ))}

      <div className="adm-side-foot">
        <div className="adm-side-user">
          <div className="adm-avatar" style={{ width: 30, height: 30, fontSize: 10 }}>{personaUser.av}</div>
          <div className="who">
            <div className="name">{personaUser.name}</div>
            <div className="role">{personaUser.role}</div>
          </div>
        </div>
        <a href="/account.html" className="adm-side-link" style={{ fontSize: 12 }}>
          <AIcon name="out" />
          <span>Back to app</span>
        </a>
      </div>
    </aside>
  );
}

function AdmTopbar({ persona, route, navGroups }) {
  const here = navGroups.flatMap(g => g.links).find(l => l.id === route);
  const crumbHead = persona === 'zenphony'
    ? ['Zenphony', 'Admin']
    : persona === 'distributor'
    ? ['ILIO', 'Distributor']
    : ['Sweetwater', 'Dealer'];
  return (
    <div className="adm-topbar">
      <div className="adm-crumbs">
        <span>{crumbHead[0]}</span>
        <span className="sep">/</span>
        <span>{crumbHead[1]}</span>
        <span className="sep">/</span>
        <span className="here">{here ? here.label : route}</span>
      </div>
      <div className="spacer" />
      <span className="adm-env-pill"><span className="dot" />production · us-east-1</span>
      <div className="adm-search">
        <AIcon name="search" />
        <input placeholder="Search users, sessions, invoices…" />
        <kbd>⌘K</kbd>
      </div>
      <div className="adm-iconbtn"><AIcon name="bell" /><span className="ping" /></div>
    </div>
  );
}

/* ============================================================================
   DASHBOARD (Phase 1)
   ============================================================================ */
function KPI({ icon, label, value, unit, currency, delta, deltaTone, vs, sparkValues, sparkColor }) {
  return (
    <div className="kpi">
      <div className="kpi-h">
        <span className="ico"><AIcon name={icon} /></span>
        <span className="label">{label}</span>
      </div>
      <div className="kpi-val">
        {currency && <span className="cur">{currency}</span>}{value}{unit && <span className="unit">{unit}</span>}
      </div>
      <div className="kpi-foot">
        <span className={`delta ${deltaTone}`}>
          {deltaTone === 'up' ? '↑' : deltaTone === 'down' ? '↓' : '→'} {delta}
        </span>
        <span className="vs">{vs}</span>
      </div>
      <div className="kpi-spark">
        <Sparkline values={sparkValues} color={sparkColor || 'var(--accent)'} />
      </div>
    </div>
  );
}

function DashboardScreen({ range, setRange, topMetric, setTopMetric }) {
  const data = useMemo(() => buildDashboardData(range), [range]);
  const topUsers = topMetric === 'revenue' ? TOP_USERS_REVENUE : TOP_USERS_USAGE;

  // Live KPIs from /api/admin/dashboard. Falls back to "—" if the
  // endpoint is unreachable so we never show fake numbers in production.
  const [live, setLive] = useState(null);
  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setLive(d || null))
      .catch(() => setLive(null));
  }, []);
  const liveMRR = (() => {
    if (!live) return { value: '—', unit: '' };
    const usd = (live.mrr_cents || 0) / 100;
    if (usd >= 1000) return { value: (usd / 1000).toFixed(1), unit: 'k' };
    return { value: usd.toFixed(0), unit: '' };
  })();
  const liveTotalUsers = live ? Number(live.total_users || 0).toLocaleString() : '—';
  const livePaidSubs   = live ? Number(live.active_subscribers || 0).toLocaleString() : '—';
  const liveSignups7d  = live ? Number(live.signups_7d || 0).toLocaleString() : '—';

  // Sparkline samples
  const r = seedRand(7);
  const sparks = {
    mrr:    Array.from({length: 24}, (_, i) => 30 + i * 0.8 + Math.sin(i / 2) * 2 + r() * 1.5),
    users:  Array.from({length: 24}, (_, i) => 100 + i * 4 + r() * 6),
    paid:   Array.from({length: 24}, (_, i) => 50 + i * 1.6 + Math.sin(i) * 1.5 + r()),
    churn:  Array.from({length: 24}, (_, i) => 4 + Math.cos(i / 3) * 0.8 + r() * 0.6).reverse()
  };

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Live business + product pulse · last refresh 12 seconds ago</div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <div className="adm-segctl">
            {['7d','30d','90d','12m'].map(k => (
              <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{k}</button>
            ))}
          </div>
          <button className="adm-btn adm-btn-ghost"><AIcon name="download" /> Export</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="bolt" /> Run report</button>
        </div>
      </div>

      <div className="alert-ribbon subtle">
        <span className="ico"><AIcon name="alert" /></span>
        <div className="text">
          Stripe webhook delivery to <code style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--accent)'}}>billing.zenphony.fm</code> degraded · 3.4% failure rate, last 30m.
        </div>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost">View incident</button>
        </div>
      </div>

      {/* KPI ROW — live values from /api/admin/dashboard */}
      <div className="kpi-row">
        <KPI
          icon="chart" label="MRR"
          currency="$" value={liveMRR.value} unit={liveMRR.unit}
          delta="" deltaTone="flat" vs={live ? 'live' : 'connecting…'}
          sparkValues={sparks.mrr} sparkColor="var(--accent)"
        />
        <KPI
          icon="users" label="Total users"
          value={liveTotalUsers}
          delta="" deltaTone="flat" vs={live ? 'live' : 'connecting…'}
          sparkValues={sparks.users} sparkColor="var(--accent)"
        />
        <KPI
          icon="card" label="Paid subscribers"
          value={livePaidSubs}
          delta="" deltaTone="flat" vs={live ? 'live' : 'connecting…'}
          sparkValues={sparks.paid} sparkColor="var(--accent)"
        />
        <KPI
          icon="refund" label="Signups (7d)"
          value={liveSignups7d}
          delta="" deltaTone="flat" vs={live ? 'last 7d' : 'connecting…'}
          sparkValues={sparks.churn} sparkColor="var(--accent)"
        />
      </div>

      {/* Revenue — full width, primary surface */}
      <div className="adm-card">
        <div className="adm-card-h">
          <h3>Revenue</h3>
          <span className="sub">MRR + ARR · last {range}</span>
          <div className="spacer" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)' }}>
            MRR <strong style={{color:'var(--foreground)',fontWeight:600}}>$42,820</strong>
            <span style={{margin:'0 10px',opacity:0.4}}>·</span>
            ARR <strong style={{color:'var(--foreground)',fontWeight:600}}>$513.8k</strong>
          </span>
          <span className="lnk" style={{marginLeft: 14}}>Open ›</span>
        </div>
        <div className="chart-frame">
          <AreaChart series={[
            { key: 'mrr', label: 'MRR', color: 'hsl(275, 100%, 78%)', points: data.mrrPoints },
            { key: 'arr', label: 'ARR/12', color: 'hsl(232, 90%, 70%)', points: data.arrPoints }
          ]} height={272} />
        </div>
      </div>

      {/* Signups + Plan distribution */}
      <div className="two-up">
        <div className="adm-card">
          <div className="adm-card-h">
            <h3>Signups</h3>
            <span className="sub">last 14 days</span>
            <div className="spacer" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)' }}>
              <strong style={{color:'var(--foreground)',fontWeight:600}}>1,284</strong> total
              <span style={{margin:'0 8px',opacity:0.4}}>·</span>
              <strong style={{color:'var(--foreground)',fontWeight:600}}>184</strong> paid
            </span>
          </div>
          <div className="chart-frame">
            <BarChart data={data.signupBars} height={272}
              color="hsl(150, 70%, 55%)"
              color2="hsl(275, 100%, 78%)" />
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <h3>Plan distribution</h3>
            <span className="sub">12,400 total</span>
            <div className="spacer" />
            <span className="lnk">Cohort ›</span>
          </div>
          <div className="adm-card-body">
            <div className="dist-list">
              {PLAN_DIST.map(p => (
                <div key={p.label} className="dist-row">
                  <div className="lbl">{p.label}</div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${p.pct}%`, background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                  </div>
                  <div className="num">{p.pct.toFixed(1)}% · {p.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity feed — full width */}
      <div className="adm-card">
        <div className="adm-card-h">
          <h3>Activity feed</h3>
          <span className="sub">live · 10 most recent admin + system events</span>
          <div className="spacer" />
          <span className="lnk">Open audit log ›</span>
        </div>
        <div className="adm-card-body tight">
          <div className="feed">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="feed-row">
                <div className={`feed-ico ${a.tone}`}><AIcon name={a.ico} /></div>
                <div className="feed-text">{a.text}</div>
                <div className="feed-time">{a.time} ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System status strip */}
      <div className="adm-card">
        <div className="adm-card-h">
          <h3>System pulse</h3>
          <span className="sub">last 60 minutes</span>
          <div className="spacer" />
          <span className="lnk">Status page ›</span>
        </div>
        <div className="sys-strip">
          <div className="sys-cell">
            <span className="lbl">API p50 / p99</span>
            <span className="val"><span className="dot ok"/>42 ms / 184 ms</span>
            <span className="sub">99.98% availability</span>
          </div>
          <div className="sys-cell">
            <span className="lbl">Render queue</span>
            <span className="val"><span className="dot ok"/>118 jobs · 14s avg</span>
            <span className="sub">EU + US workers nominal</span>
          </div>
          <div className="sys-cell">
            <span className="lbl">Stripe webhooks</span>
            <span className="val"><span className="dot warn"/>96.6% delivery</span>
            <span className="sub">3.4% failure · degraded</span>
          </div>
          <div className="sys-cell">
            <span className="lbl">Plugin telemetry</span>
            <span className="val"><span className="dot ok"/>3,820 active hosts</span>
            <span className="sub">Reaper · Logic · Ableton lead</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   COMING-SOON STUBS  (Phases 2 – 5)
   ============================================================================ */
const STUB_CONTENT = {
  users: {
    phase: 2, icon: 'users',
    title: 'User directory',
    body: 'Search and filter across the entire user base. Inspect any account, see their plan history, sessions, support history, and impersonate-as for debugging.',
    items: ['Cross-field search & saved segments', 'Impersonate-as (read-only by default)', 'Plan history with prorate calc', 'Bulk grant credits / promo codes', 'Export segment to CSV / Mixpanel cohort']
  },
  subscriptions: {
    phase: 2, icon: 'card',
    title: 'Subscriptions',
    body: 'Manage every active subscription, scheduled changes, dunning state, and seat allocations for Studio plans.',
    items: ['Subscription state machine view', 'Dunning + recovery automations', 'Studio seat editor', 'Scheduled changes timeline', 'Force-resync with Stripe']
  },
  sessions: {
    phase: 3, icon: 'waves',
    title: 'Sessions explorer',
    body: 'Drill into any mastering session — input file fingerprint, render chain, before/after metering, listener feedback, and outcome.',
    items: ['Session waveform + LUFS scopes', 'Render chain inspector', 'Listener score timeline', 'Crash & quarantine queue', 'Replay session in observer mode']
  },
  forum: {
    phase: 4, icon: 'forum',
    title: 'Forum moderation',
    body: 'Triage flagged posts, manage categories, and deploy announcement banners across the community.',
    items: ['Flag queue with reason codes', 'Shadow-ban + mute tools', 'Pinned threads & banners', 'Trust scores per author', 'Category & tag editor']
  },
  flags: {
    phase: 4, icon: 'flag',
    title: 'Feature flags',
    body: 'Roll out experimental features safely with percentage rollouts, plan gates, and per-account overrides.',
    items: ['Percentage rollouts with hash key', 'Plan / cohort gates', 'Per-account overrides', 'Kill-switch with audit', 'Diff against last release']
  },
  plugin: {
    phase: 4, icon: 'plug',
    title: 'Plugin builds',
    body: 'Promote builds across alpha, beta, and stable channels. Inspect crash reports and host compatibility matrix.',
    items: ['Channel promotion (alpha → beta → stable)', 'Host compatibility matrix', 'Crash & telemetry report', 'Force-update banner per channel', 'CDN edge purge']
  },
  presets_unused__: {
    phase: 4, icon: 'cube',
    title: 'Preset library',
    body: 'Curate the official preset library, approve community submissions, and feature picks by genre.',
    items: ['Submission queue', 'Approve / reject with note', 'Feature on home & genre pages', 'Preset analytics (uses, saves)', 'Bulk re-render on engine update']
  },
  revenue: {
    phase: 3, icon: 'chart',
    title: 'Revenue analytics',
    body: 'Cohort retention, MRR movement breakdown, expansion vs. contraction, and forecasting.',
    items: ['MRR movement waterfall', 'Cohort retention heatmap', 'Expansion vs contraction', 'Forecast (linear + seasonal)', 'Compare segments side-by-side']
  },
  invoices: {
    phase: 3, icon: 'receipt',
    title: 'Invoices',
    body: 'Browse every invoice, dunning state, and payment method. Issue manual invoices and credit notes.',
    items: ['All invoices with state', 'Issue manual invoice / credit note', 'Dunning attempts inspector', 'Tax breakdown (per region)', 'Resend receipt']
  },
  refunds: {
    phase: 3, icon: 'refund',
    title: 'Refunds & disputes',
    body: 'Approve refund requests, respond to chargebacks with evidence templates, and track recovery rates.',
    items: ['Refund request queue', 'Chargeback evidence templates', 'Auto-prorate calculator', 'Recovery rate tracking', 'Stripe dispute sync']
  },
  support: {
    phase: 4, icon: 'mail',
    title: 'Support inbox',
    body: 'Triage support tickets with SLA timers, account context, and saved replies. Route between teams.',
    items: ['Inbox + my queue + team queue', 'SLA timers and breach alerts', 'Saved replies with merge fields', 'Conversation → bug / feature link', 'CSAT after-resolve']
  },
  system: {
    phase: 5, icon: 'cpu',
    title: 'System health',
    body: 'Real-time service map, error budget burn, queue depth across regions, and incident timeline.',
    items: ['Service map (live)', 'Error-budget burn per service', 'Multi-region queue depth', 'Incident timeline', 'Promote runbooks inline']
  },
  audit: {
    phase: 5, icon: 'log',
    title: 'Audit log',
    body: 'Every admin action, every billing change, every flag flip — searchable, exportable, immutable.',
    items: ['Filter by actor / target / action', 'Diff viewer for record changes', 'Export to SIEM / S3', 'Saved searches', 'Tamper-evident hash chain']
  },
  admins: {
    phase: 5, icon: 'key',
    title: 'Admin team',
    body: 'Add or remove admins, assign roles, scope access by region or product surface, and review last activity.',
    items: ['Role editor (Owner / Billing / Support / Read)', 'Scoped access by region or surface', 'SSO + 2FA enforcement', 'Last-active timeline', 'Suspend & rotate session']
  },
  settings: {
    phase: 5, icon: 'settings',
    title: 'Workspace settings',
    body: 'Branding, notification routing, webhook endpoints, and global feature defaults for the whole org.',
    items: ['Brand & email theme', 'Notification routing rules', 'Webhook endpoints + secrets', 'Default feature flags', 'Data retention policies']
  }
};

function StubScreen({ id }) {
  const s = STUB_CONTENT[id];
  if (!s) return null;
  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>{s.title}</h1>
          <div className="sub">Coming up next on the admin roadmap.</div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="bell" /> Notify when live</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="book" /> View spec</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-empty">
          <div className="glyph"><AIcon name={s.icon} /></div>
          <span className="phase-pill">Phase {s.phase} · planned</span>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
          <ul className="check-list">
            {s.items.map(it => (
              <li key={it}><AIcon name="bolt" /><span>{it}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* Routes whose data is fully wired to the live backend. Anything else
   gets a "preview data" banner so admins know not to trust the numbers. */
const WIRED_ROUTES = new Set(['dashboard', 'users', 'subscriptions', 'support_logs']);

function PreviewBanner({ route }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', marginBottom: 16, borderRadius: 10,
      background: 'hsla(45, 100%, 60%, 0.10)',
      border: '1px solid hsla(45, 100%, 60%, 0.25)',
      color: 'hsl(45, 100%, 80%)',
      fontSize: 12, lineHeight: 1.4,
    }}>
      <span style={{flex:'none', display:'inline-flex'}}><AIcon name="alert" /></span>
      <div>
        <strong style={{color:'hsl(45,100%,88%)'}}>Preview data</strong> — this section ({route}) isn't connected to live systems yet. Numbers shown here are placeholders for design review.
      </div>
    </div>
  );
}

/* ============================================================================
   APP
   ============================================================================ */
function AdminApp() {
  const [tweaks, setTweak] = useTweaks(ADMIN_DEFAULTS);
  const persona = tweaks.persona || 'zenphony';

  const route = persona === 'distributor' ? (tweaks.distRoute || window.DIST_DEFAULT_ROUTE)
              : persona === 'dealer'      ? (tweaks.dealerRoute || window.DEALER_DEFAULT_ROUTE)
              : tweaks.route;

  const setRoute = (r) => {
    if (persona === 'distributor') setTweak('distRoute', r);
    else if (persona === 'dealer') setTweak('dealerRoute', r);
    else setTweak('route', r);
  };
  const setPersona = (p) => setTweak('persona', p);

  const navGroups = persona === 'distributor' ? window.DIST_NAV
                  : persona === 'dealer'      ? window.DEALER_NAV
                  : NAV_GROUPS;

  const isWired = persona === 'zenphony' && WIRED_ROUTES.has(route);

  return (
    <div className="adm-shell">
      <AdmSidebar persona={persona} setPersona={setPersona} route={route} setRoute={setRoute} navGroups={navGroups} />
      <main className="adm-main">
        <AdmTopbar persona={persona} route={route} navGroups={navGroups} />
        {!isWired && <PreviewBanner route={route} />}
        {persona === 'distributor' ? (
          <window.DistRouter route={route} />
        ) : persona === 'dealer' ? (
          <window.DealerRouter route={route} />
        ) : route === 'dashboard' ? (
          <DashboardScreen
            range={tweaks.range}
            setRange={(v) => setTweak('range', v)}
            topMetric={tweaks.topMetric}
            setTopMetric={(v) => setTweak('topMetric', v)}
          />
        ) : route === 'users' ? (
          <UsersScreen
            selectedId={tweaks.selectedUser}
            setSelectedId={(v) => setTweak('selectedUser', v)}
            segment={tweaks.userSegment}
            setSegment={(v) => setTweak('userSegment', v)}
          />
        ) : route === 'sessions' ? (
          <SessionsScreen
            selectedId={tweaks.selectedSession}
            setSelectedId={(v) => setTweak('selectedSession', v)}
          />
        ) : route === 'revenue' ? (
          <RevenueScreen />
        ) : route === 'forum' ? (
          <ForumScreen
            selectedId={tweaks.selectedThread}
            setSelectedId={(v) => setTweak('selectedThread', v)}
          />
        ) : route === 'flags' ? (
          <FlagsScreen
            selectedId={tweaks.selectedFlag}
            setSelectedId={(v) => setTweak('selectedFlag', v)}
          />
        ) : route === 'audit' ? (
          <AuditScreen
            severity={tweaks.auditSeverity}
            setSeverity={(v) => setTweak('auditSeverity', v)}
            operator={tweaks.auditOperator}
            setOperator={(v) => setTweak('auditOperator', v)}
            selectedEvent={tweaks.selectedAudit}
            setSelectedEvent={(v) => setTweak('selectedAudit', v)}
          />
        ) : route === 'plugin' ? (
          <PluginScreen
            selected={tweaks.selectedPluginVersion}
            setSelected={(v) => setTweak('selectedPluginVersion', v)}
          />
        ) : route === 'hub' ? (
          <HubBuildsScreen />
        ) : route === 'system' ? (
          <SystemScreen />
        ) : route === 'admins' ? (
          <AdminsScreen
            selectedOp={tweaks.selectedOperator}
            setSelectedOp={(v) => setTweak('selectedOperator', v)}
          />
        ) : route === 'settings' ? (
          <SettingsScreen />
        ) : route === 'refunds' ? (
          <RefundsScreen
            selectedId={tweaks.selectedRefund}
            setSelectedId={(v) => setTweak('selectedRefund', v)}
            queueFilter={tweaks.refundFilter}
            setQueueFilter={(v) => setTweak('refundFilter', v)}
          />
        ) : route === 'support' ? (
          <SupportScreen
            selectedId={tweaks.selectedTicket}
            setSelectedId={(v) => setTweak('selectedTicket', v)}
            queue={tweaks.supportQueue}
            setQueue={(v) => setTweak('supportQueue', v)}
            replyDraft={tweaks.supportDraft}
            setReplyDraft={(v) => setTweak('supportDraft', v)}
          />
        ) : route === 'subscriptions' ? (
          <SubscriptionsScreen
            setRoute={setRoute}
            setSelectedId={(v) => setTweak('selectedUser', v)}
            setSegment={(v) => setTweak('userSegment', v)}
          />
        ) : route === 'support_logs' ? (
          <window.SupportLogsScreen />
        ) : (
          <StubScreen id={route} />
        )}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Route">
          <TweakSelect label="Active screen" value={route} onChange={(v) => setTweak('route', v)} options={
            NAV_GROUPS.flatMap(g => g.links).map(l => ({ value: l.id, label: `${l.label} · phase ${l.phase}` }))
          } />
        </TweakSection>
        <TweakSection label="Dashboard">
          <TweakRadio label="Range" value={tweaks.range} onChange={(v) => setTweak('range', v)} options={[
            { value: '7d', label: '7d' },{ value: '30d', label: '30d' },{ value: '90d', label: '90d' },{ value: '12m', label: '12m' }
          ]} />
          <TweakRadio label="Top users" value={tweaks.topMetric} onChange={(v) => setTweak('topMetric', v)} options={[
            { value: 'revenue', label: 'Revenue' },{ value: 'usage', label: 'Usage' }
          ]} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />);
