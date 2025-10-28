FROM node:20-bookworm AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build