import { useState, useEffect } from 'react'
import './Admin.css'
import { ChatReports } from './Chat'

// ADMIN DASHBOARD – only opened by the admin (button on Profile). The `admin` function checks
// the Telegram signature and the admin id on the server, so nobody else can load these numbers.
const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
];
const fmtDay = (day) => new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const fmtNum = (n) => Number(n || 0).toLocaleString('en-US');

function Tile({ label, value, note, noteTone }) {
  return (
    <div className="admin-tile">
      <div className="admin-tile-label">{label}</div>
      <div className="admin-tile-value">{value}</div>
      {note && <div className={`admin-tile-note ${noteTone || ''}`}>{note}</div>}
    </div>
  );
}

// One-series bar chart (one per day). Tap or hover a bar to see its value.
function DayBars({ title, points, valueKey, unit, emptyText }) {
  const [selected, setSelected] = useState(null);
  const max = Math.max(1, ...points.map(p => p[valueKey]));
  const total = points.reduce((s, p) => s + p[valueKey], 0);
  const shown = selected ?? points.length - 1;
  const p = points[shown];
  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <h3>{title}</h3>
        {p && <span className="admin-readout">{fmtDay(p.day)} · <b>{fmtNum(p[valueKey])}</b> {unit}</span>}
      </div>
      {total === 0 && emptyText ? <p className="admin-empty">{emptyText}</p> : (
        <>
          <div className="admin-bars" onMouseLeave={() => setSelected(null)} role="img"
               aria-label={`${title}: ${points.map(x => `${fmtDay(x.day)} ${x[valueKey]}`).join(', ')}`}>
            {points.map((x, i) => (
              <button key={x.day} className={`admin-bar-hit ${i === shown ? 'on' : ''}`}
                      onMouseEnter={() => setSelected(i)} onClick={() => setSelected(i)}
                      aria-label={`${fmtDay(x.day)}: ${x[valueKey]} ${unit}`}>
                <span className="admin-bar" style={{ height: `${Math.max(x[valueKey] ? 4 : 0, (x[valueKey] / max) * 100)}%` }} />
              </button>
            ))}
          </div>
          <div className="admin-axis">
            <span>{fmtDay(points[0].day)}</span><span>max {fmtNum(max)}</span><span>{fmtDay(points[points.length - 1].day)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function Admin({ onClose }) {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('https://uqphmtuqncddzsvjaxqu.supabase.co/functions/v1/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: window.Telegram?.WebApp?.initData, range })
    })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(res.status === 403 ? 'This account is not an admin.' : res.status === 401 ? 'Please reopen the app from Telegram.' : body.error || `Error ${res.status}`);
        return body;
      })
      .then(body => { if (!cancelled) setData(body); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range, reload]);

  const change = data && data.activeUsersPrev > 0
    ? Math.round(((data.activeUsers - data.activeUsersPrev) / data.activeUsersPrev) * 100)
    : null;
  const rangeLabel = RANGES.find(r => r.key === range).label.toLowerCase();

  return (
    <div className="app-container admin">
      <div className="admin-header">
        <button className="admin-back" onClick={onClose} aria-label="Back">‹ Back</button>
        <h2>Admin</h2>
        <button className="admin-refresh" onClick={() => setReload(n => n + 1)} disabled={loading}>{loading ? '…' : 'Refresh'}</button>
      </div>

      <div className="admin-ranges" role="tablist">
        {RANGES.map(r => (
          <button key={r.key} role="tab" aria-selected={range === r.key}
                  className={range === r.key ? 'on' : ''} onClick={() => setRange(r.key)}>{r.label}</button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}
      {!data && !error && <p className="admin-empty">Loading…</p>}

      {data && (
        <>
          <div className="admin-tiles">
            <Tile label="Active users" value={fmtNum(data.activeUsers)}
                  note={change === null ? `opened the app, ${rangeLabel}` : `${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}% vs previous period`}
                  noteTone={change === null ? '' : change >= 0 ? 'up' : 'down'} />
            <Tile label="New users" value={fmtNum(data.newUsers)} note={`first open, ${rangeLabel}`} />
            <Tile label="Total users" value={fmtNum(data.totalUsers)} note="opened the app at least once" />
            <Tile label="Bot followers" value={fmtNum(data.botFollowers)} note={data.botBlocked ? `${fmtNum(data.botBlocked)} blocked the bot` : 'started the bot'} />
            <Tile label="Stars earned" value={`⭐ ${fmtNum(data.starsEarned)}`} note={rangeLabel} />
            <Tile label="Subscriptions" value={data.subscriptions.enabled ? fmtNum(data.subscriptions.active) : 'Not live yet'}
                  note={data.subscriptions.enabled ? 'active Premium' : `Premium paused · ${data.subscriptions.active} free`} />
          </div>

          {range !== 'today' && (
            <>
              <DayBars title="Active users per day" points={data.activity} valueKey="n" unit="users" />
              <DayBars title="Stars per day" points={data.starsByDay} valueKey="stars" unit="Stars" emptyText={`No Stars in the last ${rangeLabel}.`} />
            </>
          )}

          <ChatReports />

          <div className="admin-card">
            <div className="admin-card-head"><h3>Recent payments</h3></div>
            {data.transactions.length === 0 ? <p className="admin-empty">No payments yet.</p> : (
              <ul className="admin-list">
                {data.transactions.map((t, i) => (
                  <li key={i}>
                    <span className="admin-list-user">{t.user}</span>
                    <span className="admin-list-date">{new Date(t.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="admin-list-stars">⭐ {fmtNum(t.stars)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="admin-updated">Updated {new Date(data.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · days in Malaysia time</p>
        </>
      )}
    </div>
  );
}
