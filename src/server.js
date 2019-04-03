require("dotenv").config();

const http = require("http");

const Telegraf = require("telegraf");
const telegraf = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
require("./server/botman").bot(telegraf);


const server = http.createServer((req, res) => {});
server.listen(4000, () => {});

require("./server/webSockets").wsEmitter(server);
