/* ============================================================================
   ADMIN — REFUNDS & DISPUTES
   Approve refund requests, respond to chargebacks, track recovery rates.
   ============================================================================ */
const { useState: useStR, useMemo: useMmR } = React;

/* ---------- data ---------- */
const REFUND_REASONS = {
  duplicate:    { label: 'Duplicate charge',     color: 'hsl(220, 12%, 65%)' },
  feature:      { label: 'Missing feature',      color: 'hsl(190, 80%, 65%)' },
  quality:      { label: 'Output quality',       color: 'hsl(275, 100%, 72%)' },
  cancel_late:  { label: 'Forgot to cancel',     color: 'hsl(35, 90%, 62%)' },
  fraud:        { label: 'Unauthorized charge',  color: 'hsl(355, 80%, 65%)' },
  goodwill:     { label: 'Goodwill / comp',      color: 'hsl(150, 70%, 60%)' }
};

const REFUND_QUEUE = [
  {
    id: 'rfd_4421', kind: 'request', state: 'pending',
    user: { email: 'noah@blackcastlestudio.io', name: 'Noah Bergman', cls: 'av-bh', avatar: 'NB', plan: 'Pro · annual' },
    amount: 199.00, currency: 'USD', requested: '14m ago', sla: 'breach in 5h 46m', slaPct: 0.18,
    reason: 'cancel_late', summary: 'Forgot to cancel before annual renewal · billed 12d ago',
    note: 'I switched to Logic in March and forgot the auto-renew. Have not used the plugin since Mar 4. Asking for a refund of the year I won\'t use.',
    invoice: 'in_3PqM2V', stripeRef: 'ch_3PqM2V8nP', usage: '0 sessions in 12d', auto: 'eligible (within 14d window, low usage)'
  },
  {
    id: 'rfd_4419', kind: 'request', state: 'pending',
    user: { email: 'kira@parallaxrecords.co', name: 'Kira Lopez', cls: 'av-pr', avatar: 'KL', plan: 'Studio · monthly' },
    amount: 79.00, currency: 'USD', requested: '1h ago', sla: 'breach in 22h', slaPct: 0.04,
    reason: 'quality', summary: 'Pearl v4 mastering "lifeless" on ambient EP',
    note: 'Tried 6 different chains over the last week and the masters are flat compared to v3. Asked for v3 toggle, was told no. Want a refund for this month.',
    invoice: 'in_3PqL98', stripeRef: 'ch_3PqL98aB2', usage: '38 sessions in 6d', auto: 'manual review (high usage)'
  },
  {
    id: 'rfd_4418', kind: 'request', state: 'pending',
    user: { email: 'admin@lofi-coop.org', name: 'Marcus Reyes', cls: 'av-lc', avatar: 'LC', plan: 'Pro · annual' },
    amount: 16.58, currency: 'USD', requested: '3h ago', sla: 'breach in 21h', slaPct: 0.13,
    reason: 'feature', summary: 'Prorated refund · downgrade Pro→Indie',
    note: 'Just need the prorated portion for the remaining 30 days of Pro.',
    invoice: 'in_3PqK21', stripeRef: 'ch_3PqK21mN9', usage: '142 sessions in 11mo', auto: 'auto-prorate ready'
  },
  {
    id: 'rfd_4417', kind: 'request', state: 'pending',
    user: { email: 'team@subterra.audio', name: 'Dre Whitfield', cls: 'av-vs', avatar: 'SU', plan: 'Pro · monthly' },
    amount: 24.00, currency: 'USD', requested: '5h ago', sla: 'breach in 19h', slaPct: 0.21,
    reason: 'duplicate', summary: 'Stripe billed twice on Apr 18',
    note: 'Got two charges 4 minutes apart for the April invoice. Logs show one transaction.',
    invoice: 'in_3PqJ77', stripeRef: 'ch_3PqJ77x1A', usage: '94 sessions in 30d', auto: 'auto-approve eligible'
  },
  {
    id: 'rfd_4413', kind: 'request', state: 'in_review',
    user: { email: 'maya@blueheronstudios.com', name: 'Maya Chen', cls: 'av-bh', avatar: 'BH', plan: 'Studio · annual' },
    amount: 79.00, currency: 'USD', requested: '8h ago', sla: 'breach in 16h', slaPct: 0.34,
    reason: 'goodwill', summary: 'Comp credit · render crash batch (sess_912340 cluster)',
    note: 'Engine OOM lost 4 sessions. Granting one month back as goodwill.',
    invoice: 'in_3PqI55', stripeRef: 'ch_3PqI55dE3', usage: '212 sessions in 30d', auto: 'manual · staff initiated', operator: 'evan@'
  },
  {
    id: 'rfd_4408', kind: 'dispute', state: 'pending',
    user: { email: 'unknown@iclouds.email', name: '"Sarah J."', cls: 'av-pr', avatar: 'SJ', plan: 'Indie · monthly' },
    amount: 19.00, currency: 'USD', requested: '11h ago', sla: 'evidence due 5d 12h', slaPct: 0.09,
    reason: 'fraud', summary: 'Chargeback · "card not recognized"',
    note: 'Issuer: Chase. Reason code 4863 (cardholder doesn\'t recognize). Account created 4 days before charge. Single signup IP, single render.',
    invoice: 'in_3PqH09', stripeRef: 'ch_3PqH09zZ7', usage: '1 session in 14d', auto: 'evidence templated', disputeId: 'dp_1NtQX9'
  }
];

const RECENT_DECISIONS = [
  { id: 'rfd_4406', state: 'approved',  user: 'mira@homestudio.io',          amount: 49.00,  reason: 'cancel_late', operator: 'evan@',   at: '12m ago', ttd: '34m' },
  { id: 'rfd_4405', state: 'approved',  user: 'colin@boutiqueparallel.co',   amount: 199.00, reason: 'duplicate',   operator: 'auto',    at: '38m ago', ttd: '2m'  },
  { id: 'rfd_4404', state: 'denied',    user: 'reaperfan@protonmail.com',    amount: 79.00,  reason: 'feature',     operator: 'evan@',   at: '1h ago',  ttd: '1h 12m' },
  { id: 'rfd_4403', state: 'partial',   user: 'liam@coastline.records',      amount: 99.50,  reason: 'quality',     operator: 'evan@',   at: '2h ago',  ttd: '4h',  note: '50% comp · split with Stripe' },
  { id: 'rfd_4402', state: 'recovered', user: 'unknown@protonmail.com',      amount: 39.00,  reason: 'fraud',       operator: 'maya@',   at: '4h ago',  ttd: '3d',  note: 'won via evidence packet' },
  { id: 'rfd_4400', state: 'lost',      user: 'unknown@gmail.com',           amount: 19.00,  reason: 'fraud',       operator: 'maya@',   at: '8h ago',  ttd: '6d',  note: 'issuer ruled for cardholder' },
  { id: 'rfd_4399', state: 'approved',  user: 'priya@homestudio.io',         amount: 16.58,  reason: 'feature',     operator: 'auto',    at: '14h ago', ttd: '4m'  },
  { id: 'rfd_4398', state: 'approved',  user: 'sasha@modernsounds.studio',   amount: 199.00, reason: 'cancel_late', operator: 'evan@',   at: '21h ago', ttd: '2h'  }
];

const EVIDENCE_TEMPLATES = [
  { id: 'subscription_proof',  label: 'Subscription proof packet',     desc: 'Receipts, ToS acceptance, signup IP, billing portal access logs',    fields: 8,  winRate: 0.74 },
  { id: 'usage_proof',         label: 'Active usage evidence',         desc: 'Session count, plugin auth events, IP geolocation match',            fields: 6,  winRate: 0.68 },
  { id: 'cancellation_proof',  label: 'Cancellation policy + flow',    desc: 'Public refund policy, cancel-anytime UX screenshots, ToS section',   fields: 5,  winRate: 0.61 },
  { id: 'identity_proof',      label: 'Identity verification trail',   desc: '2FA enrollment, password change history, account recovery events',   fields: 4,  winRate: 0.52 }
];

/* ---------- screen ---------- */
function RefundsScreen({ selectedId, setSelectedId, queueFilter, setQueueFilter }) {
  const filter = queueFilter || 'all';
  const filtered = useMmR(() => {
    if (filter === 'all')      return REFUND_QUEUE;
    if (filter === 'requests') return REFUND_QUEUE.filter(r => r.kind === 'request');
    if (filter === 'disputes') return REFUND_QUEUE.filter(r => r.kind === 'dispute');
    if (filter === 'auto')     return REFUND_QUEUE.filter(r => r.auto && r.auto.startsWith('auto'));
    if (filter === 'breach')   return REFUND_QUEUE.filter(r => r.slaPct < 0.2);
    return REFUND_QUEUE;
  }, [filter]);
  const sel = REFUND_QUEUE.find(r => r.id === selectedId) || filtered[0] || REFUND_QUEUE[0];

  // recovery numbers (last 30d)
  const totalRequested = 14820;
  const refunded = 9240;
  const recovered = 4180;
  const recoveryRate = recovered / (recovered + 1900); // disputes won / total disputes
  const refundRate = refunded / 184320; // % of MRR

  return (
    <>
      <div className="adm-page-h">
        <div><h1>Refunds &amp; disputes</h1><div className="sub">{REFUND_QUEUE.filter(r=>r.state==='pending').length} pending · 1 active dispute · {(recoveryRate*100).toFixed(0)}% chargeback win rate · last 30d</div></div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIcon name="download"/> Export 30d</button>
          <button className="adm-btn adm-btn-ghost">Stripe sync</button>
          <button className="adm-btn adm-btn-primary"><AIcon name="plus"/> Manual refund</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="rfd-kpis">
        <div className="rfd-kpi">
          <div className="k">Refunded · 30d</div>
          <div className="v">${(refunded/1000).toFixed(1)}<small>k</small></div>
          <div className="s">{(refundRate*100).toFixed(2)}% of gross MRR · ↓0.18% vs prior</div>
        </div>
        <div className="rfd-kpi">
          <div className="k">Disputed · 30d</div>
          <div className="v">$1,900</div>
          <div className="s">8 chargebacks · 5 won · 2 lost · 1 open</div>
        </div>
        <div className="rfd-kpi">
          <div className="k">Auto-approved</div>
          <div className="v">62<small>%</small></div>
          <div className="s">duplicate + low-usage refunds</div>
        </div>
        <div className="rfd-kpi">
          <div className="k">Median time-to-decision</div>
          <div className="v">2h <small>14m</small></div>
          <div className="s">SLA target 24h · 0 breaches</div>
        </div>
        <div className="rfd-kpi">
          <div className="k">Recovery rate</div>
          <div className="v">{(recoveryRate*100).toFixed(0)}<small>%</small></div>
          <div className="s">won evidence packets · target 70%</div>
        </div>
      </div>

      {/* filters */}
      <div className="uf-segs">
        <button className={`uf-seg ${filter==='all'?'on':''}`} onClick={()=>setQueueFilter('all')}>All<span className="badge">{REFUND_QUEUE.length}</span></button>
        <button className={`uf-seg ${filter==='requests'?'on':''}`} onClick={()=>setQueueFilter('requests')}>Refund requests<span className="badge">{REFUND_QUEUE.filter(r=>r.kind==='request').length}</span></button>
        <button className={`uf-seg ${filter==='disputes'?'on':''}`} onClick={()=>setQueueFilter('disputes')}>Chargebacks<span className="badge">{REFUND_QUEUE.filter(r=>r.kind==='dispute').length}</span></button>
        <button className={`uf-seg ${filter==='auto'?'on':''}`} onClick={()=>setQueueFilter('auto')}>Auto-eligible<span className="badge">{REFUND_QUEUE.filter(r=>r.auto && r.auto.startsWith('auto')).length}</span></button>
        <button className={`uf-seg warn ${filter==='breach'?'on':''}`} onClick={()=>setQueueFilter('breach')}>SLA risk<span className="badge">{REFUND_QUEUE.filter(r=>r.slaPct<0.2).length}</span></button>
      </div>

      <div className="rfd-shell">
        {/* queue */}
        <div className="adm-card rfd-queue">
          <div className="adm-card-h">
            <h3>Queue</h3>
            <span className="sub">SLA bar shows time remaining · click for details</span>
          </div>
          <div className="rfd-rows">
            {filtered.map(r => <RefundRow key={r.id} r={r} active={r.id===sel.id} onPick={()=>setSelectedId(r.id)}/>)}
            {filtered.length === 0 && (
              <div style={{padding:'40px 16px',textAlign:'center',color:'var(--muted-foreground)',fontFamily:'var(--font-mono)',fontSize:12}}>
                Nothing in this filter. Queue is clear.
              </div>
            )}
          </div>
        </div>

        {/* detail */}
        <div className="adm-card rfd-detail">
          {sel ? <RefundDetail r={sel}/> : <div className="ud-empty"><div className="glyph"><AIcon name="refund"/></div><h3>Queue clear</h3></div>}
        </div>
      </div>

      {/* recent decisions + evidence templates */}
      <div className="rfd-bottom">
        <div className="adm-card">
          <div className="adm-card-h"><h3>Recent decisions</h3><span className="sub">last 24h</span></div>
          <div className="rfd-decisions">
            {RECENT_DECISIONS.map(d => {
              const re = REFUND_REASONS[d.reason];
              return (
                <div key={d.id} className="rfd-dec-row">
                  <span className={`rfd-dec-state st-${d.state}`}>{d.state}</span>
                  <span className="rfd-dec-amt">${d.amount.toFixed(2)}</span>
                  <span className="rfd-dec-user">{d.user}</span>
                  <span className="rfd-dec-reason" style={{color: re.color, borderColor: re.color+'40'}}>{re.label}</span>
                  <span className="rfd-dec-op">{d.operator}</span>
                  <span className="rfd-dec-time">{d.at}</span>
                  <span className="rfd-dec-ttd">ttd {d.ttd}</span>
                  {d.note && <span className="rfd-dec-note" title={d.note}>note</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-h"><h3>Chargeback evidence templates</h3><span className="sub">deploy in dispute response</span></div>
          <div className="rfd-evidence">
            {EVIDENCE_TEMPLATES.map(e => (
              <div key={e.id} className="rfd-evid">
                <div className="rfd-evid-h">
                  <div className="rfd-evid-name">{e.label}</div>
                  <div className="rfd-evid-win">
                    <span className="rfd-evid-win-bar"><span style={{width: `${e.winRate*100}%`}}/></span>
                    <span className="rfd-evid-win-l">{(e.winRate*100).toFixed(0)}% win</span>
                  </div>
                </div>
                <div className="rfd-evid-desc">{e.desc}</div>
                <div className="rfd-evid-foot">
                  <span>{e.fields} fields auto-filled</span>
                  <button className="adm-btn adm-btn-ghost" style={{padding:'3px 10px',fontSize:10}}>Preview</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function RefundRow({ r, active, onPick }) {
  const re = REFUND_REASONS[r.reason];
  const slaColor = r.slaPct < 0.15 ? 'hsl(355,80%,62%)' : r.slaPct < 0.3 ? 'hsl(35,90%,60%)' : 'hsl(150,70%,55%)';
  return (
    <div className={`rfd-row ${active?'is-active':''} ${r.kind==='dispute'?'is-dispute':''}`} onClick={onPick}>
      <span className={`mini-avatar ${r.user.cls}`}>{r.user.avatar}</span>
      <div className="rfd-row-id">
        <div className="rfd-row-name">
          {r.user.name}
          {r.kind === 'dispute' && <span className="rfd-dispute-badge">CHARGEBACK</span>}
        </div>
        <div className="rfd-row-email">{r.user.email} · {r.user.plan}</div>
      </div>
      <div className="rfd-row-summary">
        <div className="rfd-row-reason" style={{color: re.color, borderColor: re.color+'55'}}>{re.label}</div>
        <div className="rfd-row-text">{r.summary}</div>
      </div>
      <div className="rfd-row-amt">
        <div className="amt">${r.amount.toFixed(2)}</div>
        <div className="cur">{r.currency}</div>
      </div>
      <div className="rfd-row-sla">
        <div className="rfd-sla-bar"><span style={{width: `${Math.max(2,r.slaPct*100)}%`, background: slaColor}}/></div>
        <div className="rfd-sla-l" style={{color: slaColor}}>{r.sla}</div>
      </div>
      <div className="rfd-row-state">
        <span className={`rfd-state st-${r.state}`}>{r.state.replace('_',' ')}</span>
      </div>
    </div>
  );
}

function RefundDetail({ r }) {
  const re = REFUND_REASONS[r.reason];
  const isDispute = r.kind === 'dispute';
  return (
    <>
      <div className="adm-card-h">
        <h3>{r.id} <span className={`build-pill ${r.state==='pending'?'canary':r.state==='in_review'?'current':'previous'}`}>{r.state.replace('_',' ')}</span></h3>
        <span className="sub">{isDispute ? `Stripe dispute ${r.disputeId}` : `request · ${r.requested}`}</span>
      </div>
      <div className="rfd-detail-body">
        {/* user header */}
        <div className="rfd-detail-user">
          <span className={`mini-avatar ${r.user.cls}`} style={{width:40,height:40,fontSize:13}}>{r.user.avatar}</span>
          <div>
            <div className="rfd-du-name">{r.user.name}</div>
            <div className="rfd-du-meta">{r.user.email} · {r.user.plan}</div>
          </div>
          <div className="spacer"/>
          <button className="adm-btn adm-btn-ghost" style={{padding:'4px 10px',fontSize:11}}>Open user ↗</button>
        </div>

        {/* amount block */}
        <div className="rfd-amount-block">
          <div className="rfd-amount-l">
            <div className="k">{isDispute?'Disputed amount':'Refund amount'}</div>
            <div className="v">${r.amount.toFixed(2)}</div>
            <div className="s">{r.currency} · invoice <code>{r.invoice}</code> · <code>{r.stripeRef}</code></div>
          </div>
          {!isDispute && (
            <div className="rfd-prorate">
              <div className="rfd-pr-h">Auto-prorate</div>
              <div className="rfd-pr-row"><span>full period</span><code>$199.00</code></div>
              <div className="rfd-pr-row"><span>used (12d / 365d)</span><code>−$6.55</code></div>
              <div className="rfd-pr-row sum"><span>refundable</span><code>$192.45</code></div>
            </div>
          )}
        </div>

        {/* reason + note */}
        <div className="rfd-reason-block">
          <div className="rfd-reason-h">
            <span className="rfd-reason-tag" style={{color: re.color, borderColor: re.color+'55'}}>{re.label}</span>
            <span className="sub" style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--muted-foreground)'}}>auto-classifier confidence 0.92</span>
          </div>
          <div className="rfd-summary">{r.summary}</div>
          <div className="rfd-note">"{r.note}"</div>
        </div>

        {/* signal grid */}
        <div className="rfd-signal-grid">
          <div className="rfd-sig"><div className="k">Usage</div><div className="v">{r.usage}</div></div>
          <div className="rfd-sig"><div className="k">Auto eligibility</div><div className="v">{r.auto}</div></div>
          {r.operator && <div className="rfd-sig"><div className="k">Initiated by</div><div className="v">{r.operator}</div></div>}
          {isDispute && <div className="rfd-sig"><div className="k">Reason code</div><div className="v">4863 · cardholder unrecognized</div></div>}
        </div>

        {/* dispute-specific evidence builder */}
        {isDispute && (
          <div className="rfd-evid-builder">
            <div className="rfd-eb-h">
              <span>Evidence packet</span>
              <span className="sub">due in 5d 12h</span>
            </div>
            <div className="rfd-eb-checks">
              <label className="rfd-check on"><span className="box">✓</span>Subscription proof packet (8 fields)</label>
              <label className="rfd-check on"><span className="box">✓</span>Active usage evidence (1 session, IP match)</label>
              <label className="rfd-check"><span className="box"></span>Cancellation policy + flow (5 fields)</label>
              <label className="rfd-check"><span className="box"></span>Identity verification trail (4 fields)</label>
            </div>
            <div className="rfd-eb-meta">predicted win rate <strong>61%</strong> · staff-recommended action: submit on day 6 of 7</div>
          </div>
        )}

        {/* action bar */}
        <div className="rfd-actions">
          {isDispute ? (
            <>
              <button className="adm-btn adm-btn-ghost">Save evidence draft</button>
              <button className="adm-btn adm-btn-ghost">Accept loss</button>
              <button className="adm-btn adm-btn-primary">Submit evidence to Stripe</button>
            </>
          ) : (
            <>
              <button className="adm-btn adm-btn-ghost">Deny + send template</button>
              <button className="adm-btn adm-btn-ghost">Refund partial…</button>
              <button className="adm-btn adm-btn-primary">Approve full ${r.amount.toFixed(2)}</button>
            </>
          )}
        </div>

        <div className="rfd-foot">
          <span>↗ open Stripe charge</span>
          <span>·</span>
          <span>↗ user audit trail</span>
          <span>·</span>
          <span>↗ similar past requests (7)</span>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { RefundsScreen });
