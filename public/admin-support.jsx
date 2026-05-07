/* ============================================================================
   ADMIN — SUPPORT INBOX
   Triage tickets · SLA timers · saved replies · account context · resolve.
   ============================================================================ */
const { useState: useStS, useMemo: useMmS } = React;

/* ───────── data ───────── */

const SUPPORT_QUEUES = [
  { id: 'mine',    label: 'My queue',     count: 7,  hint: 'evan@' },
  { id: 'unassigned', label: 'Unassigned', count: 4, hint: 'oldest 38m' },
  { id: 'inbox',   label: 'Team inbox',   count: 23, hint: 'all open' },
  { id: 'awaiting',label: 'Awaiting reply', count: 6, hint: 'staff replied' },
  { id: 'breach',  label: 'SLA risk',     count: 3, hint: '<2h to breach', warn: true },
  { id: 'snoozed', label: 'Snoozed',      count: 5 },
  { id: 'resolved',label: 'Resolved · 30d', count: 318 }
];

const SUPPORT_CHANNELS = {
  email:   { label: 'Email',   color: 'hsl(190, 80%, 65%)' },
  chat:    { label: 'In-app',  color: 'hsl(150, 70%, 60%)' },
  forum:   { label: 'Forum',   color: 'hsl(275, 100%, 75%)' },
  twitter: { label: 'Twitter', color: 'hsl(220, 90%, 70%)' },
  webform: { label: 'Web form',color: 'hsl(35, 90%, 65%)' }
};

const SUPPORT_TAGS = {
  bug:        { label: 'Bug',          color: 'hsl(355, 80%, 65%)' },
  billing:    { label: 'Billing',      color: 'hsl(150, 70%, 60%)' },
  account:    { label: 'Account',      color: 'hsl(220, 80%, 70%)' },
  feature:    { label: 'Feature req',  color: 'hsl(190, 80%, 65%)' },
  quality:    { label: 'Output qual.', color: 'hsl(275, 100%, 72%)' },
  install:    { label: 'Install',      color: 'hsl(35, 90%, 60%)' },
  daw:        { label: 'DAW host',     color: 'hsl(45, 90%, 65%)' }
};

const TICKETS = [
  {
    id: 'tkt_8842',
    subject: 'Reaper 7 hangs on plugin scan after v2.4.1 update',
    snippet: 'I updated yesterday and now Reaper freezes for ~30s every time I add Buddy as an insert. Logs attached.',
    channel: 'email',
    tag: 'bug',
    state: 'open',
    priority: 'high',
    user: { name: 'Lucas Tremblay', email: 'lucas@northleafmastering.ca', cls: 'av-bh', avatar: 'LT', plan: 'Studio · monthly', mrr: 79, sessions30: 142, daw: 'Reaper 7.10', os: 'Windows 11', joinedMo: 9 },
    sla: { label: 'breach in 47m', pct: 0.06, color: 'hsl(355,80%,62%)' },
    received: '2h 13m ago',
    assignee: { name: 'Evan O.', avatar: 'EO', cls: 'av-pr', id: 'evan' },
    replies: 3,
    related: 'thr_8841 · sess_912340',
    thread: [
      { from: 'user',  at: '2h 13m ago', body: "Hey team — I updated yesterday and now Reaper freezes for ~30s every time I add Buddy as an insert. Reaper 7.10 / Win 11 / x64. Logs from the last hang attached. This wasn't happening on 2.4.0.", attach: ['reaper-hang-2026-05-04.log (412KB)'] },
      { from: 'staff', at: '1h 28m ago', body: "Thanks Lucas — confirmed on our side, this matches the Pearl v4 init regression we're tracking under bug-3041. We have a fix queued for 2.4.2 (ETA Friday). In the meantime two options:\n\n1. Roll back to 2.4.0 — link below.\n2. Set Pearl to bypass on insert and toggle when ready (avoids the init path).\n\nI'll keep this open until 2.4.2 ships and ping you for verification.", who: 'Evan Ortiz', avatar: 'EO', cls: 'av-pr', signature: 'Revenue ops · Zenphony Audio' },
      { from: 'user',  at: '52m ago',   body: "Appreciate the fast turnaround. Going with option 1 for now. I'll let you know how 2.4.2 holds." }
    ],
    suggested: 'rb-2402'
  },
  {
    id: 'tkt_8841',
    subject: 'Pearl v4 mastering sounds "lifeless" on ambient EP — refund?',
    snippet: '6 sessions over the last week, output is flat compared to v3. Asked for a v3 toggle, was told no.',
    channel: 'email',
    tag: 'quality',
    state: 'open',
    priority: 'med',
    user: { name: 'Kira Lopez', email: 'kira@parallaxrecords.co', cls: 'av-pr', avatar: 'KL', plan: 'Studio · monthly', mrr: 79, sessions30: 38, daw: 'Logic Pro 11', os: 'macOS 14.4', joinedMo: 4 },
    sla: { label: 'breach in 4h 12m', pct: 0.18, color: 'hsl(35,90%,60%)' },
    received: '4h ago',
    assignee: { name: 'Evan O.', avatar: 'EO', cls: 'av-pr', id: 'evan' },
    replies: 1,
    related: 'rfd_4419',
    thread: [
      { from: 'user', at: '4h ago', body: "I've tried 6 different chains over the last week and the masters are flat compared to v3. Asked for v3 toggle in chat last week, was told no. I'd like a refund for this month — it's not what I'm paying for." }
    ],
    suggested: 'quality-comp'
  },
  {
    id: 'tkt_8839',
    subject: 'Forgot to cancel before annual renewal — refund?',
    snippet: 'Switched to Logic in March, didn\'t use the plugin, auto-renew hit 12 days ago.',
    channel: 'webform',
    tag: 'billing',
    state: 'open',
    priority: 'med',
    user: { name: 'Noah Bergman', email: 'noah@blackcastlestudio.io', cls: 'av-bh', avatar: 'NB', plan: 'Pro · annual', mrr: 16.58, sessions30: 0, daw: 'Logic Pro 11', os: 'macOS 14.5', joinedMo: 14 },
    sla: { label: '5h 46m', pct: 0.24, color: 'hsl(35,90%,60%)' },
    received: '14m ago',
    assignee: null,
    replies: 0,
    related: 'rfd_4421',
    thread: [
      { from: 'user', at: '14m ago', body: "Hey — I switched to Logic in March and forgot the auto-renew. Haven't used the plugin since Mar 4. Asking for a refund of the year I won't use. Happy to provide proof of switch." }
    ],
    suggested: 'refund-prorate'
  },
  {
    id: 'tkt_8836',
    subject: 'Studio plan: removing a seat removes their saved presets too?',
    snippet: 'When we removed Theo from the org his preset library disappeared from shared. Is this expected?',
    channel: 'email',
    tag: 'account',
    state: 'open',
    priority: 'low',
    user: { name: 'Maya Chen', email: 'maya@blueheronstudios.com', cls: 'av-bh', avatar: 'MC', plan: 'Studio · annual', mrr: 280, sessions30: 212, daw: 'Pro Tools 2024', os: 'macOS 14.4', joinedMo: 21 },
    sla: { label: '21h 04m', pct: 0.88, color: 'hsl(150,70%,55%)' },
    received: '3h ago',
    assignee: { name: 'Rin A.', avatar: 'RA', cls: 'av-bh', id: 'rin' },
    replies: 2,
    related: 'rfd_4413',
    thread: [
      { from: 'user',  at: '3h ago', body: "When we removed Theo from the org last week his preset library disappeared from shared. Is this expected? Six of those were chains the whole team was using." },
      { from: 'staff', at: '2h ago', body: "Hi Maya — yes, that's the current behavior: presets follow the seat, not the org. We have an org-shared preset library on the roadmap (target Q3). For recovery, I can pull Theo's presets from our backup and restore them to a seat of your choosing. Want me to?", who: 'Rin Ahmadi', avatar: 'RA', cls: 'av-bh', signature: 'Support · Zenphony Audio' },
      { from: 'user',  at: '1h ago', body: "Yes please. Restore to maya@blueheronstudios.com." }
    ],
    suggested: 'preset-restore'
  },
  {
    id: 'tkt_8834',
    subject: 'Pro Tools 2024 + Buddy: latency reported as 0 but feels delayed',
    snippet: "PT shows 0 samples but I'm getting ~12ms audible offset on monitoring path.",
    channel: 'forum',
    tag: 'daw',
    state: 'open',
    priority: 'med',
    user: { name: 'Theo Holmberg', email: 'theo@redaxe.studio', cls: 'av-vs', avatar: 'TH', plan: 'Solo · monthly', mrr: 16, sessions30: 41, daw: 'Pro Tools 2024.6', os: 'macOS 14.4', joinedMo: 6 },
    sla: { label: '11h 22m', pct: 0.46, color: 'hsl(35,90%,60%)' },
    received: '5h ago',
    assignee: { name: 'Priya S.', avatar: 'PS', cls: 'av-lc', id: 'priya' },
    replies: 1,
    related: 'thr_8839',
    thread: [
      { from: 'user', at: '5h ago', body: "PT 2024 shows 0 samples reported by Buddy but I'm getting ~12ms audible offset on the monitoring path. Crossed checked with a click test. Anyone else?" }
    ],
    suggested: 'pt-latency-investigate'
  },
  {
    id: 'tkt_8831',
    subject: 'Plugin not showing up in Cubase 13 inserts after install',
    snippet: 'Installer succeeded, scan ran, but Buddy isn\'t in the inserts list. Restart didn\'t help.',
    channel: 'chat',
    tag: 'install',
    state: 'open',
    priority: 'high',
    user: { name: 'Sasha Liu', email: 'sasha@modernsounds.studio', cls: 'av-ms', avatar: 'SL', plan: 'Pro · monthly', mrr: 16, sessions30: 88, daw: 'Cubase 13.0.40', os: 'Windows 11', joinedMo: 11 },
    sla: { label: 'breach in 1h 18m', pct: 0.10, color: 'hsl(355,80%,62%)' },
    received: '6h ago',
    assignee: null,
    replies: 0,
    related: null,
    thread: [
      { from: 'user', at: '6h ago', body: "Installer succeeded, scan ran, but Buddy isn't in the inserts list in Cubase 13. Restart didn't help. Have v2.4.1 .dll in C:\\Program Files\\Common Files\\VST3\\." }
    ],
    suggested: 'cubase-vst3-rescan'
  },
  {
    id: 'tkt_8829',
    subject: 'Can I export the listening impression as a .txt with timestamps?',
    snippet: 'Would love to drop the impression text into my session notes after each pass.',
    channel: 'forum',
    tag: 'feature',
    state: 'open',
    priority: 'low',
    user: { name: 'Ren Almeida', email: 'ren@coastline.records', cls: 'av-pr', avatar: 'RA', plan: 'Pro · annual', mrr: 16.58, sessions30: 24, daw: 'Ableton Live 12', os: 'macOS 14.5', joinedMo: 8 },
    sla: { label: '2d 04h', pct: 0.92, color: 'hsl(150,70%,55%)' },
    received: '8h ago',
    assignee: { name: 'Rin A.', avatar: 'RA', cls: 'av-bh', id: 'rin' },
    replies: 1,
    related: null,
    thread: [
      { from: 'user', at: '8h ago', body: "Would love to drop the impression text into my session notes after each pass. Even .txt would be fine — just want timestamps + text." },
      { from: 'staff', at: '6h ago', body: "Logged as a feature request — voting open on the forum (thread linked). Will follow up if it gets traction.", who: 'Rin Ahmadi', avatar: 'RA', cls: 'av-bh', signature: 'Support · Zenphony Audio' }
    ],
    suggested: 'feature-logged'
  },
  {
    id: 'tkt_8825',
    subject: 'Studio seat invite went to spam, can you resend?',
    snippet: 'My new engineer didn\'t get the seat invite. Spam, I guess.',
    channel: 'email',
    tag: 'account',
    state: 'open',
    priority: 'low',
    user: { name: 'Marcus Reyes', email: 'admin@lofi-coop.org', cls: 'av-lc', avatar: 'LC', plan: 'Pro · annual', mrr: 16.58, sessions30: 142, daw: 'Bitwig 5', os: 'macOS 14.4', joinedMo: 11 },
    sla: { label: '23h 41m', pct: 0.99, color: 'hsl(150,70%,55%)' },
    received: '12h ago',
    assignee: null,
    replies: 0,
    related: null,
    thread: [
      { from: 'user', at: '12h ago', body: "My new engineer didn't get the seat invite. Spam, I guess. Can you resend to dani@lofi-coop.org?" }
    ],
    suggested: 'resend-invite'
  }
];

const SAVED_REPLIES = [
  { id: 'rb-2402',         label: 'Roll back to 2.4.0 instructions',   tag: 'bug',     used: 47, body: 'Here\'s how to roll back to 2.4.0 while we ship the fix:\n\n1. Sign in to your account at zenphony.audio\n2. Navigate to Downloads → Previous versions\n3. Run the 2.4.0 installer for your platform\n\nYour preset library and license are unaffected. We\'ll let you know the moment 2.4.2 ships.' },
  { id: 'quality-comp',    label: 'Quality complaint · comp credit',   tag: 'quality', used: 18, body: '{{first_name}}, thanks for the detailed feedback — that\'s the kind of report that actually helps us tune the model. I\'ve added 1 month of credit to your account as a goodwill gesture while we work on the v4 quality issues you flagged. Forwarding the audio examples to the model team.' },
  { id: 'refund-prorate',  label: 'Annual refund · prorate offer',     tag: 'billing', used: 31, body: 'I can process a prorated refund for the unused portion of your annual term. Based on your last sign-in ({{last_seen}}) that comes to {{prorate_amount}}. Reply to confirm and I\'ll push it through Stripe — refunds typically land in 3-5 business days.' },
  { id: 'preset-restore',  label: 'Preset restore from backup',        tag: 'account', used: 8,  used2: '8', body: 'Restoring {{seat_name}}\'s presets to {{target_email}} now. You\'ll see them populate in the next 5 minutes — they\'ll appear under "Restored" in your library. Worth noting: org-shared presets are on the Q3 roadmap, so we won\'t lose this pattern again.' },
  { id: 'cubase-vst3-rescan', label: 'Cubase VST3 rescan',             tag: 'install', used: 12, body: 'Cubase caches its plugin index aggressively. Try this:\n\n1. Quit Cubase\n2. Studio → VST Plug-in Manager → "Reset Blocklist"\n3. Delete the contents of %APPDATA%\\Steinberg\\Cubase 13\\plug-in cache\n4. Relaunch Cubase\n\nBuddy should appear under "VST3 → Zenphony Audio" on next scan. If not, attach the plugin scan log and I\'ll dig in.' },
  { id: 'pt-latency-investigate', label: 'Pro Tools latency investigation', tag: 'daw', used: 4, body: 'Going to need a few details to chase this down:\n\n• Buffer size during the test\n• Sample rate\n• Whether you\'re monitoring through the DAW or hardware\n• Pro Tools build (Help → About)\n\nThe 0-sample report from Buddy is accurate for the processing path; the 12ms you\'re hearing is likely elsewhere in the chain. Click test results would help.' },
  { id: 'feature-logged',  label: 'Feature request · logged',          tag: 'feature', used: 92, body: 'Logged as a feature request — voting open on the forum (thread linked). Will follow up if it gets traction. Thanks for taking the time to write it up.' },
  { id: 'resend-invite',   label: 'Resend seat invite',                tag: 'account', used: 27, body: 'Resent the invite to {{target_email}}. New link is valid for 7 days. If it doesn\'t arrive in 5 minutes, ask them to check spam — Outlook in particular tends to flag transactional mail with links in it.' }
];

const TEAM_QUEUES = [
  { id: 'evan',   name: 'Evan Ortiz',   role: 'Revenue ops',   avatar: 'EO', cls: 'av-pr', open: 7,  median: '11m',  csat: 96, load: 0.82 },
  { id: 'rin',    name: 'Rin Ahmadi',   role: 'Support',       avatar: 'RA', cls: 'av-bh', open: 5,  median: '14m',  csat: 94, load: 0.55 },
  { id: 'priya',  name: 'Priya Shah',   role: 'Plugin lead',   avatar: 'PS', cls: 'av-lc', open: 4,  median: '38m',  csat: 92, load: 0.44 },
  { id: 'maya',   name: 'Maya Chen',    role: 'Trust & safety',avatar: 'MC', cls: 'av-bh', open: 2,  median: '52m',  csat: 100, load: 0.22 },
  { id: 'auto',   name: 'Auto-replies', role: 'System',        avatar: 'SY', cls: '',      open: 0,  median: '< 1m', csat: 88, load: 0.14 }
];

const CSAT_SPARK = [4.6, 4.7, 4.5, 4.8, 4.9, 4.7, 4.8, 4.9, 5.0, 4.8, 4.6, 4.7, 4.9, 4.8];
const VOLUME_SPARK = [22, 28, 24, 19, 31, 35, 26, 22, 18, 24, 27, 23, 29, 31];

/* ───────── screen ───────── */

function SupportScreen({ selectedId, setSelectedId, queue, setQueue, replyDraft, setReplyDraft }) {
  const q = queue || 'inbox';
  const filtered = useMmS(() => {
    if (q === 'mine')        return TICKETS.filter(t => t.assignee && t.assignee.id === 'evan');
    if (q === 'unassigned')  return TICKETS.filter(t => !t.assignee);
    if (q === 'awaiting')    return TICKETS.filter(t => t.thread[t.thread.length-1].from === 'staff');
    if (q === 'breach')      return TICKETS.filter(t => t.sla.pct < 0.20);
    if (q === 'snoozed')     return [];
    if (q === 'resolved')    return [];
    return TICKETS;
  }, [q]);
  const sel = TICKETS.find(t => t.id === selectedId) || filtered[0] || TICKETS[0];

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Support inbox</h1>
          <div className="sub">23 open · median first reply 12m · CSAT 94% · 3 SLA at risk</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="search"/> Cmd-K</button>
          <button className="adm-btn adm-btn-ghost">Saved replies</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="plus"/> Manual ticket</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="sup-kpis">
        <div className="sup-kpi">
          <div className="k">Open · all queues</div>
          <div className="v">23</div>
          <SupSpark data={VOLUME_SPARK} stroke="hsl(190,80%,65%)" tone="cyan"/>
          <div className="s">↑ 14% vs prior 7d · 8 created today</div>
        </div>
        <div className="sup-kpi">
          <div className="k">Median first reply</div>
          <div className="v">12<small>m</small></div>
          <div className="bar"><div className="fill" style={{width: '78%', background: 'hsl(150,70%,55%)'}}/></div>
          <div className="s">target 30m · 0 breaches today</div>
        </div>
        <div className="sup-kpi">
          <div className="k">CSAT · last 30d</div>
          <div className="v">94<small>%</small></div>
          <SupSpark data={CSAT_SPARK} stroke="hsl(150,70%,60%)" tone="green" min={4.0} max={5.0}/>
          <div className="s">412 surveys · ↑1pt vs prior 30d</div>
        </div>
        <div className="sup-kpi warn">
          <div className="k">SLA at risk</div>
          <div className="v">3</div>
          <div className="risk">
            <div className="dot" style={{background: 'hsl(355,80%,62%)'}}/><span>2 breach in &lt;1h</span>
          </div>
          <div className="s">tkt_8842 · tkt_8831 · tkt_8839</div>
        </div>
        <div className="sup-kpi">
          <div className="k">Channel mix · 7d</div>
          <div className="channels">
            <span className="ch"><i style={{background: SUPPORT_CHANNELS.email.color}}/>email <em>54%</em></span>
            <span className="ch"><i style={{background: SUPPORT_CHANNELS.chat.color}}/>chat <em>22%</em></span>
            <span className="ch"><i style={{background: SUPPORT_CHANNELS.forum.color}}/>forum <em>14%</em></span>
            <span className="ch"><i style={{background: SUPPORT_CHANNELS.webform.color}}/>web <em>8%</em></span>
            <span className="ch"><i style={{background: SUPPORT_CHANNELS.twitter.color}}/>x <em>2%</em></span>
          </div>
        </div>
      </div>

      {/* main 3-col layout: queues / list / detail */}
      <div className="sup-shell">
        <aside className="sup-rail adm-card">
          <div className="adm-card-h" style={{padding: '12px 14px'}}>
            <h3 style={{fontSize: 12}}>Queues</h3>
          </div>
          <div className="sup-rail-list">
            {SUPPORT_QUEUES.map(qq => (
              <button
                key={qq.id}
                className={`sup-rail-q ${q===qq.id?'on':''} ${qq.warn?'warn':''}`}
                onClick={() => setQueue(qq.id)}
              >
                <span className="lbl">{qq.label}</span>
                <span className="meta">{qq.hint}</span>
                <span className="ct">{qq.count}</span>
              </button>
            ))}
          </div>
          <div className="sup-rail-h">Tags</div>
          <div className="sup-rail-tags">
            {Object.entries(SUPPORT_TAGS).map(([k, v]) => (
              <span key={k} className="sup-tag-pill" style={{color: v.color, borderColor: v.color+'55'}}>
                {v.label}
              </span>
            ))}
          </div>
          <div className="sup-rail-h">Saved views</div>
          <div className="sup-rail-list">
            <button className="sup-rail-q small"><span className="lbl">v2.4.1 regressions</span><span className="ct">5</span></button>
            <button className="sup-rail-q small"><span className="lbl">Annual refunds</span><span className="ct">2</span></button>
            <button className="sup-rail-q small"><span className="lbl">Studio org issues</span><span className="ct">1</span></button>
          </div>
        </aside>

        <div className="adm-card sup-list">
          <div className="adm-card-h">
            <h3>{labelFor(q)} <span className="build-pill canary" style={{marginLeft: 6}}>{filtered.length}</span></h3>
            <span className="sub">sorted by SLA · oldest at top</span>
            <div className="spacer"/>
            <button className="adm-btn adm-btn-ghost" style={{padding: '3px 10px', fontSize: 10}}>Bulk · 0 selected</button>
          </div>
          <div className="sup-rows">
            {filtered.map(t => (
              <TicketRow key={t.id} t={t} active={t.id===sel?.id} onPick={() => setSelectedId(t.id)} />
            ))}
            {filtered.length === 0 && (
              <div style={{padding: '40px 16px', textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', fontSize: 12}}>
                No tickets in {labelFor(q).toLowerCase()}.
              </div>
            )}
          </div>
        </div>

        <div className="adm-card sup-detail">
          {sel ? <TicketDetail t={sel} replyDraft={replyDraft} setReplyDraft={setReplyDraft}/> : (
            <div className="ud-empty">
              <div className="glyph"><AIcon name="mail"/></div>
              <h3>Inbox zero</h3>
            </div>
          )}
        </div>
      </div>

      {/* bottom: team load + saved replies library */}
      <div className="sup-bottom">
        <div className="adm-card">
          <div className="adm-card-h">
            <h3>Team load</h3>
            <span className="sub">today · live</span>
            <div className="spacer"/>
            <span className="lnk">Auto-route rules ›</span>
          </div>
          <div className="sup-team">
            {TEAM_QUEUES.map(m => (
              <div key={m.id} className="sup-team-row">
                <span className={`mini-avatar ${m.cls}`}>{m.avatar}</span>
                <div className="sup-team-id">
                  <div className="n">{m.name}</div>
                  <div className="r">{m.role}</div>
                </div>
                <div className="sup-team-stat">
                  <div className="k">open</div>
                  <div className="v">{m.open}</div>
                </div>
                <div className="sup-team-stat">
                  <div className="k">median 1st</div>
                  <div className="v">{m.median}</div>
                </div>
                <div className="sup-team-stat">
                  <div className="k">csat</div>
                  <div className="v">{m.csat}%</div>
                </div>
                <div className="sup-team-load">
                  <div className="bar">
                    <div className="fill" style={{
                      width: `${m.load*100}%`,
                      background: m.load > 0.8 ? 'hsl(355,80%,62%)' : m.load > 0.6 ? 'hsl(35,90%,60%)' : 'hsl(150,70%,55%)'
                    }}/>
                  </div>
                  <div className="lbl">{Math.round(m.load*100)}% capacity</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <h3>Saved replies</h3>
            <span className="sub">{SAVED_REPLIES.length} templates · merge fields auto-filled</span>
            <div className="spacer"/>
            <span className="lnk">New template ›</span>
          </div>
          <div className="sup-replies">
            {SAVED_REPLIES.map(r => {
              const t = SUPPORT_TAGS[r.tag];
              return (
                <div key={r.id} className="sup-reply">
                  <div className="sup-reply-h">
                    <span className="sup-reply-tag" style={{color: t.color, borderColor: t.color+'55'}}>{t.label}</span>
                    <div className="sup-reply-name">{r.label}</div>
                    <div className="spacer"/>
                    <span className="sup-reply-used">used <strong>{r.used}</strong>×</span>
                  </div>
                  <div className="sup-reply-body">{r.body.split('\n')[0]}…</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function labelFor(q) {
  const found = SUPPORT_QUEUES.find(x => x.id === q);
  return found ? found.label : 'Inbox';
}

/* ───────── ticket row ───────── */

function TicketRow({ t, active, onPick }) {
  const ch = SUPPORT_CHANNELS[t.channel];
  const tag = SUPPORT_TAGS[t.tag];
  return (
    <div className={`sup-row ${active?'is-active':''} prio-${t.priority}`} onClick={onPick}>
      <span className={`mini-avatar ${t.user.cls}`}>{t.user.avatar}</span>
      <div className="sup-row-id">
        <div className="sup-row-name">{t.user.name}</div>
        <div className="sup-row-meta">
          <span className="sup-row-ch" style={{color: ch.color}}>● {ch.label}</span>
          <span className="sup-row-id-num">{t.id}</span>
        </div>
      </div>
      <div className="sup-row-body">
        <div className="sup-row-subj">
          <span className="sup-row-tag" style={{color: tag.color, borderColor: tag.color+'55'}}>{tag.label}</span>
          {t.subject}
        </div>
        <div className="sup-row-snip">{t.snippet}</div>
      </div>
      <div className="sup-row-meta-r">
        <div className="sup-row-sla" style={{color: t.sla.color}}>
          <div className="bar"><span style={{width: `${Math.max(2,t.sla.pct*100)}%`, background: t.sla.color}}/></div>
          <span>{t.sla.label}</span>
        </div>
        <div className="sup-row-asg">
          {t.assignee ? (
            <><span className={`mini-avatar tiny ${t.assignee.cls}`}>{t.assignee.avatar}</span>{t.assignee.name}</>
          ) : (
            <span className="sup-row-unas">unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── ticket detail ───────── */

function TicketDetail({ t, replyDraft, setReplyDraft }) {
  const ch = SUPPORT_CHANNELS[t.channel];
  const tag = SUPPORT_TAGS[t.tag];
  const reply = SAVED_REPLIES.find(r => r.id === t.suggested);
  const draftKey = `t-${t.id}`;
  const draft = (replyDraft && replyDraft.key === draftKey) ? replyDraft.body : '';

  return (
    <>
      <div className="adm-card-h sup-detail-h">
        <div>
          <h3>{t.subject}</h3>
          <div className="sub">
            {t.id} · <span style={{color: ch.color}}>{ch.label}</span> · received {t.received} · {t.replies} replies
            {t.related && <> · <code>{t.related}</code></>}
          </div>
        </div>
        <div className="spacer"/>
        <div className="sup-detail-actions">
          <button className="adm-btn adm-btn-ghost" title="Snooze">⏱</button>
          <button className="adm-btn adm-btn-ghost" title="Link to bug">⛓</button>
          <button className="adm-btn adm-btn-ghost">Assign…</button>
          <button className="adm-btn adm-btn-primary">Resolve</button>
        </div>
      </div>

      <div className="sup-detail-body">
        {/* account context strip */}
        <div className="sup-ctx">
          <div className="sup-ctx-user">
            <span className={`mini-avatar ${t.user.cls}`} style={{width:36,height:36,fontSize:12}}>{t.user.avatar}</span>
            <div>
              <div className="sup-ctx-name">{t.user.name}</div>
              <div className="sup-ctx-mail">{t.user.email}</div>
            </div>
          </div>
          <div className="sup-ctx-grid">
            <div className="sup-ctx-cell">
              <div className="k">Plan</div>
              <div className="v">{t.user.plan}</div>
            </div>
            <div className="sup-ctx-cell">
              <div className="k">MRR</div>
              <div className="v">${t.user.mrr.toFixed(2)}</div>
            </div>
            <div className="sup-ctx-cell">
              <div className="k">Sessions · 30d</div>
              <div className="v">{t.user.sessions30}</div>
            </div>
            <div className="sup-ctx-cell">
              <div className="k">DAW</div>
              <div className="v">{t.user.daw}</div>
            </div>
            <div className="sup-ctx-cell">
              <div className="k">OS</div>
              <div className="v">{t.user.os}</div>
            </div>
            <div className="sup-ctx-cell">
              <div className="k">Account age</div>
              <div className="v">{t.user.joinedMo} mo</div>
            </div>
          </div>
          <div className="sup-ctx-foot">
            <span className="lnk">Open user ↗</span>
            <span className="sup-ctx-sep">·</span>
            <span className="lnk">Recent sessions (12)</span>
            <span className="sup-ctx-sep">·</span>
            <span className="lnk">Past tickets (4)</span>
            <span className="sup-ctx-sep">·</span>
            <span className="lnk">Impersonate (read-only)</span>
          </div>
        </div>

        {/* conversation */}
        <div className="sup-thread">
          {t.thread.map((m, i) => (
            <div key={i} className={`sup-msg from-${m.from}`}>
              {m.from === 'staff' ? (
                <span className={`mini-avatar tiny ${m.cls||''}`} title={m.who}>{m.avatar}</span>
              ) : (
                <span className={`mini-avatar tiny ${t.user.cls}`}>{t.user.avatar}</span>
              )}
              <div className="sup-msg-bubble">
                <div className="sup-msg-h">
                  <strong>{m.from === 'staff' ? m.who : t.user.name}</strong>
                  <span className="sup-msg-when">{m.at}</span>
                  {m.from === 'staff' && <span className="sup-msg-internal">staff reply</span>}
                </div>
                <div className="sup-msg-body">{m.body}</div>
                {m.attach && (
                  <div className="sup-msg-attach">
                    {m.attach.map(a => <span key={a} className="sup-attach">📎 {a}</span>)}
                  </div>
                )}
                {m.signature && <div className="sup-msg-sig">— {m.signature}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* compose box */}
        <div className="sup-compose">
          <div className="sup-compose-tabs">
            <button className="on">Reply to user</button>
            <button>Internal note</button>
            <button>Forward</button>
          </div>
          {reply && (
            <div className="sup-compose-suggest">
              <span className="suggest-tag">SUGGESTED</span>
              <span className="suggest-name">{reply.label}</span>
              <span className="spacer"/>
              <button className="adm-btn adm-btn-ghost" style={{padding: '3px 10px', fontSize: 10}} onClick={() => setReplyDraft({key: draftKey, body: reply.body})}>Insert</button>
            </div>
          )}
          <textarea
            className="sup-compose-input"
            placeholder="Write a reply… use / for saved replies, @ to mention a teammate, # to link a thread"
            value={draft}
            onChange={(e) => setReplyDraft({key: draftKey, body: e.target.value})}
          />
          <div className="sup-compose-foot">
            <span className="sup-compose-merge">merges {`{{first_name}}, {{plan}}, {{prorate_amount}}`}</span>
            <div className="spacer"/>
            <button className="adm-btn adm-btn-ghost">Save draft</button>
            <button className="adm-btn adm-btn-ghost">Reply &amp; snooze 24h</button>
            <button className="adm-btn adm-btn-primary">Send reply</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── tiny sparkline ───────── */
function SupSpark({ data, stroke, tone, min, max }) {
  const w = 110, h = 26, pad = 2;
  const lo = min != null ? min : Math.min(...data);
  const hi = max != null ? max : Math.max(...data);
  const sx = i => pad + (i / (data.length - 1)) * (w - pad*2);
  const sy = v => h - pad - ((v - lo) / (hi - lo || 1)) * (h - pad*2);
  const d = data.map((v, i) => `${i===0?'M':'L'} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(' ');
  const fill = data.map((v, i) => `${i===0?'M':'L'} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(' ') + ` L ${sx(data.length-1).toFixed(1)} ${h-pad} L ${pad} ${h-pad} Z`;
  return (
    <svg className="sup-spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <path d={fill} fill={stroke} opacity="0.16"/>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

Object.assign(window, { SupportScreen });
