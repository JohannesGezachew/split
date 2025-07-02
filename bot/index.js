const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Load token from environment variable
const token = process.env.BOT_TOKEN;
console.log('Loaded token:', process.env.BOT_TOKEN);


// Replace with your deployed Mini App URL
const MINI_APP_URL = 'https://0f4c-196-188-252-101.ngrok-free.app/';

const bot = new TelegramBot(token, { polling: true });


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Splitwise Mini App! Tap below to open:', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Open Splitwise Mini App', web_app: { url: MINI_APP_URL } }
      ]]
    }
  });
});

// Notification sending function
function sendNotification(userTelegramId, message) {
  bot.sendMessage(userTelegramId, message);
}

// Example: Listen for notifications from backend (placeholder, replace with real integration)
// You would use a webhook, polling, or message queue in production
// Example usage:
// sendNotification(123456789, 'You have a new friend request!');

// /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Help: Use the Mini App to manage friends, groups, and expenses.');
});

// /profile command
bot.onText(/\/profile/, (msg) => {
  const chatId = msg.chat.id;
  // Placeholder: fetch user profile from backend
  bot.sendMessage(chatId, 'Profile: (fetch from backend)');
});

// /groups command
bot.onText(/\/groups/, (msg) => {
  const chatId = msg.chat.id;
  // Placeholder: fetch user groups from backend
  bot.sendMessage(chatId, 'Groups: (fetch from backend)');
});

console.log('Bot is running...'); 