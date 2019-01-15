require("dotenv").config();

const Telegraf = require("telegraf");
const getIntent = require("./dialogflow");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(ctx => {
    const name = ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name;
    ctx.reply(`Welcome! ${name}`);
});

bot.help(ctx => ctx.reply("Getting Started\n\nbe a 🦄"));

// listens on all text messages if not previosly resolved
bot.on('text', async (ctx) => {
    const name = ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name;
    const language = ctx.message.from.language_code;
    const message = ctx.message.text;

    const intent = await getIntent(message, language);
    return ctx.reply(`${name}: ${intent}`);
});

bot.launch();