import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        const data = response.data
        
        // --- THE GOLDEN FIX ---
        // We now know exactly where the data lives because we saw it in Debug Mode!
        if (data.episodes && Array.isArray(data.episodes)) {
          setEpisodes(data.episodes)
          
          // Grab the Title and Image from the main package
          setPodcastData({
            title: data.podcastTitle || "My Podcast",
            image: data.podcastImage || ""
          })
          
          setError(null)
        } else {
          setError("Server returned data, but 'episodes' list was missing.")
        }
        
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError("Network Error. Please reload.")
        setIsLoading(false)
      })
  }, [])

  const filteredEpisodes = episodes.filter(episode =>
    episode.title && episode.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app-container">
      {/* Header with Logo */}
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

      {isLoading && <p className="status-message">⏳ Loading your podcast...</p>}
      {error && <p className="error-message">❌ {error}</p>}

      <div className="episode-list">
        {filteredEpisodes.map((episode, index) => (
          <div key={index} className="episode-card">
            <h3>{episode.title}</h3>
            
            {/* THE AUDIO PLAYER FIX */}
            {/* We use 'episode.audio' because your Debug Data confirmed it! */}
            {episode.audio ? (
              <audio controls preload="none">
                <source src={episode.audio} type="audio/mpeg" />
                Your browser does not support audio.
              </audio>
            ) : (
              <p style={{fontSize: '12px', color: 'orange'}}>Audio format unavailable</p>
            )}
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default App