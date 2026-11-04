const express = require('express');
const path = require('path');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
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
// /start – intro video, caption and a "Listen Now" button
const INTRO_CAPTION = `🎧 Stop scrolling. Start listening.

🎙Your next favorite podcast might be waiting on Poddex.
❌No ads. No complicated setup. Just open the app and start listening.`;
let introVideo = { source: path.join(__dirname, 'public', 'intro.MP4') }; // after the first send, Telegram's file_id is reused (no re-upload)
bot.start(async (ctx) => {
    // Remember that this user started the bot: the mini app only plays episodes for them (checked in app-open)
    try {
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/bot_users`, {
            method: 'POST',
            headers: {
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'resolution=ignore-duplicates'
            },
            body: JSON.stringify({ telegram_id: ctx.from.id })
        });
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    } catch (err) {
        console.error('bot_users insert failed:', err);
    }
    const msg = await ctx.replyWithVideo(introVideo, {
        caption: INTRO_CAPTION,
        reply_markup: {
            inline_keyboard: [[{ text: "Listen Now", url: "https://t.me/Poddexbot?startapp" }]]
        }
    });
    introVideo = msg.video.file_id;
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
// Admin dashboard "Bot followers": remember when a user blocks (kicked) or unblocks/starts (member) the bot
bot.on('my_chat_member', async (ctx) => {
    if (ctx.chat?.type !== 'private') return;
    const status = ctx.myChatMember.new_chat_member.status;
    if (status !== 'kicked' && status !== 'member') return;
    try {
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/bot_users`, {
            method: 'POST',
            headers: {
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ telegram_id: ctx.from.id, blocked: status === 'kicked' })
        });
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    } catch (err) {
        console.error('bot_users block update failed:', err);
    }
});

// PREMIUM (99 Stars, monthly subscription). The invoice is made by the Supabase `premium` function.
// Telegram asks the bot to approve each payment (must answer within 10 seconds)...
bot.on('pre_checkout_query', (ctx) => {
    const q = ctx.preCheckoutQuery;
    const ok = q.currency === 'XTR' && q.total_amount === 99 && q.invoice_payload === `premium_${q.from.id}`;
    return ctx.answerPreCheckoutQuery(ok, ok ? undefined : 'Please try again from the Poddex app.');
});
// ...then sends the payment (also every monthly renewal): +30 days of Premium, once per charge
bot.on(message('successful_payment'), async (ctx) => {
    const p = ctx.message.successful_payment;
    try {
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/grant_premium_stars`, {
            method: 'POST',
            headers: {
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_telegram_id: ctx.from.id, p_charge_id: p.telegram_payment_charge_id, p_stars: p.total_amount })
        });
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
        const until = new Date(await res.json()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        ctx.reply(`⭐ Poddex Premium is active until ${until}. Lyrics are unlocked in the app.`);
    } catch (err) {
        console.error('Premium grant failed:', err, p.telegram_payment_charge_id);
        ctx.reply('❌ Payment received, but Premium could not be activated. Please message the Poddex admin.');
    }
});

bot.telegram.deleteWebhook().then(() => bot.launch({ dropPendingUpdates: false }));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));