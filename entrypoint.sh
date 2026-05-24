#!/bin/bash
set -e

echo "Starting Production Server..."

export HOSTNAME=0.0.0.0
export PORT=3000

exec node .next/standalone/server.js
