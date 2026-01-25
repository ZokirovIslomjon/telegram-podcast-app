import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css?v=spotify_real_svg' 

const CATEGORIES = ["All", "Interview", "Business", "Tech", "Health", "Education"]

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(20)
  
  // Filters
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  // Audio Player State
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  // Refs
  const audioRef = useRef(null)

  // --- SWIPE LOGIC STATE ---
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  useEffect(() => {
    const savedFavorites = localStorage.getItem('myFavorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  useEffect(() => {
    localStorage.setItem('myFavorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        const data = response.data
        if (data.episodes && Array.isArray(data.episodes)) {
          setEpisodes(data.episodes)
          setPodcastData({ title: "Stanton Academy", image: "/logo.png" })
        } else {
          setError("Episodes list missing.")
        }
        setIsLoading(false)
      })
      .catch(err => {
        setError("Network Error: " + err.message)
        setIsLoading(false)
      })
  }, [])

  const toggleFavorite = (title) => {
    if (favorites.includes(title)) {
      setFavorites(favorites.filter(t => t !== title))
    } else {
      setFavorites([...favorites, title])
    }
  }

  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = episode.title && episode.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || 
      (episode.title && episode.title.toLowerCase().includes(selectedCategory.toLowerCase()))

    if (showFavoritesOnly) return matchesSearch && favorites.includes(episode.title)
    return matchesSearch && matchesCategory
  })
  
  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount)
  const loadMore = () => setVisibleCount(prevCount => prevCount + 20)

  // --- AUDIO LOGIC ---
  const handlePlay = (episode) => {
    setCurrentEpisode(episode)
    setIsPlayerExpanded(false) 
    setIsPlaying(true)
  }

  const togglePlayPause = (e) => {
    e.stopPropagation()
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const time = e.target.value
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (time) => {
    if (!time) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // --- SWIPE HANDLERS ---
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isUpSwipe = distance > 30   
    const isDownSwipe = distance < -30 

    if (isUpSwipe) setIsPlayerExpanded(true)
    if (isDownSwipe) setIsPlayerExpanded(false)
  }

  return (
    <div className="app-container">
      
      {/* HEADER */}
      <div className="header-row">
        {podcastData.image && <img src={podcastData.image} alt="Logo" className="podcast-logo" />}
        <div className="filter-buttons">
           <button className={`filter-btn ${!showFavoritesOnly ? 'active' : ''}`} onClick={() => setShowFavoritesOnly(false)}>Home 🏠</button>
           <button className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`} onClick={() => setShowFavoritesOnly(true)}>Favs ❤️</button>
        </div>
      </div>
      
      {/* FILTERS */}
      {!showFavoritesOnly && (
        <>
          <input 
            type="text" placeholder="Search episodes..." className="search-bar"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="dropdown-container">
            <label>Filter by Category:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-select">
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "Show All Episodes" : cat}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {isLoading && <p className="status-message">⏳ Loading...</p>}
      {showFavoritesOnly && favorites.length === 0 && <p className="status-message">You haven't liked any episodes yet. 💔</p>}

      {/* EPISODE LIST */}
      <div className="episode-list">
        {visibleEpisodes.map((episode, index) => {
          const isFav = favorites.includes(episode.title)
          const isPlayingThis = currentEpisode && currentEpisode.title === episode.title
          return (
            <div key={index} className={`episode-card ${isPlayingThis ? 'playing-card' : ''}`}>
              <div className="card-top">
                <h3>{episode.title}</h3>
                <button className="heart-btn" onClick={() => toggleFavorite(episode.title)}>{isFav ? '❤️' : '🤍'}</button>
              </div>
              <button className="play-btn" onClick={() => handlePlay(episode)}>
                {isPlayingThis && isPlaying ? 'Now Playing 🎵' : '▶️ Play Episode'}
              </button>
            </div>
          )
        })}
        {!showFavoritesOnly && visibleCount < filteredEpisodes.length && (
          <button className="load-more-btn" onClick={loadMore}>Load More Episodes 👇</button>
        )}
      </div>

      {/* --- REAL SPOTIFY PLAYER --- */}
      {currentEpisode && (
        <div 
          className={`sticky-player ${isPlayerExpanded ? 'expanded' : ''}`} 
          onClick={() => !isPlayerExpanded && setIsPlayerExpanded(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          
          <div className="swipe-handle"></div>

          {/* 1. MINIMIZED VIEW */}
          {!isPlayerExpanded && (
            <div className="player-minimized">
              <div className="mini-info">
                <span className="mini-title">{currentEpisode.title}</span>
              </div>
              <div className="mini-controls">
                <button className="mini-play-btn" onClick={togglePlayPause}>
                  {/* SVG Play/Pause for Mini Player */}
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z" /></svg>
                  )}
                </button>
                <button className="close-player" onClick={(e) => { e.stopPropagation(); setCurrentEpisode(null); }}>✖</button>
              </div>
            </div>
          )}

          {/* 2. FULL SCREEN SPOTIFY VIEW */}
          {isPlayerExpanded && (
            <div className="player-fullscreen fade-in">
              <button className="minimize-btn" onClick={(e) => { e.stopPropagation(); setIsPlayerExpanded(false); }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
              </button>
              
              <div className="art-container">
                <img src={podcastData.image} alt="Album Art" className="spotify-album-art" />
              </div>

              <div className="spotify-info">
                <h2>{currentEpisode.title}</h2>
                <p>Stanton Academy Podcast</p>
              </div>

              {/* SLIDER */}
              <div className="progress-container">
                <input 
                  type="range" 
                  min="0" max={duration || 0} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="progress-slider"
                />
                <div className="time-row">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* MAIN CONTROLS (SVG) */}
              <div className="big-controls">
                
                {/* Skip Back 10s */}
                <button className="control-btn" onClick={() => { audioRef.current.currentTime -= 10 }}>
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                </button>

                {/* BIG PLAY BUTTON */}
                <button className="play-pause-circle" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="black"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  ) : (
                     /* Centered Play Triangle */
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="black" style={{ marginLeft: '4px' }}><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>

                {/* Skip Forward 10s */}
                <button className="control-btn" onClick={() => { audioRef.current.currentTime += 10 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                </button>

              </div>
            </div>
          )}

          <audio 
            ref={audioRef}
            src={currentEpisode.audio} 
            autoPlay 
            onTimeUpdate={onTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  )
}

export default App