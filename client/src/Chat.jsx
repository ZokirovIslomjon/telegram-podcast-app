import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import './Chat.css'

// COMMUNITY CHAT
// Reading: everyone, straight from Supabase (chat_messages) + live updates via Realtime.
// Writing (send, reply, delete, report, block, admin ban): only through the `chat` Edge Function,
// which checks the Telegram signature, the bot-start gate, bans and the 2-second slow mode.
const SUPABASE_URL = 'https://uqphmtuqncddzsvjaxqu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PxlMl3gWmL_kT2kap6MOZw_Vq7FNuci';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE = 50;
const ADMIN_ID = 848849648; // messages from this account get the "Admin" badge (name/photo are set by the server)

const callChat = (action, extra = {}) =>
  fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: window.Telegram?.WebApp?.initData, action, ...extra })
  }).then(async res => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(body.error || `Error ${res.status}`), { mutedUntil: body.mutedUntil });
    return body;
  });

const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function Avatar({ name, photoUrl, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };
  if (photoUrl && !failed) return <img src={photoUrl} alt="" className="chat-avatar" style={style} referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
  return <div className="chat-avatar chat-avatar-initial" style={style}>{(name || '?').trim().charAt(0).toUpperCase()}</div>;
}

// Latest messages + live inserts/updates (deletions, pins). Used by the full chat and the home preview.
function useChatMessages(limit) {
  const [messages, setMessages] = useState([]);
  const [pinned, setPinned] = useState(null); // the admin's pinned message (may be older than the loaded page)
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.from('chat_messages').select('*').order('id', { ascending: false }).limit(limit)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setMessages(data.reverse());
        setHasMore(data.length === limit);
        setLoaded(true);
      });
    supabase.from('chat_messages').select('*').not('pinned_at', 'is', null).order('pinned_at', { ascending: false }).limit(1)
      .then(({ data }) => { if (!cancelled && data?.[0]) setPinned(data[0]); });
    const channel = supabase.channel(`chat-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, ({ new: m }) =>
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, ({ new: m }) => {
        setMessages(prev => prev.map(x => x.id === m.id ? m : x));
        setPinned(prev => m.pinned_at ? (!prev || m.pinned_at >= prev.pinned_at ? m : prev) : (prev?.id === m.id ? null : prev));
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [limit]);

  const loadEarlier = useCallback(async () => {
    const oldest = messages[0]?.id;
    if (!oldest) return;
    const { data } = await supabase.from('chat_messages').select('*').lt('id', oldest).order('id', { ascending: false }).limit(PAGE);
    if (!data) return;
    setMessages(prev => [...data.reverse(), ...prev]);
    setHasMore(data.length === PAGE);
  }, [messages]);

  const addOwn = (m) => setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
  return { messages, hasMore, loaded, loadEarlier, addOwn, pinned, setPinned };
}

// HOME PAGE CARD: last 3 messages, live. Tap opens the full chat.
export function ChatPreview({ onOpen }) {
  const { messages, loaded } = useChatMessages(3);
  const visible = messages.filter(m => !m.deleted_at).slice(-3);
  return (
    <button className="chat-preview" onClick={onOpen}>
      <div className="chat-preview-head">
        <span className="chat-preview-title">💬 Community chat</span>
        <span className="chat-preview-live"><i />Live</span>
      </div>
      {loaded && visible.length === 0 && <p className="chat-preview-empty">No messages yet. Say hi to other listeners!</p>}
      {visible.map(m => (
        <div key={m.id} className="chat-preview-row">
          <Avatar name={m.name} photoUrl={m.photo_url} size={24} />
          <span className="chat-preview-name">{m.name}</span>
          <span className="chat-preview-text">{m.text}</span>
        </div>
      ))}
      <span className="chat-preview-open">Open chat ›</span>
    </button>
  );
}

// FULL CHAT SCREEN
export default function Chat({ onClose, myId, onNeedBot }) {
  const { messages, hasMore, loaded, loadEarlier, addOwn, pinned, setPinned } = useChatMessages(PAGE);
  const [highlight, setHighlight] = useState(null);
  const [state, setState] = useState({ isAdmin: false, banned: false, blocked: [], mutedUntil: null });
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const listRef = useRef(null);
  const nearBottom = useRef(true);
  const inTelegram = Boolean(window.Telegram?.WebApp?.initData);

  useEffect(() => {
    if (inTelegram) callChat('me').then(setState).catch(() => {});
  }, [inTelegram]);

  // Stick to the newest message unless the user scrolled up to read older ones
  useEffect(() => {
    const el = listRef.current;
    if (el && nearBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, loaded]);
  const onScroll = () => {
    const el = listRef.current;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3000); };

  // Link rule: muted users can't write until mutedUntil; unlock the composer when the time is up
  const muted = state.mutedUntil && new Date(state.mutedUntil) > new Date();
  useEffect(() => {
    if (!muted) return;
    const timer = setTimeout(() => setState(s => ({ ...s, mutedUntil: null })), new Date(state.mutedUntil) - new Date());
    return () => clearTimeout(timer);
  }, [muted, state.mutedUntil]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { message } = await callChat('send', { text: body, replyTo: replyTo?.id });
      nearBottom.current = true;
      addOwn(message);
      setText('');
      setReplyTo(null);
    } catch (err) {
      if (err.message === 'start-bot') onNeedBot();
      else if (err.mutedUntil) { setState(s => ({ ...s, mutedUntil: err.mutedUntil })); setText(''); setReplyTo(null); }
      else flash(err.message);
    } finally {
      setSending(false);
    }
  };

  const act = async (action, m, done) => {
    setMenuFor(null);
    try {
      await callChat(action, { messageId: m.id, userId: m.telegram_id });
      done?.();
    } catch (err) {
      flash(err.message);
    }
  };

  const byId = new Map(messages.map(m => [m.id, m]));

  // Tap the pinned bar: jump to the message if it is loaded
  const goToPinned = () => {
    const el = document.getElementById(`chat-msg-${pinned.id}`);
    if (!el) return;
    nearBottom.current = false;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setHighlight(pinned.id);
    setTimeout(() => setHighlight(null), 1500);
  };
  const pin = (m, on) => act(on ? 'pin' : 'unpin', m, () => setPinned(on ? { ...m, pinned_at: new Date().toISOString() } : null));
  const visible = messages;
  const unblock = (m) => act('unblock', m, () => setState(s => ({ ...s, blocked: s.blocked.filter(id => id !== m.telegram_id) })));

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <button className="chat-back" onClick={onClose} aria-label="Back">‹</button>
        <div className="chat-header-title">
          <b>Poddex Community</b>
          <span>Be kind · No links · Reports go to the admin</span>
        </div>
      </div>

      {pinned && !pinned.deleted_at && (
        <div className="chat-pinned">
          <button className="chat-pinned-body" onClick={goToPinned}>
            <span className="chat-pinned-label">📌 Pinned message</span>
            <span className="chat-pinned-text">{pinned.text}</span>
          </button>
          {state.isAdmin && <button className="chat-pinned-x" onClick={() => pin(pinned, false)} aria-label="Unpin">×</button>}
        </div>
      )}

      <div className="chat-list" ref={listRef} onScroll={onScroll}>
        {hasMore && <button className="chat-earlier" onClick={() => { nearBottom.current = false; loadEarlier(); }}>Load earlier messages</button>}
        {loaded && visible.length === 0 && <p className="chat-empty">No messages yet. Start the conversation!</p>}
        {visible.map((m, i) => {
          const mine = m.telegram_id === myId;
          if (state.blocked.includes(m.telegram_id)) {
            return <button key={m.id} className="chat-blocked" onClick={() => unblock(m)}>Message from a blocked user · tap to unblock</button>;
          }
          const prev = visible[i - 1];
          const grouped = prev && prev.telegram_id === m.telegram_id && !prev.deleted_at && new Date(m.created_at) - new Date(prev.created_at) < 5 * 60 * 1000;
          const quoted = m.reply_to ? byId.get(m.reply_to) : null;
          return (
            <div key={m.id} id={`chat-msg-${m.id}`} className={`chat-msg ${grouped ? 'grouped' : ''} ${highlight === m.id ? 'highlight' : ''}`}>
              <div className="chat-msg-avatar">{!grouped && <Avatar name={m.name} photoUrl={m.photo_url} />}</div>
              <div className="chat-msg-body">
                {!grouped && (
                  <div className="chat-msg-meta">
                    <span className={`chat-msg-name ${mine ? 'mine' : ''}`}>{m.name}</span>
                    {m.telegram_id === ADMIN_ID && <span className="chat-admin-badge">ADMIN</span>}
                    {m.username && <span className="chat-msg-user">@{m.username}</span>}
                    <span className="chat-msg-time">{fmtTime(m.created_at)}</span>
                    {m.pinned_at && <span className="chat-msg-time">📌</span>}
                  </div>
                )}
                {m.reply_to && (
                  <div className="chat-quote">
                    {quoted ? <><b>{quoted.name}</b> {quoted.deleted_at ? 'Message deleted' : quoted.text}</> : 'Earlier message'}
                  </div>
                )}
                {m.deleted_at
                  ? <p className="chat-msg-text deleted">Message deleted</p>
                  : <button className="chat-msg-text" onClick={() => inTelegram && setMenuFor(m)}>{m.text}</button>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-composer">
        {notice && <div className="chat-notice">{notice}</div>}
        {replyTo && (
          <div className="chat-replying">
            <span>Replying to <b>{replyTo.name}</b>: {replyTo.text}</span>
            <button onClick={() => setReplyTo(null)} aria-label="Cancel reply">×</button>
          </div>
        )}
        {!inTelegram ? <p className="chat-readonly">Open Poddex from Telegram to join the chat.</p>
          : state.banned ? <p className="chat-readonly">You can't send messages in this chat.</p>
          : muted ? <p className="chat-readonly muted">🔗 Links aren't allowed. You can write again at <b>{fmtTime(state.mutedUntil)}</b>.</p>
          : (
            <div className="chat-input-row">
              <textarea value={text} maxLength={1000} rows={1} placeholder="Message the community…"
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); send(); } }} />
              <button className="chat-send" onClick={send} disabled={!text.trim() || sending} aria-label="Send">➤</button>
            </div>
          )}
      </div>

      {menuFor && (
        <div className="join-backdrop" onClick={() => setMenuFor(null)}>
          <div className="join-sheet chat-menu" onClick={e => e.stopPropagation()}>
            <p className="chat-menu-preview"><b>{menuFor.name}</b> {menuFor.text}</p>
            {!state.banned && <button onClick={() => { setReplyTo(menuFor); setMenuFor(null); }}>↩️ Reply</button>}
            {menuFor.telegram_id !== myId && <button onClick={() => act('report', menuFor, () => flash('Thanks, the admin will review it.'))}>🚩 Report message</button>}
            {menuFor.telegram_id !== myId && <button onClick={() => act('block', menuFor, () => setState(s => ({ ...s, blocked: [...s.blocked, menuFor.telegram_id] })))}>🚫 Block {menuFor.name}</button>}
            {state.isAdmin && <button onClick={() => pin(menuFor, !menuFor.pinned_at)}>📌 {menuFor.pinned_at ? 'Unpin message' : 'Pin message'}</button>}
            {(menuFor.telegram_id === myId || state.isAdmin) && <button className="danger" onClick={() => act('delete', menuFor)}>🗑 Delete message</button>}
            {state.isAdmin && menuFor.telegram_id !== myId && <button className="danger" onClick={() => act('ban', menuFor, () => flash(`${menuFor.name} can no longer send messages.`))}>⛔ Ban {menuFor.name} (admin)</button>}
            <button className="join-later" onClick={() => setMenuFor(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ADMIN: reported messages (shown in the Admin dashboard)
export function ChatReports() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');
  const load = () => callChat('reports').then(r => setReports(r.reports)).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);
  const act = (action, r) => callChat(action, { messageId: r.id, userId: r.telegram_id }).then(load).catch(e => setError(e.message));

  return (
    <div className="admin-card">
      <div className="admin-card-head"><h3>Chat reports</h3>{reports && <span className="admin-readout">{reports.length} open</span>}</div>
      {error && <p className="admin-empty">{error}</p>}
      {reports?.length === 0 && <p className="admin-empty">No reports. 🎉</p>}
      {reports?.map(r => (
        <div key={r.id} className="chat-report">
          <div className="chat-report-head"><b>{r.name}</b>{r.username && <span>@{r.username}</span>}<span className="chat-report-count">🚩 {r.reports}</span></div>
          <p className={r.deleted_at ? 'deleted' : ''}>{r.deleted_at ? 'Message deleted' : r.text}</p>
          <div className="chat-report-actions">
            {!r.deleted_at && <button onClick={() => act('delete', r)}>Delete</button>}
            <button onClick={() => act(r.banned ? 'unban' : 'ban', r)}>{r.banned ? 'Unban' : 'Ban user'}</button>
            <button onClick={() => act('dismiss', r)}>Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
}
