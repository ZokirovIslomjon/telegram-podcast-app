const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
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
// 2. API ROUTES
// (Episodes now come from the Poddex DB on Supabase, synced hourly by the sync-rss job)
// ---------------------------------------------------------

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
// /stats – daily / weekly / monthly active users (only for ADMIN_TELEGRAM_ID)
bot.command('stats', async (ctx) => {
    if (String(ctx.from.id) !== process.env.ADMIN_TELEGRAM_ID) {
        return ctx.reply(`Not allowed. Your Telegram ID is ${ctx.from.id}.`);
    }
    try {
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/usage_stats`, {
            method: 'POST',
            headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json' },
            body: '{}'
        });
        const [s] = await res.json();
        ctx.reply(`📊 Poddex active users\n\nToday: ${s.today}\nLast 7 days: ${s.last_7_days}\nLast 30 days: ${s.last_30_days}\nAll time: ${s.all_time}`);
    } catch (err) {
        console.error('Stats error:', err);
        ctx.reply('❌ Could not load stats.');
    }
});
bot.telegram.deleteWebhook().then(() => bot.launch({ dropPendingUpdates: true }));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));