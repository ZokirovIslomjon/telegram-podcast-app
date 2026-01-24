import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [episodes, setEpisodes] = useState([])
  const [searchTerm, setSearchTerm] = useState("") // 1. State for search text

  useEffect(() => {
    // Note: We use the full Render URL now so it works locally and on the cloud
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        setEpisodes(response.data)
      })
      .catch(error => {
        console.error("Error fetching episodes:", error)
      })
  }, [])

  // 2. Filter the episodes based on the search term
  const filteredEpisodes = episodes.filter(episode =>
    episode.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app-container">
      <h1>Poddex 🎙️</h1>

      {/* 3. The Search Input Box */}
      <input 
        type="text" 
        placeholder="Search episodes..." 
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="episode-list">
        {filteredEpisodes.map((episode, index) => (
          <div key={index} className="episode-card">
            <h3>{episode.title}</h3>
            <audio controls>
              <source src={episode.enclosure.url} type={episode.enclosure.type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App