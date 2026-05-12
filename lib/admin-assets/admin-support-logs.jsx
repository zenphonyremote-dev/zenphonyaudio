/* ============================================================================
   ADMIN — SUPPORT LOGS
   Plugin-uploaded JSONL log files. List, filter, inspect system info,
   download via signed R2 URL, mark reviewed/archived.

   Data source: /api/admin/support/logs (GET, PATCH)
                /api/admin/support/logs/[id]/download (GET signed URL)
   ============================================================================ */

(function () {
  const { useState, useEffect, useMemo, useCallback } = React;

  function fmtBytes(n) {
    if (!n && n !== 0) return '—';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function fmtRelTime(iso) {
    if (!iso) return '—';
    const t = new Date(iso).getTime();
    const diff = Date.now() - t;
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return Math.floor(diff / 60_000) + 'm ago';
    if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + 'h ago';
    if (diff < 7 * 86_400_000) return Math.floor(diff / 86_400_000) + 'd ago';
    return new Date(iso).toLocaleDateString();
  }

  function StatusPill({ status }) {
    const colors = {
      uploaded: { bg: 'hsl(190, 80%, 60%)', label: 'New' },
      reviewed: { bg: 'hsl(150, 70%, 55%)', label: 'Reviewed' },
      archived: { bg: 'hsl(220, 12%, 60%)', label: 'Archived' },
    };
    const c = colors[status] || colors.uploaded;
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        background: c.bg + '22',
        color: c.bg,
        border: '1px solid ' + c.bg + '55',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}>{c.label}</span>
    );
  }

  function EagleBadge({ state }) {
    if (!state || state === 'unknown') return <span style={{ opacity: 0.5 }}>—</span>;
    const ok = state === 'on';
    const color = ok ? 'hsl(150,70%,60%)' : 'hsl(355,80%,65%)';
    return (
      <span style={{
        fontSize: 11, fontWeight: 600, color,
        padding: '2px 8px', borderRadius: 999,
        background: color + '18', border: '1px solid ' + color + '44',
      }}>{ok ? 'EAGLE ON' : state.toUpperCase()}</span>
    );
  }

  function SupportLogsScreen() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [downloadBusy, setDownloadBusy] = useState(false);

    const load = useCallback(async () => {
      setLoading(true);
      setErr(null);
      try {
        const qs = new URLSearchParams();
        qs.set('limit', '50');
        if (statusFilter) qs.set('status', statusFilter);
        if (emailFilter) qs.set('email', emailFilter);
        const res = await fetch('/api/admin/support/logs?' + qs.toString(), {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const j = await res.json();
        setLogs(j.logs || []);
        setTotal(j.total || 0);
      } catch (e) {
        setErr(e.message || 'load_failed');
      } finally {
        setLoading(false);
      }
    }, [statusFilter, emailFilter]);

    useEffect(() => { load(); }, [load]);

    const download = useCallback(async (id) => {
      setDownloadBusy(true);
      try {
        const res = await fetch('/api/admin/support/logs/' + id + '/download', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const j = await res.json();
        if (!j.url) throw new Error('No URL returned');
        // Use a programmatic <a download> click instead of window.open. Chrome
        // (and Safari) block window.open as a popup even when the URL would
        // download cleanly — and even if not blocked, you get a flicker of
        // a blank tab opening + closing. A real <a> with the download attr,
        // combined with R2's Content-Disposition: attachment header, is the
        // reliable single-click-to-save pattern.
        const a = document.createElement('a');
        a.href = j.url;
        a.rel = 'noopener';
        // download="" hints to the browser to use the Content-Disposition
        // filename. Empty string is the canonical "filename comes from
        // the server" form.
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        alert('Download failed: ' + (e.message || 'unknown'));
      } finally {
        setDownloadBusy(false);
      }
    }, []);

    const setStatus = useCallback(async (id, status) => {
      try {
        const res = await fetch('/api/admin/support/logs', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await load();
        if (selected?.id === id) {
          setSelected({ ...selected, status });
        }
      } catch (e) {
        alert('Update failed: ' + (e.message || 'unknown'));
      }
    }, [load, selected]);

    const inputStyle = {
      background: 'hsl(220,18%,14%)',
      border: '1px solid hsl(220,18%,24%)',
      color: 'inherit',
      borderRadius: 6,
      padding: '7px 10px',
      fontSize: 13,
      outline: 'none',
    };

    return (
      <>
        <div className="adm-page-h">
          <div>
            <h1>Support logs</h1>
            <div className="sub">
              Plugin-uploaded diagnostic logs · last-48h activity + system snapshot · click a row to inspect or download.
            </div>
          </div>
          <div className="spacer" />
          <div className="actions">
            <button onClick={load} className="adm-btn adm-btn-ghost" disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, minWidth: 160 }}
          >
            <option value="">All statuses</option>
            <option value="uploaded">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>
          <input
            type="text"
            placeholder="Filter by user email"
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
            style={{ ...inputStyle, minWidth: 240 }}
          />
          <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 13 }}>
            {total} log{total === 1 ? '' : 's'}
          </span>
        </div>

        {err && (
          <div style={{
            padding: 12, borderRadius: 8,
            background: 'hsl(355,80%,55%,0.12)',
            border: '1px solid hsl(355,80%,55%,0.35)',
            color: 'hsl(355,90%,82%)', marginBottom: 16,
          }}>{err}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>
          <div className="adm-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', opacity: 0.65 }}>
                  <th style={{ padding: '10px 12px' }}>User</th>
                  <th style={{ padding: '10px 12px' }}>Machine</th>
                  <th style={{ padding: '10px 12px' }}>Plugin</th>
                  <th style={{ padding: '10px 12px' }}>EAGLE</th>
                  <th style={{ padding: '10px 12px' }}>Size</th>
                  <th style={{ padding: '10px 12px' }}>Uploaded</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && !loading && (
                  <tr><td colSpan="7" style={{ padding: 24, opacity: 0.55, textAlign: 'center' }}>No logs match these filters.</td></tr>
                )}
                {logs.map(l => (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    style={{
                      cursor: 'pointer',
                      background: selected?.id === l.id ? 'hsl(265, 80%, 65%, 0.10)' : 'transparent',
                      borderTop: '1px solid hsl(220, 18%, 22%, 0.45)',
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{l.user_email || l.user_id.slice(0, 8)}</div>
                      <div style={{ opacity: 0.55, fontSize: 11 }}>{l.user_plan || 'free'}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div>{l.hardware_model || '—'}</div>
                      <div style={{ opacity: 0.55, fontSize: 11 }}>
                        {(l.ram_gb ? l.ram_gb + ' GB · ' : '')}{l.os_version || ''}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div>v{l.plugin_version || '—'}</div>
                      <div style={{ opacity: 0.55, fontSize: 11 }}>{l.host_app || ''} {l.host_format ? '· ' + l.host_format : ''}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}><EagleBadge state={l.eagle_state} /></td>
                    <td style={{ padding: '10px 12px' }}>{fmtBytes(l.log_size_bytes)}</td>
                    <td style={{ padding: '10px 12px' }}>{fmtRelTime(l.created_at)}</td>
                    <td style={{ padding: '10px 12px' }}><StatusPill status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <aside className="adm-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.user_email || 'Unknown user'}</div>
                  <div style={{ opacity: 0.6, fontSize: 12 }}>{selected.user_full_name || ''}</div>
                </div>
                <button onClick={() => setSelected(null)} className="adm-btn" style={{ padding: '4px 10px' }}>✕</button>
              </div>

              <dl style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px 12px', fontSize: 13 }}>
                <dt style={{ opacity: 0.55 }}>Uploaded</dt><dd>{new Date(selected.created_at).toLocaleString()}</dd>
                <dt style={{ opacity: 0.55 }}>Hardware</dt><dd>{selected.hardware_model || '—'}</dd>
                <dt style={{ opacity: 0.55 }}>CPU</dt><dd>{selected.cpu_model || '—'} {selected.cpu_cores ? `(${selected.cpu_cores} cores)` : ''}</dd>
                <dt style={{ opacity: 0.55 }}>RAM</dt><dd>{selected.ram_gb ? selected.ram_gb + ' GB' : '—'}</dd>
                <dt style={{ opacity: 0.55 }}>OS</dt><dd>{selected.os_version || '—'}</dd>
                <dt style={{ opacity: 0.55 }}>Plugin</dt><dd>v{selected.plugin_version || '—'}</dd>
                <dt style={{ opacity: 0.55 }}>Host</dt><dd>{selected.host_app || '—'} {selected.host_format ? '· ' + selected.host_format : ''}</dd>
                <dt style={{ opacity: 0.55 }}>EAGLE</dt><dd><EagleBadge state={selected.eagle_state} /></dd>
                <dt style={{ opacity: 0.55 }}>Machine</dt><dd style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{selected.machine_id_hash ? selected.machine_id_hash.slice(0, 16) + '…' : '—'}</dd>
                <dt style={{ opacity: 0.55 }}>File size</dt><dd>{fmtBytes(selected.log_size_bytes)}</dd>
                <dt style={{ opacity: 0.55 }}>R2 path</dt><dd style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, wordBreak: 'break-all' }}>{selected.log_path}</dd>
              </dl>

              {selected.log_summary && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ opacity: 0.6, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Activity summary</div>
                  <pre style={{ background: 'hsl(220,18%,12%)', padding: 10, borderRadius: 6, fontSize: 11, overflowX: 'auto', maxHeight: 200 }}>
{JSON.stringify(selected.log_summary, null, 2)}
                  </pre>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => download(selected.id)}
                  className="adm-btn adm-btn-primary"
                  disabled={downloadBusy}
                >{downloadBusy ? 'Signing…' : 'Download .jsonl'}</button>
                {selected.status !== 'reviewed' && (
                  <button onClick={() => setStatus(selected.id, 'reviewed')} className="adm-btn">Mark reviewed</button>
                )}
                {selected.status !== 'archived' && (
                  <button onClick={() => setStatus(selected.id, 'archived')} className="adm-btn">Archive</button>
                )}
                {selected.status !== 'uploaded' && (
                  <button onClick={() => setStatus(selected.id, 'uploaded')} className="adm-btn">Reopen</button>
                )}
              </div>
            </aside>
          )}
        </div>
      </>
    );
  }

  window.SupportLogsScreen = SupportLogsScreen;
})();
