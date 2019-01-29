const WebSocket = require("ws");
const EventEmitter = require("events");

const sessions = require("../sessions");
const speakers = require("../speakers");

const wsEmitter = new EventEmitter();
const WebSocketServer = WebSocket.Server;

let emitter;
const connectedClients = [];
const history = [] 

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
        console.log("conn");
        const index = connectedClients.push(ws) - 1;
        const ip = req.connection.remoteAddress;

        sendHistory(ws, history);

        sendInfo(ws, "gday mate");

        ws.on("message", message => {
            history.push({
                time: (new Date()).getTime(),
                text: message,
                author: ip
            })
            switch (message) {
                case "/help":
                    ws.se
                    return sendMessage(ws, "help");
                case "/sessions":
                    return sendMessage(ws, "sessions");
                case "/speakers":
                    sendMessage(ws, "Our Speakers this Year are:");
                    let speakersMd = "";
                    speakers && speakers.map(speaker => {
                        speakersMd += `${speaker.name}\n`;
                    });
                    return sendMessage(ws, speakersMd);
            }
        });
        console.log(`connected with ip: ${ip}`);
    })


    return wss;
}

const configureWsEmitter = ws => {
    wsEmitter.on("event", () => {
        ws.broadcast("hi from emitter");
        console.log("emitter");
    });

    wsEmitter.on("message", () => {
        ws.broadcast("hi from emitter");
        console.log("emitter");
    })

    return wsEmitter;
}

const sendHistory = (ws, data) => {
    return ws.send(JSON.stringify({type: "history", data }));
}

const sendMessage = (ws, data) => {
    const time = (new Date()).getTime();
    history.push({
        time,
        text: data,
        author: "-1"
    })
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
