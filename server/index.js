const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
require('dotenv').config();

const app = express();
const parser = new Parser();

// Allow the frontend to talk to this server
app.use(cors());

// 1. The RSS Feed URL (We are using "The Daily" by NYT as a test)
// Later, you can change this to your own podcast URL.
const RSS_URL = 'https://feeds.simplecast.com/54nAGcIl'; 

// 2. The Endpoint: Frontend calls this to get data
app.get('/api/episodes', async (req, res) => {
    try {
        console.log("Fetching RSS feed...");
        const feed = await parser.parseURL(RSS_URL);

        // Clean up the messy XML data into clean JSON
        const episodes = feed.items.map(item => ({
            title: item.title,
            audio: item.enclosure?.url, // The MP3 link
            pubDate: item.pubDate,
            duration: item.itunes?.duration,
            image: item.itunes?.image || feed.image?.url
        }));

        // Send it back to the frontend
        res.json({
            podcastTitle: feed.title,
            podcastImage: feed.image?.url,
            episodes: episodes
        });
        console.log("Data sent successfully!");
    } catch (error) {
        console.error("Error fetching feed:", error);
        res.status(500).json({ error: 'Failed to fetch podcast' });
    }
});

// 3. Start the Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));