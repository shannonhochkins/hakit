ARG BUILD_FROM
FROM $BUILD_FROM
WORKDIR /usr/app
# Copy dependencies
COPY package*.json ./
COPY tsconfig.json ./

# Copy application
COPY server /usr/app/server
COPY services.d /etc/services.d

ENV NODE_ENV=production
EXPOSE 2022

# Install & build application
RUN apk add --no-cache nodejs npm
RUN npm install
run npm run build
RUN chmod +x /etc/services.d/server/run

