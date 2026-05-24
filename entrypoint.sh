#!/bin/bash
set -e

echo "Starting Production Server..."

export PORT=3000
export HOSTNAME=0.0.0.0

exec npx next start