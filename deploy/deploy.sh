#!/usr/bin/env bash
set -euo pipefail

ENV="${1:?usage: deploy.sh staging|production}"
: "${DEPLOY_HOST:?DEPLOY_HOST not set (GitHub environment variable)}"
: "${NEXT_PUBLIC_SERVER_URL:?NEXT_PUBLIC_SERVER_URL not set (GitHub environment variable)}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
REMOTE_DIR="/srv/medval-ve"
SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}"
IMAGE="medval-ve-web:$ENV-${SHA:0:12}"
SSH=(ssh -o BatchMode=yes -o ConnectTimeout=15 -p "$DEPLOY_SSH_PORT" "$DEPLOY_USER@$DEPLOY_HOST")

echo "Checking $ENV server ($DEPLOY_HOST)"
"${SSH[@]}" "test -f $REMOTE_DIR/.env" \
  || { echo "Missing $REMOTE_DIR/.env on $DEPLOY_HOST"; exit 1; }

COMPOSE_FILES=(-f compose.yml)
if [[ "$ENV" == production ]]; then
  "${SSH[@]}" "docker network inspect nginx_default >/dev/null" \
    || { echo "Missing nginx_default reverse-proxy network on $DEPLOY_HOST"; exit 1; }
  COMPOSE_FILES+=(-f compose.production.yml)
fi

echo "Building $IMAGE"
docker build --network host \
  --build-arg NEXT_PUBLIC_SERVER_URL="$NEXT_PUBLIC_SERVER_URL" \
  --build-arg NEXT_PUBLIC_GA_ID="${NEXT_PUBLIC_GA_ID:-}" \
  -t "$IMAGE" .

echo "Sending image to $DEPLOY_HOST"
docker save "$IMAGE" | gzip | "${SSH[@]}" "gunzip | docker load"

"${SSH[@]}" "cat > $REMOTE_DIR/compose.yml" < deploy/compose.yml
if [[ "$ENV" == production ]]; then
  "${SSH[@]}" "cat > $REMOTE_DIR/compose.production.yml" < deploy/compose.production.yml
fi

echo "Starting $IMAGE on $DEPLOY_HOST"
"${SSH[@]}" "cd $REMOTE_DIR && IMAGE='$IMAGE' docker compose -p medval-ve ${COMPOSE_FILES[*]} up -d --wait --remove-orphans"

# Keep the 5 most recent images on the target (for rollbacks) and 2 per environment on the runner
"${SSH[@]}" "docker images medval-ve-web --format '{{.Tag}}' | tail -n +6 | xargs -r -I{} docker rmi medval-ve-web:{} || true"
docker images medval-ve-web --format '{{.Tag}}' | grep "^$ENV-" | tail -n +3 \
  | xargs -r -I{} docker rmi "medval-ve-web:{}" || true

echo "Deployed $IMAGE to $ENV ($DEPLOY_HOST)"
