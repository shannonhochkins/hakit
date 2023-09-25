#!/usr/bin/with-contenv bashio

set +u

bashio::log.info "Starting hakit"

exec npm run start:public;

bashio::log.info "hakit running!"