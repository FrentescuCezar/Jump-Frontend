#!/bin/sh
set -e

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "NODE_ENV is set to $NODE_ENV"

if [ "$NODE_ENV" = "local" ] || [ "$NODE_ENV" = "development" ]; then
  echo "Running development mode..."
  npm run dev -- --hostname 0.0.0.0
elif [ "$NODE_ENV" = "staging" ] || [ "$NODE_ENV" = "production" ]; then
  echo "Running production mode..."
  npm run build
  npm run start
else
  echo "NODE_ENV not set → defaulting to dev"
  npm run dev -- --hostname 0.0.0.0
fi

