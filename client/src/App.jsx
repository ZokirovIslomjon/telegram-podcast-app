import { useState, useEffect, useRef } from 'react'
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Pause: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  BackArrow: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  SkipBack: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor"/>
      <line x1="5" y1="19" x2="5" y2="5"/>
    </svg>
  ),
  SkipForward: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor"/>
      <line x1="19" y1="5" x2="19" y2="19"/>
    </svg>
  ),
  Shuffle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8"/>
      <line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/>
      <line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  Repeat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
};

// Categories
const CATEGORIES = [
  { name: "Gaming", icon: "🎮" },
  { name: "Arts", icon: "🎨" },
  { name: "Fashion", icon: "👠" },
  { name: "Travel", icon: "✈️" },
  { name: "Tech", icon: "💻" },
  { name: "News", icon: "📰" },
  { name: "Sports", icon: "⚽" },
  { name: "Music", icon: "🎵" }
];

// Banners - Replace image URLs with your own
const BANNERS = [
  {
    title: "Listen Favourite",
    subtitle: "Podcast",
    description: "Enjoy premium sound",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=200&fit=crop",
    gradient: "linear-gradient(135deg, rgba(139, 122, 240, 0.9) 0%, rgba(108, 93, 211, 0.9) 100%)"
  },
  {
    title: "Discover New",
    subtitle: "Episodes",
    description: "Trending now",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=200&fit=crop",
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
  const audioRef = useRef(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      tg.setHeaderColor('#F8F8F8');
      tg.setBackgroundColor('#F8F8F8');
      if (tg.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  useEffect(() => {
    fetch('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(res => res.json())
      .then(data => setEpisodes(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = (episode) => {
    setCurrentEpisode(episode);
    setLastPlayedEpisode(episode);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const newTime = (clickPosition / progressBarWidth) * duration;
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

  const toggleFavorite = (episode) => {
    const episodeId = episode.title;
    if (favorites.includes(episodeId)) {
      setFavorites(favorites.filter(id => id !== episodeId));
    } else {
      setFavorites([...favorites, episodeId]);
    }
  };

  const isFavorite = (episode) => {
    return favorites.includes(episode.title);
  };

  const closePlayer = () => {
    setCurrentEpisode(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setActiveTab('home');
  };

  const handleBannerPlayNow = () => {
    if (lastPlayedEpisode) {
      setCurrentEpisode(lastPlayedEpisode);
      setIsPlaying(true);
    } else if (episodes.length > 0) {
      handlePlay(episodes[0]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setSelectedCategory(null);
    }
  };

  const filteredEpisodes = episodes.filter(ep => {
    const matchesCategory = !selectedCategory || ep.title.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || ep.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoriteEpisodes = episodes.filter(ep => favorites.includes(ep.title));

  if (currentEpisode) {
    return (
      <div className="player-overlay">
        <div className="player-header">
          <button className="icon-btn" onClick={closePlayer}>
            <Icons.BackArrow />
          </button>
          <span className="now-playing-text">Now Playing</span>
          <button 
            className="icon-btn" 
            onClick={() => toggleFavorite(currentEpisode)}
            style={{ color: isFavorite(currentEpisode) ? '#FF4458' : 'var(--text-grey)' }}
          >
            <Icons.Heart filled={isFavorite(currentEpisode)} />
          </button>
        </div>
        
        <img src={currentEpisode.cover} alt="Art" className="album-art-large" />
        
        <div className="track-info">
          <h2 className="track-title">{currentEpisode.title}</h2>
          <p className="track-artist">Innovision Radio</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar" onClick={handleSeek}>
            <div className="progress-fill" style={{width: `${(currentTime / duration) * 100}%`}}>
              <div className="progress-thumb"></div>
            </div>
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="controls">
          <button className="control-btn-small">
            <Icons.Shuffle />
          </button>
          <button className="control-btn-skip" onClick={skipBackward}>
            <Icons.SkipBack />
            <span className="skip-text">10</span>
          </button>
          <button className="play-btn-large" onClick={togglePlay}>
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
          <button className="control-btn-skip" onClick={skipForward}>
            <Icons.SkipForward />
            <span className="skip-text">10</span>
          </button>
          <button className="control-btn-small">
            <Icons.Repeat />
          </button>
        </div>

        <audio 
          ref={audioRef} 
          src={currentEpisode.audio} 
          autoPlay 
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>
    )
  }

  if (activeTab === 'discover') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">Discover</div>
        </div>
        
        <div className="section-title" style={{marginTop: '20px'}}>
          <span>Browse Categories</span>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.name} 
              className="category-card" 
              onClick={() => {
                setSelectedCategory(cat.name);
                setActiveTab('home');
              }}
            >
              <div className="category-icon-large">{cat.icon}</div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>

        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}>
            <Icons.Home />
            <span className="nav-text">Home</span>
          </button>
          <button className="nav-item active">
            <Icons.Discover />
            <span className="nav-text">Discover</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('library')}>
            <Icons.Library />
            <span className="nav-text">Library</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('profile')}>
            <Icons.Profile />
            <span className="nav-text">Profile</span>
          </button>
        </div>

        {lastPlayedEpisode && (
          <>
            <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
              <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
              <div className="mini-player-info">
                <div className="mini-player-title">{lastPlayedEpisode.title}</div>
                <div className="mini-player-artist">Innovision Radio</div>
              </div>
              <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>
            </div>
            <audio 
              ref={audioRef} 
              src={lastPlayedEpisode.audio}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </>
        )}
      </div>
    );
  }

  if (activeTab === 'library') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">Library</div>
        </div>
        
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
                <p className="card-sub">Episode {index + 1} • 35 mins</p>
              </div>
              <div className="play-icon-small">
                <Icons.Play />
              </div>
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
          <button className="nav-item" onClick={() => handleTabChange('home')}>
            <Icons.Home />
            <span className="nav-text">Home</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('discover')}>
            <Icons.Discover />
            <span className="nav-text">Discover</span>
          </button>
          <button className="nav-item active">
            <Icons.Library />
            <span className="nav-text">Library</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('profile')}>
            <Icons.Profile />
            <span className="nav-text">Profile</span>
          </button>
        </div>

        {lastPlayedEpisode && (
          <>
            <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
              <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
              <div className="mini-player-info">
                <div className="mini-player-title">{lastPlayedEpisode.title}</div>
                <div className="mini-player-artist">Innovision Radio</div>
              </div>
              <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>
            </div>
            <audio 
              ref={audioRef} 
              src={lastPlayedEpisode.audio}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </>
        )}
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">Profile</div>
        </div>
        
        <div className="profile-section">
          <div className="profile-avatar">
            <Icons.Profile />
          </div>
          <h2 className="profile-name">
            {telegramUser ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim() : 'Guest User'}
          </h2>
          <p className="profile-username">
            {telegramUser?.username ? `@${telegramUser.username}` : 'Telegram User'}
          </p>
          
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{favoriteEpisodes.length}</div>
              <div className="stat-label">Favorites</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{episodes.length}</div>
              <div className="stat-label">Episodes</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Playlists</div>
            </div>
          </div>
        </div>

        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}>
            <Icons.Home />
            <span className="nav-text">Home</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('discover')}>
            <Icons.Discover />
            <span className="nav-text">Discover</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('library')}>
            <Icons.Library />
            <span className="nav-text">Library</span>
          </button>
          <button className="nav-item active">
            <Icons.Profile />
            <span className="nav-text">Profile</span>
          </button>
        </div>

        {lastPlayedEpisode && (
          <>
            <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
              <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
              <div className="mini-player-info">
                <div className="mini-player-title">{lastPlayedEpisode.title}</div>
                <div className="mini-player-artist">Innovision Radio</div>
              </div>
              <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>
            </div>
            <audio 
              ref={audioRef} 
              src={lastPlayedEpisode.audio}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-title">Podcast<span>.</span></div>
        <div style={{display:'flex', gap:'12px'}}>
           <button className="icon-btn" onClick={() => setShowSearch(!showSearch)}>
             <Icons.Search />
           </button>
           <button className="icon-btn" onClick={() => setActiveTab('profile')}>
             <Icons.Profile />
           </button>
        </div>
      </div>

      {showSearch && (
        <div style={{padding: '0 20px 20px'}}>
          <input 
            type="text"
            placeholder="Search podcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      <div className="banner-container">
        <div 
          className="banner" 
          style={{
            backgroundImage: `${BANNERS[currentBannerIndex].gradient}, url(${BANNERS[currentBannerIndex].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="banner-text">
            <h2>{BANNERS[currentBannerIndex].title}<br/>{BANNERS[currentBannerIndex].subtitle}</h2>
            <p>{BANNERS[currentBannerIndex].description}</p>
            <button className="play-now-btn" onClick={handleBannerPlayNow}>Play Now</button>
          </div>
          <div className="banner-icon">🎧</div> 
        </div>
        <div className="banner-indicators">
          {BANNERS.map((_, idx) => (
            <div 
              key={idx} 
              className={`indicator ${currentBannerIndex === idx ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="section-title">
        <span>Category</span>
        <span className="see-all">See All</span>
      </div>
      <div className="categories-row">
        {CATEGORIES.slice(0, 5).map(cat => (
          <div 
            key={cat.name} 
            className="cat-item" 
            onClick={() => handleCategoryClick(cat)}
          >
            <div 
              className="cat-icon"
              style={{
                background: selectedCategory === cat.name ? 'var(--primary)' : 'var(--white)',
                color: selectedCategory === cat.name ? 'white' : 'inherit'
              }}
            >
              {cat.icon}
            </div>
            <span 
              className="cat-name" 
              style={{
                color: selectedCategory === cat.name ? 'var(--primary)' : 'var(--text-grey)',
                fontWeight: selectedCategory === cat.name ? '600' : '400'
              }}
            >
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>{selectedCategory ? `${selectedCategory} Podcasts` : 'Recommended Podcast'}</span>
        <span className="see-all">See All</span>
      </div>

      <div className="episode-list">
        {filteredEpisodes.map((ep, index) => (
          <div key={index} className="episode-card" onClick={() => handlePlay(ep)}>
            <img src={ep.cover} alt="Cover" className="card-img" />
            <div className="card-info">
              <h3 className="card-title">{ep.title}</h3>
              <p className="card-sub">Episode {index + 1} • 35 mins</p>
            </div>
            <div className="play-icon-small">
              <Icons.Play />
            </div>
          </div>
        ))}
        {filteredEpisodes.length === 0 && episodes.length === 0 && (
          <p style={{textAlign:'center', color:'#999'}}>Loading awesome episodes...</p>
        )}
        {filteredEpisodes.length === 0 && episodes.length > 0 && (
          <p style={{textAlign:'center', color:'#999'}}>No episodes found</p>
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item active" onClick={() => handleTabChange('home')}>
          <Icons.Home />
          <span className="nav-text">Home</span>
        </button>
        <button className="nav-item" onClick={() => handleTabChange('discover')}>
          <Icons.Discover />
          <span className="nav-text">Discover</span>
        </button>
        <button className="nav-item" onClick={() => handleTabChange('library')}>
          <Icons.Library />
          <span className="nav-text">Library</span>
        </button>
        <button className="nav-item" onClick={() => handleTabChange('profile')}>
          <Icons.Profile />
          <span className="nav-text">Profile</span>
        </button>
      </div>

      {lastPlayedEpisode && !currentEpisode && (
        <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
          <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
          <div className="mini-player-info">
            <div className="mini-player-title">{lastPlayedEpisode.title}</div>
            <div className="mini-player-artist">Innovision Radio</div>
          </div>
          <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
        </div>
      )}

      {lastPlayedEpisode && !currentEpisode && (
        <audio 
          ref={audioRef} 
          src={lastPlayedEpisode.audio}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}
    </div>
  )
}

export default App
