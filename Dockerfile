# Base lightweight Node.js image
FROM node:22.11-slim

# Set working directory in the container
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm install -g tsx

COPY prisma/ ./prisma/
COPY index.ts ./

RUN npx prisma generate
RUN touch logs.txt

CMD tsx index.ts >> logs.txt 2>&1 
