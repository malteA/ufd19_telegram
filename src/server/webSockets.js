const WebSocket = require("ws");
const EventEmitter = require("events");

const sessions = require("../sessions");
const speakers = require("../speakers");

const wsEmitter = new EventEmitter();
const WebSocketServer = WebSocket.Server;

let emitter;
const connectedClients = [];


parseDateToTime = (sDateTime) => {
    const date = new Date(sDateTime);
    return `${date.getHours()}:${date.getMinutes()}`;
}

const configureWs = server => {
    const wss = new WebSocketServer({server});

    wss.broadcast = data => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        })
    }

    wss.on("connection", (ws, req) => {
        sendInfo(ws, "gday mate");

        ws.on("message", message => {
            switch (message) {
                case "/help":
                    ws.se
                    return sendMessage(ws, "help");
                case "/sessions":
                    sendMessage(ws, "Our Sessions this Year are:");'F8FF'
                    let sessionsMd = "";
                    sessions && sessions.map(session => {
                        sessionsMd += `${parseDateToTime(session.time)} - *${session.title}*\n`;
                        const speaker = speakers.find(x => x.sessionId === session.id);
                        sessionsMd += `(${speaker ? speaker.name : ""})\n`;
                    });
                    return sendMessage(ws, sessionsMd);
                case "/speakers":
                    sendMessage(ws, "Our Speakers this Year are:");
                    let speakersMd = "";
                    speakers && speakers.map(speaker => {
                        speakersMd += `${speaker.name}\n`;
                    });
                    return sendMessage(ws, speakersMd);
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
