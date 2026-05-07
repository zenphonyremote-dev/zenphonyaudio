/* ════════════════════════════════════════════════════════════════════════
   LISTEN BUDDY BETA — Community forum
   Three views (home → category → thread) inside Account.html.
   ════════════════════════════════════════════════════════════════════════ */
const { useState: useStateF, useMemo: useMemoF } = React;

/* ─────────────────────────── tiny shared bits ─────────────────────────── */
function FAvatar({ name, hue, size = 32 }) {
  const initials = name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return (
    <span className="f-av" style={{
      width: size, height: size,
      fontSize: size * 0.42,
      background: `linear-gradient(135deg, hsl(${hue}, 75%, 62%), hsl(${(hue+45)%360}, 75%, 50%))`,
      boxShadow: `0 0 10px hsla(${hue}, 80%, 60%, 0.35)`
    }}>{initials}</span>
  );
}
function StaffPill() {
  return <span className="f-staff">▎ Zenphony</span>;
}
function StatusPill({ status }) {
  if (!status) return null;
  const map = {
    'in-progress': { label: 'In progress', cls: 'inprog' },
    'acknowledged': { label: 'Acknowledged', cls: 'ack' },
    'solved':       { label: 'Solved', cls: 'solved' }
  };
  const x = map[status]; if (!x) return null;
  return <span className={`f-status f-status-${x.cls}`}><span className="dot"></span>{x.label}</span>;
}
function FIcon({ name }) {
  const paths = {
    chevron:  <path d="M9 6l6 6-6 6"/>,
    pin:      <><path d="M12 17v5"/><path d="M9 4h6v3l3 4v2H6v-2l3-4z"/></>,
    lock:     <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
    fire:     <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s0 2 2 2c0-3 1-7 1-7zm-3 13a3 3 0 0 0 6 0c0-2-3-3-3-3s-3 1-3 3z"/>,
    reply:    <><path d="M9 14l-5-5 5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v6"/></>,
    bell:     <><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    eye:      <><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></>,
    waves:    <><path d="M3 12c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4"/></>,
    bug:      <><rect x="7" y="7" width="10" height="12" rx="3"/><path d="M3 10l4 1M21 10l-4 1M3 14l4-1M21 14l-4-1M9 5l1 2M15 5l-1 2"/></>,
    tools:    <><path d="M14 7a4 4 0 0 0 5 5l1 1-7 7-1-1a4 4 0 0 0-5-5l-1-1 7-7z"/></>,
    plug:     <><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/></>,
    music:    <><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M9 18V5l12-2v13"/></>,
    coffee:   <><path d="M5 8h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 4v2M12 4v2"/></>,
    rocket:   <><path d="M5 19l4-1 1-4-1-1-4 1zM10 14l5-5a7 7 0 0 1 4-2 7 7 0 0 1-2 4l-5 5z"/><circle cx="14.5" cy="9.5" r="1.5"/></>
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
}

/* ─────────────────────────── seed data ─────────────────────────── */
const TESTERS = [
  { n: 'Maya Reyes',     h: 265, role: 'Mix engineer · Pop / R&B' },
  { n: 'Rune Halvorsen', h: 195, role: 'Producer · Indie folk' },
  { n: 'Sora Tanaka',    h: 320, role: 'Composer · Film & TV' },
  { n: 'Gus Whitfield',  h: 30,  role: 'Mastering engineer' },
  { n: 'Elena Voss',     h: 142, role: 'Mix engineer · Hip-hop' },
  { n: 'Jamie Park',     h: 220, role: 'Producer · House / Techno' },
  { n: 'Daniel Okafor',  h: 12,  role: 'Sound designer · Games' },
  { n: 'Priya Bhatt',    h: 280, role: 'Mix engineer · Jazz' },
  { n: 'Nora Linden',    h: 175, role: 'Singer-songwriter' },
  { n: 'Theo Marchetti', h: 50,  role: 'Producer · Synthwave' },
  { n: 'Iris Caldwell',  h: 305, role: 'Mastering · Electronic' },
  { n: 'Omar Hadid',     h: 95,  role: 'Mix engineer · Indie rock' },
  { n: 'Lila Cheng',     h: 250, role: 'Composer · Animation' },
  { n: 'Ben Sutter',     h: 5,   role: 'Podcast producer' },
  { n: 'Cassia Roe',     h: 340, role: 'Producer · Soul' },
  { n: 'Lev Andreyev',   h: 215, role: 'Mix engineer · Metal' },
  { n: 'Hana Kowalski',  h: 158, role: 'Composer · Ad music' },
  { n: 'Solas Ahn',      h: 65,  role: 'Producer · Ambient' },
  { n: 'Mira Holloway',  h: 295, role: 'Mix engineer · Pop' },
  { n: 'Vince Okazaki',  h: 105, role: 'Mastering · Vinyl cuts' }
];
// staff
const STAFF = [
  { n: 'Marcus Chen',    h: 265, role: 'Co-founder · Zenphony' },
  { n: 'Avery Tate',     h: 142, role: 'Listen Buddy lead · Zenphony' },
  { n: 'Reza Bashar',    h: 30,  role: 'DSP & support · Zenphony' }
];

const CATEGORIES = [
  { id: 'test-drive-1', icon: 'rocket', name: 'Test Drive #1', desc: 'Run an analysis with Velvet & Rosso, talk to Buddy, save your favorite. Open through 12 May.', threads: 18, posts: 412, pinned: true, accent: 'tdv' },
  { id: 'latest-beta',  icon: 'bell',   name: 'Latest Beta',    desc: 'Build notes, hotfixes, and what\'s new in v1.0 beta.', threads: 9,  posts: 134, accent: 'beta' },
  { id: 'bugs',         icon: 'bug',    name: 'Bug Reports',    desc: 'Crashes, audio artifacts, UI breakage. Status pills track our triage.', threads: 27, posts: 198, accent: 'bug' },
  { id: 'features',     icon: 'tools',  name: 'Feature Requests', desc: 'Things you wish Buddy did. Specifics over vibes.', threads: 41, posts: 312, accent: 'feat' },
  { id: 'modes',        icon: 'waves',  name: 'Listening Modes', desc: 'Mix, Mastering, Production, Podcast, Film, and Commercial. What\'s working and what isn\'t.', threads: 22, posts: 244, accent: 'modes' },
  { id: 'daw',          icon: 'plug',   name: 'DAW & Install Help', desc: 'VST3 / AU loading, sample rate, latency, plugin scanners.', threads: 31, posts: 276, accent: 'daw' },
  { id: 'examples',     icon: 'music',  name: 'Audio Examples',   desc: 'Before-and-after clips, reference matches, and the impressions Buddy gave back.', threads: 24, posts: 188, accent: 'ex' },
  { id: 'lounge',       icon: 'coffee', name: 'Off-topic Lounge', desc: 'Studio chair recommendations, coffee orders, the snare you can\'t stop using.', threads: 17, posts: 220, accent: 'lounge' }
];

/* Build threads per category. Test Drive #1 has the pinned brief + a mega-thread. */
const PINNED_BRIEF = {
  id: 'td1-brief',
  pinned: true,
  staff: true,
  category: 'test-drive-1',
  title: 'Test Drive #1 · The brief',
  excerpt: 'One mix. Two themes. One conversation. Save your favorite analysis and post it in the mega-thread.',
  authorIdx: 1,            // Avery Tate (staff)
  replies: 0, views: 1284, hot: true,
  posted: 'Pinned · 4 days ago',
  reactions: { '👍': 47, '❤️': 22, '🔥': 18 }
};

const MEGA_THREAD = {
  id: 'td1-megathread',
  pinned: true,
  category: 'test-drive-1',
  title: '🎧 Test Drive #1 · Post your impression here',
  excerpt: 'Drop your favorite Velvet vs Rosso analysis, the chat moment that surprised you, and the export filename so we can pull telemetry.',
  authorIdx: 0,
  replies: 73, views: 2104, hot: true,
  posted: 'Started 4 days ago',
  reactions: { '👍': 31, '❤️': 14, '🔥': 26, '👂': 19 }
};

/* Procedurally generate other threads */
const TD1_OTHER = [
  { title: 'Velvet kept hearing the room — anyone else?',          authorIdx: 4,  replies: 12, views: 198, posted: '2h ago', hot: false },
  { title: 'Rosso called my hi-hat "spicy" and now I can\'t unhear it', authorIdx: 9,  replies: 8,  views: 142, posted: '3h ago', hot: true },
  { title: 'Export filename convention?',                          authorIdx: 13, replies: 4,  views: 89,  posted: '5h ago' },
  { title: 'Side-by-side: same mix through both themes',           authorIdx: 14, replies: 22, views: 411, posted: '8h ago', hot: true },
  { title: 'Buddy chat is way more useful than I expected',        authorIdx: 11, replies: 17, views: 304, posted: 'yesterday' },
  { title: 'Velvet said "−13.8 LUFS, sit on it" — and it was right', authorIdx: 7,  replies: 9,  views: 167, posted: 'yesterday' },
  { title: 'Anyone running Test Drive on a 5.1 stem?',             authorIdx: 5,  replies: 3,  views: 71,  posted: '2d ago' },
  { title: 'Late impression — finally got the export to work',     authorIdx: 17, replies: 6,  views: 102, posted: '2d ago' }
];

const BUG_THREADS = [
  { title: 'Plugin window flickers in Logic Pro 11.0.1 when undocked', authorIdx: 11, replies: 14, views: 287, posted: '3h ago',  hot: true,  status: 'acknowledged' },
  { title: 'Crash on first scan with sample rate 88.2 kHz',            authorIdx: 6,  replies: 9,  views: 198, posted: 'yesterday', status: 'in-progress' },
  { title: 'True peak readout occasionally shows +∞ on silence',       authorIdx: 14, replies: 5,  views: 112, posted: '2d ago', status: 'in-progress' },
  { title: 'Reference match crashes if the reference is mono',         authorIdx: 1,  replies: 11, views: 234, posted: '3d ago', status: 'solved' },
  { title: 'Theme switch leaks color into the impression card',        authorIdx: 18, replies: 4,  views: 88,  posted: '3d ago', status: 'solved' },
  { title: 'Cubase 13 won\'t enumerate v1.0b6 on first launch',        authorIdx: 15, replies: 8,  views: 156, posted: '4d ago', status: 'acknowledged' },
  { title: 'Buddy chat history wipes on plugin re-open',               authorIdx: 8,  replies: 13, views: 211, posted: '5d ago', status: 'in-progress' }
];
const FEAT_THREADS = [
  { title: 'Per-bus presets so I can keep "vocal mode" separate from master', authorIdx: 0,  replies: 21, views: 389, posted: '1d ago', hot: true },
  { title: 'Let me drag a reference straight onto the spectrum',              authorIdx: 12, replies: 17, views: 298, posted: '2d ago' },
  { title: 'Export the impression as a .txt with timestamps',                  authorIdx: 4,  replies: 11, views: 187, posted: '2d ago' },
  { title: 'Side-chain Buddy to a specific stem (vox-only listen mode)',       authorIdx: 7,  replies: 26, views: 422, posted: '3d ago', hot: true },
  { title: 'Voice memo replies in the chat',                                   authorIdx: 17, replies: 6,  views: 98,  posted: '4d ago' }
];
const MODES_THREADS = [
  { title: 'Mastering mode is too kind to my low-end',                authorIdx: 10, replies: 9,  views: 178, posted: '1d ago' },
  { title: 'Podcast mode flagged my room — accurate or paranoid?',     authorIdx: 13, replies: 14, views: 245, posted: '2d ago', hot: true },
  { title: 'Commercial mode + 30s spots: feedback',                    authorIdx: 16, replies: 7,  views: 134, posted: '3d ago' },
  { title: 'Film mode silence handling is great, by the way',          authorIdx: 2,  replies: 18, views: 311, posted: '4d ago' }
];
const DAW_THREADS = [
  { title: 'Pro Tools 2024.6 + AAX path is a different folder',        authorIdx: 0,  replies: 8,  views: 167, posted: '2h ago' },
  { title: 'Logic plugin manager hangs on rescan',                      authorIdx: 11, replies: 12, views: 232, posted: 'yesterday' },
  { title: 'Reaper users: what version handles the v1.0 manifest?',     authorIdx: 3,  replies: 6,  views: 121, posted: '2d ago' },
  { title: 'M1 vs Intel: any latency difference you\'re seeing?',       authorIdx: 9,  replies: 19, views: 387, posted: '3d ago', hot: true }
];
const EX_THREADS = [
  { title: 'Soul track · before/after Buddy\'s 380 Hz note',           authorIdx: 14, replies: 16, views: 287, posted: '1d ago', hot: true },
  { title: 'Acoustic ballad · reference match against Phoebe Bridgers', authorIdx: 8,  replies: 11, views: 198, posted: '2d ago' },
  { title: 'House loop where Buddy and I disagreed on the kick',        authorIdx: 5,  replies: 9,  views: 156, posted: '3d ago' },
  { title: 'Score cue · sub-bass mud Buddy caught that I missed',       authorIdx: 2,  replies: 12, views: 221, posted: '4d ago' }
];
const LOUNGE_THREADS = [
  { title: 'What chair are you sitting in for these test drives?',     authorIdx: 6,  replies: 24, views: 412, posted: 'yesterday' },
  { title: 'Coffee or tea before a critical listen?',                  authorIdx: 17, replies: 31, views: 488, posted: '2d ago', hot: true },
  { title: 'The snare you can\'t stop using',                          authorIdx: 4,  replies: 18, views: 322, posted: '3d ago' }
];
const BETA_THREADS = [
  { title: 'v1.0b7 · hotfix — Cubase enumeration & undock flicker',    authorIdx: 1,  replies: 6,  views: 432, posted: '6h ago',  staff: true, hot: true },
  { title: 'v1.0b6 · Buddy chat memory + reference matching v2',        authorIdx: 0,  replies: 14, views: 822, posted: '5d ago', staff: true },
  { title: 'Roadmap update · what\'s coming after Test Drive #1',       authorIdx: 0,  replies: 22, views: 1240, posted: '1w ago', staff: true, pinned: true }
];

/* Map category id → list of threads */
const CATEGORY_THREADS = {
  'test-drive-1': [PINNED_BRIEF, MEGA_THREAD, ...TD1_OTHER.map((t,i) => ({ ...t, id: 'td1-'+i, category: 'test-drive-1' }))],
  'bugs':         BUG_THREADS.map((t,i) => ({ ...t, id: 'bug-'+i, category: 'bugs' })),
  'features':     FEAT_THREADS.map((t,i) => ({ ...t, id: 'feat-'+i, category: 'features' })),
  'modes':        MODES_THREADS.map((t,i) => ({ ...t, id: 'mode-'+i, category: 'modes' })),
  'daw':          DAW_THREADS.map((t,i) => ({ ...t, id: 'daw-'+i, category: 'daw' })),
  'examples':     EX_THREADS.map((t,i) => ({ ...t, id: 'ex-'+i, category: 'examples' })),
  'lounge':       LOUNGE_THREADS.map((t,i) => ({ ...t, id: 'lng-'+i, category: 'lounge' })),
  'latest-beta':  BETA_THREADS.map((t,i) => ({ ...t, id: 'beta-'+i, category: 'latest-beta' }))
};

/* Mega-thread replies — full conversation */
const MEGA_REPLIES = [
  { authorIdx: 4, time: '4d ago · Pinned brief',    body: 'OK here we go — running an R&B vocal-forward mix. Velvet first, then Rosso. Will post both impressions and which one I exported.' },
  { authorIdx: 9, time: '4d ago',  body: 'Velvet on a 92 BPM soul instrumental — Buddy called the rhodes "warm but masking the bass at 180 Hz". I\'d been chasing that all week. Sold.', reactions: { '👂': 12, '🔥': 6 } },
  { authorIdx: 14, time: '3d ago', body: 'Rosso\'s tone is wild. Same mix Velvet called "punchy" became "aggressive in the upper-mids, ride is poking". Both true depending on monitors.', reactions: { '🔥': 18, '👍': 11 } },
  { authorIdx: 1,  time: '3d ago · Zenphony', staff: true, body: 'This is exactly the kind of split we wanted to see. Could you both share the export filename? We\'re cross-checking with the analysis snapshot store.', reactions: { '👍': 9 } },
  { authorIdx: 9,  time: '3d ago', body: '@Avery — exported as `oleo_RVG_velvet_2026-04-26_2031.zna`. Let me know if you need the ref track too.', reactions: { '👍': 4 } },
  { authorIdx: 7,  time: '3d ago', body: 'Buddy chat moment: I asked "what\'s tiring my ears at the chorus" and it said "the snare top end keeps competing with the lead vocal sibilance around 6.2 kHz". I never would have caught the overlap that fast.', reactions: { '🔥': 21, '👂': 15, '❤️': 7 } },
  { authorIdx: 11, time: '3d ago', body: 'Velvet feels like a friendly engineer. Rosso feels like the engineer with strong opinions. I want both depending on the day.', reactions: { '👍': 14, '❤️': 9 } },
  { authorIdx: 16, time: '2d ago', body: 'Tried this on a 30s commercial spot — Rosso called the VO "polite, could push 1.5 dB into the bus comp". It was right. Polished version posted in #examples.', reactions: { '👍': 8 } },
  { authorIdx: 2,  time: '2d ago', body: 'Doing a film cue (sparse, lots of low strings). Velvet was almost too gentle — said "feels intentional" when I was actually fighting an ugly resonance at 76 Hz. Rosso caught it.', reactions: { '👂': 11, '🔥': 5 } },
  { authorIdx: 5,  time: '2d ago', body: 'Quick UX note: the export naming is great but I want a "save with chat" toggle so the buddy conversation comes along with the analysis snapshot.', reactions: { '👍': 19 } },
  { authorIdx: 0,  time: '2d ago · Zenphony', staff: true, body: '@Daniel — added to feature requests, that\'s a solid one. We\'re tracking in #features. Keep them coming.', reactions: { '❤️': 6 } },
  { authorIdx: 8,  time: '2d ago', body: 'Songwriter demo, just guitar and vocal. Velvet leaned poetic ("vocal carries the weight, room sits behind"). Rosso said "vocal is 2 dB hot in the verses". Both helpful, different jobs.', reactions: { '❤️': 12, '🔥': 4 } },
  { authorIdx: 18, time: '1d ago', body: 'I exported 6 sessions through both. Pasting screenshots in the examples thread. Short version: Velvet for first impressions, Rosso for the second pass.', reactions: { '👍': 17, '🔥': 8 } },
  { authorIdx: 13, time: '1d ago', body: 'Podcast tester here — used Mix mode rather than Podcast mode on purpose. Velvet was kinder than I deserved. Switching to Podcast mode tomorrow and re-running.', reactions: { '👂': 5 } },
  { authorIdx: 3,  time: '20h ago', body: 'Mastering check on a folk record — Velvet flagged a 250 Hz boxiness I\'d been told to leave by the artist. Now I have an opinion to push back with. Thank you.', reactions: { '❤️': 14, '🔥': 9 } },
  { authorIdx: 12, time: '14h ago', body: 'Composer note: Buddy reading "intentional reverb tail" was lovely. It sounded like it actually listened. Rosso was less enchanted with my reverb tail. Probably correct.', reactions: { '😄': 18, '❤️': 6 } },
  { authorIdx: 6,  time: '8h ago', body: 'Game audio: tested on a layered ambient bed. Buddy chat asked me what I wanted the listener to feel before suggesting moves. That\'s a really nice touch.', reactions: { '❤️': 11, '🔥': 3 } },
  { authorIdx: 17, time: '5h ago', body: 'Late to this — ambient producer. Velvet was useful, Rosso was almost mean. I think I needed Rosso. Exporting now.', reactions: { '😄': 9, '👍': 4 } },
  { authorIdx: 1,  time: '3h ago · Zenphony', staff: true, body: 'Beautiful work, all of you. We\'ve seen 412 impressions exported across the test drive so far. Closing the brief on 12 May — keep the conversations going till then.', reactions: { '❤️': 28, '🔥': 11, '👍': 19 } },
  { authorIdx: 10, time: '2h ago', body: 'One more — Rosso on a synth-heavy track was perfect. Velvet on the same track told me it was fine. It was not fine. Trust the second opinion.', reactions: { '🔥': 14, '👂': 7 } },
  { authorIdx: 19, time: '40m ago', body: 'Just finished my run. Going to write up properly tomorrow but the short version: I disagreed with Velvet on the kick, agreed with Rosso on everything else. The conversation about why is the part I\'ll remember.', reactions: { '👍': 8 } }
];

/* ─────────────────────────── helpers ─────────────────────────── */
function authorOf(idx, asStaff) {
  if (asStaff) return STAFF[idx % STAFF.length];
  return TESTERS[idx % TESTERS.length];
}
function categoryOf(id) { return CATEGORIES.find(c => c.id === id); }

/* ════════════════════════════════════════════════════════════════════════
   FORUM — top-level entry point
   ════════════════════════════════════════════════════════════════════════ */
function Forum({ user, view, setView, categoryId, setCategoryId, threadId, setThreadId }) {
  return (
    <div className="forum">
      <NDAStrip />
      <ForumBreadcrumb view={view} categoryId={categoryId} setView={setView} />

      {view === 'home' && (
        <ForumHome
          onOpenCategory={(id) => { setCategoryId(id); setView('category'); }}
        />
      )}
      {view === 'category' && (
        <ForumCategory
          categoryId={categoryId}
          onBack={() => setView('home')}
          onOpenThread={(id) => { setThreadId(id); setView('thread'); }}
        />
      )}
      {view === 'thread' && (
        <ForumThread
          threadId={threadId}
          categoryId={categoryId}
          onBack={() => setView('category')}
          user={user}
        />
      )}
    </div>
  );
}

function NDAStrip() {
  return (
    <div className="f-nda glass-tight">
      <span className="dot"></span>
      <span><strong>Beta confidential.</strong> Screenshots, audio, and Listen Buddy impressions stay in this forum until v1.0 ships. Be honest, be specific, and credit people when you quote them.</span>
      <a href="#">Code of conduct →</a>
    </div>
  );
}

function ForumBreadcrumb({ view, categoryId, setView }) {
  const cat = categoryOf(categoryId);
  return (
    <div className="f-crumb">
      <span className={`f-crumb-link ${view === 'home' ? 'is-current' : ''}`} onClick={() => setView('home')}>Forum</span>
      {view !== 'home' && cat && <>
        <FIcon name="chevron" />
        <span className={`f-crumb-link ${view === 'category' ? 'is-current' : ''}`} onClick={() => setView('category')}>{cat.name}</span>
      </>}
      {view === 'thread' && <>
        <FIcon name="chevron" />
        <span className="f-crumb-link is-current">Thread</span>
      </>}
    </div>
  );
}

/* ─────────────────────────── HOME ─────────────────────────── */
function ForumHome({ onOpenCategory }) {
  return (
    <>
      <div className="f-home-hero glass">
        <div>
          <div className="label-caps" style={{ color: 'var(--accent)' }}>▎ Listen Buddy v1.0 beta · community</div>
          <h1 className="f-home-h1">Compare notes with <span className="grad">79 other testers.</span></h1>
          <p>The only place to talk about the beta. Test Drive #1 is live through 12 May. Pinned at the top.</p>
          <div className="f-home-stats">
            <div><div className="num">80</div><div className="lbl">Testers</div></div>
            <div><div className="num">189</div><div className="lbl">Threads</div></div>
            <div><div className="num">1,984</div><div className="lbl">Posts</div></div>
            <div><div className="num"><span className="live-dot"></span>23</div><div className="lbl">Online now</div></div>
          </div>
        </div>
        <div className="f-home-cta">
          <button className="btn btn-primary" onClick={() => onOpenCategory('test-drive-1')}>
            <FIcon name="rocket" /> Open Test Drive #1
          </button>
          <button className="btn btn-outline">New thread</button>
        </div>
      </div>

      <div className="f-cat-grid">
        {CATEGORIES.map(cat => (
          <CategoryCard key={cat.id} cat={cat} onOpen={() => onOpenCategory(cat.id)} />
        ))}
      </div>
    </>
  );
}

function CategoryCard({ cat, onOpen }) {
  const threads = CATEGORY_THREADS[cat.id] || [];
  const latest = threads.find(t => !t.pinned) || threads[0];
  const latestAuthor = latest ? authorOf(latest.authorIdx, latest.staff) : null;
  return (
    <div className={`f-cat glass ${cat.pinned ? 'is-pinned' : ''}`} onClick={onOpen}>
      {cat.pinned && <div className="f-cat-pin"><FIcon name="pin" /> Pinned · current test drive</div>}
      <div className="f-cat-head">
        <div className={`f-cat-icon f-cat-icon-${cat.accent}`}><FIcon name={cat.icon} /></div>
        <div className="f-cat-title">
          <div className="name">{cat.name}</div>
          <div className="desc">{cat.desc}</div>
        </div>
      </div>
      <div className="f-cat-foot">
        <div className="f-cat-stats">
          <span><strong>{cat.threads}</strong> threads</span>
          <span>·</span>
          <span><strong>{cat.posts}</strong> posts</span>
        </div>
        {latest && latestAuthor && (
          <div className="f-cat-latest">
            <FAvatar name={latestAuthor.n} hue={latestAuthor.h} size={26} />
            <div className="meta">
              <div className="title">{latest.title}</div>
              <div className="time">{latestAuthor.n.split(' ')[0]} · {latest.posted}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── CATEGORY VIEW ─────────────────────────── */
function ForumCategory({ categoryId, onBack, onOpenThread }) {
  const cat = categoryOf(categoryId);
  const threads = CATEGORY_THREADS[categoryId] || [];
  if (!cat) return <div>Category not found.</div>;

  const showBrief = categoryId === 'test-drive-1';
  const pinned = threads.filter(t => t.pinned);
  const regular = threads.filter(t => !t.pinned);

  return (
    <>
      <div className="f-cat-hero glass">
        <div className={`f-cat-icon f-cat-icon-${cat.accent} f-cat-icon-lg`}><FIcon name={cat.icon} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>{cat.name}</h1>
          <p>{cat.desc}</p>
        </div>
        <button className="btn btn-primary">+ New thread</button>
      </div>

      {showBrief && <TestDriveBrief />}

      {pinned.length > 0 && !showBrief && (
        <div className="f-thread-section">
          <div className="f-section-h"><FIcon name="pin" /> Pinned</div>
          {pinned.map(t => <ThreadCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} />)}
        </div>
      )}

      <div className="f-thread-section">
        <div className="f-section-h">{showBrief ? 'Tester impressions' : 'Threads'} · {regular.length}</div>
        {regular.map(t => <ThreadCard key={t.id} thread={t} onOpen={() => onOpenThread(t.id)} />)}
        {showBrief && pinned.filter(p => p.id === 'td1-megathread').map(t =>
          <ThreadCard key={t.id} thread={t} highlight onOpen={() => onOpenThread(t.id)} />
        )}
      </div>
    </>
  );
}

function TestDriveBrief() {
  return (
    <div className="f-brief glass">
      <div className="f-brief-tag">▎ Pinned brief · open through 12 May</div>
      <h2>Test Drive #1 · The brief</h2>
      <ol className="f-brief-steps">
        <li>
          <span className="f-step-num">1</span>
          <div>
            <div className="f-step-name">Run an analysis with <em>Velvet</em></div>
            <p>Pick a finished mix you know well. Drop Listen Buddy on the bus, set the theme to Velvet, and run a full analysis.</p>
          </div>
        </li>
        <li>
          <span className="f-step-num">2</span>
          <div>
            <div className="f-step-name">Run the same mix through <em>Rosso</em></div>
            <p>Same audio, different lens. Compare what changed in the impression and the four signals.</p>
          </div>
        </li>
        <li>
          <span className="f-step-num">3</span>
          <div>
            <div className="f-step-name">Talk to Buddy</div>
            <p>Open the chat. Ask something specific (not "what do you think") — like "is the vocal too forward in the bridge?" or "what&apos;s tiring my ears at the chorus?"</p>
          </div>
        </li>
        <li>
          <span className="f-step-num">4</span>
          <div>
            <div className="f-step-name">Save and export your favorite</div>
            <p>Cmd/Ctrl+S to save the snapshot, then export. Filename pattern: <code>track_theme_YYYY-MM-DD_HHMM.zna</code>. Drop the export name in the mega-thread so we can pull telemetry.</p>
          </div>
        </li>
      </ol>
      <div className="f-brief-foot">
        <span>Avery from Zenphony · 4 days ago</span>
        <div className="f-react-row">
          <span className="f-react">👍 47</span>
          <span className="f-react">❤️ 22</span>
          <span className="f-react">🔥 18</span>
        </div>
      </div>
    </div>
  );
}

function ThreadCard({ thread, onOpen, highlight }) {
  const author = authorOf(thread.authorIdx, thread.staff);
  return (
    <div className={`f-thread glass ${highlight ? 'is-highlight' : ''}`} onClick={onOpen}>
      <div className="f-thread-av">
        <FAvatar name={author.n} hue={author.h} size={42} />
      </div>
      <div className="f-thread-body">
        <div className="f-thread-title-row">
          {thread.pinned && <span className="f-tag f-tag-pin"><FIcon name="pin" /> Pinned</span>}
          {thread.hot &&    <span className="f-tag f-tag-hot"><FIcon name="fire" /> Hot</span>}
          {thread.staff &&  <StaffPill />}
          <StatusPill status={thread.status} />
          <h3>{thread.title}</h3>
        </div>
        {thread.excerpt && <p className="f-thread-excerpt">{thread.excerpt}</p>}
        <div className="f-thread-meta">
          <span className="who">{author.n}</span>
          <span className="dot">·</span>
          <span>{author.role}</span>
          <span className="dot">·</span>
          <span>{thread.posted}</span>
        </div>
      </div>
      <div className="f-thread-stats">
        <div className="stat"><div className="n">{thread.replies}</div><div className="l"><FIcon name="reply" /> replies</div></div>
        <div className="stat"><div className="n">{thread.views}</div><div className="l"><FIcon name="eye" /> views</div></div>
      </div>
    </div>
  );
}

/* ─────────────────────────── THREAD VIEW ─────────────────────────── */
function ForumThread({ threadId, categoryId, onBack, user }) {
  const cat = categoryOf(categoryId);
  const threads = CATEGORY_THREADS[categoryId] || [];
  const thread = threads.find(t => t.id === threadId) || threads.find(t => !t.pinned) || threads[0];
  if (!thread) return <div>Thread not found.</div>;

  const isMega = thread.id === 'td1-megathread';
  const replies = isMega ? MEGA_REPLIES : generateReplies(thread);
  const author = authorOf(thread.authorIdx, thread.staff);

  return (
    <>
      <div className="f-thread-hero glass">
        <div className="f-thread-hero-tags">
          {thread.pinned && <span className="f-tag f-tag-pin"><FIcon name="pin" /> Pinned</span>}
          {thread.hot &&    <span className="f-tag f-tag-hot"><FIcon name="fire" /> Hot</span>}
          {thread.staff &&  <StaffPill />}
          <StatusPill status={thread.status} />
          <span className="f-tag f-tag-cat">{cat.name}</span>
        </div>
        <h1>{thread.title}</h1>
        <div className="f-thread-hero-meta">
          <FAvatar name={author.n} hue={author.h} size={32} />
          <div className="who-block">
            <div className="who-name">{author.n}</div>
            <div className="who-role">{author.role}</div>
          </div>
          <span className="sep">·</span>
          <span>{thread.posted || 'Started 4d ago'}</span>
          <span className="sep">·</span>
          <span>{thread.views} views · {replies.length} replies</span>
        </div>
      </div>

      {/* OP body for mega-thread */}
      {isMega && (
        <ReplyCard
          author={author}
          time="Started 4 days ago"
          isOp
          body="Velvet vs Rosso, same mix, both impressions. Then the chat moment that surprised you the most. Drop the export filename so we can correlate with telemetry. Keep it casual, keep it specific."
          reactions={{ '👍': 31, '❤️': 14, '🔥': 26, '👂': 19 }}
        />
      )}

      <div className="f-replies">
        {replies.map((r, i) => {
          const a = authorOf(r.authorIdx, r.staff);
          return (
            <ReplyCard key={i}
              author={a} staff={r.staff}
              time={r.time}
              body={r.body}
              reactions={r.reactions || {}}
            />
          );
        })}
      </div>

      <ReplyComposer user={user} />
    </>
  );
}

/* Generate plausible replies for non-mega threads so each thread has content */
function generateReplies(thread) {
  const count = Math.min(thread.replies || 4, 6);
  const out = [];
  for (let i = 0; i < count; i++) {
    const aIdx = (thread.authorIdx + 3 + i * 5) % TESTERS.length;
    out.push({
      authorIdx: aIdx,
      time: `${i+1}h ago`,
      body: REPLY_FRAGMENTS[(thread.id.length + i) % REPLY_FRAGMENTS.length],
      reactions: i % 2 === 0 ? { '👍': 3 + i, '🔥': i } : { '👍': 2 }
    });
  }
  return out;
}
const REPLY_FRAGMENTS = [
  'Same here — happened twice in the last hour. Logic 11.0.1, M2 Pro, 48 kHz. Going to grab a screen recording.',
  'Confirmed on Cubase 13. The first scan goes through but Buddy doesn\'t show up in the inserts list until I restart.',
  'I get this only when I have the analyzer view docked left. Floating it makes it stable. Probably a redraw thing.',
  'Honestly this would be huge for vocal sessions. +1 on per-bus presets.',
  'Workaround that\'s been holding for me: bypass and re-enable. Not great, but it survives a session.',
  'Velvet was the same on my track too. Rosso said the opposite. Useful to have both.',
  'I assumed this was a feature, not a bug. Either way, please keep the behavior optional.',
  'Tested on Pro Tools 2024.6. Happy to report it\'s clean here. M1 Max, 96 kHz.',
  'Adding to this: I want the export to include the chat alongside the snapshot.',
  'Came here to say the same. The "intentional reverb tail" line was wonderful.',
  'Tried this with a podcast clip and got a similar result. Weighting feels off below 200 Hz.',
  'Reproducible: open project, undock plugin, drag across screens. Flicker every time.'
];

/* Reply card */
function ReplyCard({ author, staff, time, body, reactions, isOp }) {
  return (
    <div className={`f-reply glass ${isOp ? 'is-op' : ''}`}>
      <div className="f-reply-side">
        <FAvatar name={author.n} hue={author.h} size={42} />
      </div>
      <div className="f-reply-main">
        <div className="f-reply-head">
          <span className="who-name">{author.n}</span>
          {staff && <StaffPill />}
          <span className="who-role">{author.role}</span>
          <span className="sep">·</span>
          <span className="time">{time}</span>
        </div>
        <p className="f-reply-body">{body}</p>
        <div className="f-react-row">
          {Object.entries(reactions).map(([emoji, count]) => (
            <span key={emoji} className="f-react">{emoji} {count}</span>
          ))}
          <span className="f-react f-react-add">+ react</span>
          <span className="f-react-spacer"></span>
          <span className="f-react f-react-add"><FIcon name="reply" /> reply</span>
        </div>
      </div>
    </div>
  );
}

function ReplyComposer({ user }) {
  return (
    <div className="f-composer glass">
      <FAvatar name={user} hue={265} size={36} />
      <div className="f-composer-field">
        <div className="f-composer-input" contentEditable suppressContentEditableWarning>Add to the thread…</div>
        <div className="f-composer-foot">
          <span className="hint">⌘↵ to post · drag a screenshot or .zna export to attach</span>
          <button className="btn btn-primary">Post reply</button>
        </div>
      </div>
    </div>
  );
}

/* Export to globals so Account.html can use it */
Object.assign(window, { Forum });
