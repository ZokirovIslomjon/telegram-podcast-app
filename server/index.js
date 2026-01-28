const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const { Telegraf } = require('telegraf'); 
require('dotenv').config();

const app = express();
const parser = new Parser();

// --- 1. SETUP THE TELEGRAM BOT ---
// This line automatically grabs the token you saved in Render!
const bot = new Telegraf(process.env.BOT_TOKEN);

// The Welcome Message Logic
bot.start((ctx) => {
  const welcomeMessage = `
Welcome to Poddex! 🎧

Discover and listen to the best episodes from the Poddex Podcast. 
Click the button below to start listening. 👇
  `;

  ctx.reply(welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { 
            text: "Open App 🚀", 
            // ⚠️ Verify this is your correct Vercel link
            web_app: { url: "https://telegram-podcast-app.vercel.app/" } 
          }
        ]
      ]
    }
  });
});

// Start the Bot
bot.launch().then(() => {
    console.log('🤖 Telegram Bot is running...');
});

// Enable graceful stop for the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


// --- 2. EXISTING RSS FEED API ---
app.use(cors());
const RSS_URL = 'https://feeds.simplecast.com/54nAGcIl'; 

app.get('/api/episodes', async (req, res) => {
    try {
        console.log("Fetching RSS feed...");
        const feed = await parser.parseURL(RSS_URL);

        const episodes = feed.items.map(item => ({
            title: item.title,
            audio: item.enclosure?.url,
            pubDate: item.pubDate,
            duration: item.itunes?.duration,
            image: item.itunes?.image || feed.image?.url
        }));

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

// --- 3. START THE SERVER ---
const PORT = process.env.PORT || 3000;
// Change: Add '0.0.0.0' to let Render see the app
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});