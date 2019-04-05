const WebSocket = require("ws");
const EventEmitter = require("events");

const sessions = require("../sessions");
const speakers = require("../speakers");

const wsEmitter = new EventEmitter();
const WebSocketServer = WebSocket.Server;

const getIntent = require("./dialogflow");

let emitter;
const connectedClients = [];



const configureWs = server => {
    const wss = new WebSocketServer({server});

    const parseDateToTime = (sDateTime) => {
        const date = new Date(sDateTime);
        return date.toLocaleTimeString("de-DE", {minute: "2-digit", hour: "2-digit"});
    }

    const sortedSessions = sessions.sort((a, b) => {
        const moveTo = Date.parse(a.timeFrom) - Date.parse(b.timeFrom);
        if (moveTo === 0) {
            return a.track.length - b.track.length
        }
        return moveTo;
    });

    wss.broadcast = data => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        })
    }

    wss.on("connection", (ws, req) => {
        sendInfo(ws, "gday mate");

        ws.on("message", async message => {
            switch (message.toLowerCase()) {
                case "/help":
                case "help":
                    let helpMd = "";
                    helpMd += "Here are the Commands:\n";
                    helpMd += "/sessions\n";
                    helpMd += "/speakers\n";
                    helpMd += "Checkout our Telegram bot https://t.me/ufd19_bot";
                    return sendMessage(ws, helpMd);
                case "/sessions":
                    sendMessage(ws, "Our Sessions this Year are:");
                    let sessionsMd = "";
                    sortedSessions && sortedSessions.map(session => {
                        sessionsMd += `${session.lang === "en" ? "🇬🇧" : "🇩🇪"} ${parseDateToTime(session.timeFrom)} - *${session.title}*\n`;
                        session.speakers.map(sessionSpeaker => {
                            let speaker = speakers.find(x => x.id === sessionSpeaker);
                            sessionsMd += `(${speaker ? speaker.name : ""})\n`;
                        });
                        sessionsMd += `Track: ${session.track}\n`; 
                    });
                    return sendMessage(ws, sessionsMd);
                case "/speakers":
                    sendMessage(ws, "Our Speakers this Year are:");
                    let speakersMd = "";
                    speakers && speakers.map(speaker => {
                        speakersMd += `${speaker.name}\n`;
                    });
                    return sendMessage(ws, speakersMd);
                default:
                    const language = "en";
                    const {intent, parameters} = await getIntent(message, language);
                    
                    switch(intent) {
                        case "next_session":
                            let nextSessionsMd = "No Session Found";
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
                                    nextSessionsMd += `${nextSession.lang === "en" ? "🇬🇧" : "🇩🇪"} ${parseDateToTime(nextSession.timeFrom)} - "${nextSession.title}" \n`;
                                    nextSession.speakers.map(sessionSpeaker => {
                                        let speaker = speakers.find(x => x.id === sessionSpeaker);
                                        nextSessionsMd += `(${speaker ? speaker.name : ""})\n`;
                                    });
                                    nextSessionsMd += `Room: ${nextSession.track}\n`;
                                })
                            }
                            return sendMessage(ws, nextSessionsMd);
                        case "speakers":
                            let speakersMd = "Our speakers this year are:\n";
                            speakers && speakers.map(speaker => {
                                speakersMd += `${speaker.name}\n`;
                            });
                            return sendMessage(ws, speakersMd);
                        default:
                            console.log(intent);
                            return sendMessage(ws, "No results found");
                    }
            }
        });
        console.log(`connected with ip: ${req.connection.remoteAddress}`);
    })


    return wss;
}

const configureWsEmitter = ws => {
    wsEmitter.on("message", () => {
        ws.broadcast("hi from emitter");
        console.log("emitter");
    })

    return wsEmitter;
}

const sendMessage = (ws, data) => {
    const time = (new Date()).getTime();
    return ws.send(JSON.stringify({type: "message", data, author: "-1", time}));
}

const sendInfo = (ws, data) => {
    return ws.send(JSON.stringify({type: "message", data, author: "-1", time: (new Date()).getTime()}));
}

exports.wsEmitter = server => {
    if (!server) {
        return emitter;
    }

    const ws = configureWs(server);
    emitter = configureWsEmitter(ws);

    return emitter;
}
