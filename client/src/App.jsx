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
        
        // Logic to find the list of episodes
        if (Array.isArray(data)) {
          foundList = data
        } else {
          foundList = Object.values(data).find(val => Array.isArray(val)) || []
          
          // Grab Title and Image
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
        setError("Network Error. Please try again later.")
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
            
            {/* THE FIX: We use 'episode.audio' now! */}
            {(episode.audio || episode.enclosure) && (
              <audio controls preload="none">
                <source src={episode.audio || episode.enclosure?.url} type="audio/mpeg" />
                Your browser does not support audio.
              </audio>
            )}
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default App