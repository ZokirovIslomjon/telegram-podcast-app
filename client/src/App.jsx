import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css?v=final_recovery' 

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

  // --- 1. STOP AUTO EXPAND HERE ---
  const handlePlay = (episode) => {
    setCurrentEpisode(episode)
    setIsPlayerExpanded(false) // <--- Keep it minimized when starting!
  }

  // --- 2. SWIPE HANDLERS ---
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
    const isUpSwipe = distance > 50   // Swipe Up threshold
    const isDownSwipe = distance < -50 // Swipe Down threshold

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
          const isPlaying = currentEpisode && currentEpisode.title === episode.title
          return (
            <div key={index} className={`episode-card ${isPlaying ? 'playing-card' : ''}`}>
              <div className="card-top">
                <h3>{episode.title}</h3>
                <button className="heart-btn" onClick={() => toggleFavorite(episode.title)}>{isFav ? '❤️' : '🤍'}</button>
              </div>
              <button className="play-btn" onClick={() => handlePlay(episode)}>
                {isPlaying ? 'Now Playing 🎵' : '▶️ Play Episode'}
              </button>
            </div>
          )
        })}
        {!showFavoritesOnly && visibleCount < filteredEpisodes.length && (
          <button className="load-more-btn" onClick={loadMore}>Load More Episodes 👇</button>
        )}
      </div>

      {/* --- EXPANDABLE PLAYER WITH SWIPE --- */}
      {currentEpisode && (
        <div 
          className={`sticky-player ${isPlayerExpanded ? 'expanded' : ''}`} 
          onClick={() => !isPlayerExpanded && setIsPlayerExpanded(true)}
          // Attach Swipe Listeners here
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          
          {/* --- THE SWIPE HANDLE BAR --- */}
          <div className="swipe-handle"></div>

          {/* MINIMIZED VIEW */}
          {!isPlayerExpanded && (
            <div className="player-minimized">
              <div className="player-info">
                <span className="player-title">{currentEpisode.title}</span>
                <button className="close-player" onClick={(e) => { e.stopPropagation(); setCurrentEpisode(null); }}>✖</button>
              </div>
            </div>
          )}

          {/* FULL SCREEN VIEW */}
          {isPlayerExpanded && (
            <div className="player-fullscreen">
              <button className="minimize-btn" onClick={(e) => { e.stopPropagation(); setIsPlayerExpanded(false); }}>⌄</button>
              <img src={podcastData.image} alt="Album Art" className="big-album-art" />
              <div className="fullscreen-info">
                <h2>{currentEpisode.title}</h2>
                <p>Now Playing</p>
              </div>
            </div>
          )}

          <audio controls autoPlay src={currentEpisode.audio} className="main-audio-player" />
        </div>
      )}
    </div>
  )
}

export default App