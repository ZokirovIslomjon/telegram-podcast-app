import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [data, setData] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 1. New State for Speed
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        setData(response.data);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  // 2. Function to Toggle Speed (1x -> 1.5x -> 2x -> 1x)
  const toggleSpeed = () => {
    let newSpeed = 1;
    if (speed === 1) newSpeed = 1.5;
    else if (speed === 1.5) newSpeed = 2;
    else newSpeed = 1;

    setSpeed(newSpeed);

    // If audio is playing right now, change its speed immediately
    if (currentAudio) {
        currentAudio.playbackRate = newSpeed;
    }
  };

  const playEpisode = (audioUrl) => {
    if (currentAudio) {
        currentAudio.pause();
    }
    const newAudio = new Audio(audioUrl);
    
    // 3. Apply the current speed when starting new audio
    newAudio.playbackRate = speed;
    
    newAudio.play();
    setCurrentAudio(newAudio);
    setIsPlaying(true);
  };

  if (!data) return <div className="loading">Loading Podcast...</div>;

  return (
    <div className="container">
      <div className="header">
        <img src={data.podcastImage} alt="Cover" className="cover-img" />
        <div className="header-info">
            <h1>{data.podcastTitle}</h1>
            <div className="controls">
                <p>Latest Episodes</p>
                
                {/* 4. The Speed Button */}
                <button className="speed-btn" onClick={toggleSpeed}>
                    {speed}x
                </button>
            </div>
        </div>
      </div>

      <div className="list">
        {data.episodes.map((ep, index) => (
          <div key={index} className="card" onClick={() => playEpisode(ep.audio)}>
            <button className="play-btn">▶</button>
            <div className="info">
                <h3>{ep.title}</h3>
                <span>{new Date(ep.pubDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App