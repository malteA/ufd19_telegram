FROM node:10-alpine

WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci --prod

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app && npm ci --prod

FROM mhart/alpine-node:base-10
WORKDIR /home/node/app
COPY --from=0 /home/node/app ./home/node/app
COPY . .

# USER node

# COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "server.js"]