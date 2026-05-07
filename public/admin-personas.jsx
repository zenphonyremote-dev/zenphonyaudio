/* ============================================================================
   ADMIN PERSONAS — Distributor & Dealer screens
   These render inside the Admin Hub when the persona switcher is set to
   'distributor' or 'dealer'. They share layout primitives with the Zenphony
   admin screens but expose a much narrower surface.
   ============================================================================ */
const { useState: useStPx, useMemo: useMmPx } = React;
const { AIcon: AIconPx } = window;

/* ============================================================================
   SHARED DATA
   ============================================================================ */

// The signed-in distributor (sample).
const DIST_SELF = {
  id: 'ilio',
  name: 'ILIO',
  region: 'North America',
  rep: 'Maya Reyes',
  email: 'maya@iliostore.com',
  joined: 'Jan 2025',
  margin: 0.35,    // 35% margin on dealer subs
  directMargin: 0.45, // 45% margin on direct subs
  keysAllotted: 5000,
  keysIssued: 3142
};

// Dealers under this distributor.
const DEALERS = [
  { id: 'sweetwater',     name: 'Sweetwater',           rep: 'Drew Patel',     email: 'drew@sweetwater.com',     city: 'Fort Wayne, IN',  joined: 'Feb 2025', subs: 412, mrr: 8420, status: 'active', tier: 'gold',   keysAllotted: 600, keysIssued: 412 },
  { id: 'guitarcenter',   name: 'Guitar Center Pro',    rep: 'Carla Mendez',   email: 'carla@gcpro.com',         city: 'Westlake, CA',    joined: 'Feb 2025', subs: 278, mrr: 5612, status: 'active', tier: 'gold',   keysAllotted: 500, keysIssued: 278 },
  { id: 'vintage-king',   name: 'Vintage King Audio',   rep: 'Ben Sato',       email: 'ben@vintageking.com',     city: 'Ferndale, MI',    joined: 'Mar 2025', subs: 184, mrr: 3920, status: 'active', tier: 'silver', keysAllotted: 250, keysIssued: 184 },
  { id: 'sam-ash',        name: 'Sam Ash Pro',          rep: 'Tara Olin',      email: 'tara@samashpro.com',      city: 'Hicksville, NY',  joined: 'Apr 2025', subs: 96,  mrr: 1880, status: 'active', tier: 'silver', keysAllotted: 150, keysIssued: 96  },
  { id: 'westlake',       name: 'Westlake Pro',         rep: 'Marco Levitt',   email: 'marco@westlakepro.com',   city: 'Hollywood, CA',   joined: 'Jun 2025', subs: 64,  mrr: 1340, status: 'active', tier: 'bronze', keysAllotted: 100, keysIssued: 64  },
  { id: 'nodigital',      name: 'No Digital Audio',     rep: 'Jules Park',     email: 'jules@nodigital.com',     city: 'Brooklyn, NY',    joined: 'Aug 2025', subs: 28,  mrr: 580,  status: 'active', tier: 'bronze', keysAllotted: 60,  keysIssued: 28  },
  { id: 'pendingstudios', name: 'Pending Studios',      rep: 'Nina Roe',       email: 'nina@pendingstudios.com', city: 'Austin, TX',      joined: 'Apr 2026', subs: 0,   mrr: 0,    status: 'pending', tier: '—',   keysAllotted: 0,   keysIssued: 0   }
];

// Subscriptions visible to a distributor — direct + via-dealer.
const DIST_SUBS = [
  { id: 'sub_1001', user: 'Velvet Static FM',    plan: 'Studio · 14 seats · annual', mrr: 490, channel: 'direct',     dealer: null,           since: 'Mar 2025', renews: 'Mar 2026', status: 'active' },
  { id: 'sub_1002', user: 'Marcus Chen',         plan: 'Master · annual',            mrr: 32,  channel: 'dealer',     dealer: 'sweetwater',   since: 'Apr 2025', renews: 'Apr 2026', status: 'active' },
  { id: 'sub_1003', user: 'Tomoko Watanabe',     plan: 'Master · monthly',           mrr: 32,  channel: 'dealer',     dealer: 'sweetwater',   since: 'Feb 2025', renews: 'monthly',  status: 'active' },
  { id: 'sub_1004', user: 'Blue Heron Studios',  plan: 'Studio · 8 seats · annual',  mrr: 280, channel: 'direct',     dealer: null,           since: 'Jan 2025', renews: 'Jan 2026', status: 'active' },
  { id: 'sub_1005', user: 'Lo-fi Cooperative',   plan: 'Studio · 4 seats · monthly', mrr: 140, channel: 'dealer',     dealer: 'guitarcenter', since: 'May 2025', renews: 'monthly',  status: 'active' },
  { id: 'sub_1006', user: 'Maya Reyes',          plan: 'Master · annual',            mrr: 32,  channel: 'dealer',     dealer: 'vintage-king', since: 'Jun 2025', renews: 'Jun 2026', status: 'active' },
  { id: 'sub_1007', user: 'Kenji Park',          plan: 'Solo · monthly',             mrr: 14,  channel: 'unassigned', dealer: null,           since: 'Apr 2026', renews: 'monthly',  status: 'unassigned' },
  { id: 'sub_1008', user: 'Sofia Almeida',       plan: 'Master · annual',            mrr: 32,  channel: 'unassigned', dealer: null,           since: 'Apr 2026', renews: 'Apr 2027', status: 'unassigned' }
];

// Dealer team (other distributor admins under DIST_SELF)
const DIST_TEAM = [
  { id: 't1', name: 'Maya Reyes',   email: 'maya@iliostore.com',   role: 'owner',  avatar: 'MR', cls: 'av-vs', joined: 'Jan 2025', last: '2m ago',  '2fa': true },
  { id: 't2', name: 'Owen Hart',    email: 'owen@iliostore.com',   role: 'admin',  avatar: 'OH', cls: 'av-bh', joined: 'Feb 2025', last: '1h ago',  '2fa': true },
  { id: 't3', name: 'Priya Nair',   email: 'priya@iliostore.com',  role: 'sales',  avatar: 'PN', cls: 'av-pr', joined: 'Mar 2025', last: '4h ago',  '2fa': false }
];

// Plugin/Hub builds (read-only mirror of zenphony admin's data — the distributor sees these to hand to dealers/customers)
const DIST_BUILDS = [
  { kind: 'plugin', v: '2.4.1', date: 'Apr 22', notes: 'New Vinyl Warmth · Studio One AAX preview · perf', size: '95 MB',  channel: 'stable', current: true },
  { kind: 'plugin', v: '2.4.0', date: 'Apr 03', notes: 'Pearl v4 mastering model · Streaming Safe rewrite', size: '94 MB',  channel: 'stable', current: false },
  { kind: 'hub',    v: '1.6.0', date: 'May 02', notes: 'New plugin scanner · Apple Silicon perf pass',     size: '142 MB', channel: 'stable', current: true },
  { kind: 'hub',    v: '1.5.4', date: 'Apr 18', notes: 'Hotfix · macOS 14.4 keychain prompt loop',          size: '141 MB', channel: 'stable', current: false }
];

/* ----- Dealer-perspective sample data ------------------------------------- */

const DEALER_SELF = {
  id: 'sweetwater',
  name: 'Sweetwater',
  rep: 'Drew Patel',
  email: 'drew@sweetwater.com',
  distributor: 'ILIO',
  joined: 'Feb 2025',
  keysAllotted: 600,
  keysIssued: 412
};

// Dealer team — employees of the dealer who have access to the dealer portal.
const DEALER_TEAM = [
  { id: 'd1', name: 'Drew Patel',     email: 'drew@sweetwater.com',     role: 'owner',   avatar: 'DP', cls: 'av-vs', joined: 'Feb 2025', last: '4m ago',  '2fa': true  },
  { id: 'd2', name: 'Lena Voss',      email: 'lena@sweetwater.com',     role: 'manager', avatar: 'LV', cls: 'av-bh', joined: 'Mar 2025', last: '38m ago', '2fa': true  },
  { id: 'd3', name: 'Theo Kwon',      email: 'theo@sweetwater.com',     role: 'sales',   avatar: 'TK', cls: 'av-pr', joined: 'May 2025', last: '2h ago',  '2fa': true  },
  { id: 'd4', name: 'Aisha Bello',    email: 'aisha@sweetwater.com',    role: 'sales',   avatar: 'AB', cls: 'av-lc', joined: 'Jul 2025', last: '5h ago',  '2fa': false },
  { id: 'd5', name: 'Hector Romero',  email: 'hector@sweetwater.com',   role: 'support', avatar: 'HR', cls: 'av-ms', joined: 'Sep 2025', last: '1d ago',  '2fa': true  }
];

const DEALER_TEAM_PENDING = [
  { email: 'noah@sweetwater.com', role: 'sales', invitedBy: 'drew@', sent: '6h ago', expires: '6d' }
];

const DEALER_ROLES = [
  { id: 'owner',   label: 'Owner',     desc: 'Full access · billing · invite team',     color: 'hsl(280, 80%, 70%)' },
  { id: 'manager', label: 'Manager',   desc: 'Manage customers · assign · invite team', color: 'hsl(190, 80%, 65%)' },
  { id: 'sales',   label: 'Sales rep', desc: 'View customers · fulfill orders · assign',color: 'hsl(150, 70%, 60%)' },
  { id: 'support', label: 'Support',   desc: 'View customers · read-only orders',       color: 'hsl(45, 90%, 62%)'  }
];

const DEALER_CUSTOMERS = [
  { id: 'cust_5001', name: 'Marcus Chen',         email: 'marcus@chenmix.fm',       plan: 'Master · annual',  mrr: 32,  since: 'Apr 2025', status: 'active',     orderId: 'ORD-7841' },
  { id: 'cust_5002', name: 'Tomoko Watanabe',     email: 'tomoko@watanabe.audio',   plan: 'Master · monthly', mrr: 32,  since: 'Feb 2025', status: 'active',     orderId: 'ORD-7820' },
  { id: 'cust_5003', name: 'Maya Reyes',          email: 'maya.reyes@studio.fm',    plan: 'Master · annual',  mrr: 32,  since: 'Jun 2025', status: 'active',     orderId: 'ORD-7901' },
  { id: 'cust_5004', name: 'Lo-fi Cooperative',   email: 'team@lo-fi-coop.com',     plan: 'Studio · 4 seats', mrr: 140, since: 'May 2025', status: 'active',     orderId: 'ORD-7872' },
  { id: 'cust_5005', name: 'Bedroom Tapes',       email: 'tapes@btr.fm',            plan: 'Master · monthly', mrr: 32,  since: 'Mar 2026', status: 'churned',    orderId: 'ORD-8112' },
  { id: 'cust_5006', name: 'Sofia Almeida',       email: 'sofia@almeida.fm',        plan: 'Master · annual',  mrr: 32,  since: 'Apr 2026', status: 'unassigned', orderId: 'ORD-8201' }
];

const DEALER_ORDERS = [
  { id: 'ORD-8201', date: 'Apr 28', customer: 'Sofia Almeida',     plan: 'Master · annual',   total: 384,   status: 'awaiting assign' },
  { id: 'ORD-8112', date: 'Mar 30', customer: 'Bedroom Tapes',     plan: 'Master · monthly',  total: 32,    status: 'fulfilled' },
  { id: 'ORD-7901', date: 'Jun 14', customer: 'Maya Reyes',        plan: 'Master · annual',   total: 384,   status: 'fulfilled' },
  { id: 'ORD-7872', date: 'May 11', customer: 'Lo-fi Cooperative', plan: 'Studio · 4 seats',  total: 1680,  status: 'fulfilled' },
  { id: 'ORD-7841', date: 'Apr 22', customer: 'Marcus Chen',       plan: 'Master · annual',   total: 384,   status: 'fulfilled' }
];

/* ============================================================================
   SHARED — CREATE SUBSCRIPTION (used by Distributor and Dealer)
   ============================================================================ */
const SUB_PLANS = [
  { id: 'solo',   label: 'Solo',   tagline: 'For one producer',          monthly: 9,   annual: 96,   features: ['Listen Buddy plugin','5 reference tracks/mo','Stable channel updates'] },
  { id: 'master', label: 'Master', tagline: 'Full mastering suite',      monthly: 32,  annual: 320,  features: ['Everything in Solo','Mastering engine + Pearl v5','Unlimited reference tracks','Premium presets','Priority support'] },
  { id: 'studio', label: 'Studio', tagline: 'Multi-seat for studios',    monthly: 70,  annual: 720,  perSeat: 14, perSeatAnnual: 144, features: ['Everything in Master','Multi-seat (4+)','Shared preset library','Org admin console','Studio SLA'] }
];

function CreateSubscriptionModal({ open, onClose, channel = 'dealer', dealerId = null }) {
  const [step, setStep] = useStPx(1);
  const [plan, setPlan] = useStPx('master');
  const [billing, setBilling] = useStPx('monthly');
  const [seats, setSeats] = useStPx(4);
  const [name, setName] = useStPx('');
  const [email, setEmail] = useStPx('');
  const [company, setCompany] = useStPx('');
  const [paymentBy, setPaymentBy] = useStPx(channel === 'distributor' ? 'distributor' : 'dealer');
  const [sendInvite, setSendInvite] = useStPx(true);
  const [created, setCreated] = useStPx(false);

  if (!open) return null;

  const reset = () => { setStep(1); setPlan('master'); setBilling('monthly'); setSeats(4); setName(''); setEmail(''); setCompany(''); setSendInvite(true); setCreated(false); };
  const close = () => { reset(); onClose(); };

  const selectedPlan = SUB_PLANS.find(p => p.id === plan);
  const calcPrice = () => {
    if (plan === 'studio') {
      return billing === 'monthly'
        ? selectedPlan.monthly + Math.max(0, seats - 4) * selectedPlan.perSeat
        : selectedPlan.annual + Math.max(0, seats - 4) * selectedPlan.perSeatAnnual;
    }
    return billing === 'monthly' ? selectedPlan.monthly : selectedPlan.annual;
  };
  const price = calcPrice();
  const periodLabel = billing === 'monthly' ? '/mo' : '/yr';

  // Inviter context
  const isDealer = channel === 'dealer';
  const isAdmin = channel === 'admin';
  const inviterName = isAdmin ? 'Zenphony' : (isDealer ? DEALER_SELF.name : DIST_SELF.name);
  const allottedFrom = isDealer ? DEALER_SELF : DIST_SELF;
  const keysRemaining = isAdmin ? Infinity : (allottedFrom.keysAllotted - allottedFrom.keysIssued);

  if (created) {
    const generatedKey = `ZP-${plan.toUpperCase().slice(0,2)}-${Math.random().toString(36).slice(2,7).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    return (
      <div className="invite-modal-bg" onClick={close}>
        <div className="invite-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:560}}>
          <div className="create-success">
            <div className="create-success-glyph"><AIconPx name="key"/></div>
            <div className="create-success-h">Subscription created</div>
            <div className="create-success-sub">{name} · {selectedPlan.label} {plan==='studio' && `· ${seats} seats`} · {billing}</div>
            <div className="create-key-block">
              <div className="create-key-l">License key</div>
              <div className="create-key-v">{generatedKey}</div>
            </div>
            <div className="create-success-meta">
              {sendInvite
                ? <>An onboarding email has been sent to <strong>{email}</strong> with download links and the key above.</>
                : <>The key above has been issued. Email it to your customer manually.</>
              }
            </div>
            <div className="invite-actions" style={{borderTop:'none',paddingTop:0}}>
              <button className="adm-btn adm-btn-ghost" onClick={()=>{ reset(); }}>Create another</button>
              <button className="adm-btn adm-btn-primary" onClick={close}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-modal-bg" onClick={close}>
      <div className="invite-modal create-sub-modal" onClick={e=>e.stopPropagation()}>
        <div className="adm-card-h">
          <h3>Create subscription</h3>
          <span className="sub">step {step} of 3 · {inviterName} · {isAdmin ? 'unlimited keys' : `${keysRemaining} keys available`}</span>
        </div>

        <div className="create-steps">
          {[1,2,3].map(s=>(
            <div key={s} className={`create-step-pip ${step===s?'on':''} ${step>s?'done':''}`}>
              {s}<span>{s===1?'Plan':s===2?'Customer':'Review'}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="invite-form">
            <div className="invite-field">
              <label>Choose a plan</label>
              <div className="plan-cards">
                {SUB_PLANS.map(p=>(
                  <button key={p.id} className={`plan-card ${plan===p.id?'on':''}`} onClick={()=>setPlan(p.id)}>
                    <div className="plan-card-h">
                      <span className="plan-card-label">{p.label}</span>
                      <span className="plan-card-price"><span className="cur">$</span>{p.monthly}<small>/mo</small></span>
                    </div>
                    <div className="plan-card-tag">{p.tagline}</div>
                    <ul className="plan-card-feats">
                      {p.features.slice(0,3).map(f=><li key={f}>· {f}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            <div className="invite-field">
              <label>Billing cycle</label>
              <div className="invite-seg">
                <button className={`invite-seg-b ${billing==='monthly'?'on':''}`} onClick={()=>setBilling('monthly')}>monthly</button>
                <button className={`invite-seg-b ${billing==='annual'?'on':''}`} onClick={()=>setBilling('annual')}>annual <small style={{opacity:0.7,marginLeft:4}}>save ~17%</small></button>
              </div>
            </div>

            {plan === 'studio' && (
              <div className="invite-field">
                <label>Seats <small style={{color:'var(--muted-foreground)',marginLeft:6,fontFamily:'var(--font-mono)'}}>min 4 · ${selectedPlan.perSeat}/seat over 4</small></label>
                <div className="seat-row">
                  <button className="seat-btn" onClick={()=>setSeats(s=>Math.max(4,s-1))}>−</button>
                  <input type="number" min="4" max="100" value={seats} onChange={e=>setSeats(Math.max(4, parseInt(e.target.value)||4))}/>
                  <button className="seat-btn" onClick={()=>setSeats(s=>Math.min(100,s+1))}>+</button>
                </div>
              </div>
            )}

            <div className="price-summary">
              <div>
                <div className="price-summary-l">{selectedPlan.label} {plan==='studio' && `· ${seats} seats`} · {billing}</div>
                <div className="price-summary-s">renews {billing==='monthly'?'monthly':'annually'}</div>
              </div>
              <div className="price-summary-v"><span className="cur">$</span>{price.toLocaleString()}<small>{periodLabel}</small></div>
            </div>

            <div className="invite-actions">
              <button className="adm-btn adm-btn-ghost" onClick={close}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={()=>setStep(2)}>Next: customer →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="invite-form">
            <div className="invite-field">
              <label>Customer name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Marcus Chen"/>
            </div>
            <div className="invite-field">
              <label>Customer email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="customer@example.com"/>
            </div>
            {plan === 'studio' && (
              <div className="invite-field">
                <label>Studio / company name</label>
                <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Blue Heron Studios"/>
              </div>
            )}

            <div className="invite-field">
              <label>Payment</label>
              <div className="invite-seg">
                <button className={`invite-seg-b ${paymentBy===(isAdmin?'admin':isDealer?'dealer':'distributor')?'on':''}`} onClick={()=>setPaymentBy(isAdmin?'admin':isDealer?'dealer':'distributor')}>
                  {isAdmin ? 'comp / internal' : `bill ${inviterName}`}
                </button>
                <button className={`invite-seg-b ${paymentBy==='customer'?'on':''}`} onClick={()=>setPaymentBy('customer')}>
                  bill customer directly
                </button>
              </div>
            </div>

            <label className="invite-checkbox">
              <input type="checkbox" checked={sendInvite} onChange={e=>setSendInvite(e.target.checked)}/>
              <span>Email the customer their license key + onboarding instructions</span>
            </label>

            <div className="invite-hint">
              A new account will be provisioned for {email || 'the customer'}. {isAdmin ? 'A license key is issued directly from the Zenphony master pool.' : `A license key is issued from your ${keysRemaining}-key allotment.`} {paymentBy === 'customer' ? 'They will be sent a payment link to complete checkout.' : isAdmin ? 'No invoice — comp/internal subscription.' : `${inviterName} is invoiced for this subscription.`}
            </div>

            <div className="invite-actions">
              <button className="adm-btn adm-btn-ghost" onClick={()=>setStep(1)}>← Back</button>
              <button className="adm-btn adm-btn-primary" disabled={!name || !email} onClick={()=>setStep(3)}>Next: review →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="invite-form">
            <div className="create-review">
              <div className="create-review-row"><span>Customer</span><strong>{name}</strong></div>
              <div className="create-review-row"><span>Email</span><strong>{email}</strong></div>
              {company && <div className="create-review-row"><span>Company</span><strong>{company}</strong></div>}
              <div className="create-review-row"><span>Plan</span><strong>{selectedPlan.label}{plan==='studio' && ` · ${seats} seats`}</strong></div>
              <div className="create-review-row"><span>Billing</span><strong>{billing}</strong></div>
              <div className="create-review-row"><span>Payment</span><strong>{paymentBy === 'customer' ? 'customer pays directly' : isAdmin ? 'comp / internal' : `${inviterName} invoiced`}</strong></div>
              <div className="create-review-row"><span>Source</span><strong>{isAdmin ? 'Zenphony admin (direct)' : isDealer ? `Dealer — ${inviterName}` : 'Direct (distributor)'}</strong></div>
              <div className="create-review-row total"><span>Total {billing}</span><strong><span className="cur">$</span>{price.toLocaleString()}{periodLabel}</strong></div>
            </div>
            <div className="invite-actions">
              <button className="adm-btn adm-btn-ghost" onClick={()=>setStep(2)}>← Back</button>
              <button className="adm-btn adm-btn-primary" onClick={()=>setCreated(true)}>Create subscription</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   DISTRIBUTOR — DASHBOARD
   ============================================================================ */
function DistDashboardScreen() {
  const totalMRR = DEALERS.reduce((s, d) => s + d.mrr, 0);
  const directMRR = DIST_SUBS.filter(s => s.channel === 'direct').reduce((s, x) => s + x.mrr, 0);
  const totalSubs = DIST_SUBS.filter(s => s.status === 'active').length;
  const directProfit = directMRR * DIST_SELF.directMargin;
  const dealerProfit = totalMRR * DIST_SELF.margin;

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>{DIST_SELF.name} dashboard</h1>
          <div className="sub">{DIST_SELF.region} · {DEALERS.filter(d=>d.status==='active').length} active dealers · {totalSubs} subscriptions</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost"><AIconPx name="download"/> Export report</button>
        </div>
      </div>

      <div className="dist-kpi-row">
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="card"/></span><span className="label">Total MRR</span></div>
          <div className="kpi-val"><span className="cur">$</span>{(totalMRR + directMRR).toLocaleString()}</div>
          <div className="kpi-foot"><span className="delta up">↑ +12%</span> <span style={{color:'var(--muted-foreground)'}}>vs last month</span></div>
        </div>
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="users"/></span><span className="label">Active subs</span></div>
          <div className="kpi-val">{totalSubs}</div>
          <div className="kpi-foot"><span className="delta up">↑ +8</span> <span style={{color:'var(--muted-foreground)'}}>this month</span></div>
        </div>
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="key"/></span><span className="label">Keys issued</span></div>
          <div className="kpi-val">{DIST_SELF.keysIssued.toLocaleString()}<span className="unit"> / {DIST_SELF.keysAllotted.toLocaleString()}</span></div>
          <div className="kpi-foot"><span style={{color:'var(--muted-foreground)'}}>{Math.round(DIST_SELF.keysIssued/DIST_SELF.keysAllotted*100)}% allotment used</span></div>
        </div>
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="chart"/></span><span className="label">Est. profit · MTD</span></div>
          <div className="kpi-val"><span className="cur">$</span>{Math.round(directProfit + dealerProfit).toLocaleString()}</div>
          <div className="kpi-foot"><span style={{color:'var(--muted-foreground)'}}>direct + dealer net</span></div>
        </div>
      </div>

      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h"><h3>Top dealers</h3><span className="sub">by MRR · this month</span></div>
        <div style={{padding:'4px 0 8px'}}>
          {[...DEALERS].sort((a,b)=>b.mrr-a.mrr).slice(0,5).map(d=>(
            <div key={d.id} className="dist-row">
              <span className={`mini-avatar tier-${d.tier}`}>{d.name.slice(0,2).toUpperCase()}</span>
              <div className="op-id">
                <div className="op-name">{d.name}</div>
                <div className="op-email">{d.city} · {d.subs} subs · {d.tier} tier</div>
              </div>
              <div className="dist-mrr"><span className="cur">$</span>{d.mrr.toLocaleString()}<small>/mo</small></div>
              <div className="dist-bar"><span style={{width:`${(d.mrr / DEALERS[0].mrr)*100}%`}}/></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DISTRIBUTOR — DEALERS LIST + INVITE
   ============================================================================ */
function DistDealersScreen() {
  const [showInvite, setShowInvite] = useStPx(false);
  const [showCreate, setShowCreate] = useStPx(false);
  const [inviteEmail, setInviteEmail] = useStPx('');
  const [inviteName, setInviteName] = useStPx('');
  const [inviteTier, setInviteTier] = useStPx('bronze');

  const totalSubs = DEALERS.reduce((s,d)=>s+d.subs,0);
  const totalMRR = DEALERS.reduce((s,d)=>s+d.mrr,0);

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Dealers</h1>
          <div className="sub">{DEALERS.length} dealers · {totalSubs} subs · ${totalMRR.toLocaleString()}/mo combined</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost">Export list</button>
          <button className="adm-btn adm-btn-primary" onClick={()=>setShowInvite(true)}><AIconPx name="plus"/> Invite dealer</button>
        </div>
      </div>

      <CreateSubscriptionModal open={showCreate} onClose={()=>setShowCreate(false)} channel="distributor" />

      {showInvite && (
        <div className="adm-card invite-card" style={{marginBottom:14}}>
          <div className="adm-card-h">
            <h3>Invite a new dealer</h3>
            <span className="sub">they'll get an email with onboarding instructions</span>
          </div>
          <div className="invite-form">
            <div className="invite-field">
              <label>Dealer business name</label>
              <input value={inviteName} onChange={e=>setInviteName(e.target.value)} placeholder="e.g. Pro Audio LA" />
            </div>
            <div className="invite-field">
              <label>Primary contact email</label>
              <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="contact@dealer.com" type="email"/>
            </div>
            <div className="invite-field">
              <label>Tier</label>
              <div className="invite-seg">
                {['bronze','silver','gold'].map(t => (
                  <button key={t} className={`invite-seg-b ${inviteTier===t?'on':''}`} onClick={()=>setInviteTier(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="invite-actions">
              <button className="adm-btn adm-btn-ghost" onClick={()=>setShowInvite(false)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" disabled={!inviteEmail || !inviteName}>
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-h"><h3>All dealers</h3><span className="sub">click for details</span></div>
        <div className="dist-table-h">
          <div>Dealer</div><div>Joined</div><div>Subs</div><div>MRR</div><div>Tier</div><div>Status</div>
        </div>
        <div className="op-list">
          {DEALERS.map(d => (
            <div key={d.id} className="dist-table-row">
              <div className="dist-cell-d">
                <span className={`mini-avatar tier-${d.tier}`}>{d.name.slice(0,2).toUpperCase()}</span>
                <div className="op-id">
                  <div className="op-name">{d.name}</div>
                  <div className="op-email">{d.email}</div>
                </div>
              </div>
              <div className="mono-cell">{d.joined}</div>
              <div className="mono-cell">{d.subs}</div>
              <div className="mono-cell">${d.mrr.toLocaleString()}</div>
              <div><span className={`tier-pill tier-${d.tier}`}>{d.tier}</span></div>
              <div><span className={`status-pill ${d.status}`}>{d.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DISTRIBUTOR — SUBSCRIPTIONS (direct vs via-dealer + assign)
   ============================================================================ */
function DistSubsScreen() {
  const [filter, setFilter] = useStPx('all');
  const [assignFor, setAssignFor] = useStPx(null);
  const [showCreate, setShowCreate] = useStPx(false);

  const filtered = filter === 'all' ? DIST_SUBS : DIST_SUBS.filter(s => s.channel === filter);

  const directMRR  = DIST_SUBS.filter(s=>s.channel==='direct').reduce((s,x)=>s+x.mrr,0);
  const dealerMRR  = DIST_SUBS.filter(s=>s.channel==='dealer').reduce((s,x)=>s+x.mrr,0);
  const unassigned = DIST_SUBS.filter(s=>s.channel==='unassigned').length;

  const directProfit = directMRR * DIST_SELF.directMargin;
  const dealerProfit = dealerMRR * DIST_SELF.margin;

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Subscriptions</h1>
          <div className="sub">direct {DIST_SUBS.filter(s=>s.channel==='direct').length} · via dealer {DIST_SUBS.filter(s=>s.channel==='dealer').length} · {unassigned} unassigned</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-primary" onClick={()=>setShowCreate(true)}><AIconPx name="plus"/> Create subscription</button>
        </div>
      </div>

      <CreateSubscriptionModal open={showCreate} onClose={()=>setShowCreate(false)} channel="distributor" />

      <div className="margin-row">
        <div className="margin-card direct">
          <div className="margin-h">Direct subscriptions</div>
          <div className="margin-mrr"><span className="cur">$</span>{directMRR.toLocaleString()}<small>/mo</small></div>
          <div className="margin-meta">
            <span>{Math.round(DIST_SELF.directMargin*100)}% margin</span>
            <span className="margin-net">net <span className="cur">$</span>{Math.round(directProfit).toLocaleString()}<small>/mo</small></span>
          </div>
        </div>
        <div className="margin-card dealer">
          <div className="margin-h">Via-dealer subscriptions</div>
          <div className="margin-mrr"><span className="cur">$</span>{dealerMRR.toLocaleString()}<small>/mo</small></div>
          <div className="margin-meta">
            <span>{Math.round(DIST_SELF.margin*100)}% margin</span>
            <span className="margin-net">net <span className="cur">$</span>{Math.round(dealerProfit).toLocaleString()}<small>/mo</small></span>
          </div>
        </div>
        <div className="margin-card combined">
          <div className="margin-h">Combined</div>
          <div className="margin-mrr"><span className="cur">$</span>{(directMRR+dealerMRR).toLocaleString()}<small>/mo</small></div>
          <div className="margin-meta">
            <span>blended margin</span>
            <span className="margin-net">net <span className="cur">$</span>{Math.round(directProfit+dealerProfit).toLocaleString()}<small>/mo</small></span>
          </div>
        </div>
      </div>

      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h" style={{display:'flex',gap:14,alignItems:'center'}}>
          <h3>All subscriptions</h3>
          <div className="invite-seg" style={{marginLeft:'auto'}}>
            {[
              {k:'all',label:'All'},
              {k:'direct',label:'Direct'},
              {k:'dealer',label:'Via dealer'},
              {k:'unassigned',label:`Unassigned (${unassigned})`}
            ].map(o=>(
              <button key={o.k} className={`invite-seg-b ${filter===o.k?'on':''}`} onClick={()=>setFilter(o.k)}>{o.label}</button>
            ))}
          </div>
        </div>
        <div className="sub-table-h">
          <div>Customer</div><div>Plan</div><div>MRR</div><div>Channel</div><div>Renews</div><div></div>
        </div>
        <div className="op-list">
          {filtered.map(s => {
            const dealer = DEALERS.find(d=>d.id===s.dealer);
            return (
              <div key={s.id} className="sub-table-row">
                <div className="op-name">{s.user}</div>
                <div className="mono-cell">{s.plan}</div>
                <div className="mono-cell">${s.mrr}</div>
                <div>
                  {s.channel === 'direct' && <span className="ch-pill direct">Direct</span>}
                  {s.channel === 'dealer' && <span className="ch-pill dealer">{dealer ? dealer.name : 'dealer'}</span>}
                  {s.channel === 'unassigned' && <span className="ch-pill unassigned">Unassigned</span>}
                </div>
                <div className="mono-cell">{s.renews}</div>
                <div style={{textAlign:'right'}}>
                  {s.channel === 'unassigned'
                    ? <button className="adm-btn adm-btn-primary" style={{padding:'4px 10px',fontSize:11}} onClick={()=>setAssignFor(s.id)}>Assign</button>
                    : <button className="adm-btn adm-btn-ghost" style={{padding:'4px 10px',fontSize:11}}>Reassign</button>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {assignFor && (
        <div className="assign-modal-bg" onClick={()=>setAssignFor(null)}>
          <div className="assign-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-card-h"><h3>Assign subscription</h3><span className="sub">{DIST_SUBS.find(s=>s.id===assignFor)?.user}</span></div>
            <div className="assign-body">
              <p className="assign-hint">Pick where this subscription should be attributed. If a dealer is having trouble assigning a customer themselves, you can attribute it on their behalf.</p>
              <div className="assign-opt" onClick={()=>setAssignFor(null)}>
                <div className="assign-opt-h">Direct</div>
                <div className="assign-opt-sub">Counts as a direct sale by ILIO. {Math.round(DIST_SELF.directMargin*100)}% margin.</div>
              </div>
              <div className="assign-opt-h-row">Or via a dealer</div>
              {DEALERS.filter(d=>d.status==='active').map(d=>(
                <div key={d.id} className="assign-opt" onClick={()=>setAssignFor(null)}>
                  <span className={`mini-avatar tier-${d.tier}`}>{d.name.slice(0,2).toUpperCase()}</span>
                  <div>
                    <div className="assign-opt-h">{d.name}</div>
                    <div className="assign-opt-sub">{d.city} · {d.tier} tier · {d.subs} active subs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================================
   DISTRIBUTOR — LICENSE KEYS
   ============================================================================ */
function DistKeysScreen() {
  const issued = DEALERS.reduce((s,d)=>s+d.keysIssued,0) + DIST_SUBS.filter(s=>s.channel==='direct').length;
  const allotted = DIST_SELF.keysAllotted;
  const remaining = allotted - issued;

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>License keys</h1>
          <div className="sub">{issued.toLocaleString()} issued · {remaining.toLocaleString()} remaining of {allotted.toLocaleString()} allotted</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost">Export keys</button>
          <button className="adm-btn adm-btn-ghost">Request more allotment</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h"><h3>Allotment</h3><span className="sub">how your {allotted.toLocaleString()} keys are distributed</span></div>
        <div style={{padding:'18px 22px 22px'}}>
          <div className="keys-bar">
            <div className="keys-bar-fill issued" style={{width:`${(issued/allotted)*100}%`}}/>
          </div>
          <div className="keys-legend">
            <span className="dot issued"/> Issued ({issued.toLocaleString()})
            <span className="dot remain"/> Remaining ({remaining.toLocaleString()})
          </div>
        </div>
      </div>

      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h"><h3>Allocation by dealer</h3><span className="sub">{DEALERS.length} dealers</span></div>
        <div className="dist-table-h" style={{gridTemplateColumns:'minmax(0,1.6fr) 100px 100px minmax(0,1.5fr) 90px'}}>
          <div>Dealer</div><div>Allotted</div><div>Issued</div><div>Utilization</div><div>Tier</div>
        </div>
        <div className="op-list">
          {DEALERS.filter(d=>d.keysAllotted>0).map(d => (
            <div key={d.id} className="dist-table-row" style={{gridTemplateColumns:'minmax(0,1.6fr) 100px 100px minmax(0,1.5fr) 90px'}}>
              <div className="dist-cell-d">
                <span className={`mini-avatar tier-${d.tier}`}>{d.name.slice(0,2).toUpperCase()}</span>
                <div className="op-id"><div className="op-name">{d.name}</div></div>
              </div>
              <div className="mono-cell">{d.keysAllotted}</div>
              <div className="mono-cell">{d.keysIssued}</div>
              <div className="util-cell">
                <div className="util-bar"><span style={{width:`${(d.keysIssued/d.keysAllotted)*100}%`}}/></div>
                <span className="mono-cell">{Math.round((d.keysIssued/d.keysAllotted)*100)}%</span>
              </div>
              <div><span className={`tier-pill tier-${d.tier}`}>{d.tier}</span></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DISTRIBUTOR — TEAM
   ============================================================================ */
function DistTeamScreen() {
  const [showInvite, setShowInvite] = useStPx(false);

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Team</h1>
          <div className="sub">{DIST_TEAM.length} {DIST_SELF.name} admins · {DIST_TEAM.filter(t=>!t['2fa']).length} without 2FA</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-primary" onClick={()=>setShowInvite(s=>!s)}><AIconPx name="plus"/> Invite team member</button>
        </div>
      </div>

      {showInvite && (
        <div className="adm-card invite-card" style={{marginBottom:14}}>
          <div className="adm-card-h"><h3>Invite {DIST_SELF.name} team member</h3><span className="sub">they'll join your distributor admin panel</span></div>
          <div className="invite-form">
            <div className="invite-field"><label>Name</label><input placeholder="Full name"/></div>
            <div className="invite-field"><label>Email</label><input placeholder="name@iliostore.com" type="email"/></div>
            <div className="invite-field">
              <label>Role</label>
              <div className="invite-seg">
                <button className="invite-seg-b on">admin</button>
                <button className="invite-seg-b">sales</button>
                <button className="invite-seg-b">viewer</button>
              </div>
            </div>
            <div className="invite-actions">
              <button className="adm-btn adm-btn-ghost" onClick={()=>setShowInvite(false)}>Cancel</button>
              <button className="adm-btn adm-btn-primary">Send invite</button>
            </div>
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-h"><h3>Members</h3><span className="sub">click to edit</span></div>
        <div className="op-list">
          {DIST_TEAM.map(t=>(
            <div key={t.id} className="op-row">
              <span className={`mini-avatar ${t.cls}`}>{t.avatar}</span>
              <div className="op-id">
                <div className="op-name">{t.name}</div>
                <div className="op-email">{t.email}</div>
              </div>
              <span className="role-pill" style={{borderColor:'hsl(280,80%,70%)55',color:'hsl(280,80%,70%)'}}>{t.role}</span>
              <span className="op-last">{t.last}</span>
              {!t['2fa'] && <span className="op-no2fa" title="No 2FA"><AIconPx name="alert"/></span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DISTRIBUTOR — DOWNLOADS (read-only)
   ============================================================================ */
function DistDownloadsScreen() {
  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Downloads</h1>
          <div className="sub">read-only · grab installers to hand to dealers and direct customers</div>
        </div>
        <div className="spacer"/>
      </div>

      <div className="adm-card">
        <div className="adm-card-h"><h3>Plugin builds</h3><span className="sub">Listen Buddy · stable channel only</span></div>
        <div className="op-list">
          {DIST_BUILDS.filter(b=>b.kind==='plugin').map(b => (
            <div key={b.v} className="dl-row">
              <div>
                <div className="op-name">v{b.v} {b.current && <span className="ch-pill direct" style={{marginLeft:6}}>current</span>}</div>
                <div className="op-email">{b.date} · {b.size} · {b.notes}</div>
              </div>
              <button className="adm-btn adm-btn-ghost"><AIconPx name="download"/> macOS</button>
              <button className="adm-btn adm-btn-ghost"><AIconPx name="download"/> Windows</button>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h"><h3>Software Hub builds</h3><span className="sub">desktop tray app</span></div>
        <div className="op-list">
          {DIST_BUILDS.filter(b=>b.kind==='hub').map(b => (
            <div key={b.v} className="dl-row">
              <div>
                <div className="op-name">v{b.v} {b.current && <span className="ch-pill direct" style={{marginLeft:6}}>current</span>}</div>
                <div className="op-email">{b.date} · {b.size} · {b.notes}</div>
              </div>
              <button className="adm-btn adm-btn-ghost"><AIconPx name="download"/> macOS</button>
              <button className="adm-btn adm-btn-ghost"><AIconPx name="download"/> Windows</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DEALER — DASHBOARD
   ============================================================================ */
function DealerDashboardScreen() {
  const active = DEALER_CUSTOMERS.filter(c=>c.status==='active').length;
  const mrr = DEALER_CUSTOMERS.filter(c=>c.status==='active').reduce((s,c)=>s+c.mrr,0);
  const unassigned = DEALER_CUSTOMERS.filter(c=>c.status==='unassigned').length;

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>{DEALER_SELF.name}</h1>
          <div className="sub">dealer for {DEALER_SELF.distributor} · {active} active customers · {unassigned} awaiting assignment</div>
        </div>
        <div className="spacer"/>
      </div>

      <div className="dist-kpi-row">
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="users"/></span><span className="label">Customers</span></div>
          <div className="kpi-val">{active}</div>
          <div className="kpi-foot"><span style={{color:'var(--muted-foreground)'}}>{DEALER_CUSTOMERS.length} total · {DEALER_CUSTOMERS.filter(c=>c.status==='churned').length} churned</span></div>
        </div>
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="card"/></span><span className="label">MRR</span></div>
          <div className="kpi-val"><span className="cur">$</span>{mrr.toLocaleString()}</div>
          <div className="kpi-foot"><span style={{color:'var(--muted-foreground)'}}>through your account</span></div>
        </div>
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="key"/></span><span className="label">Keys remaining</span></div>
          <div className="kpi-val">{(DEALER_SELF.keysAllotted - DEALER_SELF.keysIssued).toLocaleString()}</div>
          <div className="kpi-foot"><span style={{color:'var(--muted-foreground)'}}>{DEALER_SELF.keysIssued.toLocaleString()} of {DEALER_SELF.keysAllotted.toLocaleString()} issued</span></div>
        </div>
        <div className="kpi"><div className="kpi-h"><span className="ico"><AIconPx name="alert"/></span><span className="label">To assign</span></div>
          <div className="kpi-val">{unassigned}</div>
          <div className="kpi-foot"><span style={{color: unassigned ? 'hsl(45,90%,68%)' : 'var(--muted-foreground)'}}>{unassigned ? 'requires action' : 'all caught up'}</span></div>
        </div>
      </div>

      {unassigned > 0 && (
        <div className="adm-card" style={{marginTop:14}}>
          <div className="adm-card-h"><h3>Awaiting assignment</h3><span className="sub">tie new orders to the customer who paid for them</span></div>
          <div className="op-list">
            {DEALER_CUSTOMERS.filter(c=>c.status==='unassigned').map(c=>(
              <div key={c.id} className="dl-row">
                <div>
                  <div className="op-name">{c.name}</div>
                  <div className="op-email">{c.plan} · order {c.orderId}</div>
                </div>
                <button className="adm-btn adm-btn-primary">Assign to customer</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================================
   DEALER — CUSTOMERS
   ============================================================================ */
function DealerCustomersScreen() {
  const [filter, setFilter] = useStPx('all');
  const [showCreate, setShowCreate] = useStPx(false);
  const filtered = filter === 'all' ? DEALER_CUSTOMERS : DEALER_CUSTOMERS.filter(c=>c.status===filter);

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Customers</h1>
          <div className="sub">{DEALER_CUSTOMERS.length} total · {DEALER_CUSTOMERS.filter(c=>c.status==='active').length} active</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost">Export</button>
          <button className="adm-btn adm-btn-primary" onClick={()=>setShowCreate(true)}><AIconPx name="plus"/> Create subscription</button>
        </div>
      </div>

      <CreateSubscriptionModal open={showCreate} onClose={()=>setShowCreate(false)} channel="dealer" />

      <div className="adm-card">
        <div className="adm-card-h" style={{display:'flex',alignItems:'center'}}>
          <h3>All customers</h3>
          <div className="invite-seg" style={{marginLeft:'auto'}}>
            {['all','active','unassigned','churned'].map(f=>(
              <button key={f} className={`invite-seg-b ${filter===f?'on':''}`} onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="sub-table-h">
          <div>Customer</div><div>Plan</div><div>MRR</div><div>Since</div><div>Status</div><div></div>
        </div>
        <div className="op-list">
          {filtered.map(c => (
            <div key={c.id} className="sub-table-row">
              <div>
                <div className="op-name">{c.name}</div>
                <div className="op-email">{c.email}</div>
              </div>
              <div className="mono-cell">{c.plan}</div>
              <div className="mono-cell">${c.mrr}</div>
              <div className="mono-cell">{c.since}</div>
              <div><span className={`status-pill ${c.status}`}>{c.status}</span></div>
              <div style={{textAlign:'right'}}>
                {c.status === 'unassigned'
                  ? <button className="adm-btn adm-btn-primary" style={{padding:'4px 10px',fontSize:11}}>Assign</button>
                  : <button className="adm-btn adm-btn-ghost" style={{padding:'4px 10px',fontSize:11}}>Manage</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DEALER — ORDERS
   ============================================================================ */
function DealerOrdersScreen() {
  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Orders</h1>
          <div className="sub">order history fulfilled through your dealer account</div>
        </div>
        <div className="spacer"/>
      </div>

      <div className="adm-card">
        <div className="adm-card-h"><h3>Recent orders</h3><span className="sub">last 90 days</span></div>
        <div className="sub-table-h" style={{gridTemplateColumns:'120px 100px minmax(0,1.4fr) minmax(0,1.4fr) 100px 140px'}}>
          <div>Order</div><div>Date</div><div>Customer</div><div>Plan</div><div>Total</div><div>Status</div>
        </div>
        <div className="op-list">
          {DEALER_ORDERS.map(o=>(
            <div key={o.id} className="sub-table-row" style={{gridTemplateColumns:'120px 100px minmax(0,1.4fr) minmax(0,1.4fr) 100px 140px'}}>
              <div className="mono-cell">{o.id}</div>
              <div className="mono-cell">{o.date}</div>
              <div className="op-name">{o.customer}</div>
              <div className="mono-cell">{o.plan}</div>
              <div className="mono-cell">${o.total.toLocaleString()}</div>
              <div><span className={`status-pill ${o.status === 'fulfilled' ? 'active' : 'unassigned'}`}>{o.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DEALER — ALLOCATIONS
   ============================================================================ */
function DealerAllocScreen() {
  const remaining = DEALER_SELF.keysAllotted - DEALER_SELF.keysIssued;
  const pct = (DEALER_SELF.keysIssued / DEALER_SELF.keysAllotted) * 100;

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>License allocation</h1>
          <div className="sub">read-only · keys granted to you by {DEALER_SELF.distributor}</div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-primary">Request more keys</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h"><h3>Your allotment</h3><span className="sub">{DEALER_SELF.keysAllotted.toLocaleString()} keys granted</span></div>
        <div style={{padding:'18px 22px 22px'}}>
          <div className="keys-bar">
            <div className="keys-bar-fill issued" style={{width:`${pct}%`}}/>
          </div>
          <div className="keys-legend">
            <span className="dot issued"/> Issued ({DEALER_SELF.keysIssued.toLocaleString()})
            <span className="dot remain"/> Remaining ({remaining.toLocaleString()})
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DEALER — TEAM
   ============================================================================ */
function DealerTeamScreen() {
  const [showInvite, setShowInvite] = useStPx(false);
  const [inviteName, setInviteName] = useStPx('');
  const [inviteEmail, setInviteEmail] = useStPx('');
  const [inviteRole, setInviteRole] = useStPx('sales');

  const closeInvite = () => { setShowInvite(false); setInviteName(''); setInviteEmail(''); setInviteRole('sales'); };
  const totalNo2fa = DEALER_TEAM.filter(t=>!t['2fa']).length;

  return (
    <>
      <div className="adm-page-h">
        <div>
          <h1>Team</h1>
          <div className="sub">
            {DEALER_TEAM.length} {DEALER_SELF.name} employees
            {' · '}{DEALER_TEAM_PENDING.length} pending invite{DEALER_TEAM_PENDING.length===1?'':'s'}
            {totalNo2fa>0 && ` · ${totalNo2fa} without 2FA`}
          </div>
        </div>
        <div className="spacer"/>
        <div className="actions">
          <button className="adm-btn adm-btn-ghost">Export roster</button>
          <button className="adm-btn adm-btn-primary" onClick={()=>setShowInvite(true)}><AIconPx name="plus"/> Invite employee</button>
        </div>
      </div>

      {showInvite && (
        <div className="invite-modal-bg" onClick={closeInvite}>
          <div className="invite-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-card-h">
              <h3>Invite employee</h3>
              <span className="sub">they'll get access to the {DEALER_SELF.name} dealer portal</span>
            </div>
            <div className="invite-form">
              <div className="invite-field">
                <label>Full name</label>
                <input value={inviteName} onChange={e=>setInviteName(e.target.value)} placeholder="e.g. Jordan Lee"/>
              </div>
              <div className="invite-field">
                <label>Work email</label>
                <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder={`name@${DEALER_SELF.email.split('@')[1]}`} type="email"/>
              </div>
              <div className="invite-field">
                <label>Role</label>
                <div className="dealer-role-grid">
                  {DEALER_ROLES.filter(r=>r.id!=='owner').map(r=>(
                    <button key={r.id}
                      className={`dealer-role-card ${inviteRole===r.id?'on':''}`}
                      style={{'--role-c': r.color}}
                      onClick={()=>setInviteRole(r.id)}>
                      <div className="dealer-role-h">{r.label}</div>
                      <div className="dealer-role-d">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="invite-hint">
                Employees can see your dealer portal but never the Zenphony admin console or other dealers' data.
              </div>
              <div className="invite-actions">
                <button className="adm-btn adm-btn-ghost" onClick={closeInvite}>Cancel</button>
                <button className="adm-btn adm-btn-primary" disabled={!inviteEmail || !inviteName}>Send invite</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-h"><h3>Members</h3><span className="sub">click for details</span></div>
        <div className="op-list">
          {DEALER_TEAM.map(t=>{
            const r = DEALER_ROLES.find(x=>x.id===t.role) || DEALER_ROLES[2];
            return (
              <div key={t.id} className="op-row">
                <span className={`mini-avatar ${t.cls}`}>{t.avatar}</span>
                <div className="op-id">
                  <div className="op-name">{t.name}</div>
                  <div className="op-email">{t.email}</div>
                </div>
                <span className="role-pill" style={{borderColor: r.color+'55', color: r.color}}>{r.label}</span>
                <span className="op-last">{t.last}</span>
                {!t['2fa'] && <span className="op-no2fa" title="No 2FA"><AIconPx name="alert"/></span>}
              </div>
            );
          })}
        </div>

        {DEALER_TEAM_PENDING.length > 0 && (
          <>
            <div className="adm-card-h" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
              <h3>Pending invites</h3><span className="sub">expires after 7 days</span>
            </div>
            <div className="op-list">
              {DEALER_TEAM_PENDING.map((inv,i)=>{
                const r = DEALER_ROLES.find(x=>x.id===inv.role) || DEALER_ROLES[2];
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

      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-h"><h3>What each role can do</h3><span className="sub">in the {DEALER_SELF.name} portal</span></div>
        <div className="dealer-role-list">
          {DEALER_ROLES.map(r=>(
            <div key={r.id} className="dealer-role-row">
              <span className="role-pill" style={{borderColor: r.color+'55', color: r.color, minWidth:80, textAlign:'center'}}>{r.label}</span>
              <span className="dealer-role-rd">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   DEALER — DOWNLOADS
   ============================================================================ */
function DealerDownloadsScreen() {
  return <DistDownloadsScreen />;
}

/* ============================================================================
   PERSONA NAV CONFIG
   ============================================================================ */
const DIST_NAV = [
  { title: 'Overview', links: [
    { id: 'dist-dashboard',  label: 'Dashboard',     icon: 'chart' },
    { id: 'dist-subs',       label: 'Subscriptions', icon: 'card' }
  ]},
  { title: 'Network', links: [
    { id: 'dist-dealers',    label: 'Dealers',       icon: 'users' },
    { id: 'dist-keys',       label: 'License keys',  icon: 'key' }
  ]},
  { title: 'Software Hub', links: [
    { id: 'dist-downloads',  label: 'Downloads',     icon: 'download' }
  ]},
  { title: 'Operations', links: [
    { id: 'dist-team',       label: 'Team',          icon: 'users' }
  ]}
];

const DEALER_NAV = [
  { title: 'Overview', links: [
    { id: 'dealer-dashboard', label: 'Dashboard', icon: 'chart' }
  ]},
  { title: 'Customers', links: [
    { id: 'dealer-customers', label: 'Customers', icon: 'users' },
    { id: 'dealer-orders',    label: 'Orders',    icon: 'card' }
  ]},
  { title: 'Licenses', links: [
    { id: 'dealer-alloc',     label: 'Allocation', icon: 'key' }
  ]},
  { title: 'Software Hub', links: [
    { id: 'dealer-downloads', label: 'Downloads', icon: 'download' }
  ]},
  { title: 'Operations', links: [
    { id: 'dealer-team',      label: 'Team',       icon: 'users' }
  ]}
];

const DIST_DEFAULT_ROUTE   = 'dist-dashboard';
const DEALER_DEFAULT_ROUTE = 'dealer-dashboard';

function DistRouter({ route }) {
  switch (route) {
    case 'dist-dashboard':  return <DistDashboardScreen/>;
    case 'dist-dealers':    return <DistDealersScreen/>;
    case 'dist-subs':       return <DistSubsScreen/>;
    case 'dist-keys':       return <DistKeysScreen/>;
    case 'dist-team':       return <DistTeamScreen/>;
    case 'dist-downloads':  return <DistDownloadsScreen/>;
    default:                return <DistDashboardScreen/>;
  }
}

function DealerRouter({ route }) {
  switch (route) {
    case 'dealer-dashboard':  return <DealerDashboardScreen/>;
    case 'dealer-customers':  return <DealerCustomersScreen/>;
    case 'dealer-orders':     return <DealerOrdersScreen/>;
    case 'dealer-alloc':      return <DealerAllocScreen/>;
    case 'dealer-team':       return <DealerTeamScreen/>;
    case 'dealer-downloads':  return <DealerDownloadsScreen/>;
    default:                  return <DealerDashboardScreen/>;
  }
}

Object.assign(window, {
  DistRouter, DealerRouter,
  DIST_NAV, DEALER_NAV,
  DIST_DEFAULT_ROUTE, DEALER_DEFAULT_ROUTE,
  DIST_SELF, DEALER_SELF,
  CreateSubscriptionModal
});
