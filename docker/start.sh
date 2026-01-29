#!/bin/sh
node dist/app.js &
sleep 2
nginx -g "daemon off;"