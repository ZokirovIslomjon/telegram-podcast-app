import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("⏳ Initializing...")
  const [crashError, setCrashError] = useState(null)

  // --- SAFETY NET: Catch Global Errors ---
  useEffect(() => {
    const errorHandler = (event) => {
      setCrashError(event.message || "Unknown Error Occurred");
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  useEffect(() => {
    setStatus("⏳ Fetching data...")
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        const data = response.data
        let foundList = []
        
        // --- IMPROVED SHERLOCK LOGIC ---
        if (Array.isArray(data)) {
          foundList = data
        } else {
          // Look for an array where the first item is an OBJECT (not a string!)
          foundList = Object.values(data).find(val => 
            Array.isArray(val) && val.length > 0 && typeof val[0] === 'object'
          ) || []
          
          if (data.podcastTitle) setPodcastData(prev => ({ ...prev, title: data.podcastTitle }))
          if (data.podcastImage) setPodcastData(prev => ({ ...prev, image: data.podcastImage }))
          if (data.image && data.image.url) setPodcastData(prev => ({ ...prev, image: data.image.url }))
        }

        if (foundList.length > 0) {
          setEpisodes(foundList)
          setStatus(null) // Clear status if successful
        } else {
          setStatus("⚠️ No episodes found (Check Debug Data below)")
        }
      })
      .catch(err => {
        setStatus(`❌ Network Error: ${err.message}`)
      })
  }, [])

  // --- ULTRA SAFE FILTER ---
  const filteredEpisodes = episodes.filter(episode => {
    if (!episode || typeof episode !== 'object') return false;
    const title = episode.title || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  })

  // If a crash happened, show it!
  if (crashError) {
    return (
      <div style={{padding: 20, color: 'red', border: '2px solid red', margin: 10}}>
        <h2>💥 APP CRASHED 💥</h2>
        <p>{crashError}</p>
        <p>Take a screenshot of this!</p>
      </div>
    )
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

      {status && <p className="status-message">{status}</p>}

      <div className="episode-list">
        {filteredEpisodes.map((episode, index) => {
          // ULTRA SAFE URL CALCULATION
          let audioUrl = null;
          try {
            audioUrl = episode.audio || (episode.enclosure ? episode.enclosure.url : null);
          } catch (e) {
            console.warn("Error parsing audio url", e);
          }

          return (
            <div key={index} className="episode-card">
              <h3>{episode.title || "Untitled Episode"}</h3>
              
              {audioUrl ? (
                <audio controls preload="none">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
              ) : (
                <p style={{color: 'orange', fontSize: '12px'}}>Audio format not supported</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App