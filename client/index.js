const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
const parser = new Parser();
app.use(cors());
app.use(express.json()); // Allows the server to read JSON data

// ---------------------------------------------------------
// 1. DATABASE CONNECTION (MongoDB Atlas)
// ---------------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Define what a "User" looks like in the database
const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  name: String,
  username: String,
  coins: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// ---------------------------------------------------------
// 2. RSS PODCAST CONFIGURATION
// ---------------------------------------------------------
const RSS_FEED_URL = "https://changelog.com/master/feed"; 

// ---------------------------------------------------------
// 3. API ROUTES
// ---------------------------------------------------------

// GET: Fetch Podcasts (RSS)
app.get('/api/episodes', async (req, res) => {
    try {
        const feed = await parser.parseURL(RSS_FEED_URL);
        const formattedEpisodes = feed.items.map((item, index) => ({
            id: index + 1,
            title: item.title,
            description: item.contentSnippet || "No description", 
            cover: item.itunes?.image || feed.image?.url || "https://via.placeholder.com/300",
            audio: item.enclosure?.url,
            category: "Tech",
            date: item.pubDate
        }));
        res.json(formattedEpisodes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch RSS feed" });
    }
});

// GET: Global Leaderboard (Top 50 Users)
app.get('/api/leaderboard', async (req, res) => {
    try {
        // Find all users, sort by coins (highest first), take top 50
        const topUsers = await User.find().sort({ coins: -1 }).limit(50);
        res.json(topUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Sync User Coins (App calls this when you earn coins)
app.post('/api/user/sync', async (req, res) => {
    const { telegramId, name, username, coins } = req.body;
    
    // Safety check
    if (!telegramId) return res.status(400).json({ error: "Missing Telegram ID" });

    try {
        // Try to find the user
        let user = await User.findOne({ telegramId });

        if (!user) {
            // Create new user if they don't exist
            user = new User({ telegramId, name, username, coins });
        } else {
            // Update existing user (only if new coin count is higher)
            if (coins > user.coins) {
                user.coins = coins;
            }
            user.name = name; // Update name in case they changed it
            user.lastActive = Date.now();
        }
        
        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// 4. TELEGRAM BOT
// ---------------------------------------------------------
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => {
    ctx.reply(`Welcome to Poddex! 🎧\nListen & Earn Coins!`, {
        reply_markup: {
            inline_keyboard: [[{ text: "Open App 🚀", web_app: { url: "https://telegram-podcast-app.vercel.app/" } }]]
        }
    });
});
bot.telegram.deleteWebhook().then(() => bot.launch({ dropPendingUpdates: true }));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));