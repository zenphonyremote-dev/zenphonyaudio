/* Shared helpers for the Admin Hub — AIcon + seedRand.
   Loaded BEFORE admin.jsx and admin-phase2.jsx so both can reference. */

function AIcon({ name, className }) {
  const paths = {
    dash:    <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    users:   <><circle cx="9" cy="9" r="3.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="8" r="2.5"/><path d="M16 13c2.5 0 5 1.5 5 4"/></>,
    waves:   <><path d="M3 12c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4"/><path d="M3 16c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3"/></>,
    cpu:     <><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></>,
    forum:   <><path d="M3 5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8l-5 4z"/><path d="M21 9v9a2 2 0 0 1-2 2h-7l-3 2"/></>,
    flag:    <><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></>,
    key:     <><circle cx="9" cy="14" r="4"/><path d="M13 14l8-8M17 6l3 3"/></>,
    plug:    <><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/></>,
    mail:    <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
    card:    <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></>,
    receipt: <><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    chart:   <><path d="M3 20h18"/><path d="M6 16v-5M11 16v-9M16 16v-3M21 16v-7"/></>,
    bolt:    <><path d="M13 2L4 14h7l-2 8 9-12h-7z"/></>,
    log:     <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    bell:    <><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    search:  <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    alert:   <><path d="M12 2L2 21h20z"/><path d="M12 9v6M12 18v0.5"/></>,
    plus:    <><path d="M12 5v14M5 12h14"/></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDn: <><path d="M12 5v14M19 12l-7 7-7-7"/></>,
    arrowR:  <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    download:<><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>,
    user:    <><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
    crown:   <><path d="M3 7l4 5 5-7 5 7 4-5v11H3z"/></>,
    refund:  <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></>,
    bug:     <><rect x="6" y="8" width="12" height="11" rx="6"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M3 13h3M18 13h3M4 19l3-2M20 19l-3-2M4 9l3 1M20 9l-3 1"/></>,
    feature: <><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5z"/></>,
    cube:    <><path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v10"/></>,
    book:    <><path d="M4 4a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2z"/><path d="M4 4v18"/></>,
    out:     <><path d="M9 12h12M17 8l4 4-4 4M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/></>
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] || null}
    </svg>
  );
}

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

Object.assign(window, { AIcon, seedRand });
