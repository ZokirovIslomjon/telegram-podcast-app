const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Allows the server to read JSON data

// ---------------------------------------------------------
// 1. API ROUTES
// Episodes, coins and the leaderboard now live in the Poddex DB on Supabase.
// ---------------------------------------------------------

// GET: Health check – the mini app pings this on open so Render wakes up the bot
app.get('/health', (req, res) => res.send('ok'));

// ---------------------------------------------------------
// 2. TELEGRAM BOT
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
            headers: {
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // without this Supabase runs the call as a public user
                'Content-Type': 'application/json'
            },
            body: '{}'
        });
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
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