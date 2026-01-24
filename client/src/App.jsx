import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// --- SAFETY COMPONENT: Catch Crashes ---
// If a crash happens, this will show the error in RED instead of a white screen.
const ErrorFallback = ({ error }) => (
  <div style={{ padding: 20, border: '2px solid red', margin: 20, borderRadius: 10, background: '#fff0f0' }}>
    <h3 style={{ color: 'red' }}>⚠️ App Crashed</h3>
    <p>{error}</p>
    <p>Please take a screenshot of this.</p>
  </div>
);

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [renderError, setRenderError] = useState(null) // State for render crashes

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

  // --- OPTIMIZATION: ONLY SHOW TOP 20 ---
  // This prevents the phone from choking on 100+ audio players
  const filteredEpisodes = episodes
    .filter(episode => episode.title && episode.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 20); // <--- THIS IS THE MAGIC FIX

  // If a crash happened during render, show the Fallback
  if (renderError) return <ErrorFallback error={renderError} />;

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
        {filteredEpisodes.map((episode, index) => {
          // Wrap in try-catch to prevent one bad episode from killing the app
          try {
             return (
              <div key={index} className="episode-card">
                <h3>{episode.title}</h3>
                {episode.audio ? (
                  <audio controls preload="none" style={{width: '100%', marginTop: '10px'}}>
                    <source src={episode.audio} type="audio/mpeg" />
                  </audio>
                ) : (
                  <span style={{fontSize:'12px', color:'#999'}}>Audio unavailable</span>
                )}
              </div>
            )
          } catch (e) {
            console.warn("Skipped bad episode", e)
            return null
          }
        })}
        
        {/* Show a message if there are more episodes */}
        {episodes.length > 20 && !searchTerm && (
          <p style={{marginTop: 20, color: '#888', fontSize: '12px'}}>
            Showing latest 20 episodes...
          </p>
        )}
      </div>
    </div>
  )
}

export default App