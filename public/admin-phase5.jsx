/* ============================================================================
   ADMIN PHASE 4 (cont.) + PHASE 5
   - Plugin builds
   - System health
   - Admin team
   - Settings
   ============================================================================ */
const { useState: useSt5, useMemo: useMm5, useEffect: useEf5 } = React;

/* ============================================================================
   PLUGIN BUILDS — version river + install matrix
   ============================================================================ */
const PLUGIN_VERSIONS = [
  { v: '2.4.2', date: 'Apr 28', state: 'canary', adoption: 0.04, channel: 'canary',  notes: 'Pearl v3 fallback fix · Reaper bypass crash · 12% prod', signed: { mac: 'notarized', win: 'signed' }, dl24: 412 },
  { v: '2.4.1', date: 'Apr 22', state: 'current', adoption: 0.71, channel: 'stable', notes: 'New Vinyl Warmth · Studio One AAX preview · perf', signed: { mac: 'notarized', win: 'signed' }, dl24: 8410 },
  { v: '2.4.0', date: 'Apr 03', state: 'previous', adoption: 0.18, channel: 'stable', notes: 'Pearl v4 mastering model · Streaming Safe rewrite', signed: { mac: 'notarized', win: 'signed' }, dl24: 1820 },
  { v: '2.3.6', date: 'Mar 11', state: 'previous', adoption: 0.05, channel: 'stable', notes: 'Hotfix · Logic 11 plugin scan timeout', signed: { mac: 'notarized', win: 'signed' }, dl24: 240 },
  { v: '2.3.5', date: 'Feb 26', state: 'eol',      adoption: 0.02, channel: 'stable', notes: 'Last 2.3 · EOL Sep 1', signed: { mac: 'notarized', win: 'signed' }, dl24: 90 }
];

const HOSTS = [
  { id: 'logic',     label: 'Logic Pro',    plat: 'mac' },
  { id: 'ableton',   label: 'Ableton Live', plat: 'both' },
  { id: 'protools',  label: 'Pro Tools',    plat: 'both' },
  { id: 'reaper',    label: 'Reaper',       plat: 'both' },
  { id: 'studioone', label: 'Studio One',   plat: 'both' },
  { id: 'fl',        label: 'FL Studio',    plat: 'both' },
  { id: 'cubase',    label: 'Cubase',       plat: 'both' },
  { id: 'bitwig',    label: 'Bitwig',       plat: 'both' }
];

// share of installs per host (sums roughly to 1)
const HOST_SHARE = {
  logic: 0.31, ableton: 0.27, protools: 0.11, reaper: 0.13, studioone: 0.07, fl: 0.06, cubase: 0.03, bitwig: 0.02
};

function PluginScreen({ selected, setSelected }) {
  const sel = PLUGIN_VERSIONS.find(v => v.v === selected) || PLUGIN_VERSIONS[1];
  return (
    <>
      <div className="adm-page-h">
        <div><h1>Plugin builds</h1><div className="sub">5 versions live · 1 canary in rollout · 14,972 active installs · last release 3d ago</div></div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="download"/> Release notes</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="plus"/> Cut new build</button>
        </div>
      </div>

      {/* version river */}
      <div className="adm-card">
        <div className="adm-card-h"><h3>Version river</h3><span className="sub">share of installed base · click to inspect</span></div>
        <div className="adm-card-body" style={{padding:'18px 22px 22px'}}>
          <VersionRiver versions={PLUGIN_VERSIONS} selectedV={sel.v} onPick={setSelected}/>
        </div>
      </div>

      <div className="plugin-shell">
        {/* version detail */}
        <div className="adm-card">
          <div className="adm-card-h">
            <h3>{sel.v} <span className={`build-pill ${sel.state}`}>{sel.state}</span></h3>
            <span className="sub">released {sel.date} · {sel.channel} channel</span>
          </div>
          <div style={{padding:'14px 18px 18px',display:'flex',flexDirection:'column',gap:14}}>
            <div className="build-stats">
              <div className="build-stat"><div className="k">Adoption</div><div className="v">{(sel.adoption*100).toFixed(0)}<small>%</small></div><div className="s">of installed base</div></div>
              <div className="build-stat"><div className="k">Downloads · 24h</div><div className="v">{sel.dl24.toLocaleString()}</div><div className="s">across all hosts</div></div>
              <div className="build-stat"><div className="k">macOS</div><div className="v" style={{fontSize:13,color:'hsl(150,70%,72%)'}}>{sel.signed.mac}</div><div className="s">Apple notary chain</div></div>
              <div className="build-stat"><div className="k">Windows</div><div className="v" style={{fontSize:13,color:'hsl(150,70%,72%)'}}>{sel.signed.win}</div><div className="s">EV cert · DigiCert</div></div>
            </div>
            <div className="build-notes">
              <div className="build-notes-h">Release notes</div>
              <p>{sel.notes}</p>
            </div>
            <div className="build-actions">
              <button className="adm-btn adm-btn-ghost">View changelog</button>
              <button className="adm-btn adm-btn-ghost">Download artifacts</button>
              {sel.state === 'canary' && <button className="adm-btn adm-btn-primary">Promote to stable</button>}
              {sel.state === 'previous' && <button className="adm-btn adm-btn-ghost">Rollback to {sel.v}</button>}
            </div>
          </div>
        </div>

        {/* host install matrix */}
        <div className="adm-card">
          <div className="adm-card-h"><h3>Host × platform</h3><span className="sub">install share · v{sel.v}</span></div>
          <div style={{padding:'12px 18px 18px'}}>
            <div className="host-matrix">
              <div className="host-matrix-row hm-h">
                <div></div>
                <div>macOS</div>
                <div>Windows</div>
                <div>installs</div>
              </div>
              {HOSTS.map(h => {
                const total = Math.round(14972 * sel.adoption * HOST_SHARE[h.id]);
                const macShare = h.plat === 'mac' ? 1 : h.id === 'logic' ? 1 : (h.id === 'fl' ? 0.4 : h.id === 'cubase' ? 0.55 : 0.6);
                const macN = Math.round(total*macShare);
                const winN = total - macN;
                return (
                  <div key={h.id} className="host-matrix-row">
                    <div className="hm-host">{h.label}</div>
                    <div className="hm-cell">
                      <div className="hm-bar"><span style={{width: `${macShare*100}%`}}/></div>
                      <span className="hm-n">{macN.toLocaleString()}</span>
                    </div>
                    <div className="hm-cell">
                      {h.plat === 'mac' ? (
                        <span className="hm-na">— mac only</span>
                      ) : (
                        <>
                          <div className="hm-bar"><span style={{width: `${(1-macShare)*100}%`, background:'hsl(190,80%,60%)'}}/></div>
                          <span className="hm-n">{winN.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                    <div className="hm-total">{total.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function VersionRiver({ versions, selectedV, onPick }) {
  const W=1100, H=120, padL=80, padR=60;
  const inner = W - padL - padR;
  // build cumulative offsets
  const total = versions.reduce((s,v)=>s+v.adoption,0);
  let acc = 0;
  const bands = versions.map(v => {
    const start = acc/total;
    acc += v.adoption;
    return { ...v, start, end: acc/total };
  });
  const colors = { canary:'hsl(35,90%,62%)', current:'hsl(150,70%,55%)', previous:'hsl(220,12%,55%)', eol:'hsl(355,70%,55%)' };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}} preserveAspectRatio="none">
      {/* axis */}
      <text x={padL-12} y={42} textAnchor="end" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)" letterSpacing="0.1em">SHARE</text>
      <line x1={padL} x2={W-padR} y1={70} y2={70} stroke="rgba(255,255,255,0.06)"/>
      {/* river bands */}
      {bands.map(b => {
        const x1 = padL + inner*b.start;
        const x2 = padL + inner*b.end;
        const w = Math.max(2, x2-x1);
        const isSel = b.v === selectedV;
        return (
          <g key={b.v} style={{cursor:'pointer'}} onClick={()=>onPick(b.v)}>
            <rect x={x1+0.5} y={20} width={w-1} height={50} rx="3"
                  fill={colors[b.state]}
                  opacity={isSel?1:0.7}
                  stroke={isSel?'var(--foreground)':'none'}
                  strokeWidth="1.5"/>
            <text x={x1 + w/2} y={48} textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="var(--font-mono)">
              {b.v}
            </text>
            <text x={x1 + w/2} y={88} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {b.date}
            </text>
            <text x={x1 + w/2} y={102} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {(b.adoption*100).toFixed(0)}%
            </text>
          </g>
        );
      })}
      {/* legend */}
      {Object.entries(colors).map(([k,c],i)=>(
        <g key={k} transform={`translate(${padL + i*120}, ${H-8})`}>
          <rect width="10" height="6" y="-5" fill={c} rx="1"/>
          <text x="14" y="0" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)" letterSpacing="0.06em">{k.toUpperCase()}</text>
        </g>
      ))}
    </svg>
  );
}

/* ============================================================================
   SYSTEM HEALTH
   ============================================================================ */
const SERVICES = [
  { id: 'plugin-api',     label: 'Plugin API',          status: 'ok',     latency: 28, latencyTrend: [22,28,25,31,28,26,30,28,29,27,28,28], rps: 12400, region: 'global' },
  { id: 'render-pool',    label: 'Render workers',      status: 'degraded', latency: 1240, latencyTrend: [800,820,900,1100,1300,1280,1240,1280,1300,1240,1280,1240], rps: 380, region: 'us-east-1', note: 'Queue depth 142 · auto-scaled +6 nodes 18m ago' },
  { id: 'mastering-svc',  label: 'Mastering service',   status: 'ok',     latency: 410, latencyTrend: [380,400,390,410,420,400,410,420,415,400,410,410], rps: 940, region: 'global' },
  { id: 'auth',           label: 'Auth · Clerk proxy',  status: 'ok',     latency: 88, latencyTrend: [80,88,90,86,88,90,88,86,88,90,88,86], rps: 2100, region: 'global' },
  { id: 'billing',        label: 'Billing · Stripe',    status: 'ok',     latency: 142, latencyTrend: [140,148,142,138,142,140,142,144,142,140,142,142], rps: 88, region: 'global' },
  { id: 'forum-api',      label: 'Forum API',           status: 'ok',     latency: 64, latencyTrend: [60,64,62,68,64,62,64,64,66,64,62,64], rps: 410, region: 'global' },
  { id: 'web-console',    label: 'Web console',         status: 'ok',     latency: 110, latencyTrend: [108,110,112,108,110,112,110,108,110,112,110,108], rps: 240, region: 'global' },
  { id: 'cdn-binaries',   label: 'CDN · plugin binaries', status: 'ok',   latency: 45, latencyTrend: [42,45,44,46,45,44,45,46,44,45,45,44], rps: 4200, region: 'edge' },
  { id: 'pearl-detector', label: 'Pearl model · v4.2',  status: 'warn',   latency: 880, latencyTrend: [600,640,720,820,880,860,880,900,920,880,900,880], rps: 380, region: 'us-east-1', note: 'p95 climbing since retrain · investigating' },
  { id: 'storage-projects', label: 'Project storage · S3', status: 'ok', latency: 92, latencyTrend: [88,92,90,92,94,92,90,92,94,92,90,92], rps: 1100, region: 'global' }
];

const INCIDENTS = [
  { id: 'INC-318', title: 'Pearl detector p95 latency climbing', sev: 'warn',     state: 'investigating', started: '34m', services:['pearl-detector','render-pool'], updates: 4 },
  { id: 'INC-317', title: 'Render pool OOM spike',               sev: 'critical', state: 'resolved',     started: '6h',  services:['render-pool'], updates: 12, resolved: '4h ago · root: connection pool starvation' },
  { id: 'INC-316', title: 'Stripe webhook 3-min outage',         sev: 'warn',     state: 'resolved',     started: '2d',  services:['billing'], updates: 5,  resolved: 'auto-retried · 0 dropped events' },
  { id: 'INC-315', title: 'Plugin 2.4.0 crash on Reaper bypass', sev: 'warn',     state: 'monitoring',   started: '4d',  services:['plugin-api','cdn-binaries'], updates: 8,  resolved: 'fix queued in 2.4.2 canary' }
];

const REGIONS = [
  { id: 'us-east-1', label: 'US East (N. Virginia)', primary: true, services: 28, status: 'warn' },
  { id: 'us-west-2', label: 'US West (Oregon)',      primary: false, services: 18, status: 'ok' },
  { id: 'eu-west-1', label: 'EU (Ireland)',           primary: false, services: 22, status: 'ok' },
  { id: 'ap-southeast-2', label: 'AP (Sydney)',       primary: false, services: 12, status: 'ok' },
  { id: 'edge-cdn',  label: 'Edge CDN · 47 PoPs',     primary: false, services: 1,  status: 'ok' }
];

function SystemScreen() {
  return (
    <>
      <div className="adm-page-h">
        <div><h1>System health</h1><div className="sub">10 services · 1 active incident · 99.94% uptime · last 30d</div></div>
        <div className="spacer"/>
        <div className="actions">
          <div className="adm-segctl"><button className="on">Live</button><button>1h</button><button>24h</button></div>
          <button className="adm-btn adm-btn-ghost"><AIcon name="bell"/> Subscribe</button>
        </div>
      </div>

      {/* status banner */}
      <div className="sys-banner">
        <div className="sys-banner-pulse"><span/></div>
        <div className="sys-banner-body">
          <div className="sys-banner-l">Operating with degradation</div>
          <div className="sys-banner-s">Render pool auto-scaled · Pearl detector latency under investigation · all critical paths healthy</div>
        </div>
        <div className="spacer"/>
        <div className="sys-banner-stats">
          <div><div className="k">Uptime · 30d</div><div className="v">99.94%</div></div>
          <div><div className="k">Active incidents</div><div className="v">1</div></div>
          <div><div className="k">SLO budget</div><div className="v">62%</div></div>
        </div>
      </div>

      {/* service grid */}
      <div className="adm-card">
        <div className="adm-card-h"><h3>Services</h3><span className="sub">live · last 12 minutes</span></div>
        <div className="svc-grid">
          {SERVICES.map(s => <ServiceTile key={s.id} s={s}/>)}
        </div>
      </div>

      <div className="sys-shell">
        {/* incidents */}
        <div className="adm-card">
          <div className="adm-card-h"><h3>Recent incidents</h3><span className="sub">last 7 days</span></div>
          <div className="incidents">
            {INCIDENTS.map(i => (
              <div key={i.id} className={`incident sev-${i.sev}`}>
                <div className="incident-h">
                  <span className="incident-id">{i.id}</span>
                  <span className={`incident-state st-${i.state}`}>{i.state}</span>
                  <div className="spacer"/>
                  <span className="incident-time">started {i.started} ago</span>
                </div>
                <div className="incident-title">{i.title}</div>
                <div className="incident-svcs">
                  {i.services.map(svc => <span key={svc} className="svc-chip">{svc}</span>)}
                </div>
                {i.resolved && <div className="incident-res">{i.resolved}</div>}
                <div className="incident-foot">
                  <span>{i.updates} updates</span>
                  <span>·</span>
                  <span>view timeline ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* region map */}
        <div className="adm-card">
          <div className="adm-card-h"><h3>Regions</h3><span className="sub">deploy footprint</span></div>
          <div className="regions">
            {REGIONS.map(r => (
              <div key={r.id} className={`region st-${r.status}`}>
                <div className="region-h">
                  <span className={`led-dot ${r.status==='ok'?'live':r.status==='warn'?'paused':'rollout'}`}/>
                  <span className="region-id">{r.id}</span>
                  {r.primary && <span className="region-primary">PRIMARY</span>}
                </div>
                <div className="region-label">{r.label}</div>
                <div className="region-meta">{r.services} services deployed</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ServiceTile({ s }) {
  const max = Math.max(...s.latencyTrend);
  const min = Math.min(...s.latencyTrend);
  const W=120, H=28;
  const pts = s.latencyTrend.map((v,i)=>{
    const x = (i/(s.latencyTrend.length-1))*W;
    const y = H - ((v-min)/(max-min||1))*(H-2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const trendColor = s.status === 'ok' ? 'hsl(150,70%,55%)' : s.status === 'warn' ? 'hsl(35,90%,60%)' : 'hsl(355,80%,65%)';
  return (
    <div className={`svc-tile st-${s.status}`}>
      <div className="svc-h">
        <span className={`led-dot ${s.status==='ok'?'live':s.status==='warn'?'paused':'rollout'}`}/>
        <span className="svc-name">{s.label}</span>
      </div>
      <div className="svc-stats">
        <div><div className="k">p95 latency</div><div className="v">{s.latency < 1000 ? `${s.latency}ms` : `${(s.latency/1000).toFixed(2)}s`}</div></div>
        <div><div className="k">throughput</div><div className="v">{s.rps.toLocaleString()}<small>/s</small></div></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="svc-spark" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={trendColor} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
      </svg>
      {s.note && <div className="svc-note">{s.note}</div>}
      <div className="svc-foot">
        <span className="svc-region">{s.region}</span>
      </div>
    </div>
  );
}

/* ============================================================================
   ADMIN TEAM
   ============================================================================ */
const ROLES = [
  { id: 'owner',       label: 'Owner',        color: 'hsl(45, 90%, 65%)',  desc: 'Founder · all permissions · billing' },
  { id: 'admin',       label: 'Admin',        color: 'hsl(275, 100%, 72%)', desc: 'Full read/write minus billing' },
  { id: 'support',     label: 'Support',      color: 'hsl(190, 80%, 65%)', desc: 'Refunds · plan changes · tickets' },
  { id: 'safety',      label: 'Trust & safety',color:'hsl(355, 80%, 68%)', desc: 'Forum moderation · bans · flags' },
  { id: 'engineer',    label: 'Engineer',     color: 'hsl(150, 70%, 60%)', desc: 'Read-only ops · deploys · feature flags' },
  { id: 'viewer',      label: 'Viewer',       color: 'hsl(220, 12%, 60%)', desc: 'Read-only · no actions' }
];

const OPERATORS = [
  { id: 'jamie',  name: 'Jamie Park',    email: 'jamie@zenphony.audio',  role: 'owner',    avatar: 'JP', cls: 'av-vs', joined: 'Mar 2022', last: '12m ago',  '2fa': true,  actions30: 142 },
  { id: 'maya',   name: 'Maya Chen',     email: 'maya@zenphony.audio',   role: 'safety',   avatar: 'MC', cls: 'av-bh', joined: 'Sep 2023', last: '34m ago',  '2fa': true,  actions30: 88 },
  { id: 'evan',   name: 'Evan Ortiz',    email: 'evan@zenphony.audio',   role: 'support',  avatar: 'EO', cls: 'av-pr', joined: 'Jan 2024', last: '1h ago',   '2fa': true,  actions30: 214 },
  { id: 'priya',  name: 'Priya Shah',    email: 'priya@zenphony.audio',  role: 'engineer', avatar: 'PS', cls: 'av-lc', joined: 'Jun 2023', last: '4h ago',   '2fa': true,  actions30: 56 },
  { id: 'sasha',  name: 'Sasha Liu',     email: 'sasha@zenphony.audio',  role: 'admin',    avatar: 'SL', cls: 'av-ms', joined: 'Apr 2024', last: '2h ago',   '2fa': true,  actions30: 71 },
  { id: 'theo',   name: 'Theo Nakamura', email: 'theo@zenphony.audio',   role: 'engineer', avatar: 'TN', cls: 'av-vs', joined: 'Aug 2024', last: '8h ago',   '2fa': true,  actions30: 23 },
  { id: 'rin',    name: 'Rin Ahmadi',    email: 'rin@zenphony.audio',    role: 'support',  avatar: 'RA', cls: 'av-bh', joined: 'Feb 2025', last: '3d ago',   '2fa': false, actions30: 12 },
  { id: 'leo',    name: 'Leo Morales',   email: 'leo@zenphony.audio',    role: 'viewer',   avatar: 'LM', cls: 'av-pr', joined: 'Apr 2026', last: '11d ago',  '2fa': true,  actions30: 0 }
];

const PENDING_INVITES = [
  { email: 'kira@zenphony.audio',  role: 'support',  invitedBy: 'evan@', sent: '2d ago',  expires: '5d' },
  { email: 'omar@zenphony.audio',  role: 'engineer', invitedBy: 'priya@', sent: '5h ago', expires: '7d' }
];

const CAPABILITIES = [
  { group: 'Users',        caps: [
    { id: 'u_read',   label: 'View users',           roles: ['owner','admin','support','safety','engineer','viewer'] },
    { id: 'u_edit',   label: 'Edit user details',    roles: ['owner','admin','support'] },
    { id: 'u_impersonate', label: 'Impersonate session', roles: ['owner','admin'] },
    { id: 'u_ban',    label: 'Ban / suspend',        roles: ['owner','admin','safety'] }
  ]},
  { group: 'Billing',      caps: [
    { id: 'b_read',   label: 'View subscriptions',   roles: ['owner','admin','support','viewer'] },
    { id: 'b_refund', label: 'Issue refunds',        roles: ['owner','admin','support'] },
    { id: 'b_plan',   label: 'Change plans',         roles: ['owner','admin','support'] },
    { id: 'b_invoice',label: 'Edit invoices',        roles: ['owner'] }
  ]},
  { group: 'Product',      caps: [
    { id: 'p_flags',  label: 'Toggle feature flags', roles: ['owner','admin','engineer'] },
    { id: 'p_deploy', label: 'Trigger deploys',      roles: ['owner','admin','engineer'] },
    { id: 'p_forum',  label: 'Moderate forum',       roles: ['owner','admin','safety'] }
  ]},
  { group: 'Operations',   caps: [
    { id: 'o_audit',  label: 'View audit log',       roles: ['owner','admin','engineer','safety'] },
    { id: 'o_admins', label: 'Manage admin team',    roles: ['owner'] },
    { id: 'o_settings', label: 'Edit org settings',  roles: ['owner','admin'] }
  ]}
];

function AdminsScreen({ selectedOp, setSelectedOp }) {
  const sel = OPERATORS.find(o=>o.id===selectedOp) || OPERATORS[0];
  const role = ROLES.find(r=>r.id===sel.role);
  const [inviteOpen, setInviteOpen] = useSt5(false);
  const [inviteKind, setInviteKind] = useSt5(null); // 'admin' | 'distributor' | null (chooser)
  const [inviteEmail, setInviteEmail] = useSt5('');
  const [inviteRole, setInviteRole] = useSt5('admin');
  const [inviteName, setInviteName] = useSt5('');

  const closeInvite = () => { setInviteOpen(false); setInviteKind(null); setInviteEmail(''); setInviteName(''); };

  return (
    <>
      <div className="adm-page-h">
        <div><h1>Admin team</h1><div className="sub">{OPERATORS.length} operators · {PENDING_INVITES.length} pending invites · {OPERATORS.filter(o=>!o['2fa']).length} without 2FA</div></div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost">Export roster</button>
          <button className="adm-btn adm-btn-primary" onClick={()=>{setInviteOpen(true); setInviteKind(null);}}><AIcon name="plus"/> Invite…</button>
        </div>
      </div>

      {inviteOpen && (
        <div className="invite-modal-bg" onClick={closeInvite}>
          <div className="invite-modal" onClick={e=>e.stopPropagation()}>
            {inviteKind === null && (
              <>
                <div className="adm-card-h"><h3>Send an invite</h3><span className="sub">choose what to invite</span></div>
                <div className="invite-chooser">
                  <button className="invite-choice" onClick={()=>setInviteKind('admin')}>
                    <span className="invite-choice-ico" style={{background:'hsl(280,80%,70%)22',color:'hsl(280,80%,70%)',borderColor:'hsl(280,80%,70%)55'}}><AIcon name="key"/></span>
                    <div>
                      <div className="invite-choice-h">Admin</div>
                      <div className="invite-choice-sub">Internal Zenphony operator. Has access to this Admin Hub.</div>
                    </div>
                    <span className="invite-choice-arrow">→</span>
                  </button>
                  <button className="invite-choice" onClick={()=>{setInviteKind('distributor'); setInviteRole('distributor');}}>
                    <span className="invite-choice-ico" style={{background:'hsl(28,90%,60%)22',color:'hsl(28,90%,60%)',borderColor:'hsl(28,90%,60%)55'}}><AIcon name="users"/></span>
                    <div>
                      <div className="invite-choice-h">Distributor</div>
                      <div className="invite-choice-sub">External partner. Gets their own Distributor panel and can invite dealers under them.</div>
                    </div>
                    <span className="invite-choice-arrow">→</span>
                  </button>
                </div>
              </>
            )}

            {inviteKind === 'admin' && (
              <>
                <div className="adm-card-h">
                  <h3>Invite admin</h3>
                  <span className="sub">internal Zenphony operator</span>
                </div>
                <div className="invite-form">
                  <div className="invite-field">
                    <label>Email</label>
                    <input type="email" placeholder="name@zenphony.audio" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}/>
                  </div>
                  <div className="invite-field">
                    <label>Role</label>
                    <div className="invite-seg">
                      {['admin','support','safety','engineer','viewer'].map(r=>(
                        <button key={r} className={`invite-seg-b ${inviteRole===r?'on':''}`} onClick={()=>setInviteRole(r)}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div className="invite-actions">
                    <button className="adm-btn adm-btn-ghost" onClick={()=>setInviteKind(null)}>← Back</button>
                    <button className="adm-btn adm-btn-ghost" onClick={closeInvite}>Cancel</button>
                    <button className="adm-btn adm-btn-primary" disabled={!inviteEmail}>Send invite</button>
                  </div>
                </div>
              </>
            )}

            {inviteKind === 'distributor' && (
              <>
                <div className="adm-card-h">
                  <h3>Invite distributor</h3>
                  <span className="sub">external partner with their own panel</span>
                </div>
                <div className="invite-form">
                  <div className="invite-field">
                    <label>Distributor business name</label>
                    <input placeholder="e.g. ILIO" value={inviteName} onChange={e=>setInviteName(e.target.value)}/>
                  </div>
                  <div className="invite-field">
                    <label>Primary contact email</label>
                    <input type="email" placeholder="contact@distributor.com" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}/>
                  </div>
                  <div className="invite-field">
                    <label>Region</label>
                    <div className="invite-seg">
                      {['North America','Europe','LATAM','APAC','Other'].map(r=>(
                        <button key={r} className={`invite-seg-b ${inviteRole===r?'on':''}`} onClick={()=>setInviteRole(r)}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div className="invite-hint">
                    Once accepted, they'll get a Distributor admin panel where they can manage their dealers, see subscription margins, and grab plugin/Hub installers — but they cannot invite Zenphony admins.
                  </div>
                  <div className="invite-actions">
                    <button className="adm-btn adm-btn-ghost" onClick={()=>setInviteKind(null)}>← Back</button>
                    <button className="adm-btn adm-btn-ghost" onClick={closeInvite}>Cancel</button>
                    <button className="adm-btn adm-btn-primary" disabled={!inviteEmail || !inviteName}>Send invite</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="team-shell">
        {/* roster */}
        <div className="adm-card team-roster">
          <div className="adm-card-h"><h3>Operators</h3><span className="sub">click for details</span></div>
          <div className="op-list">
            {OPERATORS.map(o => {
              const r = ROLES.find(x=>x.id===o.role);
              const sel2 = o.id===sel.id;
              return (
                <div key={o.id} className={`op-row ${sel2?'is-selected':''}`} onClick={()=>setSelectedOp(o.id)}>
                  <span className={`mini-avatar ${o.cls}`}>{o.avatar}</span>
                  <div className="op-id">
                    <div className="op-name">{o.name}</div>
                    <div className="op-email">{o.email}</div>
                  </div>
                  <span className="role-pill" style={{borderColor: r.color+'55', color: r.color}}>{r.label}</span>
                  <span className="op-last">{o.last}</span>
                  {!o['2fa'] && <span className="op-no2fa" title="No 2FA"><AIcon name="alert"/></span>}
                </div>
              );
            })}
          </div>

          {PENDING_INVITES.length>0 && (
            <>
              <div className="adm-card-h" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                <h3>Pending invites</h3><span className="sub">expires after 7 days</span>
              </div>
              <div className="op-list">
                {PENDING_INVITES.map((inv,i)=>{
                  const r = ROLES.find(x=>x.id===inv.role);
                  return (
                    <div key={i} className="op-row pending">
                      <span className="mini-avatar" style={{background:'rgba(255,255,255,0.04)',border:'1px dashed rgba(255,255,255,0.18)',color:'var(--muted-foreground)'}}>?</span>
                      <div className="op-id">
                        <div className="op-name" style={{color:'var(--muted-foreground)'}}>{inv.email}</div>
                        <div className="op-email">invited by {inv.invitedBy} · {inv.sent}</div>
                      </div>
                      <span className="role-pill" style={{borderColor: r.color+'55', color: r.color}}>{r.label}</span>
                      <span className="op-last">expires {inv.expires}</span>
                      <button className="adm-btn adm-btn-ghost" style={{padding:'2px 8px',fontSize:10}}>Resend</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* operator detail */}
        <div className="adm-card team-detail">
          <div className="adm-card-h"><h3>{sel.name}</h3><span className="sub">{sel.email}</span></div>
          <div style={{padding:'14px 18px 18px',display:'flex',flexDirection:'column',gap:14}}>
            <div className="op-detail-h">
              <span className={`mini-avatar ${sel.cls}`} style={{width:48,height:48,fontSize:14}}>{sel.avatar}</span>
              <div>
                <div className="op-detail-name">{sel.name}</div>
                <div className="op-detail-meta">
                  <span className="role-pill" style={{borderColor: role.color+'55', color: role.color}}>{role.label}</span>
                  <span style={{color:'var(--muted-foreground)',fontSize:11,fontFamily:'var(--font-mono)'}}>{role.desc}</span>
                </div>
              </div>
            </div>
            <div className="build-stats">
              <div className="build-stat"><div className="k">Joined</div><div className="v" style={{fontSize:14}}>{sel.joined}</div><div className="s">on the team</div></div>
              <div className="build-stat"><div className="k">Last active</div><div className="v" style={{fontSize:14}}>{sel.last}</div><div className="s">admin console</div></div>
              <div className="build-stat"><div className="k">Actions · 30d</div><div className="v">{sel.actions30}</div><div className="s">audited operations</div></div>
              <div className="build-stat"><div className="k">2FA</div><div className="v" style={{fontSize:13,color:sel['2fa']?'hsl(150,70%,72%)':'hsl(355,80%,72%)'}}>{sel['2fa']?'enabled':'NOT enabled'}</div><div className="s">{sel['2fa']?'authenticator app':'security risk'}</div></div>
            </div>
            <div className="op-actions">
              <button className="adm-btn adm-btn-ghost">View audit trail</button>
              <button className="adm-btn adm-btn-ghost">Reset password</button>
              <button className="adm-btn adm-btn-ghost">Change role</button>
              <button className="adm-btn adm-btn-ghost danger">Remove from team</button>
            </div>
          </div>
        </div>
      </div>

      {/* permission matrix */}
      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h"><h3>Permission matrix</h3><span className="sub">capabilities × roles</span></div>
        <div className="perm-matrix">
          <div className="perm-row perm-head">
            <div></div>
            {ROLES.map(r => <div key={r.id} className="perm-role" style={{color: r.color}}>{r.label}</div>)}
          </div>
          {CAPABILITIES.map(group => (
            <React.Fragment key={group.group}>
              <div className="perm-group">{group.group}</div>
              {group.caps.map(cap => (
                <div key={cap.id} className="perm-row">
                  <div className="perm-cap">{cap.label}</div>
                  {ROLES.map(r => (
                    <div key={r.id} className="perm-cell">
                      {cap.roles.includes(r.id) ? (
                        <span className="perm-yes" style={{background: r.color+'22', color: r.color, borderColor: r.color+'55'}}>●</span>
                      ) : (
                        <span className="perm-no">—</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   SETTINGS
   ============================================================================ */
const INTEGRATIONS = [
  { id: 'stripe',     name: 'Stripe',           desc: 'Billing · subscriptions · invoices', status: 'connected', meta: 'acct_1Q...8nP · live mode',         color:'hsl(258, 80%, 70%)' },
  { id: 'slack',      name: 'Slack',            desc: 'Alerts → #ops-alerts · #incidents',  status: 'connected', meta: 'workspace zenphony · 3 channels',   color:'hsl(45, 90%, 62%)' },
  { id: 'pagerduty',  name: 'PagerDuty',        desc: 'Critical incident escalation',       status: 'connected', meta: 'on-call rotation · 5 responders',   color:'hsl(150, 70%, 60%)' },
  { id: 'sentry',     name: 'Sentry',           desc: 'Error tracking · plugin + console',  status: 'connected', meta: 'project zenphony-prod · 4.1k events 24h', color:'hsl(280, 80%, 70%)' },
  { id: 'segment',    name: 'Segment',          desc: 'Product analytics pipeline',         status: 'connected', meta: 'source: web + plugin · 12 destinations', color:'hsl(190, 80%, 65%)' },
  { id: 'github',     name: 'GitHub',           desc: 'Deploys · PR previews',              status: 'connected', meta: 'org zenphony-audio · 14 repos',     color:'hsl(220, 12%, 70%)' },
  { id: 'clerk',      name: 'Clerk',            desc: 'User authentication',                status: 'connected', meta: 'app prod_zen · OAuth + magic link', color:'hsl(35, 90%, 65%)' },
  { id: 'cloudflare', name: 'Cloudflare',       desc: 'CDN · binary distribution',          status: 'connected', meta: 'zone zenphony.audio · 47 PoPs',     color:'hsl(28, 90%, 60%)' },
  { id: 'datadog',    name: 'Datadog',          desc: 'Infra metrics · logs',               status: 'disconnected', meta: 'evaluate Q3 · trial expired',   color:'hsl(275, 80%, 70%)' }
];

function SettingsScreen() {
  return (
    <>
      <div className="adm-page-h">
        <div><h1>Settings</h1><div className="sub">Org configuration · integrations · session policy · danger zone</div></div>
        <div className="spacer"/>
      </div>

      {/* org */}
      <div className="adm-card">
        <div className="adm-card-h"><h3>Organization</h3><span className="sub">visible to all admins</span></div>
        <div className="settings-form">
          <SettingRow label="Display name" value="Zenphony Audio" hint="Shown in console header and outbound emails" editable/>
          <SettingRow label="Primary domain" value="zenphony.audio" mono/>
          <SettingRow label="Support email" value="support@zenphony.audio" mono editable/>
          <SettingRow label="Operating timezone" value="America/New_York" hint="Used for daily/weekly reports"/>
          <SettingRow label="Brand color" value="#A855F7" mono swatch="#A855F7"/>
          <SettingRow label="Plugin update channel" value="stable + canary opt-in" hint="Controls what end-users see in their plugin update dialog"/>
        </div>
      </div>

      {/* integrations */}
      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h"><h3>Integrations</h3><span className="sub">{INTEGRATIONS.filter(i=>i.status==='connected').length} connected · {INTEGRATIONS.filter(i=>i.status!=='connected').length} available</span></div>
        <div className="integrations">
          {INTEGRATIONS.map(i => (
            <div key={i.id} className={`integration ${i.status}`}>
              <div className="integration-icon" style={{background: i.color+'22', color: i.color, borderColor: i.color+'55'}}>{i.name.slice(0,2).toUpperCase()}</div>
              <div className="integration-body">
                <div className="integration-h">
                  <span className="integration-name">{i.name}</span>
                  <span className={`integration-status ${i.status}`}>
                    <span className={`led-dot ${i.status==='connected'?'live':'paused'}`}/>
                    {i.status}
                  </span>
                </div>
                <div className="integration-desc">{i.desc}</div>
                <div className="integration-meta">{i.meta}</div>
              </div>
              <button className="adm-btn adm-btn-ghost" style={{alignSelf:'center'}}>{i.status==='connected'?'Configure':'Connect'}</button>
            </div>
          ))}
        </div>
      </div>

      {/* session + security */}
      <div className="settings-grid" style={{marginTop:14}}>
        <div className="adm-card">
          <div className="adm-card-h"><h3>Session policy</h3><span className="sub">applies to all admin operators</span></div>
          <div className="settings-form">
            <SettingRow label="Idle timeout" value="30 minutes" toggle="on"/>
            <SettingRow label="Hard expiry" value="8 hours" hint="Forces re-auth"/>
            <SettingRow label="Require 2FA" value="enforced" toggle="on"/>
            <SettingRow label="Allowed IP ranges" value="any" hint="Lock down for compliance"/>
            <SettingRow label="Audit log retention" value="365 days" hint="Forever for owner-level actions"/>
          </div>
        </div>
        <div className="adm-card">
          <div className="adm-card-h"><h3>API tokens</h3><span className="sub">programmatic access</span></div>
          <div className="tokens">
            <div className="token-row">
              <div>
                <div className="token-name">ci-deploys</div>
                <div className="token-meta">scopes: deploy, flags · last used 12m ago</div>
              </div>
              <code>zen_pk_•••••8a2c</code>
              <button className="adm-btn adm-btn-ghost" style={{padding:'4px 10px'}}>Rotate</button>
            </div>
            <div className="token-row">
              <div>
                <div className="token-name">analytics-read</div>
                <div className="token-meta">scopes: read:* · last used 3h ago</div>
              </div>
              <code>zen_pk_•••••91f0</code>
              <button className="adm-btn adm-btn-ghost" style={{padding:'4px 10px'}}>Rotate</button>
            </div>
            <div className="token-row">
              <div>
                <div className="token-name">stripe-reconcile</div>
                <div className="token-meta">scopes: billing:write · last used 14d ago</div>
              </div>
              <code>zen_pk_•••••4ab3</code>
              <button className="adm-btn adm-btn-ghost" style={{padding:'4px 10px'}}>Rotate</button>
            </div>
            <button className="adm-btn adm-btn-primary" style={{alignSelf:'flex-start',marginTop:8}}><AIcon name="plus"/> Create token</button>
          </div>
        </div>
      </div>

      {/* danger zone */}
      <div className="adm-card danger-zone" style={{marginTop:14}}>
        <div className="adm-card-h">
          <h3 style={{color:'hsl(355,80%,75%)'}}>Danger zone</h3>
          <span className="sub">requires owner role · 2FA challenge · audited</span>
        </div>
        <div className="danger-list">
          <div className="danger-row">
            <div><div className="danger-name">Rotate signing certificates</div><div className="danger-meta">Forces re-notarization of next plugin build · ~6h propagation</div></div>
            <button className="adm-btn adm-btn-ghost danger">Rotate</button>
          </div>
          <div className="danger-row">
            <div><div className="danger-name">Wipe staging environment</div><div className="danger-meta">Deletes all staging data · users, sessions, flags · cannot be undone</div></div>
            <button className="adm-btn adm-btn-ghost danger">Wipe staging</button>
          </div>
          <div className="danger-row">
            <div><div className="danger-name">Transfer ownership</div><div className="danger-meta">Moves billing + ultimate authority to another admin · 7-day cooldown</div></div>
            <button className="adm-btn adm-btn-ghost danger">Transfer</button>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingRow({ label, value, hint, mono, swatch, toggle, editable }) {
  return (
    <div className="setting-row">
      <div className="setting-l">
        <div className="setting-label">{label}</div>
        {hint && <div className="setting-hint">{hint}</div>}
      </div>
      <div className="setting-v">
        {swatch && <span className="setting-swatch" style={{background: swatch}}/>}
        <span className={mono?'setting-value mono':'setting-value'}>{value}</span>
        {toggle && <span className={`setting-toggle ${toggle}`}><span/></span>}
        {editable && <button className="setting-edit">Edit</button>}
      </div>
    </div>
  );
}

/* ============================================================================
   HUB BUILDS — desktop Software Hub app: version list + uploader
   ============================================================================ */
const HUB_VERSIONS = [
  { v: '1.6.0', date: 'May 02', state: 'current',  adoption: 0.62, channel: 'stable', notes: 'New plugin scanner · Apple Silicon perf pass · auto-update fix', size: '142 MB', dl24: 5240 },
  { v: '1.5.4', date: 'Apr 18', state: 'previous', adoption: 0.27, channel: 'stable', notes: 'Hotfix · macOS 14.4 keychain prompt loop', size: '141 MB', dl24: 980 },
  { v: '1.5.3', date: 'Mar 30', state: 'previous', adoption: 0.09, channel: 'stable', notes: 'Win 11 22H2 installer signing fix', size: '140 MB', dl24: 220 },
  { v: '1.5.0', date: 'Feb 11', state: 'eol',      adoption: 0.02, channel: 'stable', notes: 'Last 1.5.0 · EOL Aug 1', size: '138 MB', dl24: 40 }
];

function HubBuildsScreen() {
  const [sel, setSel] = useSt5(HUB_VERSIONS[0].v);
  const [drag, setDrag] = useSt5(false);
  const [staged, setStaged] = useSt5(null); // { name, size, channel, notes }
  const [channel, setChannel] = useSt5('beta');
  const [notes, setNotes] = useSt5('');
  const current = HUB_VERSIONS.find(v => v.v === sel) || HUB_VERSIONS[0];

  const onPick = (file) => {
    if (!file) return;
    setStaged({ name: file.name, size: (file.size/1024/1024).toFixed(1) + ' MB' });
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    onPick(e.dataTransfer.files && e.dataTransfer.files[0]);
  };

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Hub builds</h1>
          <div className="sub">Zenphony Audio Software Hub · 4 versions live · 23,118 active installs · last release 4d ago</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="download"/> Release notes</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="plus"/> Cut new build</button>
        </div>
      </div>

      {/* Uploader */}
      <div className="adm-card">
        <div className="adm-card-h">
          <h3>Upload a new Software Hub build</h3>
          <span className="sub">drag a signed installer (.dmg / .pkg / .exe / .msi) or browse</span>
        </div>
        <div className="adm-card-body" style={{padding:'18px 22px 22px',display:'flex',flexDirection:'column',gap:14}}>
          <label
            className={`hub-drop ${drag ? 'is-drag' : ''} ${staged ? 'has-file' : ''}`}
            onDragOver={(e)=>{e.preventDefault(); setDrag(true);}}
            onDragLeave={()=>setDrag(false)}
            onDrop={onDrop}
          >
            <input type="file" accept=".dmg,.pkg,.exe,.msi,.zip" style={{display:'none'}}
                   onChange={(e)=>onPick(e.target.files && e.target.files[0])} />
            <div className="hub-drop-glyph"><AIcon name="download"/></div>
            {staged ? (
              <>
                <div className="hub-drop-title">{staged.name}</div>
                <div className="hub-drop-sub">{staged.size} · ready to publish</div>
              </>
            ) : (
              <>
                <div className="hub-drop-title">Drop installer here, or click to browse</div>
                <div className="hub-drop-sub">macOS .dmg / .pkg · Windows .exe / .msi · max 500 MB</div>
              </>
            )}
          </label>

          <div className="hub-meta-row">
            <div className="hub-meta-col">
              <label className="hub-lbl">Release channel</label>
              <div className="hub-seg">
                {['canary','beta','stable'].map(c => (
                  <button key={c}
                    className={`hub-seg-b ${channel === c ? 'on' : ''}`}
                    onClick={()=>setChannel(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className="hub-meta-col grow">
              <label className="hub-lbl">Release notes</label>
              <textarea className="hub-notes" rows="2" value={notes}
                placeholder="What changed in this build?"
                onChange={(e)=>setNotes(e.target.value)} />
            </div>
          </div>

          <div className="build-actions" style={{justifyContent:'flex-end'}}>
            <button className="adm-btn adm-btn-ghost" onClick={()=>{setStaged(null); setNotes('');}}>Discard</button>
            <button className="adm-btn adm-btn-primary" disabled={!staged}>
              <AIcon name="download"/> Publish to {channel}
            </button>
          </div>
        </div>
      </div>

      {/* Existing builds list */}
      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h">
          <h3>Live builds</h3>
          <span className="sub">click a row to inspect</span>
        </div>
        <div style={{padding:'4px 0 6px'}}>
          {HUB_VERSIONS.map(v => (
            <div key={v.v}
              onClick={()=>setSel(v.v)}
              className={`hub-row ${sel === v.v ? 'is-sel' : ''}`}>
              <div className="hub-v">{v.v} <span className={`build-pill ${v.state}`}>{v.state}</span></div>
              <div className="hub-date">{v.date} · {v.channel}</div>
              <div className="hub-notes-cell">{v.notes}</div>
              <div className="hub-size">{v.size}</div>
              <div className="hub-adopt"><div className="hub-adopt-bar"><span style={{width:`${v.adoption*100}%`}}/></div><span>{(v.adoption*100).toFixed(0)}%</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected build detail */}
      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h">
          <h3>{current.v} <span className={`build-pill ${current.state}`}>{current.state}</span></h3>
          <span className="sub">released {current.date} · {current.channel} channel · {current.size}</span>
        </div>
        <div style={{padding:'14px 18px 18px',display:'flex',flexDirection:'column',gap:14}}>
          <div className="build-stats">
            <div className="build-stat"><div className="k">Adoption</div><div className="v">{(current.adoption*100).toFixed(0)}<small>%</small></div><div className="s">of installed base</div></div>
            <div className="build-stat"><div className="k">Downloads · 24h</div><div className="v">{current.dl24.toLocaleString()}</div><div className="s">across mac + windows</div></div>
            <div className="build-stat"><div className="k">macOS</div><div className="v" style={{fontSize:13,color:'hsl(150,70%,72%)'}}>notarized</div><div className="s">Apple notary chain</div></div>
            <div className="build-stat"><div className="k">Windows</div><div className="v" style={{fontSize:13,color:'hsl(150,70%,72%)'}}>signed</div><div className="s">EV cert · DigiCert</div></div>
          </div>
          <div className="build-notes">
            <div className="build-notes-h">Release notes</div>
            <p>{current.notes}</p>
          </div>
          <div className="build-actions">
            <button className="adm-btn adm-btn-ghost">View changelog</button>
            <button className="adm-btn adm-btn-ghost">Download installer</button>
            {current.state === 'previous' && <button className="adm-btn adm-btn-ghost">Rollback to {current.v}</button>}
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { PluginScreen, HubBuildsScreen, SystemScreen, AdminsScreen, SettingsScreen });
