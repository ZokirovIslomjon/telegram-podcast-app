import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css?v=final_fullscreen' 

// Full list of categories for the dropdown menu
const CATEGORIES = ["All", "Interview", "Business", "Tech", "Health", "Education"]

function App() {
  const [episodes, setEpisodes] = useState([])
  const [podcastData, setPodcastData] = useState({ title: "Poddex", image: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(20)
  
  // State for Filters
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  // State for Audio Player
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false) // Track if player is full screen

  useEffect(() => {
    const savedFavorites = localStorage.getItem('myFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('myFavorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    axios.get('https://telegram-podcast-app.onrender.com/api/episodes')
      .then(response => {
        const data = response.data
        if (data.episodes && Array.isArray(data.episodes)) {
          setEpisodes(data.episodes)
          setPodcastData({
            title: "Stanton Academy",
            image: "/logo.png"
          })
        } else {
          setError("Episodes list missing.")
        }
        setIsLoading(false)
      })
      .catch(err => {
        setError("Network Error: " + err.message)
        setIsLoading(false)
      })
  }, [])

  const toggleFavorite = (title) => {
    if (favorites.includes(title)) {
      setFavorites(favorites.filter(t => t !== title))
    } else {
      setFavorites([...favorites, title])
    }
  }

  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = episode.title && episode.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "All" || 
      (episode.title && episode.title.toLowerCase().includes(selectedCategory.toLowerCase()))

    if (showFavoritesOnly) {
      return matchesSearch && favorites.includes(episode.title)
    }
    
    return matchesSearch && matchesCategory
  })
  
  const visibleEpisodes = filteredEpisodes.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 20)
  }

  // Helper to start playing
  const handlePlay = (episode) => {
    setCurrentEpisode(episode)
    setIsPlayer