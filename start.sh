#!/usr/bin/with-contenv bashio

set +u

bashio::log.info "Starting hakit"

node ./server/dist/server/index.js &
./node_modules/.bin/vite & 
wait

bashio::log.info "hakit running!"