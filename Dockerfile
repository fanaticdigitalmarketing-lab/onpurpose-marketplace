FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S onpurpose -u 1001

RUN chown -R onpurpose:nodejs /app
USER onpurpose

EXPOSE 3000

CMD ["node", "server.js"]
