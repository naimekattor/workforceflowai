#!/bin/bash
set -e

echo "Running Production Frontend Server..."

# Set required environment variables for the standalone server
export PORT=3000
export HOSTNAME=0.0.0.0

# Start the standalone production server
node dist/standalone/server.js