#!/bin/bash
node ./server/dist/server/index.js &
./node_modules/.bin/vite & 
wait