import { useState, useEffect, useRef } from 'react'
import './App.css'

// Categories for visual appeal
const CATEGORIES = [
  { name: "Gaming", icon: "🎮" },
  { name: "Arts", icon: "🎨" },
  { name: "Fashion", icon: "👠" },
  { name: "Travel", icon: "✈️" },
  { name: "Tech", icon: "💻" }
];

function App() {
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // FETCH RSS FEED (The one you just set up!)
  useEffect(() => {
    fetch('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(res => res.json())
      .then(data => setEpisodes(data))
      .catch(err => console.error(err));
  }, []);

  const handlePlay = (episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // --- 1. FULL SCREEN PLAYER VIEW ---
  if (currentEpisode) {
    return (
      <div className="player-overlay">
        <div className="player-header">
          <button className="icon-btn" onClick={() => setCurrentEpisode(null)}>↓</button>
          <span>Now Playing</span>
          <button className="icon-btn">⋮</button>
        </div>
        
        <img src={currentEpisode.cover} alt="Art" className="album-art-large" />
        
        <div className="track-info">
          <h2 className="track-title">{currentEpisode.title}</h2>
          <p className="track-artist">Innovision Radio</p>
        </div>

        {/* Fake Waveform Visual */}
        <div style={{display:'flex', gap:'4px', height:'40px', alignItems:'center', justifyContent:'center', marginBottom:'40px'}}>
           {[...Array(20)].map((_,i) => (
             <div key={i} style={{
               width:'4px', 
               height: `${Math.random() * 40 + 10}px`, 
               background:'#6C5DD3', 
               borderRadius:'2px',
               opacity: 0.7
             }}></div>
           ))}
        </div>

        <div className="controls">
          <button className="icon-btn">🔀</button>
          <button className="icon-btn">⏮</button>
          <button className="play-btn-large" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="icon-btn">⏭</button>
          <button className="icon-btn">🔁</button>
        </div>

        <audio 
          ref={audioRef} 
          src={currentEpisode.audio} 
          autoPlay 
          onEnded={() => setIsPlaying(false)} 
        />
      </div>
    )
  }

  // --- 2. HOME SCREEN VIEW ---
  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-title">Podcast<span>.</span></div>
        <div style={{display:'flex', gap:'12px'}}>
           <button className="icon-btn">🔍</button>
           <button className="icon-btn">🔔</button>
        </div>
      </div>

      {/* Banner */}
      <div className="banner-container">
        <div className="banner">
          <div className="banner-text">
            <h2>Listen Favourite<br/>Podcast</h2>
            <p>Enjoy premium sound</p>
            <button className="play-now-btn">Play Now</button>
          </div>
          {/* Decorative Circle/Image for banner */}
          <div style={{fontSize:'40px'}}>🎧</div> 
        </div>
      </div>

      {/* Categories */}
      <div className="section-title">
        <span>Category</span>
        <span className="see-all">See All</span>
      </div>
      <div className="categories-row">
        {CATEGORIES.map(cat => (
          <div key={cat.name} className="cat-item">
            <div className="cat-icon">{cat.icon}</div>
            <span className="cat-name">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended List */}
      <div className="section-title">
        <span>Recommended Podcast</span>
        <span className="see-all">See All</span>
      </div>

      <div className="episode-list">
        {episodes.map((ep, index) => (
          <div key={index} className="episode-card" onClick={() => handlePlay(ep)}>
            <img src={ep.cover} alt="Cover" className="card-img" />
            <div className="card-info">
              <h3 className="card-title">{ep.title}</h3>
              <p className="card-sub">Episode {index + 1} • 35 mins</p>
            </div>
            <div className="play-icon-small">▶</div>
          </div>
        ))}
        {/* Placeholder if loading */}
        {episodes.length === 0 && <p style={{textAlign:'center', color:'#999'}}>Loading awesome episodes...</p>}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-item active">
          <span>🏠</span><span className="nav-text">Home</span>
        </button>
        <button className="nav-item">
          <span>🧭</span><span className="nav-text">Discover</span>
        </button>
        <button className="nav-item">
          <span>📥</span><span className="nav-text">Library</span>
        </button>
        <button className="nav-item">
          <span>👤</span><span className="nav-text">Profile</span>
        </button>
      </div>
    </div>
  )
}

export default App