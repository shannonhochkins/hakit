ARG BUILD_FROM
FROM $BUILD_FROM
WORKDIR /usr/app
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

# Copy application
COPY server /usr/app/server
COPY client /usr/app/client
COPY services.d /etc/services.d

ENV NODE_ENV=production
EXPOSE 2022

# Install & build application
RUN apk add --no-cache nodejs npm
RUN npm install
RUN npm run build:client
RUN chmod +x /etc/services.d/server/run

