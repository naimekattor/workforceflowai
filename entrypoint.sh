#!/bin/bash
set -e

echo "Running Frontend Server..."
npm run dev -- --hostname 0.0.0.0 --port 3000
