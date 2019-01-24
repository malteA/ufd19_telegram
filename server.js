require("dotenv").config();

const Telegraf = require("telegraf");
const getIntent = require("./server/dialogflow");

const sessions = require("./sessions");

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
    const {intent, parameters} = await getIntent(message, language);

    switch(intent) {
        case "next_session":
            const session = sessions.filter(x => x.time === parameters.time);
            if (session && session.length !== 0) {
                return ctx.reply(`Next Session at ${new Date(parameters.time).getDate()} will be "${session[0].title}"`);
            }
            break;
        default:
            return ctx.reply("No results found");
    }

    return ctx.reply(`${name}: ${intent} parameters ${JSON.stringify(parameters)}`);
});

bot.launch();