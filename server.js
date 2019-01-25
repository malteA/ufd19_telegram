require("dotenv").config();

const Telegraf = require("telegraf");
const getIntent = require("./server/dialogflow");

const sessions = require("./sessions");
const speakers = require("./speakers");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(ctx => {
    const name = ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name;
    ctx.reply(`Welcome! ${name}`);
});

bot.help(ctx => ctx.reply("Getting Started\n\nbe a 🦄"));

bot.hears('#h5yr', ctx => ctx.replyWithMarkdown('Source Code\n\n ```cmd\nrm -rf / \n```'));
bot.hears('/speakers', ctx => {
    ctx.reply("Our Speakers this Year are:");
    let speakersMd = "";
    speakers && speakers.map(speaker => {
        speakersMd += `${speaker.name}\n`;
    });
    ctx.reply(speakersMd);
});
bot.hears('/shedule', ctx => {
    ctx.reply("sending venue");
    ctx.telegram.sendVenue(ctx.message.chat.id, 50.111211, 8.709987, "#UFD19", "Hanauer Landstraße 114");
});

// listens on all text messages if not previosly resolved
bot.on('text', async (ctx) => {
    const name = ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name;
    const language = ctx.message.from.language_code;
    const message = ctx.message.text;
    const {intent, parameters} = await getIntent(message, language);

    ctx.replyWithChatAction("typing");

    switch(intent) {
        case "next_session":
            const session = sessions.filter(x => x.time === parameters.time);
            if (session && session.length !== 0) {
                return ctx.reply(`Next Session at ${new Date(parameters.time).getDate()} will be "${session[0].title}"`);
            }
            break;
        case "location":
            await ctx.reply("UFD19 is located in Frankfurt");
            return ctx.telegram.sendVenue(ctx.message.chat.id, 50.111211, 8.709987, "#UFD19", "Hanauer Landstraße 114");
            break;
        case "speakers":
            await ctx.reply("Our Speakers \n #h5yr");
            let speakersMd = "";
            speakers && speakers.map(speaker => {
                speakersMd += `${speaker.name}\n`;
            });
            await ctx.reply(speakersMd);
            return;
        default:
            console.log(intent);
            console.log(ctx.message);
            return ctx.reply("No results found");
    }

    return ctx.reply(`${name}: ${intent} parameters ${JSON.stringify(parameters)}`);
});

bot.on('venue', ctx => {
    console.log(ctx.message);
    ctx.reply("thx venue");
})

bot.launch();