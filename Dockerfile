FROM mhart/alpine-node:10

WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci --prod

FROM alpine:3.7
COPY --from=0 /usr/bin/node /usr/bin/
COPY --from=0 /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
WORKDIR /app
COPY --from=0 /home/node/app .
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]