const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();

// --- 1. SETUP THE TELEGRAM BOT ---
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  console.log("User started the bot!");
  ctx.reply(`Welcome to Poddex! 🎧\n\nClick below to start listening. 👇`, {
    reply_markup: {
      inline_keyboard: [[ { text: "Open App 🚀", web_app: { url: "https://telegram-podcast-app.vercel.app/" } } ]]
    }
  });
});

// Fix for Render 409 Conflict Error
bot.telegram.deleteWebhook().then(() => {
    bot.launch();
    console.log('🤖 Telegram Bot is running...');
}).catch(err => {
    console.error('❌ Bot failed to start:', err);
});

// Graceful Stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// --- 2. START THE SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});