FROM node:15-alpine

WORKDIR /drivent-back

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . ./drivent-back


CMD ["npm", "run", "dev:docker"]