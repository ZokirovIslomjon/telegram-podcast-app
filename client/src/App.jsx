import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        const data = response.data
        let foundList = []
        
        // Sherlock Holmes Logic (Same as before)
        if (Array.isArray(data)) {
          foundList = data
        } else {
          foundList = Object.values(data).find(val => Array.isArray(val)) || []
          if (data.podcastTitle) setPodcastData(prev => ({ ...prev, title: data.podcastTitle }))
          if (data.podcastImage) setPodcastData(prev => ({ ...prev, image: data.podcastImage }))
          if (data.image && data.image.url) setPodcastData(prev => ({ ...prev, image: data.image.url }))
        }

        setEpisodes(foundList)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="app-container">
      <div className="podcast-header">
        {podcastData.image && <img src={podcastData.image} alt="Logo" className="podcast-logo" />}
        <h1>{podcastData.title}</h1>
      </div>

      {/* --- X-RAY VISION: SHOW ME THE DATA --- */}
      {episodes.length > 0 && (
        <div style={{background: '#222', color: '#0f0', padding: '15px', margin: '20px 0', textAlign: 'left', borderRadius: '8px', fontSize: '12px', wordWrap: 'break-word'}}>
          <strong>🔎 DATA OF FIRST EPISODE:</strong><br/><br/>
          {JSON.stringify(episodes[0])}
        </div>
      )}
      {/* ------------------------------------- */}

      <div className="episode-list">
        {episodes.map((episode, index) => (
          <div key={index} className="episode-card">
            <h3>{episode.title}</h3>
            {/* We temporarily removed the audio check to focus on the data */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App