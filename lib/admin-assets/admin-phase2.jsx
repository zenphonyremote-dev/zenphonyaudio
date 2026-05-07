/* ============================================================================
   ZENPHONY ADMIN — PHASE 2 (Customers)
   Users (split view) + Subscriptions (state-machine kanban).

   Wired to live data:
     GET /api/admin/users               — paginated profile list
     GET /api/admin/users/:id           — single profile + invoices + usage
     GET /api/admin/subscriptions       — kanban counts + previews

   Tabs in the user-detail pane that don't have real backends yet (Support,
   Forum) render explicit empty states. Audit trail derives from billing_events.
   ============================================================================ */

const { useState: useState2, useMemo: useMemo2, useEffect: useEffect2 } = React;

const PHASE2_FETCH_BASE = window.location.origin;

async function adminFetch(path) {
  const r = await fetch(PHASE2_FETCH_BASE + path, {
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });
  if (!r.ok) throw new Error('http_' + r.status);
  return r.json();
}

const PHASE2_PLAN_LABEL = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  max: 'Max',
};

function fmtState(s) {
  if (!s) return 'unknown';
  return String(s).replace('_', ' ');
}

/* ============================================================================
   USERS SCREEN — split view
   ============================================================================ */
const SAVED_SEGMENTS = [
  { id: 'all',       label: 'All users' },
  { id: 'paying',    label: 'Paying' },
  { id: 'past_due',  label: 'Past due',  danger: true },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'max',       label: 'Max plan' },
];

function UsersScreen({ selectedId, setSelectedId, segment, setSegment }) {
  const [data, setData] = useState2(null);
  const [error, setError] = useState2(null);
  const [search, setSearch] = useState2('');

  useEffect2(() => {
    let cancelled = false;
    adminFetch('/api/admin/users')
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message || 'failed'); });
    return () => { cancelled = true; };
  }, []);

  const allUsers = data?.users || [];
  const total = data?.total || 0;
  const paying = data?.paying || 0;
  const paidThisMonth = data?.paid_this_month || 0;

  const segmentCounts = useMemo2(() => {
    const c = { all: allUsers.length, paying: 0, past_due: 0, cancelled: 0, max: 0 };
    for (const u of allUsers) {
      if (u.plan !== 'free' && u.state === 'active') c.paying++;
      if (u.state === 'past_due') c.past_due++;
      if (u.state === 'cancelled') c.cancelled++;
      if (u.plan === 'max') c.max++;
    }
    return c;
  }, [allUsers]);

  const visible = useMemo2(() => {
    let list = allUsers;
    if (segment === 'paying')    list = list.filter(u => u.plan !== 'free' && u.state === 'active');
    if (segment === 'past_due')  list = list.filter(u => u.state === 'past_due');
    if (segment === 'cancelled') list = list.filter(u => u.state === 'cancelled');
    if (segment === 'max')       list = list.filter(u => u.plan === 'max');
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allUsers, segment, search]);

  const selected = useMemo2(() => {
    return allUsers.find(u => u.id === selectedId) || visible[0] || null;
  }, [allUsers, selectedId, visible]);

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Users</h1>
          <div className="sub">
            {data
              ? <>{total.toLocaleString()} total · {paying.toLocaleString()} paying · {paidThisMonth.toLocaleString()} paid this month</>
              : (error ? <span style={{color:'var(--destructive,#f88)'}}>Failed to load users</span> : 'Loading…')
            }
          </div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <button className="adm-btn adm-btn-ghost" disabled><AIcon name="download" /> Export segment</button>
        </div>
      </div>

      {/* Saved segments */}
      <div className="uf-segs">
        {SAVED_SEGMENTS.map(s => (
          <button
            key={s.id}
            className={`uf-seg ${segment === s.id ? 'on' : ''} ${s.danger ? 'danger' : ''}`}
            onClick={() => setSegment(s.id)}
          >
            {s.label}
            <span className="badge">{(segmentCounts[s.id] ?? 0).toLocaleString()}</span>
          </button>
        ))}
      </div>

      {/* Filter bar — simplified to working search only */}
      <div className="users-filters">
        <div className="uf-search">
          <AIcon name="search" />
          <input
            placeholder="Search by name, email, or user ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Split shell */}
      <div className="users-shell">
        {/* LEFT — table */}
        <div className="adm-card users-table-card">
          <div className="users-table-h">
            <span className="count"><strong>{visible.length}</strong> of {allUsers.length.toLocaleString()}</span>
            <div className="spacer" />
            <span className="count" style={{ color: 'var(--muted-foreground)' }}>Sort: Joined ↓</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="users-tbl">
              <colgroup>
                <col className="col-user" />
                <col className="col-plan" />
                <col className="col-state" />
                <col className="col-mrr" />
                <col className="col-last" />
              </colgroup>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>State</th>
                  <th className="r">MRR</th>
                  <th className="r">Joined</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr><td colSpan={5} style={{textAlign:'center', padding:24, color:'var(--muted-foreground)', fontSize:12}}>
                    {data ? 'No users match this segment.' : (error ? 'Could not load users.' : 'Loading users…')}
                  </td></tr>
                )}
                {visible.map(u => {
                  const isSel = selected && u.id === selected.id;
                  return (
                    <tr key={u.id} className={isSel ? 'is-selected' : ''} onClick={() => setSelectedId(u.id)}>
                      <td>
                        <div className="who-cell">
                          <div className={`mini-avatar ${u.cls || ''}`}>{u.avatar}</div>
                          <div className="who">
                            <div className="name">{u.name}{u.is_admin ? ' · admin' : ''}</div>
                            <div className="meta">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`plan-pill ${u.plan}`}>{u.plan}</span></td>
                      <td><span className={`state-pill ${u.state}`}><span className="dot" />{fmtState(u.state)}</span></td>
                      <td className="num">{u.mrr ? `$${u.mrr.toFixed(2)}` : '—'}</td>
                      <td className="num last">{u.since || '—'}</td>
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
   USER DETAIL — fetches per-user invoices + usage
   ============================================================================ */
function UserDetail({ user: u, onClose }) {
  const [tab, setTab] = useState2('billing');
  const [detail, setDetail] = useState2(null);
  const [loadingDetail, setLoadingDetail] = useState2(false);
  const [detailError, setDetailError] = useState2(null);

  useEffect2(() => {
    if (!u || !u.id) { setDetail(null); return; }
    let cancelled = false;
    setLoadingDetail(true);
    setDetailError(null);
    adminFetch('/api/admin/users/' + encodeURIComponent(u.id))
      .then(d => { if (!cancelled) { setDetail(d); setLoadingDetail(false); } })
      .catch(e => { if (!cancelled) { setDetailError(e.message || 'failed'); setLoadingDetail(false); } });
    return () => { cancelled = true; };
  }, [u && u.id]);

  if (!u) {
    return (
      <div className="ud-empty">
        <div className="glyph"><AIcon name="users" /></div>
        <h3>No user selected</h3>
        <p>Pick a row from the table to inspect their plan, billing, and usage.</p>
      </div>
    );
  }

  const invoices = detail?.invoices || [];
  const usage    = detail?.usage    || null;

  return (
    <>
      <div className="ud-h">
        <div className={`ud-avatar ${u.cls || ''}`}>{u.avatar}</div>
        <div className="ud-id">
          <h2>{u.name}</h2>
          <div className="email">{u.email}</div>
          <div className="pills">
            <span className={`plan-pill ${u.plan}`}>{u.plan}</span>
            <span className={`state-pill ${u.state}`}><span className="dot" />{fmtState(u.state)}</span>
            {u.period && <span className="plan-pill" style={{background: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)'}}>{u.period}</span>}
            {u.is_admin && <span className="plan-pill" style={{background:'hsla(45,100%,60%,0.18)', color:'hsl(45,100%,80%)'}}>admin</span>}
          </div>
        </div>
        <div className="close-btn" onClick={onClose} title="Close detail">
          <AIcon name="arrowR" />
        </div>
      </div>

      {/* TABS */}
      <div className="ud-tabs">
        <button className={`ud-tab ${tab === 'billing' ? 'on' : ''}`} onClick={() => setTab('billing')}>Billing<span className="badge">{invoices.length}</span></button>
        <button className={`ud-tab ${tab === 'usage' ? 'on' : ''}`}  onClick={() => setTab('usage')}>Usage</button>
        <button className={`ud-tab ${tab === 'audit' ? 'on' : ''}`}   onClick={() => setTab('audit')}>Audit<span className="badge">{invoices.length}</span></button>
      </div>

      {/* BODY */}
      <div className="ud-body">
        {loadingDetail && <div className="ud-sec"><div className="ud-sec-body" style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', padding: 24 }}>Loading…</div></div>}
        {detailError   && <div className="ud-sec"><div className="ud-sec-body" style={{ fontSize: 12, color: 'var(--destructive,#f88)', textAlign: 'center', padding: 24 }}>Could not load detail.</div></div>}
        {!loadingDetail && !detailError && tab === 'billing' && <UDBilling u={u} invoices={invoices} />}
        {!loadingDetail && !detailError && tab === 'usage'   && <UDUsage   u={u} usage={usage} />}
        {!loadingDetail && !detailError && tab === 'audit'   && <UDAudit   u={u} invoices={invoices} />}
      </div>
    </>
  );
}

function UDBilling({ u, invoices }) {
  const renew = u.state === 'active' || u.state === 'past_due' || u.state === 'trialing';
  return (
    <>
      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Plan & subscription</h4>{u.stripe_customer_id && <><div className="spacer" /><span className="lnk" style={{fontFamily:'var(--font-mono)', fontSize:11}}>{u.stripe_customer_id}</span></>}</div>
        <div className="ud-sec-body">
          <div className="ud-kv">
            <div><div className="k">Plan</div><div className="v body">{PHASE2_PLAN_LABEL[u.plan] || u.plan}{u.period ? ` · ${u.period}` : ''}</div></div>
            <div><div className="k">State</div><div className="v body" style={{color: 'var(--accent)'}}>{fmtState(u.state)}</div></div>
            <div><div className="k">MRR</div><div className="v">${u.mrr.toFixed(2)}</div></div>
            <div><div className="k">LTV</div><div className="v">${u.ltv}</div></div>
            <div><div className="k">Customer since</div><div className="v">{u.since || '—'}</div></div>
            <div><div className="k">{renew ? 'Status' : 'Ended'}</div><div className="v">{fmtState(u.state)}</div></div>
          </div>
        </div>
      </div>

      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Billing events</h4>{invoices.length > 0 && <span style={{fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)'}}>last {Math.min(invoices.length, 8)} of {invoices.length}</span>}</div>
        <div className="ud-sec-body" style={{paddingTop: 4, paddingBottom: 4}}>
          {invoices.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--muted-foreground)', padding: '8px 0' }}>No billing events on this account yet.</div>
            : invoices.slice(0, 8).map((inv, i) => (
                <div className="inv-row" key={inv.stripe_event_id || i}>
                  <span className="date">{(inv.created_at || '').slice(0, 10)}</span>
                  <span className="desc">{inv.description || inv.event_type}{inv.plan_to ? ` → ${inv.plan_to}` : ''}</span>
                  <span className={`state-pill ${inv.event_type === 'payment_failed' ? 'past_due' : 'active'}`}><span className="dot" />{(inv.event_type || '').replace(/_/g,' ')}</span>
                  <span className="amt">{typeof inv.amount_cents === 'number' ? `$${(inv.amount_cents/100).toFixed(2)}` : '—'}</span>
                </div>
              ))
          }
        </div>
      </div>
    </>
  );
}

function UDUsage({ u, usage }) {
  if (!usage) return <div className="ud-sec"><div className="ud-sec-body" style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', padding: 24 }}>No usage data available.</div></div>;
  const minutesRemaining = Math.max(0, (usage.minutes_limit || 0) - (usage.minutes_used || 0));
  const minutes30d = (usage.daily || []).reduce((s, r) => s + (Number(r.minutes_used) || 0), 0);
  const chatLimit = usage.chat_tokens_limit;
  const chatLimitDisplay = chatLimit === -1 ? 'unlimited' : (chatLimit || 50000).toLocaleString();
  return (
    <>
      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Listening minutes</h4></div>
        <div className="ud-sec-body">
          <div className="tele-grid">
            <div className="tele-cell">
              <div className="lbl">Used (lifetime)</div>
              <div className="val">{(usage.minutes_used || 0).toLocaleString()}</div>
              <div className="sub">of {(usage.minutes_limit || 0).toLocaleString()} subscription cap</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Top-up balance</div>
              <div className="val">{(usage.topup_minutes || 0).toLocaleString()}</div>
              <div className="sub">never expires</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Subscription remaining</div>
              <div className={`val ${minutesRemaining === 0 ? 'warn' : ''}`}>{minutesRemaining.toLocaleString()}</div>
              <div className="sub">resets at next renewal</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Last 30 days</div>
              <div className="val">{minutes30d.toLocaleString()}</div>
              <div className="sub">{Math.round(minutes30d / 30)} / day avg</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ud-sec">
        <div className="ud-sec-h"><h4>Chat tokens</h4></div>
        <div className="ud-sec-body">
          <div className="tele-grid">
            <div className="tele-cell">
              <div className="lbl">Used</div>
              <div className="val">{(usage.chat_tokens_used || 0).toLocaleString()}</div>
              <div className="sub">advisor + chat path</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Limit</div>
              <div className="val">{chatLimitDisplay}</div>
              <div className="sub">{chatLimit === -1 ? 'paid plan unlimited' : 'free-plan cap'}</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Plan</div>
              <div className="val">{PHASE2_PLAN_LABEL[u.plan] || u.plan}</div>
              <div className="sub">{u.period || 'no period set'}</div>
            </div>
            <div className="tele-cell">
              <div className="lbl">Stripe customer</div>
              <div className="val" style={{fontSize: 14, fontFamily: 'var(--font-mono)'}}>{u.stripe_customer_id ? u.stripe_customer_id.slice(0, 14) + '…' : '—'}</div>
              <div className="sub">{u.stripe_customer_id ? 'open in Stripe →' : 'never paid'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function UDAudit({ u, invoices }) {
  if (!invoices || invoices.length === 0) {
    return <div className="ud-sec"><div className="ud-sec-body" style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', padding: 24 }}>No audit events recorded yet.</div></div>;
  }
  return (
    <div className="ud-sec">
      <div className="ud-sec-h"><h4>Audit trail</h4><div className="spacer" /><span style={{fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)'}}>derived from billing_events</span></div>
      <div className="ud-sec-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
        {invoices.map((inv, i) => (
          <div className="inv-row" key={inv.stripe_event_id || i}>
            <span className="date">{(inv.created_at || '').slice(0, 10)}</span>
            <span className="desc">{inv.description || inv.event_type}</span>
            <span className={`state-pill ${inv.event_type === 'payment_failed' ? 'past_due' : 'active'}`}><span className="dot" />{(inv.event_type || '').replace(/_/g, ' ')}</span>
            <span className="amt">{typeof inv.amount_cents === 'number' ? `$${(inv.amount_cents/100).toFixed(2)}` : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   SUBSCRIPTIONS SCREEN — kanban backed by /api/admin/subscriptions
   ============================================================================ */
const SUB_STATES = [
  { id: 'active',    label: 'Active',    color: 'hsl(150, 70%, 60%)' },
  { id: 'trialing',  label: 'Trialing',  color: 'hsl(190, 90%, 70%)' },
  { id: 'past_due',  label: 'Past due',  color: 'hsl(35, 90%, 60%)' },
  { id: 'paused',    label: 'Paused',    color: 'rgba(255,255,255,0.5)' },
  { id: 'cancelled', label: 'Cancelled', color: 'hsl(355, 80%, 65%)' },
];

function SubscriptionsScreen({ setRoute, setSelectedId, setSegment }) {
  const [data, setData] = useState2(null);
  const [error, setError] = useState2(null);
  const [showCreate, setShowCreate] = useState2(false);
  const CreateSubscriptionModal = window.CreateSubscriptionModal;

  useEffect2(() => {
    let cancelled = false;
    adminFetch('/api/admin/subscriptions')
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message || 'failed'); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Subscriptions</h1>
          <div className="sub">
            {data
              ? <>State machine across paid customers · drill into any column</>
              : (error ? <span style={{color:'var(--destructive,#f88)'}}>Failed to load subscriptions</span> : 'Loading…')
            }
          </div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <button className="adm-btn adm-btn-ghost" disabled><AIcon name="download" /> Export</button>
          {CreateSubscriptionModal && <button className="adm-btn adm-btn-primary" onClick={()=>setShowCreate(true)}><AIcon name="plus" /> Create subscription</button>}
        </div>
      </div>
      {CreateSubscriptionModal && <CreateSubscriptionModal open={showCreate} onClose={()=>setShowCreate(false)} channel="admin" />}

      {/* Summary strip */}
      <div className="subs-summary">
        {SUB_STATES.map(s => {
          const stat = data?.states?.[s.id] || { count: 0, mrr_cents: 0 };
          const mrrK = (stat.mrr_cents || 0) / 100000;
          return (
            <div key={s.id} className="subs-sum" style={{'--bar-color': s.color}}>
              <div className="lbl">{s.label}</div>
              <div className="val">{(stat.count || 0).toLocaleString()}</div>
              <div className="sub">{stat.mrr_cents > 0 ? `$${mrrK.toFixed(1)}k MRR` : 'no active MRR'}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div className="kanban">
        {SUB_STATES.map(col => {
          const stat = data?.states?.[col.id] || { count: 0, mrr_cents: 0 };
          const subs = data?.preview?.[col.id] || [];
          return (
            <div key={col.id} className="kan-col">
              <div className="kan-col-h">
                <div className={`lbl ${col.id}`}><span className="dot" />{col.label}</div>
                <div className="count">
                  {(stat.count || 0).toLocaleString()}
                  <div className="mrr">{stat.mrr_cents > 0 ? `$${(stat.mrr_cents/100000).toFixed(1)}k` : '—'}</div>
                </div>
              </div>
              <div className="kan-list">
                {subs.length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center', fontSize: 11, color: 'var(--muted-foreground)' }}>{data ? 'No accounts in this state' : 'Loading…'}</div>
                )}
                {subs.map(u => (
                  <div key={u.id} className="kan-card" onClick={() => { setRoute('users'); setSegment('all'); setSelectedId(u.id); }}>
                    <div className="top">
                      <div className={`mini-avatar ${u.cls || ''}`}>{u.avatar}</div>
                      <div className="who">
                        <div className="name">{u.name}</div>
                        <div className="meta">{(PHASE2_PLAN_LABEL[u.plan] || u.plan)}{u.period ? ` · ${u.period}` : ''}</div>
                      </div>
                      <div className="mrr">{u.mrr ? `$${u.mrr.toFixed(0)}` : '—'}</div>
                    </div>
                    <div className="bot">
                      <span style={{flex: 1}} />
                      <span className="stamp">since {(u.since || '').slice(0, 7) || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
              {stat.count > subs.length && (
                <div className="kan-foot">View all {stat.count.toLocaleString()} →</div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* expose to window so admin.jsx can pick up */
Object.assign(window, { UsersScreen, SubscriptionsScreen });
