/* ============================================================================
   ADMIN PHASE 4 — Forum soundboard · Flags mixing console · Audit waveform
   ============================================================================ */
const { useState: useSt4, useMemo: useMm4, useEffect: useEf4, useRef: useRf4 } = React;

/* ---------- forum data ---------- */
const FORUM_CATEGORIES = [
  { id: 'mastering', label: 'Mastering chains', color: 'hsl(275,80%,68%)' },
  { id: 'genres',    label: 'Genre tips',       color: 'hsl(190,80%,65%)' },
  { id: 'feedback',  label: 'Feedback room',    color: 'hsl(150,70%,60%)' },
  { id: 'bugs',      label: 'Bugs & fixes',     color: 'hsl(35,90%,65%)' },
  { id: 'meta',      label: 'Meta',             color: 'hsl(220,12%,68%)' }
];

const THREADS = [
  {
    id: 'thr_8841', cat: 'mastering', title: 'Pearl on lo-fi hip-hop sounds too tight after v2.4', signal: 0.92, flags: 0,
    author: 'admin@lofi-coop.org', replies: 34, views: 1290, lastAt: '12m', state: 'hot', staffEyes: false,
    excerpt: 'Anyone else feel like the new Pearl model is choking out tape saturation? My usual chain (Velvet Bus → Pearl → Streaming Safe) is reading 2dB hotter but feels less dimensional.',
    posts: [
      { id: 1, author: 'admin@lofi-coop.org', avatar: 'LC', cls: 'av-lc',  trust: 4, time: '2h', body: "Anyone else feel like the new Pearl model is choking out tape saturation? My usual chain (Velvet Bus → Pearl → Streaming Safe) is reading 2dB hotter but feels less dimensional. Is this a side-effect of the v3 fallback path I'm seeing in my session logs?" },
      { id: 2, author: 'maya@blueheronstudios.com', avatar: 'BH', cls: 'av-bh', trust: 5, time: '1h', body: 'Confirmed on three of my projects this week. Backing off the input gain by 1.5dB and adding a Vinyl Warmth stage in front of Pearl restores most of it. Not ideal but it works.' },
      { id: 3, author: 'jamie@velvetstatic.fm', avatar: 'VS', cls: 'av-vs', trust: 5, time: '54m', body: 'Same here. Filed a bug — sess_912340. Pearl is hitting the v3 weights when input has heavy sub content. We have a fix queued for 2.4.2.', staff: true },
      { id: 4, author: 'priya@homestudio.io', avatar: 'PR', cls: 'av-pr', trust: 3, time: '21m', body: 'Wait, staff confirms. Going to roll back to 2.4.0 in the meantime, thanks @jamie 🙏' }
    ]
  },
  {
    id: 'thr_8839', cat: 'feedback', title: 'Track feedback: ambient piano EP, looking for tonal balance notes', signal: 0.78, flags: 0,
    author: 'sasha@modernsounds.studio', replies: 18, views: 612, lastAt: '38m', state: 'active',
    excerpt: 'Six tracks, all solo piano with light room reverb. Mastered with the new Vinyl Warmth preset. Curious if the 200-400Hz region feels muddy on monitors vs headphones.'
  },
  {
    id: 'thr_8836', cat: 'mastering', title: 'Streaming Safe preset clipping on bass-heavy material', signal: 0.71, flags: 1,
    author: 'omar@lateblock.beats', replies: 22, views: 880, lastAt: '1h', state: 'active', staffEyes: true,
    excerpt: 'Streaming Safe is supposed to keep me at -14 LUFS / -1 dBTP but on 808-heavy mixes I am getting -0.3 dBTP intermittently. Reproducible.'
  },
  {
    id: 'thr_8834', cat: 'bugs', title: 'Reaper 7.20 + Zenphony plugin = silent crash on bypass', signal: 0.65, flags: 0,
    author: 'riley@nightowl.studio', replies: 11, views: 410, lastAt: '2h', state: 'active', staffEyes: true,
    excerpt: 'Specifically when I bypass the plugin while a render is in progress, Reaper goes silent and I have to relaunch. Logs attached.'
  },
  {
    id: 'thr_8831', cat: 'genres', title: 'Hip-hop glue: chain order matters more than I expected', signal: 0.58, flags: 0,
    author: 'dre@subterra.audio', replies: 27, views: 1130, lastAt: '3h', state: 'active',
    excerpt: 'Putting Hip-hop Glue *after* Streaming Safe instead of before changed the entire feel. Sharing my findings + a/b clips.'
  },
  {
    id: 'thr_8829', cat: 'meta', title: 'Forum search is missing recent threads from category filter', signal: 0.31, flags: 0,
    author: 'team@parallaxrecords.co', replies: 4, views: 88, lastAt: '4h', state: 'quiet'
  },
  {
    id: 'thr_8826', cat: 'feedback', title: 'CHEAP MASTERING SERVICES DM ME 🔥🔥🔥', signal: 0.04, flags: 8,
    author: 'mastergurupro2024', replies: 1, views: 24, lastAt: '5h', state: 'flagged',
    excerpt: 'Get pro mastering for $5! DM telegram @mastergurupro for unlimited tracks 100% guaranteed loudness ⚡️',
    flagReasons: ['Spam (8)', 'New account · 0 trust', 'External link in body']
  },
  {
    id: 'thr_8824', cat: 'mastering', title: 'Pearl v4.2 changelog speculation thread', signal: 0.62, flags: 0,
    author: 'evan@coastline.records', replies: 19, views: 740, lastAt: '6h', state: 'active'
  }
];

/* ---------- screens ---------- */
function ForumScreen({ selectedId, setSelectedId }) {
  const [cat, setCat] = useSt4('all');
  const visible = useMm4(() => cat === 'all' ? THREADS : THREADS.filter(t => t.cat === cat), [cat]);
  const selected = THREADS.find(t => t.id === selectedId) || THREADS[0];

  return (
    <>
      <div className="adm-page-h">
        <div><h1>Forum · soundboard</h1><div className="sub">Live channel strips · 7 flagged · 142 active threads · staff eyes on 4</div></div>
        <div className="spacer"/>
        <div className="actions">
          <div className="adm-segctl"><button className="on">Channel strips</button><button>Compact list</button></div>
          <button className="adm-btn adm-btn-ghost"><AIcon name="user"/> Staff post</button>
        </div>
      </div>

      <div className="uf-segs">
        <button className={`uf-seg ${cat==='all'?'on':''}`} onClick={()=>setCat('all')}>All categories<span className="badge">{THREADS.length}</span></button>
        {FORUM_CATEGORIES.map(c => {
          const n = THREADS.filter(t=>t.cat===c.id).length;
          return <button key={c.id} className={`uf-seg ${cat===c.id?'on':''}`} onClick={()=>setCat(c.id)}>{c.label}<span className="badge">{n}</span></button>;
        })}
        <button className="uf-seg warn" onClick={()=>{}}>Flagged<span className="badge">{THREADS.filter(t=>t.flags>0).length}</span></button>
      </div>

      <div className="forum-shell">
        <div className="adm-card forum-board">
          <div className="forum-board-h">
            <span className="meta">Channel strips · signal = engagement velocity</span>
            <div className="spacer"/>
            <span className="meta">Sort: signal ↓</span>
          </div>
          <div className="strips">
            {visible.map(t => <ThreadStrip key={t.id} t={t} active={t.id===selected.id} onPick={()=>setSelectedId(t.id)} />)}
          </div>
        </div>
        <div className="adm-card forum-thread">
          <ThreadView t={selected} />
        </div>
      </div>
    </>
  );
}

function ThreadStrip({ t, active, onPick }) {
  const cat = FORUM_CATEGORIES.find(c=>c.id===t.cat) || FORUM_CATEGORIES[0];
  const bars = 24;
  return (
    <div className={`strip ${active?'is-active':''} ${t.state==='flagged'?'is-flagged':''}`} onClick={onPick}>
      <div className="strip-head">
        <span className="cat-dot" style={{background: cat.color}}/>
        <div className="strip-title">{t.title}</div>
        {t.flags>0 && <span className="led overload" title={`${t.flags} flags`}>FLAG</span>}
        {t.staffEyes && <span className="led staff" title="Staff watching">EYES</span>}
        {t.state==='hot' && <span className="led hot">HOT</span>}
      </div>
      <div className="strip-meter">
        {Array.from({length:bars}).map((_,i)=>{
          const lit = i/bars < t.signal;
          const peak = i/bars >= 0.85 && lit;
          return <span key={i} className={`bar ${lit?'on':''} ${peak?'peak':''}`}/>;
        })}
      </div>
      <div className="strip-meta">
        <span className="cat-tag" style={{color: cat.color, borderColor: cat.color+'33'}}>{cat.label}</span>
        <span className="m">{t.replies} replies</span>
        <span className="m">{t.views} views</span>
        <div className="spacer"/>
        <span className="m">{t.author}</span>
        <span className="m">·</span>
        <span className="m">{t.lastAt} ago</span>
      </div>
      <div className="strip-faders">
        <Fader label="Pin"      pos={active?0.7:0.2}/>
        <Fader label="Lock"     pos={t.state==='flagged'?0.8:0.1}/>
        <Fader label="Boost"    pos={t.signal*0.85}/>
        <Fader label="Mute"     pos={t.flags>0?0.6:0.05}/>
      </div>
    </div>
  );
}

function Fader({ label, pos }) {
  return (
    <div className="fader">
      <div className="fader-track">
        <span className="fader-cap" style={{bottom: `calc(${pos*100}% - 5px)`}}/>
      </div>
      <div className="fader-l">{label}</div>
    </div>
  );
}

function ThreadView({ t }) {
  if (!t) return <div className="ud-empty"><div className="glyph"><AIcon name="forum"/></div><h3>No thread selected</h3></div>;
  const cat = FORUM_CATEGORIES.find(c=>c.id===t.cat) || FORUM_CATEGORIES[0];
  const posts = t.posts || [{id:1,author:t.author,avatar:t.author.slice(0,2).toUpperCase(),trust:3,time:t.lastAt,body:t.excerpt||'(no body in mock)'}];
  return (
    <>
      <div className="thread-h">
        <div className="thread-cat" style={{color: cat.color, borderColor: cat.color+'33'}}>{cat.label}</div>
        <h2>{t.title}</h2>
        <div className="thread-meta">
          <span>{t.replies} replies</span>
          <span>·</span>
          <span>{t.views} views</span>
          <span>·</span>
          <span>started by {t.author}</span>
          {t.flags>0 && <><span>·</span><span style={{color:'hsl(355,80%,72%)'}}>{t.flags} flag{t.flags>1?'s':''}</span></>}
        </div>
      </div>

      {t.flagReasons && (
        <div className="thread-flag-card">
          <div className="thread-flag-h"><AIcon name="alert"/> Flagged for review</div>
          <ul>{t.flagReasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
          <div className="thread-flag-actions">
            <button className="adm-btn adm-btn-ghost">Approve</button>
            <button className="adm-btn adm-btn-ghost">Hide</button>
            <button className="adm-btn adm-btn-primary" style={{background:'hsl(355,75%,55%)'}}>Remove + ban author</button>
          </div>
        </div>
      )}

      <div className="thread-posts">
        {posts.map((p,i)=>(
          <div key={p.id} className={`post ${p.staff?'is-staff':''}`}>
            <div className={`post-av ${p.cls||''}`}>{p.avatar}</div>
            <div className="post-body">
              <div className="post-h">
                <span className="post-author">{p.author}</span>
                {p.staff && <span className="post-staff">STAFF</span>}
                <span className="post-trust">trust {p.trust}/5</span>
                <div className="spacer"/>
                <span className="post-time">{p.time} ago</span>
              </div>
              <div className="post-text">{p.body}</div>
              <div className="post-actions">
                <span>↑ helpful</span>
                <span>· quote</span>
                <span>· flag</span>
                {!p.staff && <span>· moderate ▾</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="thread-reply">
        <div className="thread-reply-h">Reply as staff</div>
        <div className="thread-reply-box">Type a response… (staff replies are highlighted in the thread)</div>
        <div className="thread-reply-actions">
          <button className="adm-btn adm-btn-ghost">Save draft</button>
          <button className="adm-btn adm-btn-primary">Post reply</button>
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   FEATURE FLAGS — mixing console
   ============================================================================ */
const FLAGS = [
  { id: 'pearl_v5_beta',     name: 'Pearl v5 (beta)',          group: 'Plugin',  rollout: { dev: 100, staging: 100, prod: 12 }, owner: 'jamie@', users: 1480, sessions: '4.2k', impact: 0.74, status: 'rollout', updated: '34m', note: 'Holding at 12% prod while we dial in v3 fallback' },
  { id: 'protools_native',   name: 'Pro Tools native ARM',     group: 'Plugin',  rollout: { dev: 100, staging: 100, prod: 100 }, owner: 'priya@', users: 8240, sessions: '21k', impact: 0.91, status: 'live', updated: '2d' },
  { id: 'studio_one_aax',    name: 'Studio One AAX preview',   group: 'Plugin',  rollout: { dev: 100, staging: 50, prod: 0 }, owner: 'jamie@', users: 0, sessions: '0', impact: 0, status: 'paused', updated: '1d', note: 'Paused after staging crash spike' },
  { id: 'preset_marketplace',name: 'Preset marketplace',       group: 'Plugin',  rollout: { dev: 100, staging: 100, prod: 35 }, owner: 'maya@', users: 4320, sessions: '12k', impact: 0.62, status: 'rollout', updated: '6h' },

  { id: 'studio_tier',       name: 'Studio tier ($199)',       group: 'Pricing', rollout: { dev: 100, staging: 100, prod: 100 }, owner: 'evan@', users: 312, sessions: 'n/a', impact: 0.82, status: 'live', updated: '12d' },
  { id: 'annual_promo_q2',   name: 'Q2 annual 20% off',        group: 'Pricing', rollout: { dev: 100, staging: 100, prod: 100 }, owner: 'evan@', users: 1880, sessions: 'n/a', impact: 0.55, status: 'live', updated: '5d', note: 'Ends May 31' },
  { id: 'usage_overage',     name: 'Pay-per-track overages',   group: 'Pricing', rollout: { dev: 100, staging: 100, prod: 0 }, owner: 'evan@', users: 0, sessions: 'n/a', impact: 0, status: 'paused', updated: '3d', note: 'Awaiting legal review' },

  { id: 'editor_redesign',   name: 'Editor redesign',          group: 'UI',      rollout: { dev: 100, staging: 100, prod: 50 }, owner: 'sasha@', users: 6180, sessions: '18k', impact: 0.68, status: 'rollout', updated: '1h', note: 'Half-traffic A/B running clean' },
  { id: 'onboarding_v3',     name: 'Onboarding v3',            group: 'UI',      rollout: { dev: 100, staging: 100, prod: 25 }, owner: 'sasha@', users: 940, sessions: '2.1k', impact: 0.48, status: 'rollout', updated: '8h' },
  { id: 'dark_console',      name: 'Dark console theme',       group: 'UI',      rollout: { dev: 100, staging: 100, prod: 100 }, owner: 'sasha@', users: 11200, sessions: '34k', impact: 0.88, status: 'live', updated: '40d' }
];

function FlagsScreen({ selectedId, setSelectedId }) {
  const groups = ['Plugin','Pricing','UI'];
  const selected = FLAGS.find(f=>f.id===selectedId) || FLAGS[0];
  return (
    <>
      <div className="adm-page-h">
        <div><h1>Feature flags · console</h1><div className="sub">10 flags · 4 in active rollout · 2 paused · 4 fully shipped</div></div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="download"/> Export config</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="plus"/> New flag</button>
        </div>
      </div>

      <div className="console-shell">
        {groups.map(g => (
          <div key={g} className="console-bus">
            <div className="bus-label">
              <span className="bus-name">{g}</span>
              <span className="bus-count">{FLAGS.filter(f=>f.group===g).length} channels</span>
            </div>
            <div className="bus-channels">
              {FLAGS.filter(f=>f.group===g).map(f => (
                <FlagChannel key={f.id} f={f} active={f.id===selected.id} onPick={()=>setSelectedId(f.id)}/>
              ))}
            </div>
          </div>
        ))}

        <div className="console-master adm-card">
          <FlagDetail f={selected}/>
        </div>
      </div>
    </>
  );
}

function FlagChannel({ f, active, onPick }) {
  const angle = (pct) => -135 + (pct/100)*270;
  return (
    <div className={`chan ${active?'is-active':''} ${f.status}`} onClick={onPick}>
      <div className="chan-name">{f.name}</div>
      <div className="chan-status">
        <span className={`led-dot ${f.status}`}/>
        <span>{f.status}</span>
      </div>

      {/* env bus buttons */}
      <div className="chan-busses">
        {['dev','staging','prod'].map(env => {
          const v = f.rollout[env];
          return (
            <div key={env} className={`bus-btn ${v===100?'on':v>0?'half':'off'}`}>
              <span className="bus-btn-l">{env}</span>
              <span className="bus-btn-v">{v}%</span>
            </div>
          );
        })}
      </div>

      {/* prod rollout knob */}
      <div className="chan-knob">
        <div className="knob-shell">
          <svg viewBox="0 0 64 64" className="knob-svg">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            <circle cx="32" cy="32" r="26" fill="none"
                    stroke={f.status==='paused'?'hsl(35,90%,60%)':f.status==='live'?'hsl(150,70%,55%)':'hsl(275,100%,72%)'}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(f.rollout.prod/100)*163.4} 163.4`}
                    transform="rotate(135 32 32)"/>
            <line x1="32" y1="32" x2="32" y2="14"
                  stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round"
                  transform={`rotate(${angle(f.rollout.prod)} 32 32)`}/>
            <circle cx="32" cy="32" r="4" fill="var(--foreground)"/>
          </svg>
          <div className="knob-val">{f.rollout.prod}%</div>
        </div>
        <div className="knob-l">prod rollout</div>
      </div>

      {/* impact meter */}
      <div className="chan-meter">
        {Array.from({length:14}).map((_,i)=>{
          const lit = i/14 < f.impact;
          return <span key={i} className={`bar ${lit?'on':''} ${i>=11&&lit?'peak':''}`}/>;
        })}
        <div className="chan-meter-l">impact · {f.users.toLocaleString()} users</div>
      </div>
    </div>
  );
}

function FlagDetail({ f }) {
  if (!f) return null;
  return (
    <>
      <div className="fd-h">
        <div className="fd-id">
          <h3>{f.name}</h3>
          <div className="fd-meta">
            <span className={`state-pill ${f.status==='live'?'active':f.status==='paused'?'paused':'trialing'}`}><span className="dot"/>{f.status}</span>
            <span className="fd-key">flag id <code>{f.id}</code></span>
          </div>
        </div>
        <div className="spacer"/>
        <div className="fd-actions">
          <button className="adm-btn adm-btn-ghost">View targeting rules</button>
          <button className="adm-btn adm-btn-ghost">History</button>
          <button className="adm-btn adm-btn-primary">Edit rollout</button>
        </div>
      </div>

      <div className="fd-grid">
        <div className="fd-card">
          <div className="fd-card-h">Owner</div>
          <div className="fd-card-v">{f.owner}</div>
          <div className="fd-card-s">last edit {f.updated} ago</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-h">Users on</div>
          <div className="fd-card-v">{f.users.toLocaleString()}</div>
          <div className="fd-card-s">{f.sessions} sessions / 24h</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-h">Impact score</div>
          <div className="fd-card-v">{(f.impact*100).toFixed(0)}<small>/100</small></div>
          <div className="fd-card-s">retention proxy · 7d</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-h">Group</div>
          <div className="fd-card-v">{f.group}</div>
          <div className="fd-card-s">bus assignment</div>
        </div>
      </div>

      {f.note && (
        <div className="fd-note">
          <AIcon name="alert"/>
          <span>{f.note}</span>
        </div>
      )}

      <div className="fd-rules">
        <div className="fd-rules-h">Targeting rules</div>
        <div className="fd-rule"><span className="fd-rule-k">% rollout</span><span className="fd-rule-v">{f.rollout.prod}% of all prod traffic</span></div>
        <div className="fd-rule"><span className="fd-rule-k">Plan gate</span><span className="fd-rule-v">{f.group==='Pricing' ? 'all plans' : f.group==='Plugin' ? 'pro + studio' : 'all paying users'}</span></div>
        <div className="fd-rule"><span className="fd-rule-k">Region</span><span className="fd-rule-v">global · no exclusions</span></div>
        <div className="fd-rule"><span className="fd-rule-k">Force-on for</span><span className="fd-rule-v">internal staff (38) · early access cohort (412)</span></div>
      </div>
    </>
  );
}

/* ============================================================================
   AUDIT LOG — waveform timeline
   ============================================================================ */
const AUDIT_OPS = [
  { id: 'jamie',   name: 'Jamie Park',   role: 'Founding eng', avatar: 'JP', cls: 'av-vs' },
  { id: 'maya',    name: 'Maya Chen',    role: 'Trust & safety', avatar: 'MC', cls: 'av-bh' },
  { id: 'evan',    name: 'Evan Ortiz',   role: 'Revenue ops', avatar: 'EO', cls: 'av-pr' },
  { id: 'priya',   name: 'Priya Shah',   role: 'Plugin lead', avatar: 'PS', cls: 'av-lc' },
  { id: 'sasha',   name: 'Sasha Liu',    role: 'Design ops', avatar: 'SL', cls: 'av-ms' },
  { id: 'system',  name: 'System',       role: 'Automated', avatar: 'SY', cls: '' }
];

const AUDIT_TYPES = [
  { id: 'refund',     label: 'Refund',          sev: 'warn',     color: 'hsl(35,90%,65%)' },
  { id: 'plan',       label: 'Plan change',     sev: 'info',     color: 'hsl(190,80%,65%)' },
  { id: 'ban',        label: 'Ban',             sev: 'critical', color: 'hsl(355,80%,68%)' },
  { id: 'flag',       label: 'Flag toggle',     sev: 'info',     color: 'hsl(275,85%,72%)' },
  { id: 'deploy',     label: 'Deploy',          sev: 'info',     color: 'hsl(150,70%,60%)' },
  { id: 'retrain',    label: 'Model retrain',   sev: 'warn',     color: 'hsl(280,90%,72%)' },
  { id: 'incident',   label: 'Incident',        sev: 'critical', color: 'hsl(0,90%,68%)' },
  { id: 'permission', label: 'Permission',      sev: 'info',     color: 'hsl(220,12%,68%)' },
  { id: 'credits',    label: 'Credits',         sev: 'info',     color: 'hsl(45,90%,68%)' }
];

function makeAuditEvents() {
  const r = seedRand(701);
  const out = [];
  // hot moments — clustered events
  const clusters = [
    { t: 0.06, n: 6, type: 'incident',  op: 'system', label: 'Render workers OOM spike' },
    { t: 0.24, n: 4, type: 'retrain',   op: 'priya',  label: 'Pearl v4.2 retrain · staging' },
    { t: 0.41, n: 3, type: 'deploy',    op: 'system', label: 'Plugin 2.4.1 → prod' },
    { t: 0.58, n: 9, type: 'flag',      op: 'sasha',  label: 'Editor redesign 25 → 50%' },
    { t: 0.71, n: 5, type: 'refund',    op: 'evan',   label: 'Batch refund · billing reconcile' },
    { t: 0.85, n: 4, type: 'ban',       op: 'maya',   label: 'Spam wave · 4 accounts removed' }
  ];
  let id = 1;
  clusters.forEach(c => {
    for (let i=0;i<c.n;i++){
      const offset = (r()-0.5)*0.04;
      out.push({
        id: 'ev_' + (90000+id++),
        tNorm: Math.max(0.01, Math.min(0.99, c.t + offset)),
        type: c.type, op: c.op,
        amplitude: 0.55 + r()*0.4,
        target: targetFor(c.type, r),
        summary: c.label + (i>0?` · #${i+1}`:''),
        details: detailFor(c.type, r)
      });
    }
  });
  // sprinkle ambient events
  for (let i=0;i<22;i++){
    const type = AUDIT_TYPES[Math.floor(r()*AUDIT_TYPES.length)];
    const op = type.id==='deploy'||type.id==='retrain'||type.id==='incident' ? 'system' : AUDIT_OPS[Math.floor(r()*5)].id;
    out.push({
      id: 'ev_' + (90000+id++),
      tNorm: r(),
      type: type.id, op,
      amplitude: 0.15 + r()*0.4,
      target: targetFor(type.id, r),
      summary: ambientSummary(type.id, r),
      details: detailFor(type.id, r)
    });
  }
  return out.sort((a,b)=>a.tNorm-b.tNorm);
}

function targetFor(type, r) {
  const users = ['ops@velvetstatic.fm','admin@lofi-coop.org','maya@blueheronstudios.com','sasha@modernsounds.studio','jamie@boutiqueparallel.co'];
  const flags = FLAGS.map(f=>f.id);
  switch(type){
    case 'refund': case 'plan': case 'ban': case 'permission': case 'credits':
      return users[Math.floor(r()*users.length)];
    case 'flag': return flags[Math.floor(r()*flags.length)];
    case 'deploy': return ['plugin@2.4.1','plugin@2.4.0','console-web@1.18','api@2024.04.30'][Math.floor(r()*4)];
    case 'retrain': return ['pearl/v4.2','pearl/v4.1','velvet-bus/v2.0'][Math.floor(r()*3)];
    case 'incident': return ['render-worker-pool','api-eu','stripe-webhook'][Math.floor(r()*3)];
  }
  return '—';
}

function ambientSummary(type, r) {
  const m = {
    refund:  ['Partial refund $24', 'Full refund — duplicate charge', 'Refund + 30d credit'],
    plan:    ['Indie → Pro upgrade', 'Studio → Pro downgrade', 'Annual switch'],
    ban:     ['Spam · permanent', 'TOS violation · 14d', 'Repeat flagger · warned'],
    flag:    ['Rollout adjusted', 'Emergency disable', 'Targeting rule edited'],
    deploy:  ['Hotfix shipped', 'Canary rollout 10%', 'Rollback completed'],
    retrain: ['Detector match recalibrated', 'Loss converged at epoch 18', 'Eval batch passed'],
    incident:['SLA degraded', 'Auto-remediation kicked in', 'Page resolved'],
    permission: ['Admin role granted', 'API token rotated', '2FA reset'],
    credits: ['+200 render credits', 'Batch credit grant · 12 users', 'Credit reversal']
  };
  const arr = m[type] || ['Event'];
  return arr[Math.floor(r()*arr.length)];
}
function detailFor(type, r) {
  const fragments = {
    refund:  'Stripe ref ch_3LqM2V · processor confirmation 200 · note attached',
    plan:    'Effective immediately · prorated · next bill May 14',
    ban:     'Trust score 0/5 · 8 forum flags · 0 paid history',
    flag:    'A/B variant unchanged · audit chain v2 · attached config',
    deploy:  'Build #4421 · 3 services · canary green for 18m before promotion',
    retrain: 'Train 12 epochs · val loss 0.082 · detector match +1.4%',
    incident:'PagerDuty P2 · 14m duration · root cause: connection pool starvation',
    permission: 'Scope: read:users, write:billing · expires 30d',
    credits: 'Reason: comp for sess_912340 crash batch'
  };
  return fragments[type] || '—';
}

const AUDIT_EVENTS = makeAuditEvents();

function AuditScreen({ severity, setSeverity, operator, setOperator, selectedEvent, setSelectedEvent }) {
  const filtered = useMm4(()=>{
    return AUDIT_EVENTS.filter(e=>{
      const t = AUDIT_TYPES.find(x=>x.id===e.type);
      if (severity && severity !== 'all' && t.sev !== severity) return false;
      if (operator && operator !== 'all' && e.op !== operator) return false;
      return true;
    });
  },[severity,operator]);
  const selected = AUDIT_EVENTS.find(e=>e.id===selectedEvent) || filtered[Math.floor(filtered.length*0.42)] || filtered[0];

  return (
    <>
      <div className="adm-page-h">
        <div><h1>Audit log · waveform</h1><div className="sub">Last 24h · {AUDIT_EVENTS.length} events across {AUDIT_OPS.length-1} operators + system</div></div>
        <div className="spacer"/>
        <div className="actions">
          <div className="adm-segctl">
            <button className="on">24h</button><button>7d</button><button>30d</button>
          </div>
          <button className="adm-btn adm-btn-ghost"><AIcon name="download"/> Export</button>
        </div>
      </div>

      {/* filter bar */}
      <div className="audit-filters">
        <div className="audit-filter">
          <span className="audit-filter-l">Severity</span>
          <div className="adm-segctl">
            {['all','info','warn','critical'].map(s=>(
              <button key={s} className={severity===s?'on':''} onClick={()=>setSeverity(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="audit-filter">
          <span className="audit-filter-l">Operator</span>
          <div className="audit-ops">
            <button className={`audit-op ${operator==='all'?'on':''}`} onClick={()=>setOperator('all')}>All</button>
            {AUDIT_OPS.map(o=>(
              <button key={o.id} className={`audit-op ${operator===o.id?'on':''}`} onClick={()=>setOperator(o.id)}>
                <span className={`mini-avatar ${o.cls}`} style={{width:18,height:18,fontSize:9}}>{o.avatar}</span>
                <span>{o.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* waveform timeline */}
      <div className="adm-card audit-wave">
        <div className="adm-card-h">
          <h3>Timeline</h3>
          <span className="sub">{filtered.length} events · scrub to inspect · click any peak for details</span>
        </div>
        <div className="adm-card-body" style={{padding:'12px 18px 20px'}}>
          <AuditWaveform events={filtered} selected={selected} onPick={setSelectedEvent}/>
        </div>
      </div>

      {/* event list + detail */}
      <div className="audit-shell">
        <div className="adm-card">
          <div className="adm-card-h"><h3>Events</h3><span className="sub">most recent first</span></div>
          <div className="audit-list">
            {[...filtered].reverse().map(e => {
              const t = AUDIT_TYPES.find(x=>x.id===e.type);
              const op = AUDIT_OPS.find(x=>x.id===e.op);
              const sel = e.id===selected?.id;
              return (
                <div key={e.id} className={`audit-row ${sel?'is-selected':''}`} onClick={()=>setSelectedEvent(e.id)}>
                  <span className="audit-row-time">{(24-e.tNorm*24).toFixed(1)}h ago</span>
                  <span className="audit-row-type" style={{borderColor: t.color+'55', color: t.color}}>{t.label}</span>
                  <span className="audit-row-summary">{e.summary}</span>
                  <span className="audit-row-target">{e.target}</span>
                  <span className="audit-row-op">
                    <span className={`mini-avatar ${op.cls}`} style={{width:18,height:18,fontSize:9}}>{op.avatar}</span>
                    {op.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="adm-card audit-detail">
          <AuditDetail e={selected}/>
        </div>
      </div>
    </>
  );
}

function AuditWaveform({ events, selected, onPick }) {
  const W=1100,H=220,pad={l:64,r:14,t:12,b:30};
  const sevRow = { critical: 0, warn: 1, info: 2 };
  return (
    <div style={{position:'relative',width:'100%'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}} preserveAspectRatio="none">
        {/* row dividers */}
        {[0,1,2].map(i=>{
          const y = pad.t + (H-pad.t-pad.b)*((i+0.5)/3);
          return <line key={i} x1={pad.l} x2={W-pad.r} y1={y} y2={y} stroke="rgba(255,255,255,0.05)"/>;
        })}
        {/* row labels */}
        {[['critical',0],['warn',1],['info',2]].map(([l,i])=>(
          <text key={l} x={pad.l-6} y={pad.t + (H-pad.t-pad.b)*((i+0.5)/3)+3} textAnchor="end"
                fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)" letterSpacing="0.1em">{l.toUpperCase()}</text>
        ))}
        {/* hour ticks */}
        {Array.from({length:25}).map((_,i)=>{
          const x = pad.l + ((W-pad.l-pad.r)*(i/24));
          return <g key={i}>
            <line x1={x} x2={x} y1={H-pad.b} y2={H-pad.b+(i%6===0?6:3)} stroke="rgba(255,255,255,0.18)"/>
            {i%6===0 && <text x={x} y={H-pad.b+18} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">{24-i}h ago</text>}
          </g>;
        })}
        {/* event peaks */}
        {events.map(e=>{
          const t = AUDIT_TYPES.find(x=>x.id===e.type);
          const row = sevRow[t.sev];
          const cy = pad.t + (H-pad.t-pad.b)*((row+0.5)/3);
          const x  = pad.l + (W-pad.l-pad.r)*e.tNorm;
          const peak = (H-pad.t-pad.b)/3*0.5*e.amplitude;
          const sel = selected && e.id===selected.id;
          return (
            <g key={e.id} style={{cursor:'pointer'}} onClick={()=>onPick(e.id)}>
              <line x1={x} x2={x} y1={cy-peak} y2={cy+peak} stroke={t.color} strokeWidth={sel?2.5:1.4} opacity={sel?1:0.85} strokeLinecap="round"/>
              {sel && <circle cx={x} cy={cy} r="5" fill={t.color}/>}
            </g>
          );
        })}
        {/* playhead for selected */}
        {selected && (() => {
          const x = pad.l + (W-pad.l-pad.r)*selected.tNorm;
          return <line x1={x} x2={x} y1={pad.t} y2={H-pad.b} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>;
        })()}
      </svg>
      {/* legend */}
      <div style={{display:'flex',gap:14,marginTop:6,flexWrap:'wrap'}}>
        {AUDIT_TYPES.map(t=>(
          <div key={t.id} style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:10,color:'var(--muted-foreground)',fontFamily:'var(--font-mono)'}}>
            <span style={{width:10,height:10,borderRadius:2,background:t.color}}/>{t.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditDetail({ e }) {
  if (!e) return <div className="ud-empty"><div className="glyph"><AIcon name="log"/></div><h3>No event selected</h3><p>Click any peak in the waveform.</p></div>;
  const t = AUDIT_TYPES.find(x=>x.id===e.type);
  const op = AUDIT_OPS.find(x=>x.id===e.op);
  return (
    <>
      <div className="adm-card-h"><h3>{e.summary}</h3><span className="sub">{e.id}</span></div>
      <div style={{padding:'14px 18px 18px',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span className="audit-row-type" style={{borderColor: t.color+'55', color: t.color, padding:'4px 10px',fontSize:11}}>{t.label} · {t.sev}</span>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--muted-foreground)'}}>{(24-e.tNorm*24).toFixed(2)}h ago</span>
        </div>
        <div className="ad-kv">
          <div className="ad-row"><span className="k">Operator</span>
            <span className="v"><span className={`mini-avatar ${op.cls}`} style={{width:18,height:18,fontSize:9,marginRight:6}}>{op.avatar}</span>{op.name} · <em style={{color:'var(--muted-foreground)',fontStyle:'normal'}}>{op.role}</em></span>
          </div>
          <div className="ad-row"><span className="k">Target</span><span className="v"><code>{e.target}</code></span></div>
          <div className="ad-row"><span className="k">Amplitude</span><span className="v">{(e.amplitude*100).toFixed(0)}% relative impact</span></div>
          <div className="ad-row"><span className="k">Source</span><span className="v">admin-console v1.18 · ip 10.4.x.x · session adm_8842</span></div>
        </div>
        <div className="ad-detail">
          <div className="ad-detail-h">Detail</div>
          <p>{e.details}</p>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="adm-btn adm-btn-ghost"><AIcon name="user"/> Open operator</button>
          <button className="adm-btn adm-btn-ghost"><AIcon name="arrowR"/> Open target</button>
          <button className="adm-btn adm-btn-ghost"><AIcon name="download"/> Copy log line</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ForumScreen, FlagsScreen, AuditScreen });
