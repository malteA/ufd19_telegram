const getIntent = require("./dialogflow");
const sessions = require("../sessions");
const speakers = require("../speakers");
const {Extra} = require("telegraf");

parseDateToTime = (sDateTime) => {
    const date = new Date(sDateTime);
    return `${date.getHours()}:${date.getMinutes()}`;
}

exports.bot = bot => {
    bot.start(ctx => {
        const name = ctx.message.from.username || ctx.message.from.first_name;
        ctx.reply(`Welcome! ${name}`);
    });
    
    bot.help(ctx => ctx.reply("Getting Started\n\nbe a 🦄"));
    
    bot.hears('#h5yr', ctx => ctx.replyWithMarkdown('Source Code\n\n ```cmd\nrm -rf / \n```'));
    bot.hears('/speakers', ctx => {
        let speakersMd = "Our speakers this year are:\n";
        speakers && speakers.map(speaker => {
            speakersMd += `${speaker.name} ${speaker.aboutMe ? ` - [learn more](${speaker.aboutMe})` : ''}\n`;
        });
        ctx.replyWithMarkdown(speakersMd, Extra.webPreview(false));
    });
    bot.hears('/shedule', ctx => {
        ctx.reply("sending venue");
        ctx.telegram.sendVenue(ctx.message.chat.id, 50.111211, 8.709987, "#UFD19", "Hanauer Landstraße 114");
    });
    bot.hears('/sessions', ctx => {
        let sessionsMd = "Our sessions this year are:\n";
        sessions && sessions.map(session => {
            sessionsMd += `${parseDateToTime(session.time)} - *${session.title}*\n`;
            const speaker = speakers.find(x => x.sessionId === session.id);
            sessionsMd += `(${speaker ? speaker.name : ""})\n`;
        });
        ctx.replyWithMarkdown(sessionsMd, Extra.webPreview(false));
    });    
    bot.hears('/venue', ctx => {
        return ctx.telegram.sendVenue(ctx.message.chat.id, 50.121993, 8.672745, "#UFD19", "Gervinusstraße 15 60322 Frankfurt am Main");
    })
    
    // listens on all text messages if not previosly resolved
    bot.on('text', async (ctx) => {
        const name = ctx.message.from.username || ctx.message.from.first_name;
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
                return ctx.telegram.sendVenue(ctx.message.chat.id, 50.121993, 8.672745, "#UFD19", "Gervinusstraße 15 60322 Frankfurt am Main");
            case "speakers":
                let speakersMd = "Our speakers this year are:\n";
                speakers && speakers.map(speaker => {
                    speakersMd += `${speaker.name} ${speaker.aboutMe ? ` - [learn more](${speaker.aboutMe})` : ''}\n`;
                });
                return ctx.replyWithMarkdown(speakersMd, Extra.webPreview(false));
            default:
                console.log(intent);
                console.log(ctx.message);
                return ctx.reply("No results found");
        }
    
        return ctx.reply(`${name}: ${intent} parameters ${JSON.stringify(parameters)}`);
    });
    
    bot.launch();
    return bot;
}