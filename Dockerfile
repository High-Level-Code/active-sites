# Base lightweight Node.js image
FROM node:22.11-slim

RUN apt-get update -y && apt-get install -y openssl

# Set working directory in the container
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm install -g tsx

COPY prisma/ ./prisma/
COPY src/ ./src/

RUN npx prisma generate
RUN touch logs.txt
RUN mkdir url-logs

CMD tsx src/index.ts >> logs.txt 2>&1
