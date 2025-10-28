# ---- Base image ----
FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --only=production

COPY . .

RUN mkdir -p uploads optimized

EXPOSE 8080

CMD ["node", "server.js"]
