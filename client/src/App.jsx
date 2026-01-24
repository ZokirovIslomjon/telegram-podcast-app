import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [episodes, setEpisodes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true) // Safety 1: Loading State
  const [error, setError] = useState(null)         // Safety 2: Error State

  useEffect(() => {
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        // Safety 3: Check if the data is actually an array (List)
        if (Array.isArray(response.data)) {
          setEpisodes(response.data)
        } else {
          console.error("Data was not a list:", response.data)
          // Fallback: If it's wrapped in an object, try to find the list
          setEpisodes(response.data.items || []) 
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Fetch error:", err)
        setError("Could not load episodes. Server might be waking up.")
        setIsLoading(false)
      })
  }, [])

  // Safety 4: Ensure episodes is an array before filtering
  const safeEpisodes = Array.isArray(episodes) ? episodes : []
  
  const filteredEpisodes = safeEpisodes.filter(episode =>
    episode.title && episode.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app-container">
      <h1>Poddex 🎙️</h1>

      <input 
        type="text" 
        placeholder="Search episodes..." 
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Show Loading Message */}
      {isLoading && <p className="status-message">⏳ Waking up server... (Please wait 30s)</p>}
      
      {/* Show Error Message */}
      {error && <p className="error-message">❌ {error}</p>}

      <div className="episode-list">
        {!isLoading && !error && filteredEpisodes.length === 0 && (
          <p>No episodes found.</p>
        )}

        {filteredEpisodes.map((episode, index) => (
          <div key={index} className="episode-card">
            <h3>{episode.title}</h3>
            {episode.enclosure && (
              <audio controls>
                <source src={episode.enclosure.url} type={episode.enclosure.type} />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App