const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
require('dotenv').config();

const app = express();
const parser = new Parser();
app.use(cors());

// ---------------------------------------------------------
// 🎧 CONFIGURATION: PUT YOUR RSS URL HERE
// You can use any link from listennotes.com or other podcast sites
// ---------------------------------------------------------
const RSS_FEED_URL = "https://changelog.com/master/feed"; 

// --- 1. TELEGRAM BOT SETUP ---
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(`Welcome to Poddex! 🎧\nStreaming: The Changelog`, {
        reply_markup: {
            inline_keyboard: [[{ text: "Open App 🚀", web_app: { url: "https://telegram-podcast-app.vercel.app/" } }]]
        }
    });
});

// Launch Bot (Crash-Proof Mode)
bot.telegram.deleteWebhook().then(() => {
    bot.launch({ dropPendingUpdates: true });
    console.log('🤖 Telegram Bot started!');
}).catch((err) => console.error('❌ Bot launch failed:', err));

// --- 2. THE API (FETCHER) ---
app.get('/api/episodes', async (req, res) => {
    try {
        // 1. Fetch and Parse the Real RSS Feed
        const feed = await parser.parseURL(RSS_FEED_URL);
        
        // 2. Convert it to the format your App expects
        // We map the weird RSS names (item.enclosure) to your nice names (audio, cover)
        const formattedEpisodes = feed.items.map((item, index) => ({
            id: index + 1,
            title: item.title,
            // Strip HTML tags from description if they exist
            description: item.contentSnippet || item.content || "No description available", 
            // Use episode image if available, otherwise use the main podcast logo
            cover: item.itunes?.image || feed.image?.url || "https://via.placeholder.com/300",
            audio: item.enclosure?.url, // This is the MP3 link
            category: "Tech", // You can make this dynamic later
            date: item.pubDate
        }));

        // 3. Send the Unlimited List to your App
        res.json(formattedEpisodes);

    } catch (error) {
        console.error("RSS Error:", error);
        res.status(500).json({ error: "Failed to fetch RSS feed" });
    }
});

app.get('/', (req, res) => res.send('RSS Server is Running! 📡'));

// --- 3. START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});