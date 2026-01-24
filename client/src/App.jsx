import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [status, setStatus] = useState("🚀 App Started")
  const [debugData, setDebugData] = useState("")

  useEffect(() => {
    setStatus("⏳ Fetching data...")
    
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        setStatus("✅ Data Received")
        const data = response.data
        
        // DUMP THE RAW DATA to the screen so we can see it safely
        setDebugData(JSON.stringify(data).slice(0, 500)) 
      })
      .catch(err => {
        setStatus(`❌ Error: ${err.message}`)
      })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', wordWrap: 'break-word' }}>
      <h1>Debug Mode 🐞</h1>
      
      <div style={{ background: '#eee', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
        <strong>Status:</strong> {status}
      </div>

      <h3>Raw Data (First 500 chars):</h3>
      <div style={{ background: '#333', color: '#0f0', padding: '15px', fontSize: '12px' }}>
        {debugData || "Waiting for data..."}
      </div>
    </div>
  )
}

export default App