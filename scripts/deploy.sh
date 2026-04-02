#!/usr/bin/env bash
set -euo pipefail

echo "==> Pulling latest code..."
git pull origin main

echo "==> Building Docker image..."
docker compose -f docker-compose.prod.yml build

echo "==> Running database migration..."
docker compose -f docker-compose.prod.yml run --rm migrate

echo "==> Deploying landing pages to nginx volume..."
docker compose -f docker-compose.prod.yml run --rm deploy-page

echo "==> Starting API..."
docker compose -f docker-compose.prod.yml up -d api

echo "==> Reloading nginx..."
docker exec infra-nginx nginx -s reload

echo "==> Health check..."
for i in 1 2 3 4 5; do
  if curl -sf http://localhost:3848/api/health > /dev/null 2>&1; then
    echo "    API is healthy!"
    break
  fi
  echo "    Attempt $i/5 — waiting..."
  sleep 3
done

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Deploy complete!"
