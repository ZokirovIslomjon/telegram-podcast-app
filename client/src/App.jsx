import { useState, useEffect, useRef } from 'react'
import './App.css'

// Categories for visual appeal
const CATEGORIES = [
  { name: "Gaming", icon: "🎮" },
  { name: "Arts", icon: "🎨" },
  { name: "Fashion", icon: "👠" },
  { name: "Travel", icon: "✈️" },
  { name: "Tech", icon: "💻" }
];

// Banners data
const BANNERS = [
  {
    title: "Listen Favourite",
    subtitle: "Podcast",
    description: "Enjoy premium sound",
    icon: "🎧",
    gradient: "linear-gradient(135deg, #8B7AF0 0%, #6C5DD3 100%)"
  },
  {
    title: "Discover New",
    subtitle: "Episodes",
    description: "Trending now",
    icon: "🔥",
    gradient: "linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)"
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // FETCH RSS FEED
  useEffect(() => {
    fetch('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(res => res.json())
      .then(data => setEpisodes(data))
      .catch(err => console.error(err));
  }, []);

  // Auto-swipe banners every 5 seconds
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
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const closePlayer = () => {
    // Don't stop audio, just minimize the player
    setCurrentEpisode(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setActiveTab('home'); // Stay on home tab but filter by category
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

  // Filter episodes by category or search query
  const filteredEpisodes = episodes.filter(ep => {
    const matchesCategory = !selectedCategory || ep.title.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || ep.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- 1. FULL SCREEN PLAYER VIEW ---
  if (currentEpisode) {
    return (
      <div className="player-overlay">
        <div className="player-header">
          <button className="icon-btn" onClick={closePlayer}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12L5 12M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-grey)'}}>Now Playing</span>
          <button className="icon-btn" onClick={toggleFavorite}>
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        
        <img src={currentEpisode.cover} alt="Art" className="album-art-large" />
        
        <div className="track-info">
          <h2 className="track-title">{currentEpisode.title}</h2>
          <p className="track-artist">Innovision Radio</p>
        </div>

        {/* Progress Bar */}
        <div style={{marginBottom: '12px', padding: '0 20px'}}>
          <div 
            onClick={handleSeek}
            style={{
              width: '100%',
              height: '4px',
              background: '#E0E0E0',
              borderRadius: '2px',
              position: 'relative',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            <div style={{
              width: `${(currentTime / duration) * 100}%`,
              height: '100%',
              background: 'var(--primary)',
              borderRadius: '2px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '12px',
                background: 'var(--primary)',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(108, 93, 211, 0.4)'
              }}></div>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-grey)'}}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="controls">
          <button className="icon-btn" style={{fontSize: '24px'}}>🔀</button>
          <button className="control-btn" onClick={skipBackward}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5 5v6l-5-5v14l5-5v6z"/>
            </svg>
            <span style={{fontSize: '10px', position: 'absolute', fontWeight: '600'}}>10</span>
          </button>
          <button className="play-btn-large" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="control-btn" onClick={skipForward}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 5v6l5-5v14l-5-5v6z"/>
            </svg>
            <span style={{fontSize: '10px', position: 'absolute', fontWeight: '600'}}>10</span>
          </button>
          <button className="icon-btn" style={{fontSize: '24px'}}>🔁</button>
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

  // --- 2. DISCOVER TAB ---
  if (activeTab === 'discover') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">Discover</div>
        </div>
        <div style={{padding: '40px 20px', textAlign: 'center'}}>
          <div style={{fontSize: '60px', marginBottom: '20px'}}>🧭</div>
          <h2 style={{color: 'var(--text-dark)', marginBottom: '10px'}}>Discover New Podcasts</h2>
          <p style={{color: 'var(--text-grey)'}}>Explore trending and featured content</p>
        </div>
        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}>
            <span>🏠</span><span className="nav-text">Home</span>
          </button>
          <button className="nav-item active">
            <span>🧭</span><span className="nav-text">Discover</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('library')}>
            <span>📥</span><span className="nav-text">Library</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('profile')}>
            <span>👤</span><span className="nav-text">Profile</span>
          </button>
        </div>
        {lastPlayedEpisode && (
          <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
            <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
            <div className="mini-player-info">
              <div className="mini-player-title">{lastPlayedEpisode.title}</div>
              <div className="mini-player-artist">Innovision Radio</div>
            </div>
            <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        )}
        {lastPlayedEpisode && (
          <audio 
            ref={audioRef} 
            src={lastPlayedEpisode.audio}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        )}
      </div>
    );
  }

  // --- 3. LIBRARY TAB ---
  if (activeTab === 'library') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">Library</div>
        </div>
        <div style={{padding: '40px 20px', textAlign: 'center'}}>
          <div style={{fontSize: '60px', marginBottom: '20px'}}>📥</div>
          <h2 style={{color: 'var(--text-dark)', marginBottom: '10px'}}>Your Library</h2>
          <p style={{color: 'var(--text-grey)'}}>Saved episodes and downloads</p>
        </div>
        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}>
            <span>🏠</span><span className="nav-text">Home</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('discover')}>
            <span>🧭</span><span className="nav-text">Discover</span>
          </button>
          <button className="nav-item active">
            <span>📥</span><span className="nav-text">Library</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('profile')}>
            <span>👤</span><span className="nav-text">Profile</span>
          </button>
        </div>
        {lastPlayedEpisode && (
          <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
            <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
            <div className="mini-player-info">
              <div className="mini-player-title">{lastPlayedEpisode.title}</div>
              <div className="mini-player-artist">Innovision Radio</div>
            </div>
            <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        )}
        {lastPlayedEpisode && (
          <audio 
            ref={audioRef} 
            src={lastPlayedEpisode.audio}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        )}
      </div>
    );
  }

  // --- 4. PROFILE TAB ---
  if (activeTab === 'profile') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">Profile</div>
        </div>
        <div style={{padding: '40px 20px', textAlign: 'center'}}>
          <div style={{fontSize: '60px', marginBottom: '20px'}}>👤</div>
          <h2 style={{color: 'var(--text-dark)', marginBottom: '10px'}}>Your Profile</h2>
          <p style={{color: 'var(--text-grey)'}}>Settings and preferences</p>
        </div>
        <div className="bottom-nav">
          <button className="nav-item" onClick={() => handleTabChange('home')}>
            <span>🏠</span><span className="nav-text">Home</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('discover')}>
            <span>🧭</span><span className="nav-text">Discover</span>
          </button>
          <button className="nav-item" onClick={() => handleTabChange('library')}>
            <span>📥</span><span className="nav-text">Library</span>
          </button>
          <button className="nav-item active">
            <span>👤</span><span className="nav-text">Profile</span>
          </button>
        </div>
        {lastPlayedEpisode && (
          <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
            <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
            <div className="mini-player-info">
              <div className="mini-player-title">{lastPlayedEpisode.title}</div>
              <div className="mini-player-artist">Innovision Radio</div>
            </div>
            <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        )}
        {lastPlayedEpisode && (
          <audio 
            ref={audioRef} 
            src={lastPlayedEpisode.audio}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        )}
      </div>
    );
  }

  // --- 5. HOME SCREEN VIEW ---
  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-title">Podcast<span>.</span></div>
        <div style={{display:'flex', gap:'12px'}}>
           <button className="icon-btn" onClick={() => setShowSearch(!showSearch)}>🔍</button>
           <button className="icon-btn">🔔</button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={{padding: '0 20px 20px'}}>
          <input 
            type="text"
            placeholder="Search podcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      )}

      {/* Auto-Swiping Banner */}
      <div className="banner-container">
        <div className="banner" style={{background: BANNERS[currentBannerIndex].gradient}}>
          <div className="banner-text">
            <h2>{BANNERS[currentBannerIndex].title}<br/>{BANNERS[currentBannerIndex].subtitle}</h2>
            <p>{BANNERS[currentBannerIndex].description}</p>
            <button className="play-now-btn" onClick={handleBannerPlayNow}>Play Now</button>
          </div>
          <div style={{fontSize:'40px'}}>{BANNERS[currentBannerIndex].icon}</div> 
        </div>
        {/* Banner indicators */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px'}}>
          {BANNERS.map((_, idx) => (
            <div 
              key={idx} 
              style={{
                width: currentBannerIndex === idx ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: currentBannerIndex === idx ? 'var(--primary)' : '#D0D0D0',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="section-title">
        <span>Category</span>
        <span className="see-all">See All</span>
      </div>
      <div className="categories-row">
        {CATEGORIES.map(cat => (
          <div 
            key={cat.name} 
            className="cat-item" 
            onClick={() => handleCategoryClick(cat)}
            style={{cursor: 'pointer'}}
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
            <span className="cat-name" style={{
              color: selectedCategory === cat.name ? 'var(--primary)' : 'var(--text-grey)',
              fontWeight: selectedCategory === cat.name ? '600' : '400'
            }}>
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* Recommended List */}
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
            <div className="play-icon-small">▶</div>
          </div>
        ))}
        {/* Placeholder if loading or no results */}
        {filteredEpisodes.length === 0 && episodes.length === 0 && (
          <p style={{textAlign:'center', color:'#999'}}>Loading awesome episodes...</p>
        )}
        {filteredEpisodes.length === 0 && episodes.length > 0 && (
          <p style={{textAlign:'center', color:'#999'}}>No episodes found</p>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-item active" onClick={() => handleTabChange('home')}>
          <span>🏠</span><span className="nav-text">Home</span>
        </button>
        <button className="nav-item" onClick={() => handleTabChange('discover')}>
          <span>🧭</span><span className="nav-text">Discover</span>
        </button>
        <button className="nav-item" onClick={() => handleTabChange('library')}>
          <span>📥</span><span className="nav-text">Library</span>
        </button>
        <button className="nav-item" onClick={() => handleTabChange('profile')}>
          <span>👤</span><span className="nav-text">Profile</span>
        </button>
      </div>

      {/* Mini Player - shows when audio is playing but player is closed */}
      {lastPlayedEpisode && !currentEpisode && (
        <div className="mini-player" onClick={() => setCurrentEpisode(lastPlayedEpisode)}>
          <img src={lastPlayedEpisode.cover} alt="Cover" className="mini-player-img" />
          <div className="mini-player-info">
            <div className="mini-player-title">{lastPlayedEpisode.title}</div>
            <div className="mini-player-artist">Innovision Radio</div>
          </div>
          <button className="mini-player-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      )}

      {/* Hidden audio element for background playback */}
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
