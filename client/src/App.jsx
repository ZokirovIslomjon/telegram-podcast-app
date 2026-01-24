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
  
  // 1. NEW STATE: Favorites & Filter Mode
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // 2. Load Favorites from Phone Storage on Startup
  useEffect(() => {
    const savedFavorites = localStorage.getItem('myFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // 3. Save to Phone Storage whenever favorites change
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
            title: data.podcastTitle || "My Podcast",
            image: data.podcastImage || ""
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

  // 4. Toggle Logic (Add/Remove Heart)
  const toggleFavorite = (title) => {
    if (favorites.includes(title)) {
      setFavorites(favorites.filter(t => t !== title)) // Remove
    } else {
      setFavorites([...favorites, title]) // Add
    }
  }

  // 5. Updated Filter Logic
  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = episode.title && episode.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    // If "Show Favorites" is ON, we only show items that are in the favorites list
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

        {/* 6. Filter Toggle Button */}
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
      
      {/* Empty State for Favorites */}
      {showFavoritesOnly && favorites.length === 0 && (
        <p className="status-message">You haven't liked any episodes yet. 💔</p>
      )}

      <div className="episode-list">
        {visibleEpisodes.map((episode, index) => {
          const isFav = favorites.includes(episode.title)
          
          try {
             return (
              <div key={index} className="episode-card">
                <div className="card-top">
                  <h3>{episode.title}</h3>
                  {/* 7. The Heart Button */}
                  <button 
                    className="heart-btn" 
                    onClick={() => toggleFavorite(episode.title)}
                  >
                    {isFav ? '❤️' : '🤍'}
                  </button>
                </div>

                {episode.audio ? (
                  <audio controls preload="none">
                    <source src={episode.audio} type="audio/mpeg" />
                  </audio>
                ) : (
                  <span style={{fontSize:'12px', color:'#666'}}>Audio unavailable</span>
                )}
              </div>
            )
          } catch (e) {
            return null
          }
        })}
        
        {!showFavoritesOnly && visibleCount < filteredEpisodes.length && (
          <button className="load-more-btn" onClick={loadMore}>
            Load More Episodes 👇
          </button>
        )}
      </div>
    </div>
  )
}

export default App