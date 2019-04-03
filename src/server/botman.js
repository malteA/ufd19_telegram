const getIntent = require("./dialogflow");
const sessions = require("../sessions");
const speakers = require("../speakers");
const {Extra} = require("telegraf");

parseDateToTime = (sDateTime) => {
    const date = new Date(sDateTime);
    return date.toLocaleTimeString("de-DE", {minute: "2-digit", hour: "2-digit"});
}

exports.bot = bot => {
    const sortedSessions = sessions.sort((a, b) => {
        const moveTo = Date.parse(a.timeFrom) - Date.parse(b.timeFrom);
        if (moveTo === 0) {
            return a.track - b.track
        }
        return moveTo;
    });

    bot.start(ctx => {
        const name = ctx.message.from.username || ctx.message.from.first_name;
        ctx.reply(`Welcome! ${name}`);
    });
    
    bot.help(ctx => {
        let helpMd = "Here are the Commands:\n";
        helpMd += "/sessions - All Sessions\n";
        helpMd += "/speakers - All Speakers\n";
        helpMd += "/preparty - Location of the Venue\n";
        helpMd += "/venue - Location of the Venue";
        return ctx.replyWithMarkdown(helpMd, Extra.webPreview(false));
    });
    
    bot.hears('#h5yr', ctx => ctx.replyWithMarkdown('Source Code\n\n ```cmd\nrm -rf / \n```'));
    bot.hears('/speakers', ctx => {
        let speakersMd = "Our speakers this year are:\n";
        speakers && speakers.map(speaker => {
            speakersMd += `${speaker.twitter ? `[🐦](${speaker.twitter})` : "    "} ${speaker.name} ${speaker.aboutMe ? ` - [learn more](${speaker.aboutMe})` : ''}\n`;
        });
        ctx.replyWithMarkdown(speakersMd, Extra.webPreview(false));
    });
    bot.hears('/preparty', ctx => {
        ctx.telegram.sendVenue(ctx.message.chat.id, 50.111211, 8.709987, "#UFD19 Preparty", "Hanauer Landstraße 114");
    });
    bot.hears('/sessions', ctx => {
        let sessionsMd = "Our sessions this year are:\n";

        sortedSessions && sortedSessions
            .map(session => {
            sessionsMd += `${session.lang === "en" ? "🇬🇧" : "🇩🇪"} ${parseDateToTime(session.timeFrom)} - *${session.title}*\n`;
            session.speakers.map(sessionSpeaker => {
                let speaker = speakers.find(x => x.id === sessionSpeaker);
                sessionsMd += `_(${speaker ? speaker.name : ""})_\n`;
            });
            sessionsMd += `Room: ${session.track}\n`;
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
                let nextSessionsMd = "No Session Found";
                ctx.reply(parseDateToTime(parameters.time));
                let nextSessions = sortedSessions
                .filter(x => {
                        const timeFrom = parseDateToTime(x.timeFrom); 
                        const matched = timeFrom === parseDateToTime(parameters.time)
                        return matched;
                });
                if (nextSessions.length === 0) {
                    nextSessions = sortedSessions.filter(x => parseDateToTime(x.timeFrom >= parseDateToTime(parameters.time))).slice(0, 3);
                }
                if (nextSessions && nextSessions.length !== 0) {
                    nextSessionsMd = nextSessions.length === 1 ? "Next Session\n" : "Next Sessions\n";
                    nextSessions.map(nextSession => {
                        nextSessionsMd += `${session.lang === "en" ? "🇬🇧" : "🇩🇪"} ${parseDateToTime(nextSession.timeFrom)} will be "${nextSession.title}" \n`;
                    })
                    nextSessionsMd += `Room: ${session.track}\n`;
                }
                return ctx.replyWithMarkdown(nextSessionsMd, Extra.webPreview(false));
            case "location":
                return ctx.telegram.sendVenue(ctx.message.chat.id, 50.121993, 8.672745, "#UFD19", "Gervinusstraße 15 60322 Frankfurt am Main");
            case "speakers":
                let speakersMd = "Our speakers this year are:\n";
                speakers && speakers.map(speaker => {
                    speakersMd += `${speaker.twitter ? `[🐦](${speaker.twitter})` : "    "} ${speaker.name} ${speaker.aboutMe ? ` - [learn more](${speaker.aboutMe})` : ''}\n`;
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