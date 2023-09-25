FROM node:18
WORKDIR /usr/src/app

# Copy dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig-build.json ./
COPY vite.config.ts ./
COPY .d.ts ./
COPY reset.d.ts ./
COPY global.d.ts ./
COPY config.ts ./
COPY index.html ./
COPY start.sh ./


# Copy application
COPY server ./server
COPY client ./client
ENV NODE_ENV=production
RUN npm install
RUN npm run build:client
RUN npm run build:server

CMD ["./start.sh"]