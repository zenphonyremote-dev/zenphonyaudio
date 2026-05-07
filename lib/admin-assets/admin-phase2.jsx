/* ============================================================================
   ZENPHONY ADMIN — PHASE 2 (Customers)
   Users (split view) + Subscriptions (state-machine kanban).
   ============================================================================ */

const { useState: useState2, useMemo: useMemo2 } = React;

/* ────────── seeded mock — users ────────── */
const USER_FIRST = ['Maya','Marcus','Tomoko','Sofia','Kofi','Kenji','Aria','Dmitri','Priya','Lena','Felix','Nina','Caleb','Zara','Theo','Yuki','Ravi','Iris','Omar','Hana','Diego','Ines','Liang','Rhea','Jonas','Camille','Ezra','Ada','Bao','Mira','Saul','Vera','Niko','Jules','Tariq','Olu','Pia','Quinn','Ren','Sage'];
const USER_LAST = ['Reyes','Chen','Watanabe','Almeida','Boateng','Park','Volkov','Singh','Holmberg','Vargas','Nakamura','Schmidt','Kowalski','Costa','Mensah','Iqbal','Tanaka','Okafor','Bjornsson','Cruz','Petrov','Aboagye','Khan','Adler','Sato','Larsen','Mustafa','Wójcik','Nguyen','Lima'];
const USER_DOMAINS = ['gmail.com','velvetstatic.fm','outlook.com','blueheronstudios.com','protonmail.com','lofi-coop.org','icloud.com','hey.com','fastmail.com','mac.com'];
const USER_REGIONS = ['us-east','us-west','eu-central','eu-west','ap-tokyo','ap-singapore','sa-east'];
const USER_DAWS = ['Reaper 7','Logic Pro 11','Ableton Live 12','Pro Tools 2024','Studio One 7','FL Studio 21','Bitwig 5','Cubase 13'];
const USER_OS  = ['macOS 14.5 · Apple Silicon','macOS 14.4 · Intel','Windows 11 · 23H2','Windows 11 · 22H2','Windows 10 · 22H2'];

function makeUsers(n) {
  const r = seedRand(101);
  const users = [];
  // Hand-tuned hero accounts that show up in the dashboard / kanban
  const heroes = [
    { name: 'Velvet Static FM',   email: 'ops@velvetstatic.fm',         plan: 'studio', state: 'active',   mrr: 490, ltv: 5880, since: '2022-07-12', region: 'us-east',   daw: 'Reaper 7',    os: 'macOS 14.5 · Apple Silicon', sessions: 10240, isOrg: true,  seats: 14, avatar: 'VS', cls: '' },
    { name: 'Blue Heron Studios', email: 'admin@blueheronstudios.com',  plan: 'studio', state: 'active',   mrr: 280, ltv: 3360, since: '2023-01-04', region: 'us-west',   daw: 'Pro Tools 2024', os: 'macOS 14.4 · Intel',          sessions: 5840,  isOrg: true,  seats: 8,  avatar: 'BH', cls: 'alt-1' },
    { name: 'Tomoko Watanabe',    email: 'tomoko.w@gmail.com',          plan: 'master', state: 'active',   mrr: 29,  ltv: 648,  since: '2023-04-18', region: 'ap-tokyo',  daw: 'Logic Pro 11',os: 'macOS 14.5 · Apple Silicon',  sessions: 1284,  avatar: 'TW', cls: 'alt-2' },
    { name: 'Marcus Chen',        email: 'marcus@chen.audio',           plan: 'master', state: 'active',   mrr: 32,  ltv: 352,  since: '2024-02-09', region: 'us-west',   daw: 'Ableton Live 12', os: 'macOS 14.5 · Apple Silicon', sessions: 980, avatar: 'MC', cls: 'alt-3' },
    { name: 'Sofia Almeida',      email: 'sofia@almeida.fm',            plan: 'master', state: 'trialing', mrr: 0,   ltv: 0,    since: '2026-04-22', region: 'eu-west',   daw: 'Logic Pro 11',os: 'macOS 14.5 · Apple Silicon',  sessions: 18,    avatar: 'SA', cls: 'alt-1' },
    { name: 'Kofi Boateng',       email: 'kofi@boateng.studio',         plan: 'solo',   state: 'active',   mrr: 9,   ltv: 112,  since: '2025-08-03', region: 'eu-central',daw: 'FL Studio 21',os: 'Windows 11 · 23H2',           sessions: 410,   avatar: 'KB', cls: 'alt-3' },
    { name: 'Lo-fi Cooperative',  email: 'admin@lofi-coop.org',         plan: 'studio', state: 'past_due', mrr: 140, ltv: 1820, since: '2024-06-15', region: 'eu-west',   daw: 'Ableton Live 12', os: 'Windows 11 · 23H2',          sessions: 3120,  isOrg: true, seats: 4, avatar: 'LC', cls: 'alt-4' },
    { name: 'Maya Reyes',         email: 'maya@velvetstatic.fm',        plan: 'master', state: 'active',   mrr: 16,  ltv: 294,  since: '2024-09-01', region: 'us-east',   daw: 'Logic Pro 11',os: 'macOS 14.5 · Apple Silicon',  sessions: 380,   avatar: 'MR', cls: '' },
    { name: 'Bedroom Tapes',      email: 'tapes@bedroom.fm',            plan: 'free',   state: 'canceled', mrr: 0,   ltv: 174,  since: '2024-10-22', region: 'us-east',   daw: 'Studio One 7',os: 'Windows 11 · 22H2',           sessions: 22,    avatar: 'BT', cls: 'alt-2' },
    { name: 'Kenji Park',         email: 'kenji.park@protonmail.com',   plan: 'solo',   state: 'paused',   mrr: 0,   ltv: 56,   since: '2025-03-11', region: 'ap-singapore',daw: 'Bitwig 5', os: 'macOS 14.4 · Intel',         sessions: 88,    avatar: 'KP', cls: 'alt-1' }
  ];
  users.push(...heroes);

  while (users.length < n) {
    const fn = USER_FIRST[Math.floor(r() * USER_FIRST.length)];
    const ln = USER_LAST[Math.floor(r() * USER_LAST.length)];
    const dom = USER_DOMAINS[Math.floor(r() * USER_DOMAINS.length)];
    const planRoll = r();
    const plan = planRoll < 0.71 ? 'free' : planRoll < 0.87 ? 'solo' : planRoll < 0.97 ? 'master' : 'studio';
    const stateRoll = r();
    const state =
      plan === 'free' ? 'free'
      : stateRoll < 0.78 ? 'active'
      : stateRoll < 0.86 ? 'trialing'
      : stateRoll < 0.92 ? 'past_due'
      : stateRoll < 0.96 ? 'paused'
      : 'canceled';
    const planMRR = { free: 0, solo: 9, master: plan === 'master' && r() > 0.5 ? 24 : 32, studio: 70 + Math.floor(r() * 20) * 14 }[plan];
    const mrr = (state === 'active' || state === 'past_due') ? planMRR : 0;
    const monthsAgo = Math.floor(r() * 36) + 1;
    const since = new Date(2026, 4 - monthsAgo, Math.floor(r() * 28) + 1).toISOString().slice(0, 10);
    users.push({
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${dom}`,
      plan, state, mrr,
      ltv: state === 'canceled' ? Math.round(planMRR * (Math.floor(r() * 14) + 2)) : Math.round(planMRR * monthsAgo * 0.9),
      since, region: USER_REGIONS[Math.floor(r() * USER_REGIONS.length)],
      daw: USER_DAWS[Math.floor(r() * USER_DAWS.length)],
      os: USER_OS[Math.floor(r() * USER_OS.length)],
      sessions: Math.floor(r() * 800),
      avatar: (fn[0] + ln[0]).toUpperCase(),
      cls: ['', 'alt-1', 'alt-2', 'alt-3', 'alt-4'][Math.floor(r() * 5)]
    });
  }
  return users;
}

const ALL_USERS = makeUsers(120); // mock paginated set; we only render the page

/* ────────── per-user mock detail (deterministic from seed) ────────── */
function userInvoices(u) {
  const r = seedRand(u.name.length * 7 + u.email.length);
  if (u.plan === 'free' || u.state === 'free') return [];
  const months = u.state === 'canceled' ? Math.floor(r() * 14) + 2 : Math.min(18, Math.floor(r() * 18) + 2);
  const out = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(2026, 3 - i, 4);
    out.push({
      date: d.toISOString().slice(0, 10),
      desc: `${u.plan === 'studio' ? `Studio · ${u.seats || 4} seats` : u.plan[0].toUpperCase()+u.plan.slice(1)} · monthly`,
      amount: u.mrr || ({ solo: 9, master: 32, studio: 70 + (u.seats || 4) * 14 }[u.plan]),
      status: i === 0 && u.state === 'past_due' ? 'past_due' : 'paid'
    });
  }
  return out;
}

function userTickets(u) {
  const r = seedRand(u.email.length * 11);
  const n = u.state === 'past_due' ? 3 : Math.floor(r() * 4);
  const subjects = [
    "Reaper 7 hangs on plugin init",
    "Mastering session won't complete render",
    "Lost preset chain after engine update",
    "License count seems wrong",
    "Studio seats not syncing",
    "Wrong invoice amount this month",
    "Can't switch from monthly to annual"
  ];
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      subj: subjects[(u.email.length + i) % subjects.length],
      status: ['Resolved','Resolved','In progress','Awaiting reply'][Math.floor(r() * 4)],
      ago: ['2d','9d','3w','2mo','5mo'][Math.floor(r() * 5)],
      csat: r() > 0.18 ? Math.floor(r() * 2) + 4 : Math.floor(r() * 2) + 2
    });
  }
  return out;
}

function userForumActivity(u) {
  const r = seedRand(u.email.length * 17);
  const posts  = Math.floor(r() * 80) + (u.state === 'active' ? 4 : 0);
  const flags  = Math.floor(r() * 3);
  const trust  = Math.min(100, 60 + Math.floor(r() * 40));
  const recent = [
    { subj: "Master vs solo preset banks — when does it pay off?", meta: "Reaper · Mastering · 14 replies · 6d ago", stat: '+12', cls: 'ok' },
    { subj: "Reaper 7 plugin init bug — temp fix inside",          meta: "Bugs · 4 replies · 2w ago",                stat: 'flagged', cls: 'flag' },
    { subj: "Tutorial: dialing in pearl meters for hip-hop",       meta: "Tutorials · 27 replies · 3w ago",          stat: '+34', cls: 'ok' }
  ];
  return { posts, flags, trust, recent: posts > 5 ? recent : recent.slice(0, 1) };
}

function userAuditTrail(u) {
  const ago = (mins) => mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.floor(mins/60)}h` : `${Math.floor(mins/1440)}d`;
  const trail = [];
  if (u.state === 'past_due') trail.push({ ico: 'card', text: <>Stripe webhook reported <strong>charge failed</strong> · attempt 3 of 4</>, who: 'system', time: ago(38) });
  trail.push({ ico: 'mail', text: <><span className="who">@maya.r</span> sent template <strong>"Welcome to Master"</strong></>, who: 'maya', time: ago(180) });
  if (u.plan !== 'free') trail.push({ ico: 'crown', text: <><span className="who">@dmitri.v</span> applied promo code <strong>MASTER30</strong> retroactively</>, who: 'dmitri', time: ago(420) });
  trail.push({ ico: 'log',  text: <>Account opened <strong>{u.name}</strong> from <span className="who">{u.region}</span></>, who: 'system', time: ago(1440 * 9) });
  if (u.state === 'canceled') trail.push({ ico: 'refund', text: <><span className="who">@iris.t</span> processed refund <strong>$59</strong> · prorate</>, who: 'iris', time: ago(60) });
  return trail;
}

function userSeats(u) {
  if (!u.isOrg) return [];
  const r = seedRand(u.email.length * 19);
  const roles = ['Owner','Admin','Member','Member','Member','Engineer','Engineer'];
  const names = ['Maya Reyes','Marcus Chen','Sofia Almeida','Kenji Park','Aria Singh','Dmitri Volkov','Priya Holmberg','Felix Larsen','Nina Schmidt','Iris Tanaka','Theo Adler','Yuki Sato','Ravi Iqbal','Caleb Mensah'];
  const seats = [];
  for (let i = 0; i < u.seats; i++) {
    const nm = names[(i + Math.floor(r() * 5)) % names.length];
    seats.push({
      name: nm,
      role: i === 0 ? 'Owner' : roles[Math.floor(r() * roles.length)],
      last: ['just now', '4h ago', '2d ago', '1w ago', '3w ago'][Math.floor(r() * 5)],
      avatar: nm.split(' ').map(s=>s[0]).join('').slice(0,2),
      cls: ['', 'alt-1', 'alt-2', 'alt-3', 'alt-4'][Math.floor(r() * 5)]
    });
  }
  return seats;
}

/* ============================================================================
   USERS SCREEN — split view
   ============================================================================ */
const SAVED_SEGMENTS = [
  { id: 'all',       label: 'All users',      count: '12.4k' },
  { id: 'paying',    label: 'Paying',         count: '3,544' },
  { id: 'trial',     label: 'Trial expiring', count: 84,  warn: true },
  { id: 'past_due',  label: 'Past due',       count: 38,  danger: true },
  { id: 'risk',      label: 'Churn risk',     count: 126, warn: true },
  { id: 'studio',    label: 'Studio orgs',    count: 408 }
];

const FILTER_CHIPS = [
  { id: 'plan',     lbl: 'Plan',     val: 'any' },
  { id: 'state',    lbl: 'State',    val: 'any' },
  { id: 'region',   lbl: 'Region',   val: 'any' },
  { id: 'signup',   lbl: 'Signup',   val: 'any' },
  { id: 'lastSeen', lbl: 'Last seen',val: 'any' },
  { id: 'risk',     lbl: 'Risk',     val: 'any' }
];

function UsersScreen({ selectedId, setSelectedId, segment, setSegment }) {
  const visible = useMemo2(() => {
    let list = ALL_USERS;
    if (segment === 'paying')   list = list.filter(u => u.plan !== 'free');
    if (segment === 'trial')    list = list.filter(u => u.state === 'trialing');
    if (segment === 'past_due') list = list.filter(u => u.state === 'past_due');
    if (segment === 'risk')     list = list.filter(u => u.state === 'past_due' || u.state === 'paused');
    if (segment === 'studio')   list = list.filter(u => u.plan === 'studio');
    return list.slice(0, 24); // single page for the prototype
  }, [segment]);

  const selected = useMemo2(() => {
    return ALL_USERS.find(u => u.email === selectedId) || visible[0] || ALL_USERS[0];
  }, [selectedId, visible]);

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Users</h1>
          <div className="sub">12,398 total · 3,544 paying · 384 paid this month</div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="download" /> Export segment</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="plus" /> Add admin</button>
        </div>
      </div>

      {/* Saved segments */}
      <div className="uf-segs">
        {SAVED_SEGMENTS.map(s => (
          <button
            key={s.id}
            className={`uf-seg ${segment === s.id ? 'on' : ''} ${s.warn ? 'warn' : ''} ${s.danger ? 'danger' : ''}`}
            onClick={() => setSegment(s.id)}
          >
            {s.label}
            <span className="badge">{s.count}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="uf-seg" style={{ color: 'var(--accent)' }}>
          <AIcon name="plus" /> Save current view
        </button>
      </div>

      {/* Filter bar */}
      <div className="users-filters">
        <div className="uf-search">
          <AIcon name="search" />
          <input placeholder="Search by name, email, Stripe ID, account UUID…" />
        </div>
        {FILTER_CHIPS.map(c => (
          <div key={c.id} className="uf-chip">
            <span className="lbl">{c.lbl}:</span>
            <span>{c.val}</span>
            <AIcon name="arrowDn" />
          </div>
        ))}
      </div>

      {/* Split shell */}
      <div className="users-shell">
        {/* LEFT — table */}
        <div className="adm-card users-table-card">
          <div className="users-table-h">
            <div className="uf-check on" />
            <span className="count"><strong>{visible.length}</strong> of 12,398</span>
            <div className="spacer" />
            <span className="count" style={{ color: 'var(--muted-foreground)' }}>Sort: Last active ↓</span>
            <div className="pager">
              <button><AIcon name="arrowUp" /></button>
              <span>1 – {visible.length}</span>
              <button><AIcon name="arrowDn" /></button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="users-tbl">
              <colgroup>
                <col className="col-check" />
                <col className="col-user" />
                <col className="col-plan" />
                <col className="col-state" />
                <col className="col-mrr" />
                <col className="col-last" />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th>User</th>
                  <th>Plan</th>
                  <th>State</th>
                  <th className="r">MRR</th>
                  <th className="r">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(u => {
                  const isSel = u.email === selected.email;
                  return (
                    <tr key={u.email} className={isSel ? 'is-selected' : ''} onClick={() => setSelectedId(u.email)}>
                      <td><div className="uf-check" /></td>
                      <td>
                        <div className="who-cell">
                          <div className={`mini-avatar ${u.cls || ''}`}>{u.avatar}</div>
                          <div className="who">
                            <div className="name">{u.name}{u.isOrg ? ' · org' : ''}</div>
                            <div className="meta">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`plan-pill ${u.plan}`}>{u.plan}</span></td>
                      <td><span className={`state-pill ${u.state}`}><span className="dot" />{u.state.replace('_',' ')}</span></td>
                      <td className="num">{u.mrr ? `$${u.mrr}` : '—'}</td>
                      <td className="num last">{['12m','38m','3h','1d','4d','2w','3w','2mo'][(u.email.length) % 8]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT — detail */}
        <div className="adm-card user-detail">
          <UserDetail user={selected} onClose={() => setSelectedId(null)} />
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   USER DETAIL — tabs
   ============================================================================ */
function UserDetail({ user: u, onClose }) {
  const [tab, setTab] = useState2('billing');
  if (!u) {
    return (
      <div className="ud-empty">
        <div className="glyph"><AIcon name="users" /></div>
        <h3>No user selected</h3>
        <p>Pick a row from the table to inspect their plan, telemetry, and history.</p>
      </div>
    );
  }
  const invoices = userInvoices(u);
  const tickets  = userTickets(u);
  const forum    = userForumActivity(u);
  const audit    = userAuditTrail(u);
  const seats    = userSeats(u);

  return (
    <>
      <div className="ud-h">
        <div className={`ud-avatar ${u.cls || ''}`}>{u.avatar}</div>
        <div className="ud-id">
          <h2>{u.name}</h2>
          <div className="email">{u.email}</div>
          <div className="pills">
            <span className={`plan-pill ${u.plan}`}>{u.plan}</span>
            <span className={`state-pill ${u.state}`}><span className="dot" />{u.state.replace('_',' ')}</span>
            {u.isOrg && <span className="plan-pill" style={{background: 'rgba(255,255,255,0.06)'}}>{u.seats} seats</span>}
            <span className="plan-pill" style={{background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)'}}>{u.region}</span>
          </div>
        </div>
        <div className="close-btn" onClick={onClose} title="Close detail">
          <AIcon name="arrowR" />
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="ud-actions">
        <button className="ud-action"><AIcon name="bolt" /> Grant credits</button>
        <button className="ud-action"><AIcon name="crown" /> Apply promo</button>
        <button className="ud-action"><AIcon name="card" /> Change plan</button>
        <button className="ud-action"><AIcon name="refund" /> Refund last invoice</button>
        <button className="ud-action"><AIcon name="mail" /> Send template</button>
        <button className="ud-action"><AIcon name="key" /> Reset password</button>
        <button className="ud-action"><AIcon name="plug" /> Pause subscription</button>
        <button className="ud-action danger"><AIcon name="alert" /> Suspend</button>
      </div>

      {/* TABS */}
      <div className="ud-tabs">
        <button className={`ud-tab ${tab === 'billing' ? 'on' : ''}`} onClick={() => setTab('billing')}>Billing<span className="badge">{invoices.length}</span></button>
        <button className={`ud-tab ${tab === 'plugin' ? 'on' : ''}`}  onClick={() => setTab('plugin')}>Plugin telemetry</button>
        <button className={`ud-tab ${tab === 'support' ? 'on' : ''}`} onClick={() => setTab('support')}>Support<span className="badge">{tickets.length}</span></button>
        <button className={`ud-tab ${tab === 'forum' ? 'on' : ''}`}   onClick={() => setTab('forum')}>Forum<span className="badge">{forum.posts}</span></button>
        <button className={`ud-tab ${tab === 'audit' ? 'on' : ''}`}   onClick={() => setTab('audit')}>Audit trail<span className="badge">{audit.length}</span></button>
      </div>

      {/* BODY */}
      <div className="ud-body">
        {tab === 'billing' && <UDBilling u={u} invoices={invoices} seats={seats} />}
        {tab === 'plugin'  && <UDPlugin u={u} />}
        {tab === 'support' && <UDSupport u={u} tickets={tickets} />}
        {tab === 'forum'   && <UDForum u={u} forum={forum} />}
        {tab === 'audit'   && <UDAudit u={u} audit={audit} />}
      </div>
    </>
  );
}

function UDBilling({ u, invoices, seats }) {
  const cardLast = ['4242','9081','5577','1119','3068'][(u.email.length) % 5];
  const brand = ['VISA','MC','AMEX'][(u.email.length) % 3];
  const renew = u.state === 'active' || u.state === 'past_due' || u.state === 'trialing';
  return (
    <>
      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Plan & subscription</h4><div className="spacer" /><span className="lnk">Stripe customer ›</span></div>
        <div className="ud-sec-body">
          <div className="ud-kv">
            <div><div className="k">Plan</div><div className="v body">{u.plan === 'free' ? 'Free' : u.plan === 'solo' ? 'Solo · monthly' : u.plan === 'master' ? 'Master · monthly' : `Studio · ${u.seats} seats · annual`}</div></div>
            <div><div className="k">State</div><div className="v body" style={{color: 'var(--accent)'}}>{u.state.replace('_',' ')}</div></div>
            <div><div className="k">MRR</div><div className="v">{u.mrr ? `$${u.mrr}.00` : '$0.00'}</div></div>
            <div><div className="k">LTV</div><div className="v">${u.ltv}</div></div>
            <div><div className="k">Customer since</div><div className="v">{u.since}</div></div>
            <div><div className="k">{renew ? 'Renews' : 'Ended'}</div><div className="v">{renew ? '2026-05-04' : '2026-02-18'}</div></div>
          </div>
        </div>
      </div>

      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Payment method</h4><div className="spacer" /><span className="lnk">Update ›</span></div>
        <div className="ud-sec-body">
          {u.plan === 'free' && u.state === 'free'
            ? <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>No payment method on file.</div>
            : <div className="card-brand">
                <span className="brand">{brand}</span>
                <span>•••• •••• •••• {cardLast}</span>
                <span style={{ color: 'var(--muted-foreground)', marginLeft: 'auto' }}>exp 09/27</span>
              </div>
          }
        </div>
      </div>

      {u.isOrg && seats.length > 0 && (
        <div className="ud-sec">
          <div className="ud-sec-h"><h4>Seats · {seats.length} of {u.seats}</h4><div className="spacer" /><span className="lnk">+ Add seat</span></div>
          <div className="ud-sec-body">
            <div className="seats-list">
              {seats.map((s, i) => (
                <div className="seat-row" key={i}>
                  <div className={`mini-avatar ${s.cls}`} style={{width: 24, height: 24, fontSize: 9}}>{s.avatar}</div>
                  <div className="who">
                    <div className="name">{s.name}</div>
                    <div className="role">{s.role}</div>
                  </div>
                  <div className="last">{s.last}</div>
                  <div className="x" title="Remove seat">×</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div className="ud-sec">
          <div className="ud-sec-h"><h4>Invoices</h4><span style={{fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)'}}>last {Math.min(invoices.length, 6)} of {invoices.length}</span><div className="spacer" /><span className="lnk">All invoices ›</span></div>
          <div className="ud-sec-body" style={{paddingTop: 4, paddingBottom: 4}}>
            {invoices.slice(0, 6).map((inv, i) => (
              <div className="inv-row" key={i}>
                <span className="date">{inv.date}</span>
                <span className="desc">{inv.desc}</span>
                <span className={`state-pill ${inv.status === 'past_due' ? 'past_due' : 'active'}`}><span className="dot" />{inv.status === 'past_due' ? 'past due' : 'paid'}</span>
                <span className="amt">${inv.amount}.00</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function UDPlugin({ u }) {
  const r = seedRand(u.email.length * 23);
  const crashCount = u.state === 'past_due' ? 4 : Math.floor(r() * 3);
  const lastSeen = u.state === 'paused' ? '3w ago' : u.state === 'canceled' ? '2mo ago' : ['just now','12m','2h','1d'][Math.floor(r() * 4)];
  const buildChan = ['stable','stable','stable','beta'][Math.floor(r() * 4)];
  const versions = u.plan === 'free' ? '2.4.1' : '2.4.1';
  return (
    <>
      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Hosts & build</h4></div>
        <div className="ud-sec-body">
          <div className="tele-grid">
            <div className="tele-cell">
              <div className="lbl">DAW</div>
              <div className="val">{u.daw}</div>
              <div className="sub">primary host · last 30d</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">OS</div>
              <div className="val">{u.os.split(' · ')[0]}</div>
              <div className="sub">{u.os.split(' · ')[1] || ''}</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Plugin version</div>
              <div className="val">v{versions}</div>
              <div className="sub">{buildChan} channel · 3 days behind</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Last seen</div>
              <div className="val">{lastSeen}</div>
              <div className="sub">via {u.region}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Reliability · last 30 days</h4></div>
        <div className="ud-sec-body">
          <div className="tele-grid">
            <div className="tele-cell">
              <div className="lbl">Sessions</div>
              <div className="val">{u.sessions.toLocaleString()}</div>
              <div className="sub">{Math.round(u.sessions / 30)} / day avg</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Crashes</div>
              <div className={`val ${crashCount > 0 ? 'warn' : ''}`}>{crashCount}</div>
              <div className="sub">{crashCount > 0 ? 'open in crash reports →' : 'no crashes recorded'}</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Render success</div>
              <div className="val">{(98.2 + r() * 1.6).toFixed(1)}%</div>
              <div className="sub">98.5% global avg</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Avg LUFS target</div>
              <div className="val">−14.2 LUFS</div>
              <div className="sub">streaming-safe pearl chain</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function UDSupport({ u, tickets }) {
  if (tickets.length === 0) {
    return <div className="ud-sec"><div className="ud-sec-body" style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', padding: 24 }}>No support tickets on file.</div></div>;
  }
  return (
    <div className="ud-sec">
      <div className="ud-sec-h"><h4>Tickets</h4><div className="spacer" /><span className="lnk">Open inbox ›</span></div>
      <div className="ud-sec-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
        {tickets.map((t, i) => (
          <div className="tk-row" key={i}>
            <div>
              <div className="subj">{t.subj}</div>
              <div className="meta">{t.status} · {t.ago} ago</div>
            </div>
            <div className={`csat ${t.csat < 4 ? 'bad' : ''}`}>
              {t.csat < 4 ? '★' : '★★'} CSAT {t.csat}/5
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UDForum({ u, forum }) {
  return (
    <>
      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Trust & activity</h4></div>
        <div className="ud-sec-body">
          <div className="tele-grid">
            <div className="tele-cell">
              <div className="lbl">Posts</div>
              <div className="val">{forum.posts}</div>
              <div className="sub">all-time</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Flags received</div>
              <div className={`val ${forum.flags > 0 ? 'warn' : ''}`}>{forum.flags}</div>
              <div className="sub">{forum.flags > 0 ? 'review thread context →' : 'no flags'}</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Trust score</div>
              <div className="val">{forum.trust} / 100</div>
              <div className="sub">{forum.trust > 80 ? 'trusted contributor' : 'normal'}</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Reactions</div>
              <div className="val">+{Math.round(forum.posts * 1.4)}</div>
              <div className="sub">stars given · {Math.round(forum.posts * 0.6)} received</div>
            </div>
          </div>
        </div>
      </div>
      {forum.recent.length > 0 && (
        <div className="ud-sec">
          <div className="ud-sec-h"><h4>Recent threads</h4><div className="spacer" /><span className="lnk">Profile ›</span></div>
          <div className="ud-sec-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {forum.recent.map((t, i) => (
              <div className="fm-row" key={i}>
                <div>
                  <div className="subj">{t.subj}</div>
                  <div className="meta">{t.meta}</div>
                </div>
                <div className={`stat ${t.cls}`}>{t.stat}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function UDAudit({ u, audit }) {
  return (
    <div className="ud-sec">
      <div className="ud-sec-h"><h4>Audit trail</h4><div className="spacer" /><span className="lnk">Export ›</span></div>
      <div className="ud-sec-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {audit.map((e, i) => (
          <div className="aud-row" key={i}>
            <div className="ico"><AIcon name={e.ico} /></div>
            <div className="text">{e.text}</div>
            <div className="time">{e.time} ago</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   SUBSCRIPTIONS — state-machine kanban
   ============================================================================ */
const SUB_STATES = [
  { id: 'active',    label: 'Active',    color: 'hsl(150, 70%, 55%)', count: 3506, mrr: 42820, delta: '+184',  deltaTone: 'up'   },
  { id: 'trialing',  label: 'Trialing',  color: 'hsl(190, 80%, 60%)', count: 312,  mrr: 0,     delta: '+38',   deltaTone: 'up'   },
  { id: 'past_due',  label: 'Past due',  color: 'hsl(35, 90%, 60%)',  count: 38,   mrr: 1480,  delta: '+6',    deltaTone: 'down' },
  { id: 'paused',    label: 'Paused',    color: 'rgba(255,255,255,0.5)', count: 76, mrr: 0,    delta: '−4',    deltaTone: 'flat' },
  { id: 'canceled',  label: 'Canceled',  color: 'hsl(355, 80%, 65%)', count: 142,  mrr: 0,     delta: '+22',   deltaTone: 'down' }
];

function pickSubsForState(state, n) {
  return ALL_USERS.filter(u => u.state === state && u.plan !== 'free').slice(0, n);
}

function subPulse(u) {
  if (u.state === 'past_due') {
    return { cls: 'danger', text: 'charge failed · 3rd attempt' };
  }
  if (u.state === 'trialing') {
    return { cls: 'warn', text: 'trial · ' + (Math.floor((u.email.length * 7) % 14)) + 'd left' };
  }
  if (u.state === 'paused') {
    return { cls: 'warn', text: 'paused · resumes 2026-05-12' };
  }
  if (u.state === 'canceled') {
    return { cls: 'danger', text: 'churned · ' + ['2d','1w','3w','2mo'][(u.email.length) % 4] + ' ago' };
  }
  // active — show small positive
  if (u.plan === 'studio') return { cls: 'ok', text: 'expanding · +2 seats this mo' };
  return null;
}

function SubscriptionsScreen({ setRoute, setSelectedId, setSegment }) {
  const [showCreate, setShowCreate] = React.useState(false);
  const CreateSubscriptionModal = window.CreateSubscriptionModal;
  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Subscriptions</h1>
          <div className="sub">State machine across the entire customer base · drill into any column</div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <div className="adm-segctl">
            <button className="on">All plans</button>
            <button>Solo</button>
            <button>Master</button>
            <button>Studio</button>
          </div>
          <button className="adm-btn adm-btn-ghost"><AIcon name="download" /> Export</button>
          <button className="adm-btn adm-btn-ghost"><AIcon name="bolt" /> Recovery campaign</button>
          {CreateSubscriptionModal && <button className="adm-btn adm-btn-primary" onClick={()=>setShowCreate(true)}><AIcon name="plus" /> Create subscription</button>}
        </div>
      </div>
      {CreateSubscriptionModal && <CreateSubscriptionModal open={showCreate} onClose={()=>setShowCreate(false)} channel="admin" />}

      {/* Summary strip */}
      <div className="subs-summary">
        {SUB_STATES.map(s => (
          <div key={s.id} className="subs-sum" style={{'--bar-color': s.color}}>
            <div className="lbl">{s.label}</div>
            <div className="val">{s.count.toLocaleString()}<span className={`delta ${s.deltaTone}`}>{s.delta}</span></div>
            <div className="sub">{s.mrr ? `$${(s.mrr/1000).toFixed(1)}k MRR` : 'no active MRR'}</div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="kanban">
        {SUB_STATES.map(col => {
          const subs = pickSubsForState(col.id, 8);
          return (
            <div key={col.id} className="kan-col">
              <div className="kan-col-h">
                <div className={`lbl ${col.id}`}><span className="dot" />{col.label}</div>
                <div className="count">
                  {col.count.toLocaleString()}
                  <div className="mrr">{col.mrr ? `$${(col.mrr/1000).toFixed(1)}k` : '—'}</div>
                </div>
              </div>
              <div className="kan-list">
                {subs.length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center', fontSize: 11, color: 'var(--muted-foreground)' }}>No accounts</div>
                )}
                {subs.map(u => {
                  const pulse = subPulse(u);
                  return (
                    <div key={u.email} className="kan-card" onClick={() => { setRoute('users'); setSegment('all'); setSelectedId(u.email); }}>
                      <div className="top">
                        <div className={`mini-avatar ${u.cls || ''}`}>{u.avatar}</div>
                        <div className="who">
                          <div className="name">{u.name}</div>
                          <div className="meta">{u.plan === 'studio' ? `studio · ${u.seats || 4} seats` : `${u.plan} · monthly`}</div>
                        </div>
                        <div className="mrr">{u.mrr ? `$${u.mrr}` : '—'}</div>
                      </div>
                      <div className="bot">
                        {pulse && <span className={`pulse ${pulse.cls}`}>{pulse.text}</span>}
                        <span style={{flex: 1}} />
                        <span className="stamp">since {u.since.slice(0, 7)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="kan-foot">View all {col.count.toLocaleString()} →</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* expose to window so admin.jsx can pick up */
Object.assign(window, { UsersScreen, SubscriptionsScreen });
