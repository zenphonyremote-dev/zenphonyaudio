/* ============================================================================
   ADMIN PHASE 3 — Analysis sessions (crash log lens) + Revenue analytics
   ============================================================================ */
const { useState: useSt3, useMemo: useMm3 } = React;

/* ---------- mock crash sessions ---------- */
const ERR_TYPES = [
  { code: 'ENGINE_OOM',       label: 'Engine OOM',        sev: 'critical', hint: 'render worker exhausted memory' },
  { code: 'CHAIN_INVALID',    label: 'Invalid chain',     sev: 'error',    hint: 'preset depends on missing module v2.3' },
  { code: 'IO_TIMEOUT',       label: 'I/O timeout',       sev: 'error',    hint: 'upload stalled past 90s · ap-tokyo' },
  { code: 'BRAIN_DEGRADED',   label: 'Brain degraded',    sev: 'warn',     hint: 'pearl model fell back to v3 weights' },
  { code: 'FORMAT_UNSUPPORTED',label:'Unsupported fmt',    sev: 'warn',    hint: 'DSD64 not yet supported' },
  { code: 'LICENSE_DESYNC',   label: 'License desync',    sev: 'error',    hint: 'token mismatch · forced re-auth' },
  { code: 'PEAK_OVERFLOW',    label: 'Peak overflow',     sev: 'warn',     hint: 'output clipped >0.5dB · auto-scaled' },
  { code: 'RENDER_CRASH',     label: 'Render crash',      sev: 'critical', hint: 'segfault in plugin host · 2.4.1' }
];
const HOSTS = ['Reaper 7','Logic Pro 11','Ableton Live 12','Pro Tools 2024','Studio One 7','FL Studio 21','Bitwig 5'];
const OSES  = ['macOS 14.5','macOS 14.4','Windows 11 23H2','Windows 11 22H2'];
const PRESETS = ['Pearl Master','Velvet Bus','Hip-hop Glue','Streaming Safe','Loud-but-Clean','Vinyl Warmth','Pop Polish','Lo-fi Tape'];

function makeSessions(n) {
  const r = seedRand(401);
  const users = ALL_USERS.filter(u => u.plan !== 'free');
  const out = [];
  for (let i = 0; i < n; i++) {
    const u = users[Math.floor(r() * users.length)];
    const err = ERR_TYPES[Math.floor(r() * ERR_TYPES.length)];
    const min = Math.floor(r() * 180);
    const ago = min < 60 ? `${min}m` : min < 1440 ? `${Math.floor(min/60)}h` : `${Math.floor(min/1440)}d`;
    const dur = (r() * 6 + 0.3).toFixed(1);
    out.push({
      id: 'sess_' + (912340 + i),
      user: u,
      err,
      durationS: dur,
      lufs: -(11 + r() * 6).toFixed(1),
      tp: -(0.3 + r() * 1.2).toFixed(2),
      dr: (8 + r() * 6).toFixed(1),
      brainHealth: err.code === 'BRAIN_DEGRADED' ? 0.42 + r()*0.1 : err.sev === 'critical' ? 0 : 0.86 + r()*0.12,
      host: HOSTS[Math.floor(r() * HOSTS.length)],
      os:   OSES[Math.floor(r() * OSES.length)],
      pluginV: r() > 0.3 ? '2.4.1' : '2.4.0',
      chain: Array.from({length: Math.floor(r()*3)+2}, (_,k) => PRESETS[(i+k) % PRESETS.length]),
      ago,
      occurrences: Math.floor(r() * 24) + 1,
      stars: err.sev === 'critical' ? 0 : Math.floor(r()*3) + (r()>0.6 ? 2 : 1),
      feedback: ['Sounded thin in the mids — fell back to manual chain.','Brilliant on the second pass after I lowered the input gain.','Chain crashed mid-render. Lost 4 minutes.','Pearl meter pinned then recovered — output is fine but uncomfortable to watch.','Honestly nailed it on the streaming-safe preset.'][Math.floor(r()*5)]
    });
  }
  // ensure first card is hero scenario
  out[0] = {
    ...out[0],
    user: ALL_USERS.find(u => u.email === 'admin@lofi-coop.org'),
    err: ERR_TYPES[0],
    durationS: '4.2',
    occurrences: 3,
    ago: '12m',
    brainHealth: 0,
    chain: ['Pearl Master','Streaming Safe','Loud-but-Clean']
  };
  return out;
}
const ALL_SESSIONS = makeSessions(38);

const SESS_FILTERS = [
  { id: 'all',      label: 'All issues',       count: 38 },
  { id: 'critical', label: 'Critical',         count: 9, danger: true },
  { id: 'error',    label: 'Errors',           count: 18, warn: true },
  { id: 'warn',     label: 'Warnings',         count: 11 },
  { id: 'spike',    label: 'Spikes (24h)',     count: 4, warn: true }
];

/* ---------- screens ---------- */
function SessionsScreen({ selectedId, setSelectedId }) {
  const [filter, setFilter] = useSt3('all');
  const visible = useMm3(() => filter === 'all' ? ALL_SESSIONS : ALL_SESSIONS.filter(s => s.err.sev === filter || (filter === 'spike' && s.occurrences > 10)), [filter]);
  const selected = ALL_SESSIONS.find(s => s.id === selectedId) || visible[0] || ALL_SESSIONS[0];

  // group by error code for the spike summary
  const grouped = useMm3(() => {
    const m = {};
    ALL_SESSIONS.forEach(s => { m[s.err.code] = (m[s.err.code] || 0) + s.occurrences; });
    return Object.entries(m).map(([code, count]) => ({ code, count, label: ERR_TYPES.find(e=>e.code===code).label, sev: ERR_TYPES.find(e=>e.code===code).sev })).sort((a,b)=>b.count-a.count);
  }, []);

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Analysis sessions</h1>
          <div className="sub">Crash + error log · 38 issues across 21 accounts in the last 24h</div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="download" /> Export crash dump</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="bolt" /> Bulk re-render</button>
        </div>
      </div>

      <div className="uf-segs">
        {SESS_FILTERS.map(s => (
          <button key={s.id} className={`uf-seg ${filter===s.id?'on':''} ${s.warn?'warn':''} ${s.danger?'danger':''}`} onClick={() => setFilter(s.id)}>
            {s.label}<span className="badge">{s.count}</span>
          </button>
        ))}
      </div>

      {/* Spike strip — top error codes */}
      <div className="adm-card" style={{marginBottom: 14}}>
        <div className="adm-card-h"><h3>Top error codes · last 24h</h3><div className="spacer"/><span className="lnk">Group by host ›</span></div>
        <div className="adm-card-body" style={{padding: '10px 16px 14px'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
            {grouped.slice(0,6).map(g => (
              <div key={g.code} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'8px 12px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8}}>
                <span className={`state-pill ${g.sev==='critical'?'past_due':g.sev==='error'?'canceled':'paused'}`} style={{whiteSpace:'nowrap'}}>{g.label}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--foreground)',fontWeight:600}}>{g.count}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--muted-foreground)'}}>occurrences</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="users-shell">
        <div className="adm-card users-table-card">
          <div className="users-table-h"><span className="count"><strong>{visible.length}</strong> sessions</span><div className="spacer"/><span className="count">Sort: most recent ↓</span></div>
          <div style={{overflowX:'auto'}}>
            <table className="users-tbl">
              <colgroup><col className="col-check"/><col className="col-user"/><col className="col-plan"/><col className="col-state"/><col className="col-mrr"/><col className="col-last"/></colgroup>
              <thead><tr><th></th><th>User · session</th><th>Host</th><th>Error</th><th className="r">×</th><th className="r">When</th></tr></thead>
              <tbody>
                {visible.map(s => {
                  const sel = s.id === selected.id;
                  return (
                    <tr key={s.id} className={sel?'is-selected':''} onClick={()=>setSelectedId(s.id)}>
                      <td><div className="uf-check"/></td>
                      <td>
                        <div className="who-cell">
                          <div className={`mini-avatar ${s.user.cls||''}`}>{s.user.avatar}</div>
                          <div className="who"><div className="name">{s.user.name}</div><div className="meta">{s.id} · {s.durationS}s</div></div>
                        </div>
                      </td>
                      <td><span className="plan-pill" style={{textTransform:'none',letterSpacing:0,fontFamily:'var(--font-mono)',fontSize:10}}>{s.host.split(' ')[0]}</span></td>
                      <td><span className={`state-pill ${s.err.sev==='critical'?'past_due':s.err.sev==='error'?'canceled':'paused'}`}><span className="dot"/>{s.err.label}</span></td>
                      <td className="num">{s.occurrences}</td>
                      <td className="num last">{s.ago}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="adm-card user-detail">
          <SessionDetail s={selected} onClose={()=>setSelectedId(null)} />
        </div>
      </div>
    </>
  );
}

function SessionDetail({ s, onClose }) {
  const [tab, setTab] = useSt3('scopes');
  if (!s) return <div className="ud-empty"><div className="glyph"><AIcon name="waves"/></div><h3>No session selected</h3><p>Pick a row to inspect waveforms, scopes, and the render chain.</p></div>;
  return (
    <>
      <div className="ud-h">
        <div className={`ud-avatar ${s.user.cls||''}`} style={{background: s.err.sev==='critical'?'linear-gradient(135deg,hsl(355,80%,60%),hsl(20,90%,55%))':undefined}}>
          <AIcon name={s.err.sev==='critical'?'alert':'waves'}/>
        </div>
        <div className="ud-id">
          <h2>{s.id}</h2>
          <div className="email">{s.user.name} · {s.user.email}</div>
          <div className="pills">
            <span className={`state-pill ${s.err.sev==='critical'?'past_due':s.err.sev==='error'?'canceled':'paused'}`}><span className="dot"/>{s.err.label}</span>
            <span className="plan-pill" style={{textTransform:'none',letterSpacing:0,fontFamily:'var(--font-mono)',fontSize:10}}>{s.host}</span>
            <span className="plan-pill free">v{s.pluginV}</span>
          </div>
        </div>
        <div className="close-btn" onClick={onClose}><AIcon name="arrowR"/></div>
      </div>

      <div className="ud-actions">
        <button className="ud-action"><AIcon name="bolt"/> Re-render</button>
        <button className="ud-action"><AIcon name="waves"/> Replay (observer)</button>
        <button className="ud-action"><AIcon name="download"/> Download dump</button>
        <button className="ud-action"><AIcon name="user"/> Open user</button>
        <button className="ud-action danger"><AIcon name="alert"/> Quarantine</button>
      </div>

      <div className="ud-tabs">
        {[['scopes','Scopes'],['waveform','Waveform'],['chain','Render chain'],['brain','Brain health'],['feedback','Feedback'],['host','Host']].map(([k,l])=>(
          <button key={k} className={`ud-tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      <div className="ud-body">
        {tab==='scopes' && <SDScopes s={s}/>}
        {tab==='waveform' && <SDWaveform s={s}/>}
        {tab==='chain' && <SDChain s={s}/>}
        {tab==='brain' && <SDBrain s={s}/>}
        {tab==='feedback' && <SDFeedback s={s}/>}
        {tab==='host' && <SDHost s={s}/>}
      </div>
    </>
  );
}

function SDScopes({s}) {
  return (
    <div className="ud-sec"><div className="ud-sec-h"><h4>Loudness scopes</h4><div className="spacer"/><span className="lnk">Streaming targets ›</span></div>
      <div className="ud-sec-body"><div className="tele-grid">
        <div className="tele-cell"><div className="lbl">Integrated LUFS</div><div className="val">{s.lufs}</div><div className="sub">target −14 ± 1.5 (Spotify)</div></div>
        <div className="tele-cell"><div className="lbl">True peak</div><div className={`val ${parseFloat(s.tp)>-0.5?'warn':''}`}>{s.tp} dBTP</div><div className="sub">target ≤ −1.0 dBTP</div></div>
        <div className="tele-cell"><div className="lbl">Dynamic range</div><div className="val">{s.dr} LU</div><div className="sub">healthy 8–14 LU</div></div>
        <div className="tele-cell"><div className="lbl">Duration</div><div className="val">{s.durationS}s</div><div className="sub">render time before {s.err.sev==='critical'?'crash':'completion'}</div></div>
      </div></div>
    </div>
  );
}

function SDWaveform({s}){
  const r = seedRand(parseInt(s.id.replace('sess_',''),10));
  const W=620,H=88,N=120;
  const wave = (mult, off=0) => {
    const pts = [];
    for(let i=0;i<N;i++){const y=Math.sin(i/4+off)*0.3+Math.sin(i/9)*0.4+(r()-0.5)*0.5;pts.push([i/N*W,H/2+y*mult*H/2]);}
    return pts;
  };
  const before = wave(0.55,0);
  const after  = s.err.sev==='critical' ? wave(0.95,2) : wave(0.78,1);
  const path = pts => 'M'+pts.map(p=>p.join(',')).join(' L ');
  return (
    <div className="ud-sec"><div className="ud-sec-h"><h4>Waveform · before / after</h4><div className="spacer"/><span className="lnk">Open scrubber ›</span></div>
      <div className="ud-sec-body" style={{display:'flex',flexDirection:'column',gap:14}}>
        <div><div className="k" style={{fontFamily:'var(--font-display)',fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--muted-foreground)',marginBottom:6}}>Source</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:88,background:'rgba(0,0,0,0.2)',borderRadius:6}}>
            <path d={path(before)} stroke="hsl(190,80%,65%)" strokeWidth="1" fill="none"/>
            <path d={path(before.map(([x,y])=>[x,H-y]))} stroke="hsl(190,80%,65%)" strokeWidth="1" fill="none" opacity="0.6"/>
          </svg>
        </div>
        <div><div className="k" style={{fontFamily:'var(--font-display)',fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--muted-foreground)',marginBottom:6}}>{s.err.sev==='critical'?'After (truncated at crash)':'Mastered output'}</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:88,background:'rgba(0,0,0,0.2)',borderRadius:6}}>
            <path d={path(after)} stroke={s.err.sev==='critical'?'hsl(355,80%,68%)':'hsl(275,100%,78%)'} strokeWidth="1" fill="none"/>
            <path d={path(after.map(([x,y])=>[x,H-y]))} stroke={s.err.sev==='critical'?'hsl(355,80%,68%)':'hsl(275,100%,78%)'} strokeWidth="1" fill="none" opacity="0.6"/>
            {s.err.sev==='critical' && <line x1={W*0.62} x2={W*0.62} y1="0" y2={H} stroke="hsl(355,90%,70%)" strokeDasharray="3,3"/>}
          </svg>
        </div>
      </div>
    </div>
  );
}

function SDChain({s}){
  return (
    <div className="ud-sec"><div className="ud-sec-h"><h4>Render chain</h4><span style={{fontSize:11,color:'var(--muted-foreground)',fontFamily:'var(--font-mono)'}}>{s.chain.length} stages</span></div>
      <div className="ud-sec-body">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {s.chain.map((p,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'24px 1fr auto',gap:10,padding:'10px 12px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,alignItems:'center'}}>
              <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--muted-foreground)'}}>{i+1}</div>
              <div><div style={{fontSize:13,color:'var(--foreground)',fontWeight:500}}>{p}</div><div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--muted-foreground)'}}>preset · v2.4 · {(2.3+i*0.2).toFixed(1)}ms cpu</div></div>
              <span className={`state-pill ${i===s.chain.length-1 && s.err.sev==='critical' ?'past_due':'active'}`}><span className="dot"/>{i===s.chain.length-1 && s.err.sev==='critical' ?'crash':'ok'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SDBrain({s}){
  const pct = Math.round(s.brainHealth*100);
  const tone = pct < 50 ? 'danger' : pct < 80 ? 'warn' : 'ok';
  return (
    <>
      <div className="ud-sec"><div className="ud-sec-h"><h4>Brain health</h4><span style={{fontSize:11,color:'var(--muted-foreground)',fontFamily:'var(--font-mono)'}}>pearl model · v4.2</span></div>
        <div className="ud-sec-body">
          <div style={{display:'flex',alignItems:'center',gap:18}}>
            <div style={{position:'relative',width:84,height:84,flex:'none'}}>
              <svg viewBox="0 0 84 84" style={{width:84,height:84}}>
                <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                <circle cx="42" cy="42" r="36" fill="none" strokeLinecap="round" strokeWidth="6"
                        stroke={tone==='danger'?'hsl(355,80%,65%)':tone==='warn'?'hsl(35,90%,60%)':'hsl(150,70%,55%)'}
                        strokeDasharray={`${pct*2.262} 226.2`} transform="rotate(-90 42 42)"/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,color:'var(--foreground)'}}>{pct}%</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:'var(--foreground)',fontWeight:600,marginBottom:6}}>
                {pct<10?'Critical · model failed to converge':pct<50?'Degraded · fell back to v3 weights':pct<85?'Reduced · running on partial inference':'Healthy'}
              </div>
              <div style={{fontSize:12,color:'var(--muted-foreground)',lineHeight:1.5}}>
                {pct<10?'Inference pipeline crashed before output. No usable mastered audio produced.':pct<50?'Pearl model marked degraded after detector mismatch — output is acceptable but quality estimator deviated >18% from reference.':pct<85?'Brain ran inference at reduced precision to fit memory budget. Subjective quality unaffected for most genres.':'All checks green. Output matched reference within tolerance.'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ud-sec"><div className="ud-sec-h"><h4>Diagnostic flags</h4></div>
        <div className="ud-sec-body"><div className="tele-grid">
          <div className="tele-cell"><div className="lbl">Inference latency</div><div className="val">{(140 + (1-s.brainHealth)*880).toFixed(0)} ms</div><div className="sub">budget 320 ms</div></div>
          <div className="tele-cell"><div className="lbl">Detector match</div><div className={`val ${s.brainHealth<0.5?'warn':''}`}>{(s.brainHealth*100).toFixed(0)}%</div><div className="sub">reference correlation</div></div>
          <div className="tele-cell"><div className="lbl">Fallback path</div><div className="val">{s.brainHealth<0.5?'v3 weights':'none'}</div><div className="sub">{s.brainHealth<0.5?'auto-engaged':'primary path active'}</div></div>
          <div className="tele-cell"><div className="lbl">Memory peak</div><div className={`val ${s.err.code==='ENGINE_OOM'?'warn':''}`}>{s.err.code==='ENGINE_OOM'?'8.0 GB':'4.2 GB'}</div><div className="sub">budget 6.0 GB</div></div>
        </div></div>
      </div>
    </>
  );
}

function SDFeedback({s}){
  return (
    <div className="ud-sec"><div className="ud-sec-h"><h4>Listener feedback</h4></div>
      <div className="ud-sec-body">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,color:'var(--foreground)'}}>{s.stars}<small style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--muted-foreground)',fontWeight:400,marginLeft:4}}>/5</small></div>
          <div style={{color:'hsl(42,100%,68%)',fontSize:14}}>{'★'.repeat(s.stars)}<span style={{color:'rgba(255,255,255,0.15)'}}>{'★'.repeat(5-s.stars)}</span></div>
        </div>
        <div style={{padding:12,background:'rgba(0,0,0,0.18)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,fontSize:13,color:'var(--card-foreground)',lineHeight:1.55,fontStyle:'italic'}}>"{s.feedback}"</div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--muted-foreground)',marginTop:8}}>submitted {s.ago} ago · via plugin in-app prompt</div>
      </div>
    </div>
  );
}

function SDHost({s}){
  return (
    <div className="ud-sec"><div className="ud-sec-h"><h4>DAW host & build</h4></div>
      <div className="ud-sec-body"><div className="tele-grid">
        <div className="tele-cell"><div className="lbl">DAW</div><div className="val">{s.host}</div><div className="sub">primary host this session</div></div>
        <div className="tele-cell"><div className="lbl">OS</div><div className="val">{s.os}</div><div className="sub">{s.os.includes('macOS')?'Apple Silicon':'x86_64'}</div></div>
        <div className="tele-cell"><div className="lbl">Plugin version</div><div className="val">v{s.pluginV}</div><div className="sub">{s.pluginV==='2.4.0'?'1 minor behind':'latest stable'}</div></div>
        <div className="tele-cell"><div className="lbl">Buffer / sample rate</div><div className="val">512 / 48 kHz</div><div className="sub">project default</div></div>
      </div></div>
    </div>
  );
}

/* ============================================================================
   REVENUE ANALYTICS — waterfall + cohort + forecast
   ============================================================================ */
function RevenueScreen() {
  const months = ['Nov','Dec','Jan','Feb','Mar','Apr'];
  const moves = months.map((m,i) => {
    const newMRR  = 1800 + Math.round(Math.sin(i)*180) + i*120;
    const expand  = 600 + i*60;
    const contract= -(280 + Math.round(Math.cos(i)*60));
    const churn   = -(440 + Math.round(Math.cos(i*1.4)*50));
    return { m, newMRR, expand, contract, churn, net: newMRR+expand+contract+churn };
  });
  return (
    <>
      <div className="adm-page-h">
        <div><h1>Revenue analytics</h1><div className="sub">MRR movement, cohort retention, and trailing forecast</div></div>
        <div className="spacer"/>
        <div className="actions">
          <div className="adm-segctl"><button className="on">6 mo</button><button>12 mo</button><button>All</button></div>
          <button className="adm-btn adm-btn-ghost"><AIcon name="download"/> Export</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h"><h3>MRR movement</h3><span className="sub">new + expansion − contraction − churn = net</span><div className="spacer"/>
          <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--muted-foreground)'}}>Net <strong style={{color:'var(--foreground)',fontWeight:600}}>+$2,180</strong> this month</span>
        </div>
        <div className="adm-card-body" style={{padding:'14px 18px'}}>
          <Waterfall moves={moves}/>
        </div>
      </div>

      <div className="two-up">
        <div className="adm-card">
          <div className="adm-card-h"><h3>Cohort retention</h3><span className="sub">% of signup-month still paying</span></div>
          <div className="adm-card-body" style={{padding:'14px 18px'}}><CohortHeatmap/></div>
        </div>
        <div className="adm-card">
          <div className="adm-card-h"><h3>Forecast</h3><span className="sub">trailing 12mo + 6mo projection</span></div>
          <div className="adm-card-body" style={{padding:'14px 18px'}}><Forecast/></div>
        </div>
      </div>
    </>
  );
}

function Waterfall({ moves }) {
  const W=860,H=260,pad={l:40,r:14,t:18,b:36};
  const all = moves.flatMap(m=>[m.newMRR,m.expand,Math.abs(m.contract),Math.abs(m.churn),m.net]);
  const yMax = Math.max(...all)*1.15;
  const colW = (W-pad.l-pad.r)/moves.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H}}>
      {[0,0.25,0.5,0.75,1].map((p,i)=><line key={i} x1={pad.l} x2={W-pad.r} y1={pad.t+(H-pad.t-pad.b)*p} y2={pad.t+(H-pad.t-pad.b)*p} stroke="rgba(255,255,255,0.06)"/>)}
      {moves.map((m,i)=>{
        const x = pad.l + colW*i + colW*0.12;
        const w = colW*0.16;
        const ny = (val) => pad.t+(H-pad.t-pad.b)*(1-val/yMax);
        const cols=[
          {v:m.newMRR,c:'hsl(150,70%,55%)'},
          {v:m.expand,c:'hsl(190,80%,60%)'},
          {v:Math.abs(m.contract),c:'hsl(35,90%,60%)'},
          {v:Math.abs(m.churn),c:'hsl(355,80%,65%)'}
        ];
        return (
          <g key={i}>
            {cols.map((b,k)=>(<rect key={k} x={x+w*k*1.1} y={ny(b.v)} width={w} height={ny(0)-ny(b.v)} fill={b.c} opacity="0.8" rx="2"/>))}
            <line x1={x} x2={x+w*4*1.1-w*0.1} y1={ny(m.net)} y2={ny(m.net)} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3,3"/>
            <text x={x+w*2} y={H-pad.b+18} fill="var(--muted-foreground)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">{m.m}</text>
            <text x={x+w*2} y={ny(m.net)-5} fill="var(--foreground)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="600">+${(m.net/1000).toFixed(1)}k</text>
          </g>
        );
      })}
      <g transform={`translate(${pad.l},${H-12})`}>
        {[['New','hsl(150,70%,55%)'],['Expansion','hsl(190,80%,60%)'],['Contraction','hsl(35,90%,60%)'],['Churn','hsl(355,80%,65%)']].map(([l,c],i)=>(
          <g key={i} transform={`translate(${i*100},0)`}><rect width="9" height="9" fill={c} rx="1.5"/><text x="14" y="8" fontSize="10" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">{l}</text></g>
        ))}
      </g>
    </svg>
  );
}

function CohortHeatmap(){
  const cohorts=['Nov \'25','Dec \'25','Jan \'26','Feb \'26','Mar \'26','Apr \'26'];
  const r = seedRand(77);
  const data = cohorts.map((c,i)=>{
    const row = [100];
    for(let m=1;m<=6-i;m++){row.push(Math.max(35, Math.round(100 - m*8 - r()*5 + Math.sin(i+m)*2)));}
    return {c, row};
  });
  return (
    <div style={{display:'grid',gridTemplateColumns:'auto repeat(7,1fr)',gap:3,fontFamily:'var(--font-mono)',fontSize:10}}>
      <div></div>{['M0','M1','M2','M3','M4','M5','M6'].map(h=><div key={h} style={{textAlign:'center',color:'var(--muted-foreground)'}}>{h}</div>)}
      {data.map((d,i)=>(<React.Fragment key={i}>
        <div style={{color:'var(--muted-foreground)',paddingRight:6}}>{d.c}</div>
        {Array.from({length:7}).map((_,k)=>{const v=d.row[k];const op=v?(v/100):0;
          return <div key={k} style={{height:28,display:'grid',placeItems:'center',background:v?`hsla(275,80%,60%,${op*0.55})`:'transparent',borderRadius:3,color:v?'var(--foreground)':'transparent',border:v?'1px solid hsla(275,80%,70%,0.20)':'none'}}>{v?`${v}%`:''}</div>;
        })}
      </React.Fragment>))}
    </div>
  );
}

function Forecast(){
  const W=460,H=240,pad={l:36,r:14,t:14,b:24};
  const r=seedRand(99);
  const past = Array.from({length:12},(_,i)=>30+i*1.4+r()*1.5);
  const fc = Array.from({length:6},(_,i)=>past[past.length-1]+i*1.6+r()*1.0);
  const all = [...past,...fc];
  const yMax = Math.max(...all)*1.15;
  const xS = (i,n)=>pad.l+((W-pad.l-pad.r)*(i/(n-1)));
  const yS = (v)=>pad.t+(H-pad.t-pad.b)*(1-v/yMax);
  const total = past.length+fc.length;
  const pastPath = past.map((v,i)=>`${i?'L':'M'}${xS(i,total)},${yS(v)}`).join(' ');
  const fcPath   = fc.map((v,i)=>`${i?'L':'M'}${xS(past.length-1+i,total)},${yS(v)}`).join(' ');
  const bandTop = fc.map((v,i)=>`${i?'L':'M'}${xS(past.length-1+i,total)},${yS(v*1.10)}`).join(' ');
  const bandBot = fc.map((v,i)=>`L${xS(past.length-1+i,total)},${yS(v*0.90)}`).reverse().join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H}}>
      {[0,0.25,0.5,0.75,1].map((p,i)=><line key={i} x1={pad.l} x2={W-pad.r} y1={pad.t+(H-pad.t-pad.b)*p} y2={pad.t+(H-pad.t-pad.b)*p} stroke="rgba(255,255,255,0.06)"/>)}
      <line x1={xS(past.length-1,total)} x2={xS(past.length-1,total)} y1={pad.t} y2={H-pad.b} stroke="rgba(255,255,255,0.18)" strokeDasharray="2,3"/>
      <path d={`${bandTop} ${bandBot} Z`} fill="hsla(275,80%,70%,0.12)"/>
      <path d={pastPath} stroke="hsl(275,100%,78%)" strokeWidth="2" fill="none"/>
      <path d={fcPath} stroke="hsl(275,100%,78%)" strokeWidth="2" fill="none" strokeDasharray="4,3" opacity="0.7"/>
      <text x={xS(past.length-1,total)+4} y={pad.t+12} fontSize="10" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">forecast →</text>
    </svg>
  );
}

Object.assign(window,{SessionsScreen,RevenueScreen});
