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



// --- REPLACE YOUR OLD EPISODES LIST WITH THIS BIG ONE ---
const episodes = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    title: `Episode ${i + 1}: The Tech Frontier`,
    description: `In this episode, we discuss the latest trends in technology, AI, and the future of coding. Special guest #${i + 1}.`,
    cover: `https://picsum.photos/seed/${i + 1}/300/300`, // Random professional cover art
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: ["Tech", "Business", "Education", "Health"][i % 4] // Rotates categories
}));

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