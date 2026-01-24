import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [episodes, setEpisodes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null) // New Debug Tool

  useEffect(() => {
    // Fetch from the live Render backend
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        console.log("Raw Data:", response.data) // Check console for details
        
        const data = response.data
        
        // --- SMART DETECTION LOGIC ---
        if (Array.isArray(data)) {
          // Scenario 1: It is a direct list
          setEpisodes(data)
        } else if (data.items && Array.isArray(data.items)) {
          // Scenario 2: It is inside 'items'
          setEpisodes(data.items)
        } else {
          // Scenario 3: Unknown format - Show us the keys!
          setDebugInfo(JSON.stringify(data).slice(0, 200)) // Show first 200 chars
          setError("Could not find episode list in data.")
        }
        
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Fetch error:", err)
        setError("Network Error: " + err.message)
        setIsLoading(false)
      })
  }, [])

  const filteredEpisodes = episodes.filter(episode =>
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

      {isLoading && <p className="status-message">⏳ Waking up server... (Please wait 30s)</p>}
      
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          {debugInfo && (
            <div style={{marginTop: '10px', fontSize: '10px', textAlign: 'left', background: '#333', color: '#fff', padding: '10px'}}>
              <strong>Debug Data:</strong><br/>
              {debugInfo}
            </div>
          )}
        </div>
      )}

      <div className="episode-list">
        {!isLoading && !error && filteredEpisodes.length === 0 && (
          <p>No episodes found (List is empty).</p>
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