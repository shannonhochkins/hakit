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
COPY start.sh ./

# Copy application
COPY server /usr/app/server
COPY client /usr/app/client
COPY services.d /etc/services.d

# Install & build application
RUN apk add --no-cache \
    nodejs npm && \
    npm install && \
    npm run build:client && \
    npm run build:server
