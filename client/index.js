const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
app.use(cors()); // Allow the Web App to talk to this Server

// --- 1. SETUP TELEGRAM BOT ---
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(`Welcome to Poddex! 🎧`, {
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

// --- 2. THE PODCAST DATA (The missing part!) ---
const episodes = [
  {
    id: 1,
    title: "The Future of AI",
    description: "How AI will change the way we work and live.",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Startup Stories",
    description: "Interviews with founders who built unicorns.",
    cover: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Tech Trends 2026",
    description: "What's coming next in the world of technology.",
    cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "Deep Dive: Coding",
    description: "Understanding the fundamentals of modern software.",
    cover: "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  }
];

// --- 3. THE API ENDPOINT (The App calls this!) ---
app.get('/api/episodes', (req, res) => {
    res.json(episodes);
});

app.get('/', (req, res) => res.send('Server is running & Data is ready!'));

// --- 4. START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});