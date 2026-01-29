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
    <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? "#FF4458" : "none"} stroke={filled ? "#FF4458" : "currentColor"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  BackArrow: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
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
      <text x="9" y="15" fontSize="7" fill="currentColor" fontWeight="bold">+10</text>
    </svg>
  ),
  Backward10: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12A10 10 0 1 0 12 2"/>
      <path d="M2 2v6h6"/>
      <text x="9" y="15" fontSize="7" fill="currentColor" fontWeight="bold">-10</text>
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
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [listeningTime, setListeningTime] = useState(0);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('podcastAppData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setFavorites(data.favorites || []);
      setProfileImage(data.profileImage || null);
      setUserCoins(data.userCoins || 0);
      setUserRank(data.userRank || 0);
      setListeningTime(data.listeningTime || 0);
      setLeaderboard(data.leaderboard || []);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      favorites,
      profileImage,
      userCoins,
      userRank,
      listeningTime,
      leaderboard,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('podcastAppData', JSON.stringify(dataToSave));
  }, [favorites, profileImage, userCoins, userRank, listeningTime, leaderboard]);

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
        // Add user to leaderboard if not exists
        addUserToLeaderboard(tg.initDataUnsafe.user);
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

  // Track listening time and award coins
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setListeningTime(prev => {
          const newTime = prev + 1;
          // Award 5 coins every 30 seconds
          if (newTime % 30 === 0) {
            setUserCoins(prevCoins => prevCoins + 5);
            updateUserInLeaderboard(5);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const addUserToLeaderboard = (user) => {
    setLeaderboard(prev => {
      const existingUser = prev.find(u => u.id === user.id);
      if (!existingUser) {
        const newUser = {
          id: user.id,
          name: `${user.first_name} ${user.last_name || ''}`.trim(),
          username: user.username,
          coins: 0,
          rank: 0
        };
        return [...prev, newUser];
      }
      return prev;
    });
  };

  const updateUserInLeaderboard = (coinsToAdd) => {
    if (!telegramUser) return;
    
    setLeaderboard(prev => {
      const updated = prev.map(user => {
        if (user.id === telegramUser.id) {
          return { ...user, coins: user.coins + coinsToAdd };
        }
        return user;
      });
      
      // Sort by coins and update ranks
      const sorted = updated.sort((a, b) => b.coins - a.coins);
      return sorted.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    });

    // Update current user's rank
    const myPosition = leaderboard.findIndex(u => u.id === telegramUser.id) + 1;
    setUserRank(myPosition || 0);
  };

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

  const playNext = () => {
    const currentIndex = episodes.findIndex(ep => ep.title === lastPlayedEpisode?.title);
    if (currentIndex < episodes.length - 1) {
      handlePlay(episodes[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    const currentIndex = episodes.findIndex(ep => ep.title === lastPlayedEpisode?.title);
    if (currentIndex > 0) {
      handlePlay(episodes[currentIndex - 1]);
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

  const closeMiniPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setLastPlayedEpisode(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setActiveTab('discover');
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
    setShowAllEpisodes(false);
    if (tab === 'home') {
      setSelectedCategory(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredEpisodes = episodes.filter(ep => {
    const matchesCategory = !selectedCategory || ep.title.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || ep.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoriteEpisodes = episodes.filter(ep => favorites.includes(ep.title));
  const displayedEpisodes = showAllEpisodes ? filteredEpisodes : filteredEpisodes.slice(0, 5);

  // FULL SCREEN PLAYER
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

        <div className="controls-large">
          <button className="control-btn-small">
            <Icons.Shuffle />
          </button>
          <button className="control-btn-nav" onClick={playPrevious}>
            <Icons.SkipPrevious />
          </button>
          <button className="control-btn-skip" onClick={skipBackward}>
            <Icons.Backward10 />
          </button>
          <button className="play-btn-extra-large" onClick={togglePlay}>
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
          <button className="control-btn-skip" onClick={skipForward}>
            <Icons.Forward10 />
          </button>
          <button className="control-btn-nav" onClick={playNext}>
            <Icons.SkipNext />
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

  // DISCOVER TAB
  if (activeTab === 'discover') {
    return (
      <div className="app-container">
        <div className="header">
          <div className="header-title">
            {selectedCategory ? selectedCategory : 'Discover'}
          </div>
          {selectedCategory && (
            <button className="clear-filter-btn" onClick={() => setSelectedCategory(null)}>
              Clear Filter
            </button>
          )}
        </div>
        
        {!selectedCategory && (
          <>
            <div className="section-title" style={{marginTop: '20px'}}>
              <span>Browse Categories</span>
            </div>
            <div className="categories-grid-4col">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat.name} 
                  className="category-card" 
                  onClick={() => setSelectedCategory(cat.name)}
                >
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
              {filteredEpisodes.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🎙️</div>
                  <h3>No episodes found</h3>
                  <p>Try a different category</p>
                </div>
              )}
            </div>
          </>
        )}

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
              <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
                <Icons.Close />
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

  // LIBRARY TAB
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
              <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
                <Icons.Close />
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

  // PROFILE TAB
  if (activeTab === 'profile') {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.coins - a.coins).slice(0, 10);
    
    return (
      <div className="app-container">
        <div className="profile-header">
          <div className="profile-avatar-container">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                <Icons.Profile />
              </div>
            )}
            <button className="profile-camera-btn" onClick={() => fileInputRef.current?.click()}>
              <Icons.Camera />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              style={{display: 'none'}} 
              onChange={handleImageUpload}
            />
          </div>
          <h2 className="profile-name-center">
            {telegramUser ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim() : 'Guest User'}
          </h2>
          <p className="profile-username-center">
            {telegramUser?.username ? `@${telegramUser.username}` : 'Telegram User'}
          </p>
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
            <div className="stat-number">#{userRank || 0}</div>
            <div className="stat-label">Rank</div>
          </div>
        </div>

        <div className="section-title" style={{marginTop: '30px'}}>
          <span>Leaderboard</span>
          <span className="see-all">Top Listeners</span>
        </div>

        <div className="leaderboard">
          {sortedLeaderboard.length > 0 ? (
            sortedLeaderboard.map((user, index) => (
              <div key={user.id} className="leaderboard-item">
                <div className="leaderboard-rank">#{index + 1}</div>
                <div className="leaderboard-avatar">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">{user.name}</div>
                  <div className="leaderboard-coins">{user.coins} coins</div>
                </div>
                {index <= 2 && <div className="leaderboard-badge">🎖️</div>}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏆</div>
              <h3>No ranking yet</h3>
              <p>Start listening to earn coins and rank up!</p>
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
              <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
                <Icons.Close />
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

  // HOME SCREEN
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
        <span className="see-all" onClick={() => setActiveTab('discover')}>See All</span>
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
        <span>Recommended Podcast</span>
        <span className="see-all" onClick={() => setShowAllEpisodes(!showAllEpisodes)}>
          {showAllEpisodes ? 'Show Less' : 'See All'}
        </span>
      </div>

      <div className="episode-list">
        {displayedEpisodes.map((ep, index) => (
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
        {displayedEpisodes.length === 0 && episodes.length === 0 && (
          <p style={{textAlign:'center', color:'#999', padding: '40px 20px'}}>Loading awesome episodes...</p>
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
            <button className="mini-player-close" onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}>
              <Icons.Close />
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
  )
}

export default App
