FROM node:22-alpine

WORKDIR /app
COPY app.js package-lock.json  package.json /app
RUN npm install
ENTRYPOINT ["node", "app.js"]
