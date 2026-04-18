#!/usr/bin/env bash
# Deploy wilservice.us static site to Linux server via rsync.
# Run from project root: ./deploy.sh

set -e

# --- Configure for your server (override with env vars) ---
# Default: legacy Linux host. For TrueNAS SCALE (ZFS + bind mount, not container image):
#   DEPLOY_USER=truenas_admin DEPLOY_HOST=10.7.5.13 DEPLOY_PATH=/mnt/storage/wilservice.us ./deploy.sh
# Fully containerized deploy: use Dockerfile + PUBLISH-IMAGE.md (no rsync). Hostname: test.wilservice.us — see TrueNas setup docs/deploy-wilservice-step-by-step.md
SSH_USER="${DEPLOY_USER:-admdade}"
SSH_HOST="${DEPLOY_HOST:-10.7.5.253}"
REMOTE_PATH="${DEPLOY_PATH:-/var/www/wilservice.us}"

# --- Deploy ---
echo "Deploying to ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}"
# Use --checksum so image/content changes always sync (not just size/mtime)
rsync -avz --delete --checksum \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='node_modules' \
  --exclude='*.md' \
  --exclude='deploy.sh' \
  --exclude='configs' \
  --exclude='Certs' \
  ./ \
  "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/"

echo "Done. Site updated."
