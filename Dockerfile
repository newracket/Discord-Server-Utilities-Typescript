FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g typescript

RUN node -v && tsc -v

RUN npm run build

COPY . .

CMD ["npm", "start"]