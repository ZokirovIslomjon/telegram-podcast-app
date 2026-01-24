import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const ErrorFallback = ({ error }) => (
  <div style={{ padding: 20, border: '2px solid red', margin: 20, borderRadius: 10, background: '#fff0f0' }}>
    <h3 style={{ color: 'red' }}>⚠️ App Crashed</h3>
    <p>{error}</p>
  </div>
);

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(20)
  
  // Favorites State
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // NEW: The "Master" Playing State
  // This holds the SINGLE episode that is currently playing at the bottom
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
          
          // --- CUSTOM LOGO SECTION STARTS HERE ---
          setPodcastData({
            title: "Stanton Academy",  // My Custom Brand Name
            image: "/logo.png"         // My Custom Logo File
          })
          // ---------------------------------------

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
    if (showFavoritesOnly) {
      return matchesSearch && favorites.includes(episode.title)
    }
    return matchesSearch
  })
  
  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 20)
  }

  return (
    <div className="app-container">
      <div className="podcast-header">
        {podcastData.image && <img src={podcastData.image} alt="Logo" className="podcast-logo" />}
        <h1>{podcastData.title}</h1>

        <div className="filter-buttons">
           <button 
             className={`filter-btn ${!showFavoritesOnly ? 'active' : ''}`}
             onClick={() => setShowFavoritesOnly(false)}
           >
             All Episodes
           </button>
           <button 
             className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
             onClick={() => setShowFavoritesOnly(true)}
           >
             Favorites ❤️ ({favorites.length})
           </button>
        </div>
      </div>

      {!showFavoritesOnly && (
        <input 
          type="text" 
          placeholder="Search episodes..." 
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      {isLoading && <p className="status-message">⏳ Loading...</p>}
      
      {showFavoritesOnly && favorites.length === 0 && (
        <p className="status-message">You haven't liked any episodes yet. 💔</p>
      )}

      {/* Main List */}
      <div className="episode-list">
        {visibleEpisodes.map((episode, index) => {
          const isFav = favorites.includes(episode.title)
          // Check if this specific card is the one currently playing
          const isPlaying = currentEpisode && currentEpisode.title === episode.title
          
          return (
            <div key={index} className={`episode-card ${isPlaying ? 'playing-card' : ''}`}>
              <div className="card-top">
                <h3>{episode.title}</h3>
                <button 
                  className="heart-btn" 
                  onClick={() => toggleFavorite(episode.title)}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Instead of an <audio> tag, we have a PLAY BUTTON */}
              <button 
                className="play-btn"
                onClick={() => setCurrentEpisode(episode)}
              >
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

      {/* NEW: The Sticky Footer Player */}
      {/* It only appears if an episode is selected */}
      {currentEpisode && (
        <div className="sticky-player">
          <div className="player-info">
            <span className="player-title">{currentEpisode.title}</span>
            <button className="close-player" onClick={() => setCurrentEpisode(null)}>✖</button>
          </div>
          <audio 
            controls 
            autoPlay 
            src={currentEpisode.audio} 
            className="main-audio-player"
          >
            Your browser does not support audio.
          </audio>
        </div>
      )}
    </div>
  )
}

export default App