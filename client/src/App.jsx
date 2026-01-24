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
        let foundList = []
        
        // 1. Find the list (Sherlock Logic)
        if (Array.isArray(data)) {
          foundList = data
        } else {
          foundList = Object.values(data).find(val => Array.isArray(val)) || []
          
          // Get Title & Image
          if (data.podcastTitle) setPodcastData(prev => ({ ...prev, title: data.podcastTitle }))
          if (data.podcastImage) setPodcastData(prev => ({ ...prev, image: data.podcastImage }))
          if (data.image && data.image.url) setPodcastData(prev => ({ ...prev, image: data.image.url }))
        }

        if (foundList.length > 0) {
          setEpisodes(foundList)
        } else {
          setError("No episodes found.")
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

      {isLoading && <p className="status-message">⏳ Loading podcast...</p>}
      {error && <p className="error-message">❌ {error}</p>}

      <div className="episode-list">
        {filteredEpisodes.map((episode, index) => {
          // --- SAFETY CALCULATION ---
          // We calculate the URL here, safely, before the HTML part.
          // This prevents the "White Screen" crash.
          const audioUrl = episode.audio || (episode.enclosure && episode.enclosure.url) || null;
          
          return (
            <div key={index} className="episode-card">
              <h3>{episode.title}</h3>
              
              {/* Only show player if we found a valid URL */}
              {audioUrl ? (
                <audio controls preload="none">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support audio.
                </audio>
              ) : (
                <p style={{fontSize: '12px', color: 'red'}}>Audio unavailable</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App