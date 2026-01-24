import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Safety Component
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
  
  // NEW: State to track how many episodes to show
  const [visibleCount, setVisibleCount] = useState(20)

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

  // Logic: Filter first, THEN slice based on the visible count
  const filteredEpisodes = episodes.filter(episode => 
    episode.title && episode.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount)

  // NEW: Function to load more
  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 20)
  }

  return (
    <div className="app-container">
      <div className="podcast-header">
        {podcastData.image && <img src={podcastData.image} alt="Logo" className="podcast-logo" />}
        <h1>{podcastData.title}</h1>
      </div>

      <input 
        type="text" 
        placeholder="Search episodes..." 
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading && <p className="status-message">⏳ Loading...</p>}
      {error && <p className="error-message">❌ {error}</p>}

      <div className="episode-list">
        {visibleEpisodes.map((episode, index) => {
          try {
             return (
              <div key={index} className="episode-card">
                <h3>{episode.title}</h3>
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
        
        {/* NEW: The Load More Button */}
        {/* Only show if there are more episodes to load */}
        {visibleCount < filteredEpisodes.length && (
          <button className="load-more-btn" onClick={loadMore}>
            Load More Episodes 👇
          </button>
        )}
        
        {/* Show message if we reached the end */}
        {visibleCount >= filteredEpisodes.length && filteredEpisodes.length > 0 && (
          <p className="status-message">You have reached the end! 🏁</p>
        )}
      </div>
    </div>
  )
}

export default App