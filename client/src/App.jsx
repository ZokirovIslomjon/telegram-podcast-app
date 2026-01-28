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
          <button className="icon-btn" onClick={() => setCurrentEpisode(null)}>↓</button>
          <span>Now Playing</span>
          <button className="icon-btn">⋮</button>
        </div>
        
        <img src={currentEpisode.cover} alt="Art" className="album-art-large" />
        
        <div className="track-info">
          <h2 className="track-title">{currentEpisode.title}</h2>
          <p className="track-artist">Innovision Radio</p>
        </div>

        {/* Fake Waveform Visual */}
        <div style={{display:'flex', gap:'4px', height:'40px', alignItems:'center', justifyContent:'center', marginBottom:'40px'}}>
           {[...Array(20)].map((_,i) => (
             <div key={i} style={{
               width:'4px', 
               height: `${Math.random() * 40 + 10}px`, 
               background:'#6C5DD3', 
               borderRadius:'2px',
               opacity: 0.7
             }}></div>
           ))}
        </div>

        <div className="controls">
          <button className="icon-btn">🔀</button>
          <button className="icon-btn">⏮</button>
          <button className="play-btn-large" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="icon-btn">⏭</button>
          <button className="icon-btn">🔁</button>
        </div>

        <audio 
          ref={audioRef} 
          src={currentEpisode.audio} 
          autoPlay 
          onEnded={() => setIsPlaying(false)} 
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
    </div>
  )
}

export default App
