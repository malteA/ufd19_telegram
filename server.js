require("dotenv").config();

const http = require("http");

const Telegraf = require("telegraf");
const telegraf = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const bot = require("./server/botman").bot(telegraf);

const sessions = require("./sessions");
const speakers = require("./speakers");


const server = http.createServer((req, res) => {});
server.listen(1337, () => {});

const wsEmitter = require("./server/webSockets").wsEmitter(server);
