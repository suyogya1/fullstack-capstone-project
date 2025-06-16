FROM node:18.12.1-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080  # ✅ Required by Code Engine

CMD ["node", "app.js"]  # ✅ or app.js depending on your file
