import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css?v=3' // <--- Updated to v3 to force cache refresh

// --- CUSTOMIZE CATEGORIES ---
const CATEGORIES = ["All", "Interview", "Business", "Tech", "Health", "Education"]

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(20)
  
  // Filters & State
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentEpisode, setCurrentEpisode] = useState(null)

  useEffect(() => {
    const savedFavorites = localStorage.getItem('myFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
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
          setPodcastData({
            title: "Stanton Academy",
            image: "/logo.png"
          })
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

    if (showFavoritesOnly) {
      return matchesSearch && favorites.includes(episode.title)
    }
    return matchesSearch && matchesCategory
  })
  
  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 20)
  }

  return (
    <div className="app-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-row">
        {/* Logo Left */}
        {podcastData.image && (
          <img src={podcastData.image} alt="Logo" className="podcast-logo" />
        )}
        
        {/* Buttons Right */}
        <div className="filter-buttons">
           <button 
             className={`filter-btn ${!showFavoritesOnly ? 'active' : ''}`}
             onClick={() => setShowFavoritesOnly(false)}
           >
             Start 🏠
           </button>
           <button 
             className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
             onClick={() => setShowFavoritesOnly(true)}
           >
             Favs ❤️
           </button>
        </div>
      </div> 
      {/* 🛑 HEADER CLOSES HERE - LIST IS NOW SAFE BELOW */}

      {!showFavoritesOnly && (
        <>
          <input 
            type="text" 
            placeholder="Search episodes..." 
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="category-scroll">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </>
      )}

      {isLoading && <p className="status-message">⏳ Loading...</p>}
      
      {showFavoritesOnly && favorites.length === 0 && (
        <p className="status-message">You haven't liked any episodes yet. 💔</p>
      )}

      {/* --- EPISODE LIST --- */}
      <div className="episode-list">
        {visibleEpisodes.map((episode, index) => {
          const isFav = favorites.includes(episode.title)
          const isPlaying = currentEpisode && currentEpisode.title === episode.title
          
          return (
            <div key={index} className={`episode-card ${isPlaying ? 'playing-card' : ''}`}>
              <div className="card-top">
                <h3>{episode.title}</h3>
                <button className="heart-btn" onClick={() => toggleFavorite(episode.title)}>
                  {isFav ? '❤️' : '🤍'}
                </button>
              </div>

              <button className="play-btn" onClick={() => setCurrentEpisode(episode)}>
                {isPlaying ? 'Now Playing 🎵' : '▶️ Play Episode'}
              </button>
            </div>
          )
        })}
        
        {!showFavoritesOnly && visibleCount < filteredEpisodes.length && (
          <button className="load-more-btn" onClick={loadMore}>
            Load More Episodes 👇
          </button>
        )}
      </div>

      {/* --- PLAYER --- */}
      {currentEpisode && (
        <div className="sticky-player">
          <div className="player-info">
            <span className="player-title">{currentEpisode.title}</span>
            <button className="close-player" onClick={() => setCurrentEpisode(null)}>✖</button>
          </div>
          <audio controls autoPlay src={currentEpisode.audio} className="main-audio-player" />
        </div>
      )}
    </div>
  )
}

export default App