import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'

// SVG Icons Components
const Icons = {
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Search: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Profile: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Discover: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor"/>
    </svg>
  ),
  Library: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Play: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Pause: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? "#F04432" : "none"} stroke={filled ? "#F04432" : "currentColor"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  BackArrow: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  SkipNext: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 4 15 12 5 20 5 4"/>
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  SkipPrevious: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19 20 9 12 19 4 19 20"/>
      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Forward10: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12A10 10 0 1 1 12 2"/>
      <path d="M22 2v6h-6"/>
      <text x="9" y="15" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">+10</text>
    </svg>
  ),
  Backward10: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12A10 10 0 1 0 12 2"/>
      <path d="M2 2v6h6"/>
      <text x="9" y="15" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">-10</text>
    </svg>
  ),
  Shuffle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8"/>
      <line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/>
      <line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  Repeat: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  Camera: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
};

// Poddex DB (Supabase) – publishable key is safe to ship in the app (read-only via RLS)
const SUPABASE_URL = 'https://uqphmtuqncddzsvjaxqu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PxlMl3gWmL_kT2kap6MOZw_Vq7FNuci';
const CHANNEL_URL = 'https://t.me/Poddex_Podcast';
const COVER_IMAGE = '/poddex%20cover.jpg'; // same cover for every episode (client/public/poddex cover.jpg)

// Categories
const CATEGORIES = [
  { name: "Gaming", icon: "🎮" },
  { name: "Arts", icon: "🎨" },
  { name: "Education", icon: "📚" },
  { name: "Travel", icon: "✈️" },
  { name: "Tech", icon: "💻" },
  { name: "News", icon: "📰" },
  { name: "Sports", icon: "⚽" },
  { name: "Music", icon: "🎵" }
];

// Banners
const BANNERS = [
  {
    title: "Listen Favourite",
    subtitle: "Podcast",
    description: "Enjoy premium sound",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=400&fit=crop",
    gradient: "linear-gradient(135deg, rgba(139, 122, 240, 0.9) 0%, rgba(108, 93, 211, 0.9) 100%)"
  },
  {
    title: "Discover New",
    subtitle: "Episodes",
    description: "Trending now",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=400&fit=crop",
    gradient: "linear-gradient(135deg, rgba(255, 107, 157, 0.9) 0%, rgba(196, 69, 105, 0.9) 100%)"
  }
];

function App() {
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [lastPlayedEpisode, setLastPlayedEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [telegramUser, setTelegramUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isChannelMember, setIsChannelMember] = useState(null); // null = unknown (don't nag)
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [lyrics, setLyrics] = useState(null); // null = loading/none, [] = not available
  
  // NEW: PAGINATION STATE
  const [visibleCount, setVisibleCount] = useState(15);
  
  const audioRef = useRef(null);
  const playedRef = useRef(0);      // seconds of real playback since the last coin heartbeat
  const lastPosRef = useRef(null);  // last audio position seen, to measure real playback
  const lyricsBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('podcastAppData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setFavorites(data.favorites || []);
      setProfileImage(data.profileImage || null);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      favorites,
      profileImage,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('podcastAppData', JSON.stringify(dataToSave));
  }, [favorites, profileImage]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      tg.setHeaderColor('#0b0708');
      tg.setBackgroundColor('#0b0708');
      if (tg.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  // Record today's visit (DAU/WAU/MAU) and check if the user joined our channel.
  // Runs on open and again whenever the user comes back to the app (e.g. after joining).
  const checkChannelMembership = () => {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return; // opened outside Telegram
    fetch(`${SUPABASE_URL}/functions/v1/app-open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    })
      .then(res => res.json())
      .then(data => {
        if (typeof data.coins === 'number') { setUserCoins(data.coins); setUserRank(data.rank); }
        if (typeof data.isMember !== 'boolean') return;
        setIsChannelMember(data.isMember);
        if (data.isMember) setShowJoinPrompt(false);
      })
      .catch(err => console.error('app-open failed:', err));
  };

  useEffect(() => {
    checkChannelMembership();
    const tg = window.Telegram?.WebApp;
    const onVisible = () => { if (document.visibilityState === 'visible') checkChannelMembership(); };
    tg?.onEvent?.('activated', checkChannelMembership);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      tg?.offEvent?.('activated', checkChannelMembership);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const joinChannel = () => {
    const tg = window.Telegram?.WebApp;
    // Opens the channel inside Telegram; the mini app stays open (minimized) and audio keeps playing
    if (tg?.openTelegramLink) tg.openTelegramLink(CHANNEL_URL);
    else window.open(CHANNEL_URL, '_blank');
    setShowJoinPrompt(false);
  };

  // Fetch Global Leaderboard (top 10 from Supabase) whenever the Profile tab opens
  useEffect(() => {
    if (activeTab !== 'profile') return;
    fetch(`${SUPABASE_URL}/rest/v1/rpc/get_leaderboard`, { headers: { apikey: SUPABASE_KEY } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLeaderboard(data); })
      .catch(err => console.error("Leaderboard fetch error:", err));
  }, [activeTab]);

  // Wake the Render server (Telegram bot) – the app no longer calls it for anything else
  useEffect(() => {
    fetch('https://telegram-podcast-app.onrender.com/health', { mode: 'no-cors' }).catch(() => {});
  }, []);

  // FETCH EPISODES from Poddex DB (Supabase, always on). An hourly background job fills it from RSS.
  useEffect(() => {
    const PAGE = 1000; // Supabase returns max 1000 rows per request
    const loadPage = async (offset, loaded) => {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/episodes?select=title,audio_url,published_at,transcript_url&order=published_at.desc&limit=${PAGE}&offset=${offset}`,
        { headers: { apikey: SUPABASE_KEY } }
      );
      const rows = await res.json();
      if (!Array.isArray(rows)) throw new Error(rows?.message || 'Failed to load episodes');
      // Newest first already; map to the shape the UI uses
      const all = loaded.concat(rows.map(r => ({ title: r.title, cover: COVER_IMAGE, audio: r.audio_url, date: r.published_at, transcript: r.transcript_url })));
      setEpisodes(all); // show the first page immediately
      if (rows.length === PAGE) await loadPage(offset + PAGE, all);
    };
    loadPage(0, []).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // COINS: after every 30s of real playback, tell the server. The server credits the time
  // (never faster than the clock) and gives 1 coin per 2 minutes. Telegram users only.
  const sendListenHeartbeat = () => {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;
    fetch(`${SUPABASE_URL}/functions/v1/listen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    })
      .then(res => res.json())
      .then(data => { if (typeof data.coins === 'number') { setUserCoins(data.coins); setUserRank(data.rank); } })
      .catch(err => console.error('listen failed:', err));
  };

  const handlePlay = (episode) => {
    if (isChannelMember === false) setShowJoinPrompt(true);
    setCurrentEpisode(episode);
    if (episode.audio === lastPlayedEpisode?.audio) audioRef.current?.play();
    else setLastPlayedEpisode(episode); // new src + autoPlay starts it
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const skipForward = () => {
    if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
  };

  const skipBackward = () => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
  };

  const playNext = () => {
    const currentIndex = episodes.findIndex(ep => ep.title === lastPlayedEpisode?.title);
    if (currentIndex < episodes.length - 1) handlePlay(episodes[currentIndex + 1]);
  };

  const playPrevious = () => {
    const currentIndex = episodes.findIndex(ep => ep.title === lastPlayedEpisode?.title);
    if (currentIndex > 0) handlePlay(episodes[currentIndex - 1]);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    // Count only normal playback: ignore seeks/skips (big jumps) and backwards moves
    const step = audio.currentTime - (lastPosRef.current ?? audio.currentTime);
    lastPosRef.current = audio.currentTime;
    if (step > 0 && step < 1 + audio.playbackRate && !audio.paused) {
      playedRef.current += step;
      if (playedRef.current >= 30) {
        playedRef.current -= 30;
        sendListenHeartbeat();
      }
    }
  };

  const handleLoadedMetadata = () => {
    lastPosRef.current = null; // new episode
    if (audioRef.current) setDuration(audioRef.current.duration);
    updatePositionState();
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Date Formatter
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleFavorite = (episode) => {
    const episodeId = episode.title;
    if (favorites.includes(episodeId)) setFavorites(favorites.filter(id => id !== episodeId));
    else setFavorites([...favorites, episodeId]);
  };

  const isFavorite = (episode) => {
    return favorites.includes(episode.title);
  };

  const closePlayer = () => setCurrentEpisode(null);

  const closeMiniPlayer = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setLastPlayedEpisode(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setActiveTab('discover');
  };

  const handleBannerPlayNow = () => {
    if (lastPlayedEpisode) {
      handlePlay(lastPlayedEpisode);
    } else if (episodes.length > 0) {
      handlePlay(episodes[0]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setSelectedCategory(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // LOCK SCREEN / NOTIFICATION CONTROLS (Media Session API)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !lastPlayedEpisode) return;
    const ms = navigator.mediaSession;
    ms.metadata = new window.MediaMetadata({
      title: lastPlayedEpisode.title,
      artist: 'Innovision Radio',
      artwork: [{ src: lastPlayedEpisode.cover, sizes: '512x512' }]
    });
    const handlers = {
      play: () => audioRef.current?.play(),
      pause: () => audioRef.current?.pause(),
      seekbackward: skipBackward,
      seekforward: skipForward,
      previoustrack: playPrevious,
      nexttrack: playNext,
      seekto: (d) => { if (audioRef.current) audioRef.current.currentTime = d.seekTime; }
    };
    Object.entries(handlers).forEach(([action, fn]) => {
      try { ms.setActionHandler(action, fn); } catch { /* unsupported action */ }
    });
  }, [lastPlayedEpisode, episodes, duration]);

  const updatePositionState = () => {
    const a = audioRef.current;
    if (!a || !('mediaSession' in navigator) || !isFinite(a.duration)) return;
    try { navigator.mediaSession.setPositionState({ duration: a.duration, position: a.currentTime, playbackRate: a.playbackRate }); } catch { /* ignore */ }
  };

  // FILTERING LOGIC
  const filteredEpisodes = episodes.filter(ep => {
    const matchesCategory = !selectedCategory || ep.title.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || ep.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoriteEpisodes = episodes.filter(ep => favorites.includes(ep.title));
  
  // PAGINATION LOGIC: Show only 'visibleCount' items
  const displayedEpisodes = filteredEpisodes.slice(0, visibleCount);

  // Load More Function
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  // LYRICS: load the episode's transcript
  useEffect(() => {
    setLyrics(null);
    const url = lastPlayedEpisode?.transcript;
    if (!url) return;
    let cancelled = false;
    fetch(`${SUPABASE_URL}/functions/v1/transcript?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setLyrics(Array.isArray(data.lines) ? data.lines : []); })
      .catch(() => { if (!cancelled) setLyrics([]); });
    return () => { cancelled = true; };
  }, [lastPlayedEpisode]);

  // Give each line a start time: exact where the transcript has a [mm:ss] marker,
  // in between spread by text length up to the next marker (or the end of the episode).
  const lyricTimes = useMemo(() => {
    if (!lyrics?.length || !duration) return [];
    const anchors = [{ i: 0, t: 0 }];
    lyrics.forEach((line, i) => {
      const last = anchors[anchors.length - 1];
      if (i > 0 && line.at > last.t && line.at < duration) anchors.push({ i, t: line.at });
    });
    anchors.push({ i: lyrics.length, t: duration });
    const times = [];
    for (let a = 0; a < anchors.length - 1; a++) {
      const { i: from, t: t0 } = anchors[a];
      const { i: to, t: t1 } = anchors[a + 1];
      const total = lyrics.slice(from, to).reduce((sum, l) => sum + l.text.length, 0) || 1;
      let chars = 0;
      for (let i = from; i < to; i++) {
        times[i] = t0 + ((t1 - t0) * chars) / total;
        chars += lyrics[i].text.length;
      }
    }
    return times;
  }, [lyrics, duration]);

  let activeLine = -1;
  for (let i = 0; i < lyricTimes.length && lyricTimes[i] <= currentTime; i++) activeLine = i;

  // Keep the current line in view (scrolls only the lyrics box, not the page)
  useEffect(() => {
    const box = lyricsBoxRef.current;
    const el = box?.children[activeLine];
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (el) box.scrollTo({ top: el.offsetTop - box.clientHeight / 3, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeLine]);

  const renderPage = () => {
  // FULL SCREEN PLAYER
  if (currentEpisode) {
    const progress = duration ? (currentTime / duration) * 100 : 0;
    return (
      <div className="player-overlay">
        <div className="player-bg" style={{ backgroundImage: `url(${currentEpisode.cover})` }} />

        <div className={`player-main ${currentEpisode.transcript ? 'has-lyrics' : ''}`}>
        <div className="player-header">
          <button className="icon-btn" onClick={closePlayer} aria-label="Close player">
            <Icons.ChevronDown />
          </button>
          <div className="player-header-text">
            <span className="player-header-label">Playing from podcast</span>
            <span className="now-playing-text">Innovision Radio</span>
          </div>
          <span className="icon-btn-spacer" />
        </div>

        <div className="album-art-wrap">
          <img src={currentEpisode.cover} alt="Art" className="album-art-large" />
        </div>

        <div className="track-row">
          <div className="track-info">
            <h2 className="track-title">{currentEpisode.title}</h2>
            <p className="track-artist">Innovision Radio · {formatDate(currentEpisode.date)}</p>
          </div>
          <button className="icon-btn" onClick={() => toggleFavorite(currentEpisode)} aria-label="Favorite">
            <Icons.Heart filled={isFavorite(currentEpisode)} />
          </button>
        </div>

        <div className="progress-container">
          <input
            type="range"
            className="progress-range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            style={{ '--progress': `${progress}%` }}
          />
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(duration - currentTime, 0))}</span>
          </div>
        </div>

        <div className="controls-large">
          <button className="control-btn-nav" onClick={playPrevious} aria-label="Previous"><Icons.SkipPrevious /></button>
          <button className="control-btn-skip" onClick={skipBackward} aria-label="Back 10 seconds"><Icons.Backward10 /></button>
          <button className="play-btn-extra-large" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
          <button className="control-btn-skip" onClick={skipForward} aria-label="Forward 10 seconds"><Icons.Forward10 /></button>
          <button className="control-btn-nav" onClick={playNext} aria-label="Next"><Icons.SkipNext /></button>
        </div>
        </div>

        {currentEpisode.transcript && (
          <div className="lyrics-card">
            <div className="lyrics-title">Lyrics</div>
            {lyrics === null && <p className="lyrics-empty">Loading lyrics…</p>}
            {lyrics?.length === 0 && <p className="lyrics-empty">Lyrics aren't available for this episode.</p>}
            {lyrics?.length > 0 && (
              <div className="lyrics-box" ref={lyricsBoxRef}>
                {lyrics.map((line, i) => (
                  <div key={i} className={`lyrics-line ${i === activeLine ? 'active' : i < activeLine ? 'past' : ''}`}>
                    {line.speaker && (i === 0 || lyrics[i - 1].speaker !== line.speaker) && (
                      <span className="lyrics-speaker">{line.speaker}</span>
                    )}
                    {line.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // DISCOVER TAB
  if (activeTab === 'discover') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">{selectedCategory ? selectedCategory : 'Discover'}</div>
          {selectedCategory && (
            <button className="clear-filter-btn" onClick={() => setSelectedCategory(null)}>Clear Filter</button>
          )}
        </div>
        
        {!selectedCategory && (
          <>
            <div className="section-title" style={{marginTop: '20px'}}><span>Browse Categories</span></div>
            <div className="categories-grid-4col">
              {CATEGORIES.map(cat => (
                <div key={cat.name} className="category-card" onClick={() => setSelectedCategory(cat.name)}>
                  <div className="category-icon-large">{cat.icon}</div>
                  <span className="category-name">{cat.name}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedCategory && (
          <>
            <div className="section-title" style={{marginTop: '20px'}}>
              <span>{selectedCategory} Podcasts</span>
              <span className="see-all">{filteredEpisodes.length} episodes</span>
            </div>
            <div className="episode-list">
              {displayedEpisodes.map((ep, index) => (
                <div key={index} className="episode-card" onClick={() => handlePlay(ep)}>
                  <img src={ep.cover} alt="Cover" className="card-img" />
                  <div className="card-info">
                    <h3 className="card-title">{ep.title}</h3>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                       <p className="card-sub">{formatDate(ep.date)}</p>
                       <p className="card-sub">35m</p>
                    </div>
                  </div>
                  <div className="play-icon-small"><Icons.Play /></div>
                </div>
              ))}
              
              {/* Load More Button */}
              {visibleCount < filteredEpisodes.length && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Episodes
                </button>
              )}
            </div>
          </>
        )}

        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}><Icons.Home /><span className="nav-text">Home</span></button>
          <button className="nav-item active"><Icons.Discover /><span className="nav-text">Discover</span></button>
          <button className="nav-item" onClick={() => handleTabChange('library')}><Icons.Library /><span className="nav-text">Library</span></button>
          <button className="nav-item" onClick={() => handleTabChange('profile')}><Icons.Profile /><span className="nav-text">Profile</span></button>
        </div>

        {lastPlayedEpisode && (
          <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
            <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
            <div className="mini-player-info">
              <div className="mini-player-title">{lastPlayedEpisode.title}</div>
              <div className="mini-player-artist">Innovision Radio</div>
            </div>
            <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
              <Icons.Close />
            </button>
          </div>
        )}
      </div>
    );
  }

  // LIBRARY TAB
  if (activeTab === 'library') {
    return (
      <div className="app-container">
        <div className="header"><div className="header-title">Library</div></div>
        
        <div className="section-title" style={{marginTop: '20px'}}>
          <span>Favorite Podcasts</span>
          <span className="see-all">{favoriteEpisodes.length} episodes</span>
        </div>

        <div className="episode-list">
          {favoriteEpisodes.map((ep, index) => (
            <div key={index} className="episode-card" onClick={() => handlePlay(ep)}>
              <img src={ep.cover} alt="Cover" className="card-img" />
              <div className="card-info">
                <h3 className="card-title">{ep.title}</h3>
                <p className="card-sub">{formatDate(ep.date)}</p>
              </div>
              <div className="play-icon-small"><Icons.Play /></div>
            </div>
          ))}
          {favoriteEpisodes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💜</div>
              <h3>No favorites yet</h3>
              <p>Tap the heart icon on any episode to add it here</p>
            </div>
          )}
        </div>

        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}><Icons.Home /><span className="nav-text">Home</span></button>
          <button className="nav-item" onClick={() => handleTabChange('discover')}><Icons.Discover /><span className="nav-text">Discover</span></button>
          <button className="nav-item active"><Icons.Library /><span className="nav-text">Library</span></button>
          <button className="nav-item" onClick={() => handleTabChange('profile')}><Icons.Profile /><span className="nav-text">Profile</span></button>
        </div>

        {lastPlayedEpisode && (
          <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
            <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
            <div className="mini-player-info">
              <div className="mini-player-title">{lastPlayedEpisode.title}</div>
              <div className="mini-player-artist">Innovision Radio</div>
            </div>
            <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
              <Icons.Close />
            </button>
          </div>
        )}
      </div>
    );
  }

  // PROFILE TAB
  if (activeTab === 'profile') {
    const inTelegram = Boolean(window.Telegram?.WebApp?.initData);
    return (
      <div className="app-container">
        <div className="profile-header">
          <div className="profile-avatar-container">
            {profileImage ? <img src={profileImage} alt="Profile" className="profile-avatar-img" /> : <div className="profile-avatar-placeholder"><Icons.Profile /></div>}
            <button className="profile-camera-btn" onClick={() => fileInputRef.current?.click()}><Icons.Camera /></button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display: 'none'}} onChange={handleImageUpload}/>
          </div>
          <h2 className="profile-name-center">{telegramUser ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim() : 'Guest User'}</h2>
          <p className="profile-username-center">{telegramUser?.username ? `@${telegramUser.username}` : 'Telegram User'}</p>
        </div>

        <div className="profile-stats-3col">
          <div className="stat-card">
            <div className="stat-icon">💜</div>
            <div className="stat-number">{favoriteEpisodes.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🪙</div>
            <div className="stat-number">{userCoins}</div>
            <div className="stat-label">Coins</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-number">{userRank ? `#${userRank}` : '—'}</div>
            <div className="stat-label">Rank</div>
          </div>
        </div>

        <div className="coins-info">
          <h3 className="coins-info-title">How coins work</h3>
          <ul className="coins-info-list">
            <li><span className="coins-info-icon">🎧</span><p>Listen to any episode. Every <b>2 minutes</b> of listening earns you <b>1 coin</b>.</p></li>
            <li><span className="coins-info-icon">⏯️</span><p>Only real listening counts. Paused, loading or skipped time doesn't.</p></li>
            <li><span className="coins-info-icon">🏆</span><p>The <b>top 10 listeners</b> appear on the leaderboard below. Keep listening to climb!</p></li>
          </ul>
          {!inTelegram && <p className="coins-info-note">Open Poddex from Telegram to start earning coins.</p>}
        </div>

        <div className="section-title">
          <span>Leaderboard</span><span className="see-all">Top Listeners</span>
        </div>

        <div className="leaderboard">
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <div key={user.rank} className="leaderboard-item">
                <div className="leaderboard-left">
                  <div className="leaderboard-rank">#{index + 1}</div>
                  <div className="leaderboard-avatar">{index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}</div>
                  <div className="leaderboard-name">{user.name}</div>
                </div>
                <div className="leaderboard-coins">{user.coins} coins</div>
              </div>
            ))
          ) : (
            <div className="empty-state"><div className="empty-icon">🏆</div><h3>No ranking yet</h3><p>Be the first: play an episode to earn coins.</p></div>
          )}
        </div>

        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}><Icons.Home /><span className="nav-text">Home</span></button>
          <button className="nav-item" onClick={() => handleTabChange('discover')}><Icons.Discover /><span className="nav-text">Discover</span></button>
          <button className="nav-item" onClick={() => handleTabChange('library')}><Icons.Library /><span className="nav-text">Library</span></button>
          <button className="nav-item active"><Icons.Profile /><span className="nav-text">Profile</span></button>
        </div>

        {lastPlayedEpisode && (
          <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
            <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
            <div className="mini-player-info">
              <div className="mini-player-title">{lastPlayedEpisode.title}</div>
              <div className="mini-player-artist">Innovision Radio</div>
            </div>
            <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
              <Icons.Close />
            </button>
          </div>
        )}
      </div>
    );
  }

  // HOME SCREEN
  return (
    <div className="app-container">
      <div className="header">
        <div className="header-title">Poddex<span>.</span></div>
        <div style={{display:'flex', gap:'12px'}}>
           <button className="icon-btn" onClick={() => setShowSearch(!showSearch)}><Icons.Search /></button>
           <button className="icon-btn" onClick={() => setActiveTab('profile')}><Icons.Profile /></button>
        </div>
      </div>

      {showSearch && (
        <div style={{padding: '0 20px 20px'}}>
          <input type="text" placeholder="Search podcasts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
        </div>
      )}

      <div className="banner-container">
        <div className="banner" style={{backgroundImage: `${BANNERS[currentBannerIndex].gradient}, url(${BANNERS[currentBannerIndex].image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay'}}>
          <div className="banner-text">
            <h2>{BANNERS[currentBannerIndex].title}<br/>{BANNERS[currentBannerIndex].subtitle}</h2>
            <p>{BANNERS[currentBannerIndex].description}</p>
            <button className="play-now-btn" onClick={handleBannerPlayNow}>Play Now</button>
          </div>
          <div className="banner-icon">🎧</div> 
        </div>
        <div className="banner-indicators">
          {BANNERS.map((_, idx) => <div key={idx} className={`indicator ${currentBannerIndex === idx ? 'active' : ''}`} />)}
        </div>
      </div>

      <div className="section-title">
        <span>Category</span><span className="see-all" onClick={() => setActiveTab('discover')}>See All</span>
      </div>
      <div className="categories-row">
        {CATEGORIES.slice(0, 5).map(cat => (
          <div key={cat.name} className="cat-item" onClick={() => handleCategoryClick(cat)}>
            <div className="cat-icon" style={{background: selectedCategory === cat.name ? 'var(--primary)' : 'var(--white)', color: selectedCategory === cat.name ? 'white' : 'inherit'}}>
              {cat.icon}
            </div>
            <span className="cat-name" style={{color: selectedCategory === cat.name ? 'var(--primary)' : 'var(--text-grey)', fontWeight: selectedCategory === cat.name ? '600' : '400'}}>
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>Latest Episodes</span>
      </div>

      <div className="episode-list">
        {displayedEpisodes.map((ep, index) => (
          <div key={index} className="episode-card" onClick={() => handlePlay(ep)}>
            <img src={ep.cover} alt="Cover" className="card-img" />
            <div className="card-info">
              <h3 className="card-title">{ep.title}</h3>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                 <p className="card-sub">{formatDate(ep.date)}</p>
                 <p className="card-sub">35m</p>
              </div>
            </div>
            <div className="play-icon-small"><Icons.Play /></div>
          </div>
        ))}
        
        {/* LOAD MORE BUTTON IN HOME */}
        {visibleCount < filteredEpisodes.length && (
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More Episodes
          </button>
        )}

        {displayedEpisodes.length === 0 && episodes.length === 0 && (
          <p style={{textAlign:'center', color:'#999', padding: '40px 20px'}}>Loading awesome episodes...</p>
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item active" onClick={() => handleTabChange('home')}><Icons.Home /><span className="nav-text">Home</span></button>
        <button className="nav-item" onClick={() => handleTabChange('discover')}><Icons.Discover /><span className="nav-text">Discover</span></button>
        <button className="nav-item" onClick={() => handleTabChange('library')}><Icons.Library /><span className="nav-text">Library</span></button>
        <button className="nav-item" onClick={() => handleTabChange('profile')}><Icons.Profile /><span className="nav-text">Profile</span></button>
      </div>

      {lastPlayedEpisode && (
        <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
          <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
          <div className="mini-player-info">
            <div className="mini-player-title">{lastPlayedEpisode.title}</div>
            <div className="mini-player-artist">Innovision Radio</div>
          </div>
          <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
          <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
            <Icons.Close />
          </button>
        </div>
      )}
    </div>
  )
  };

  return (
    <>
      {renderPage()}
      {lastPlayedEpisode && (
        <audio
          ref={audioRef}
          src={lastPlayedEpisode.audio}
          autoPlay
          onPlay={() => { setIsPlaying(true); updatePositionState(); }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onSeeked={updatePositionState}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}
      {showJoinPrompt && (
        <div className="join-backdrop" onClick={() => setShowJoinPrompt(false)}>
          <div className="join-sheet" onClick={(e) => e.stopPropagation()}>
            <img src="/logo.png" alt="" className="join-logo" />
            <h3 className="join-title">Join Poddex on Telegram</h3>
            <p className="join-text">Get new episodes and updates first. Your podcast keeps playing while you join.</p>
            <button className="join-btn" onClick={joinChannel}>Join channel</button>
            <button className="join-later" onClick={() => setShowJoinPrompt(false)}>Later</button>
          </div>
        </div>
      )}
    </>
  )
}

export default App