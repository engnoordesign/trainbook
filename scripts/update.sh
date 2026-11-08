#!/usr/bin/env sh
# One-command update for the Docker container (Linux / macOS / Git Bash):  sh scripts/update.sh
set -e
cd "$(dirname "$0")/.."

if [ -d .git ]; then
  echo "> git pull"
  git pull --ff-only
fi
echo "> docker compose up -d --build"
docker compose up -d --build
docker image prune -f >/dev/null
echo "TrainBook is running at http://localhost:8080"
